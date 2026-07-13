# Portfolio deployment operations

Portfolio runs in the shared Mac mini Multipass VM. The
`Lyelt/MacMiniInfrastructure` repository owns the VM bootstrap, Docker host
policy, Caddy, cloudflared, the external `web` network, runner installation,
deployment-manifest receiver, and host recovery tooling. This repository owns
only Portfolio's image, Compose model, database migrations, environment
contract, deployment adapter, and database backup helper.

## Environment map

| Item | Staging | Production |
| --- | --- | --- |
| Git branch | `staging` | `master` |
| Compose project | `portfolio-staging` | `portfolio-prod` |
| Caddy alias | `portfolio-staging-web` | `portfolio-prod-web` |
| Public host | `staging.ghobrial.dev` | `ghobrial.dev`, `www.ghobrial.dev` |
| PostgreSQL volume | selected by `/srv/secrets/portfolio/staging-database-volume` | `portfolio-prod-postgres-data` |
| Secret file | `/srv/secrets/portfolio/staging.env` | `/srv/secrets/portfolio/prod.env` |

Both environments run an app and PostgreSQL 17 on separate internal database
networks. Only the app joins the shared `web` network. No application or
database port is published to the VM or LAN.

## Install Portfolio-owned VM files

Install the infrastructure repository first. Then, from this repository on the
Mac, install the fixed Portfolio adapters and reference files:

```sh
bash host/install-vm-files.sh hosting
```

The installer does not modify the shared edge, install or register runners,
overwrite populated secrets, enable production, start an app, or change DNS.
It installs:

- `/usr/local/sbin/deploy-portfolio`;
- `/usr/local/sbin/backup-portfolio-production`;
- `/srv/apps/portfolio/compose.reference.yml`;
- `/srv/PORTFOLIO_HOSTING.md`; and
- Portfolio-only secret examples under `/srv/secrets/examples`.

Runner installation and re-registration use
`MacMiniInfrastructure/host/register-runner.sh`.

## Secrets and guards

Populate environment files with `sudoedit`. Keep them as regular files owned
by `root:deploy` with mode `0640`. Each environment requires matching
`POSTGRES_*` values and `CONNECTION_STRING`, plus its JWT settings.

Production deployment requires both:

- GitHub repository variable `PRODUCTION_DEPLOY_ENABLED=true`; and
- `/srv/secrets/portfolio/production-enabled` on the VM.

The imported production database is also marked by
`/srv/secrets/portfolio/production-import-complete`. The one-time MySQL
conversion and import programs were removed after the verified migration; Git
history preserves them. Future recovery uses the PostgreSQL backups rather than
reimporting the retired MySQL service.

## Deployment behavior

The GitHub workflow builds and tests on GitHub-hosted runners, publishes a
multi-architecture GHCR image, and records the exact digest in a deployment
manifest. Only the deployment job uses the repository-scoped ARM64 runner.

The fixed adapter:

1. verifies the requested branch head and immutable image digest;
2. takes and validates a PostgreSQL backup when an environment already exists;
3. pulls the image without building on the VM;
4. starts PostgreSQL and runs the bundled DbUp migration service;
5. replaces the app and checks `/livez` and `/healthz`; and
6. restores the previous app image if the new app fails health checks.

Database migrations are not automatically reversed. An incompatible migration
requires restoring the matching database backup with the previous image.

## Backups

Every deployment creates a custom-format PostgreSQL dump and SHA-256 sidecar
before mutation. The scheduled production workflow additionally encrypts a
fresh dump with age, decrypts it, fully restores it into an isolated disposable
PostgreSQL instance, validates the schema, and uploads the encrypted artifact.

Keep `/srv/secrets/portfolio/backup.env` and its age identity outside Git. A
recovery copy of that identity must exist outside the VM.

## Verification

```sh
curl --fail https://staging.ghobrial.dev/livez
curl --fail https://staging.ghobrial.dev/healthz
curl --fail https://ghobrial.dev/livez
curl --fail https://ghobrial.dev/healthz
```

Inside the VM, inspect the two Compose projects without printing their
environment values:

```sh
sudo -iu deploy docker compose -p portfolio-staging ps
sudo -iu deploy docker compose -p portfolio-prod ps
```

For shared edge, VM, runner, and Cloudflare recovery, use the infrastructure
repository runbook.
