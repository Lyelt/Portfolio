# Portfolio deployment boundary

The shared Mac mini hosting layer is owned by the private
[`Lyelt/MacMiniInfrastructure`](https://github.com/Lyelt/MacMiniInfrastructure)
repository. Portfolio does not contain Caddy, Cloudflare Tunnel, shared Docker
network, VM bootstrap, runner registration, or host-wide lock setup.

Portfolio owns its application source and tests, Docker image and CI, its
Portfolio Compose model, PostgreSQL migrations, database backups/imports,
application secrets, and the application-specific deployment adapter in
`deploy/portfolio/`. The adapter consumes a published immutable image digest;
it never builds application code on the Mac mini.

The staging and production Compose projects join the infrastructure-owned
external `web` network using `portfolio-staging-web` and `portfolio-prod-web`.
The infrastructure Caddyfile is the only shared edge configuration and routes
configurable hostnames to those aliases. Portfolio keeps `/livez` and
`/healthz` unchanged.

Portfolio deployments remain independently deployable from protected
`staging` and `master` branches. They publish a manifest containing the exact
GHCR image digest, commit SHA, branch/environment mapping, Compose files, and
both health paths. The infrastructure receiver accepts that manifest and the
Portfolio adapter performs the database-aware rollout under the VM-wide
`/srv/apps/.deploy.lock`.

Do not place populated environment files, database backups, JWT keys, age
identities, Cloudflare tokens, runner tokens, or other credentials in this
repository. For Mac installation, routing, Cloudflare, shared runner setup,
rollback boundaries, and future sites, use the infrastructure repository's
runbook.
