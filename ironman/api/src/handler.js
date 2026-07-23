const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const USER_PK = 'USER#default';
const TABLE_NAME = process.env.TABLE_NAME;
const IRONMAN_PIN = process.env.IRONMAN_PIN || '';
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  'https://umesh.skalekontrol.com,http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000,http://127.0.0.1:8000'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

function corsHeaders(origin) {
  const allow =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(statusCode, body, origin) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
    body: JSON.stringify(body),
  };
}

function getOrigin(event) {
  return event.headers?.origin || event.headers?.Origin || '';
}

function extractPin(event) {
  const auth =
    event.headers?.authorization || event.headers?.Authorization || '';
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return '';
}

function authorize(event) {
  if (!IRONMAN_PIN || IRONMAN_PIN.length !== 4) {
    return { ok: false, reason: 'server_misconfigured' };
  }
  const pin = extractPin(event);
  if (pin !== IRONMAN_PIN) {
    return { ok: false, reason: 'unauthorized' };
  }
  return { ok: true };
}

function daySk(day) {
  return `DAY#${day}`;
}

function isValidDay(day) {
  return typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day);
}

function emptyDay(day) {
  return {
    day,
    checks: {},
    progress: {},
    waterLog: [],
    openSections: {},
    workoutDoneToday: false,
    completedWorkoutIndex: null,
    updatedAt: null,
  };
}

function emptyMeta() {
  return {
    workoutIndex: 0,
    review: {},
    lastBottleFinishedAt: null,
    updatedAt: null,
  };
}

function dayFromItem(item, day) {
  if (!item) return emptyDay(day);
  return {
    day: item.day || day,
    checks: item.checks || {},
    progress: item.progress || {},
    waterLog: Array.isArray(item.waterLog) ? item.waterLog : [],
    openSections: item.openSections || {},
    workoutDoneToday: !!item.workoutDoneToday,
    completedWorkoutIndex:
      item.completedWorkoutIndex == null ? null : item.completedWorkoutIndex,
    updatedAt: item.updatedAt || null,
  };
}

function metaFromItem(item) {
  if (!item) return emptyMeta();
  return {
    workoutIndex: item.workoutIndex ?? 0,
    review: item.review || {},
    lastBottleFinishedAt: item.lastBottleFinishedAt || null,
    updatedAt: item.updatedAt || null,
  };
}

async function getState(day) {
  const [metaRes, dayRes] = await Promise.all([
    ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: USER_PK, sk: 'META' },
      })
    ),
    ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: USER_PK, sk: daySk(day) },
      })
    ),
  ]);

  return {
    meta: metaFromItem(metaRes.Item),
    day: dayFromItem(dayRes.Item, day),
  };
}

async function putState(payload) {
  const now = new Date().toISOString();
  const day = payload.day;

  const metaItem = {
    pk: USER_PK,
    sk: 'META',
    workoutIndex: payload.workoutIndex ?? 0,
    review: payload.review || {},
    lastBottleFinishedAt: payload.lastBottleFinishedAt || null,
    updatedAt: now,
  };

  const dayItem = {
    pk: USER_PK,
    sk: daySk(day),
    day,
    checks: payload.checks || {},
    progress: payload.progress || {},
    waterLog: Array.isArray(payload.waterLog) ? payload.waterLog : [],
    openSections: payload.openSections || {},
    workoutDoneToday: !!payload.workoutDoneToday,
    completedWorkoutIndex:
      payload.completedWorkoutIndex == null
        ? null
        : payload.completedWorkoutIndex,
    updatedAt: now,
  };

  await Promise.all([
    ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: metaItem })),
    ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: dayItem })),
  ]);

  return {
    meta: metaFromItem(metaItem),
    day: dayFromItem(dayItem, day),
  };
}

function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
  return JSON.parse(raw);
}

exports.handler = async (event) => {
  const origin = getOrigin(event);
  const method =
    event.requestContext?.http?.method || event.httpMethod || 'GET';
  const path = event.rawPath || event.path || '/';

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(origin),
      body: '',
    };
  }

  if (!path.endsWith('/state') && path !== '/state') {
    return json(404, { error: 'not_found' }, origin);
  }

  const auth = authorize(event);
  if (!auth.ok) {
    const code = auth.reason === 'server_misconfigured' ? 500 : 401;
    return json(code, { error: auth.reason }, origin);
  }

  try {
    if (method === 'GET') {
      const day = event.queryStringParameters?.day;
      if (!isValidDay(day)) {
        return json(400, { error: 'invalid_day' }, origin);
      }
      const state = await getState(day);
      return json(200, state, origin);
    }

    if (method === 'PUT') {
      const payload = parseBody(event);
      if (!isValidDay(payload.day)) {
        return json(400, { error: 'invalid_day' }, origin);
      }
      const state = await putState(payload);
      return json(200, state, origin);
    }

    return json(405, { error: 'method_not_allowed' }, origin);
  } catch (err) {
    console.error(err);
    return json(500, { error: 'internal_error' }, origin);
  }
};
