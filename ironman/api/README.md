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
3. `pulumi up` (creates/updates DynamoDB, Lambda, HTTP API)
4. Write `../api-config.js` with the public `apiUrl`

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

## API

- `GET /state?day=YYYY-MM-DD` — `Authorization: Bearer <pin>`
- `PUT /state` — same auth; body includes day checks/progress + meta fields

PIN lives only in Pulumi config / Lambda env — never in `resources.yaml` or frontend source.
