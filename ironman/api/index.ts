import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface AttributeSpec {
  name: string;
  type: string;
}

interface ResourcesSpec {
  tags: Record<string, string>;
  dynamodb: {
    name: string;
    billingMode: string;
    hashKey: string;
    rangeKey: string;
    attributes: AttributeSpec[];
  };
  lambda: {
    name: string;
    roleName: string;
    runtime: string;
    architectures: string[];
    handler: string;
    timeout: number;
    memorySize: number;
    codeDir: string;
  };
  httpApi: {
    name: string;
    stageName: string;
    autoDeploy: boolean;
    cors: {
      allowOrigins: string[];
      allowHeaders: string[];
      allowMethods: string[];
      maxAge: number;
    };
    routes: string[];
  };
}

function loadResources(): ResourcesSpec {
  const filePath = path.join(__dirname, 'resources.yaml');
  const raw = fs.readFileSync(filePath, 'utf8');
  const spec = yaml.load(raw) as ResourcesSpec;
  if (!spec?.dynamodb?.name || !spec?.lambda?.name || !spec?.httpApi?.name) {
    throw new Error('resources.yaml is missing required dynamodb/lambda/httpApi fields');
  }
  return spec;
}

const spec = loadResources();
const config = new pulumi.Config();
const ironmanPin = config.requireSecret('ironmanPin');
const tags = spec.tags || {};

const table = new aws.dynamodb.Table('ironman-tracker', {
  name: spec.dynamodb.name,
  billingMode: spec.dynamodb.billingMode,
  hashKey: spec.dynamodb.hashKey,
  rangeKey: spec.dynamodb.rangeKey,
  attributes: spec.dynamodb.attributes.map((a) => ({
    name: a.name,
    type: a.type,
  })),
  tags,
});

const lambdaRole = new aws.iam.Role('ironman-lambda-role', {
  name: spec.lambda.roleName,
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'lambda.amazonaws.com',
  }),
  tags,
});

new aws.iam.RolePolicyAttachment('ironman-lambda-basic', {
  role: lambdaRole.name,
  policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
});

const ddbPolicy = new aws.iam.RolePolicy('ironman-lambda-ddb', {
  role: lambdaRole.id,
  policy: table.arn.apply((arn) =>
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'dynamodb:GetItem',
            'dynamodb:PutItem',
            'dynamodb:UpdateItem',
            'dynamodb:DeleteItem',
            'dynamodb:Query',
            'dynamodb:Scan',
          ],
          Resource: arn,
        },
      ],
    })
  ),
});

const allowedOrigins = (spec.httpApi.cors.allowOrigins || []).join(',');

const lambdaFn = new aws.lambda.Function(
  'ironman-api',
  {
    name: spec.lambda.name,
    runtime: spec.lambda.runtime,
    architectures: spec.lambda.architectures,
    role: lambdaRole.arn,
    handler: spec.lambda.handler,
    timeout: spec.lambda.timeout,
    memorySize: spec.lambda.memorySize,
    code: new pulumi.asset.FileArchive(path.join(__dirname, spec.lambda.codeDir)),
    environment: {
      variables: {
        TABLE_NAME: table.name,
        IRONMAN_PIN: ironmanPin,
        ALLOWED_ORIGINS: allowedOrigins,
      },
    },
    tags,
  },
  { dependsOn: [ddbPolicy] }
);

const httpApi = new aws.apigatewayv2.Api('ironman-http-api', {
  name: spec.httpApi.name,
  protocolType: 'HTTP',
  corsConfiguration: {
    allowOrigins: spec.httpApi.cors.allowOrigins,
    allowHeaders: spec.httpApi.cors.allowHeaders,
    allowMethods: spec.httpApi.cors.allowMethods,
    maxAge: spec.httpApi.cors.maxAge,
  },
  tags,
});

const integration = new aws.apigatewayv2.Integration('ironman-lambda-integration', {
  apiId: httpApi.id,
  integrationType: 'AWS_PROXY',
  integrationUri: lambdaFn.arn,
  payloadFormatVersion: '2.0',
  integrationMethod: 'POST',
});

const routes = spec.httpApi.routes || [];
routes.forEach((routeKey, i) => {
  new aws.apigatewayv2.Route(`ironman-route-${i}`, {
    apiId: httpApi.id,
    routeKey,
    target: pulumi.interpolate`integrations/${integration.id}`,
  });
});

new aws.apigatewayv2.Stage('ironman-default-stage', {
  apiId: httpApi.id,
  name: spec.httpApi.stageName,
  autoDeploy: spec.httpApi.autoDeploy !== false,
  tags,
});

new aws.lambda.Permission('ironman-apigw-permission', {
  action: 'lambda:InvokeFunction',
  function: lambdaFn.name,
  principal: 'apigateway.amazonaws.com',
  sourceArn: pulumi.interpolate`${httpApi.executionArn}/*/*`,
});

export const apiUrl = pulumi.interpolate`${httpApi.apiEndpoint}`;
export const tableName = table.name;
export const lambdaName = lambdaFn.name;
