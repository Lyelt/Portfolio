# Portfolio operations

Portfolio owns its image, Compose model, environment contract, DbUp migrations,
deployment adapter, and database backup helper. `Lyelt/MacMiniInfrastructure`
owns the Ubuntu host, Docker policy, shared `web` network, edge routing, tunnel,
deployment receiver, runner installation, credential inventory, and disaster
recovery runbook.

## Environment contract

| Item | Staging | Production |
| --- | --- | --- |
| Branch | `staging` | `master` |
| Compose project | `portfolio-staging` | `portfolio-prod` |
| Web alias | `portfolio-staging-web` | `portfolio-prod-web` |
| Hostname | `staging.ghobrial.dev` | `ghobrial.dev` |
| Environment file | `/srv/secrets/portfolio/staging.env` | `/srv/secrets/portfolio/prod.env` |
| Database volume | `portfolio-staging-postgres-data` | `portfolio-prod-postgres-data` |

The app is the only service on the shared `web` network. PostgreSQL stays on an
environment-specific internal network, and no service publishes a host port.

Each application environment file defines `POSTGRES_DB`, `POSTGRES_USER`,
`POSTGRES_PASSWORD`, `CONNECTION_STRING`, `JWT_SECURITY_KEY`, `JWT_ISSUER`,
`JWT_AUDIENCE`, and `GAME_NIGHT_FIRST_USER_NAME`. The first three values and
the connection string must describe the same database. Staging and production
credentials are independent. See the infrastructure `docs/SECRETS.md` for
classification, recreation, minimum scope, rotation, and safe verification.

## Install application-owned host files

Install the infrastructure repository first. From this repository on the Mac,
use the thin transport wrapper:

```sh
bash host/install-vm-files.sh hosting
```

On a cloud VM, transfer a reviewed checkout and invoke the same target-side
installer used by that wrapper:

```sh
sudo bash host/install-portfolio-linux-files.sh "$PWD"
```

The idempotent target-side installer creates Portfolio directories, installs
fixed root-owned deployment and backup commands, copies reference Compose and
example files, and validates both Compose environments. It does not register a
runner, populate a secret, enable production, start an app, or change routing.
The shared infrastructure installer owns the fixed `web` subnet and Caddy
validation; the Portfolio installer verifies only that the shared network
exists before installing app-owned files.

## CI, promotion, and deployment

Pull requests to `staging` and `master` run `.github/workflows/ci.yml`.
Deployment accepts only a merged PR revision. It reruns CI, publishes an image
by digest, records the deployment manifest, and then invokes the fixed adapter
on the repository-scoped runner.

Promote by merging the reviewed feature PR into `staging`, validating both
health endpoints and the relevant user journeys, then merging the same reviewed
change into `master`. Production also requires the repository variable
`PRODUCTION_DEPLOY_ENABLED=true` and the protected host sentinel
`/srv/secrets/portfolio/production-enabled`.

The adapter verifies the protected branch head, takes a database backup, pulls
the exact image digest, runs DbUp, replaces the app, and checks `/livez` and
`/healthz`. If health fails it stops the failed application and retains the
database plus backup for paired database/image recovery; it never starts an old
image against a potentially migrated database.

DbUp migration `009 - Remove Legacy Schema.sql` drops the retired
`legacy.GameNightUserOrders` archive and legacy EF migration journal from
existing environments. Fresh databases never create that schema. Deployment
and backup restore validation both require its absence.

## Backup, restore, and rollback

Deployments create validated PostgreSQL custom-format dumps. The scheduled
production workflow also encrypts a new dump, fully restores it into an
isolated PostgreSQL container, validates the restored schema, and uploads the
encrypted artifact with its checksum. The age identity must also have an
independent recovery copy outside the Mac and VM.

Use `MacMiniInfrastructure/docs/RECOVERY.md` for the start-to-finish host or
cloud-VM rebuild, encrypted backup retrieval, database restore, app rollout,
DNS/tunnel cutover, and validation drill. Use the previous approved manifest
and matching database backup for an incompatible migration; never delete the
current volume or previous image during diagnosis.

## Troubleshooting

```sh
curl --fail https://staging.ghobrial.dev/livez
curl --fail https://staging.ghobrial.dev/healthz
curl --fail https://ghobrial.dev/livez
curl --fail https://ghobrial.dev/healthz
sudo -iu deploy docker compose -p portfolio-staging ps
sudo -iu deploy docker compose -p portfolio-prod ps
```

- `/livez` failure: inspect the app container and immutable image pull.
- `/healthz` failure with `/livez` healthy: inspect PostgreSQL health, the
  fixed environment volume, `CONNECTION_STRING`, and the latest DbUp output.
- Manifest rejection: compare repository, application, branch/environment,
  digest, health paths, and the infrastructure allowlist.
- Runner unavailable: recreate it from the infrastructure recovery runbook;
  never run pull-request code on a deployment runner.
