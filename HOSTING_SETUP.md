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

Use `MacMiniInfrastructure/host/install-vm-files.sh` for a complete Mac host or
`MacMiniInfrastructure/host/bootstrap-ecosystem.sh` for a complete cloud host.
Those canonical entrypoints install every application in dependency order.

To reinstall only Portfolio files on an already provisioned host, transfer a
reviewed checkout and run:

```sh
sudo bash host/install-portfolio-linux-files.sh "$PWD"
```

The idempotent app installer creates Portfolio directories, installs fixed
root-owned deployment, backup, and production-restore commands plus the
canonical schema contract, copies the environment examples, and validates both
Compose environments from the reviewed checkout. It does not register a
runner, populate a secret, enable production, start an app, or change routing.
After merging a change to an installed command or schema contract, rerun the
full ecosystem bootstrap (or this app installer) as root before the first
affected job. Self-hosted jobs compare the checkout byte-for-byte with those
installed files and fail with that instruction when the host has drifted.
The shared infrastructure installer owns the fixed `web` subnet and Caddy
validation; the Portfolio installer verifies only that the shared network
exists before installing app-owned files.

## CI, promotion, and deployment

Every pull request runs `.github/workflows/ci.yml`, including stacked pull
requests whose temporary base is not an integration branch.
Deployment accepts only a merged PR revision. It reruns CI, publishes an image
by digest, records a schema-2 deployment manifest for the exact workflow run ID
and positive run attempt, and then invokes the fixed adapter on the
repository-scoped runner.

Promote by merging the reviewed feature PR into `staging`, validating both
health endpoints and the relevant user journeys, then merging the same reviewed
change into `master`. Production also requires the repository variable
`PRODUCTION_DEPLOY_ENABLED=true` and the protected host sentinel
`/srv/secrets/portfolio/production-enabled`.

The adapter verifies the accepted manifest with the shared fixed host
validator, verifies the protected branch head, takes a database backup, pulls
the exact image digest, runs DbUp, replaces the app, and checks `/livez` and
`/healthz`. If health fails it stops the failed application and retains the
database plus backup for paired database/image recovery; it never starts an old
image against a potentially migrated database. The sole manifest and
branch-head exception is the exact, short-lived disaster-recovery approval
created by the root-owned restore command below; its source must still be an
ancestor of `master`.

DbUp migration `009 - Remove Legacy Schema.sql` drops the retired
`legacy.GameNightUserOrders` archive and legacy EF migration journal from
existing environments. Fresh databases never create that schema. Migration
rehearsal, deployment, and backup restore all execute the same exact table-set,
migration-record, and legacy-absence contract.

## Backup, restore, and rollback

Deployments create validated PostgreSQL custom-format dumps. The scheduled
production workflow verifies that the healthy app and database match the
current source/image/volume markers, then packages exactly `database.dump`,
`SOURCE_SHA`, `IMAGE_REF`, and `SHA256SUMS` as
`portfolio-production-TIMESTAMP.backup.tar.age`. It decrypts and extracts that
authenticated package, verifies its inner checksums, fully restores it into an
isolated PostgreSQL container, validates the schema, and uploads the archive
with its outer checksum. Local backups are retained until an explicit operator
retention decision; the job does not prune them. Keep an independent recovery
copy of the age identity outside the production host and its storage.

On a rebuilt host with no Portfolio production release, project containers, or
production database volume, restore one exact package:

```sh
sudo /usr/local/sbin/restore-portfolio-production \
  /path/to/portfolio-production-TIMESTAMP.backup.tar.age \
  /secure/portfolio-age-identity.txt
```

The `.sha256` sidecar must sit beside the archive. The fixed command refuses an
existing volume, verifies the exact four-member package, restores it, checks
the migration journal and basic database integrity, labels the new
`portfolio-prod-postgres-data` volume with the package digest/source/image, and
writes the root-owned, 24-hour approval
`/srv/secrets/portfolio/production-recovery.env`. Its stdout is exactly:

```text
SOURCE_SHA=<40-character SHA>
IMAGE_REF=ghcr.io/lyelt/portfolio@sha256:<64-character digest>
```

Use those identifiers unchanged:

```sh
source_sha='paste the SOURCE_SHA value'
image_ref='paste the IMAGE_REF value'
sudo -iu deploy /usr/local/sbin/deploy-portfolio \
  prod "${source_sha}" "${image_ref}"
sudo rm /srv/secrets/portfolio/production-recovery.env
```

The first command rechecks the approval, volume labels, protected branch
ancestry, and a new pre-migration snapshot. It then lets the package's exact
source image run its migrations and checks the result against that protected
source revision's exact schema contract before starting the app. A digest-keyed
marker under the guarded `prod/recovery-consumed` directory prevents reuse of
that authenticated backup even if the root-owned approval is not removed,
while a different future package can still recover a rebuilt host. If any
value differs or the approval is stale, deployment stops.

Use `MacMiniInfrastructure/docs/RECOVERY.md` for the start-to-finish host or
cloud-VM rebuild, artifact retrieval, app rollout, DNS/tunnel cutover, and
validation drill. Use the previous approved manifest and matching database
backup for an incompatible migration; never delete the current volume or
previous image during diagnosis.

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
