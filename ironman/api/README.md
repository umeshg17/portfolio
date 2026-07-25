# Ironman Tracker API (Pulumi)

Low-cost serverless backend for multi-device daily tracking.

## Config vs code

| File | What to edit |
|------|----------------|
| [`resources.yaml`](resources.yaml) | Resource names, Lambda size/timeout, CORS, routes, DynamoDB settings |
| Pulumi stack config | Secrets only (`ironmanPin`) + AWS region |
| `index.ts` | Wiring only — prefer not to touch for day-to-day changes |

Edit `resources.yaml`, then deploy locally.

## Stack

- API Gateway HTTP API
- Lambda (Node 24, arm64, esbuild-bundled)
- DynamoDB (name from `resources.yaml`, on-demand)

## Pulumi backend

```text
s3://skalekontrol/pulumi/ironman
```

## Deploy (local — preferred)

Uses your AWS profile (no GitHub OIDC). Default profile name: `umesh`.

```bash
cd ironman/api
chmod +x deploy.sh
export AWS_PROFILE=umesh
export IRONMAN_PIN=XXXX          # 4 digits; never commit
export PULUMI_CONFIG_PASSPHRASE= # empty — no interactive secrets unlock (set by deploy.sh too)
./deploy.sh
```

`deploy.sh` will:

1. Build the Lambda bundle
2. `pulumi login` to the S3 backend
3. Set `ironmanPin` as a Pulumi secret from `IRONMAN_PIN` (not committed)
4. `pulumi up` (creates/updates DynamoDB, Lambda, HTTP API)
5. Write `../api-config.js` with the public `apiUrl`
6. Restore `Pulumi.ironman.yaml` to non-secret config only (so the encrypted PIN is not left in the working tree)

Do **not** commit `ironmanPin` / `encryptionsalt` in `Pulumi.ironman.yaml` — with an empty passphrase those values are not safe in git.

Manual equivalent:

```bash
cd ironman/api
npm install && npm run build:lambda
export AWS_PROFILE=umesh
pulumi login s3://skalekontrol/pulumi/ironman
pulumi stack select ironman --create
pulumi config set aws:region ap-south-1
pulumi config set --secret ironmanPin XXXX
pulumi up
pulumi stack output apiUrl
```

## Cost guards (no added spend)

Tunable in [`resources.yaml`](resources.yaml) under `lambda` / `costGuard`:

| Guard | What it does |
|-------|----------------|
| `reservedConcurrentExecutions: 2` | Caps parallel Lambda runs so a flood cannot scale cost |
| API Gateway `throttle` (5 rps / burst 10) | Rejects excess HTTP traffic before Lambda |
| `logRetentionDays: 7` | Drops old CloudWatch logs (unlimited retention is the default and costs more over time) |
| Optional AWS Budget | First **2 budgets/account are free** — uncomment `budgetUsd` + `budgetEmail` to email at 80%/100% of a monthly tag-filtered budget |

Not included on purpose (they add cost): WAF, CloudWatch metric alarms, SNS topics.

If `pulumi up` fails because `/aws/lambda/ironman-tracker-api` already exists (Lambda auto-created it earlier), import once then redeploy:

```bash
pulumi import aws:cloudwatch/logGroup:LogGroup ironman-lambda-logs /aws/lambda/ironman-tracker-api
./deploy.sh
```

## API

- `GET /state?day=YYYY-MM-DD` — `Authorization: Bearer <pin>`
- `PUT /state` — same auth; body includes day checks/progress + meta fields

PIN lives only in Pulumi config / Lambda env — never in `resources.yaml` or frontend source.
