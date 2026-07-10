# Mac mini hosting runbook

Status recorded 2026-07-10: the Mac power settings, Multipass VM, Docker
Engine, shared `web` network, UFW rules, `/srv` skeleton, registered GitHub
runner service, and private Caddy edge service are installed. GitHub Actions
automatically deploys the exact `staging` branch head as an ARM64 image with a
separate healthy PostgreSQL volume. Public HTTPS, migrations, database-aware
readiness, the Caddy Host route, VM restart recovery, and a custom-format
staging backup were verified.

Cloudflared is connected with four registered tunnel connections. Cloudflare is
now authoritative for `ghobrial.dev`, and the proxied staging CNAME and tunnel
route return database-aware `healthy` over HTTPS with an active Universal SSL
certificate and an active HTTP-to-HTTPS redirect. Production containers/data,
production enablement guards, and a production tunnel route remain absent. The
hosting changes are tracked on the long-lived `staging` branch; `master` remains
the production branch and has not received this deployment setup.

## Safety boundaries

- Never open router ports for this design.
- Never commit populated env files or print secret values in logs.
- Never overwrite `/srv/secrets/portfolio/staging.env` unintentionally.
- Do not create a production Cloudflare hostname, change production DNS, start
  production, or remove DigitalOcean without separate explicit approval.
- Do not delete a volume, backup, release, image, cache, service, or existing
  data without explicit approval.
- Production needs both a host sentinel and a GitHub repository variable. Keep
  both absent until approved.

The old DigitalOcean service and its data remain the rollback source until the
new host, data migration, public staging, backups, and recovery are proven.

## Architecture

- Host: Apple M2 Mac mini, 8 GB RAM, macOS 15.6.
- Guest: Ubuntu Server 24.04 ARM64 in Multipass, 4 vCPU, 4 GB RAM, 60 GB disk,
  and 2 GB swap.
- Runtime: Docker Engine 29.6.1 and Docker Compose 5.3.1 from Docker's official
  apt repository; Docker and containerd are enabled at boot.
- Edge: reusable Caddy 2.11.4 plus cloudflared 2026.7.1 Compose project.
- Ingress: outbound Cloudflare Tunnel only; no Docker web port is published.
- Shared proxy network: `web`, fixed at `172.18.0.0/16`. Caddy reserves
  `172.18.0.2`; applications trust only that address for forwarded headers.
- Staging: branch `staging`, project `portfolio-staging`, app alias
  `portfolio-staging-web`, and a root-controlled database-volume selector at
  `/srv/secrets/portfolio/staging-database-volume`. The original volume is
  `portfolio-staging-postgres-data`; restored candidates use the allowlisted
  `portfolio-staging-postgres-restored-*` form.
- Production: branch `master`, project `portfolio-prod`, app alias
  `portfolio-prod-web`, and volume `portfolio-prod-postgres-data`.
- Isolation: staging and production have different env files, credentials,
  internal database networks, volumes, and backup directories.
- Host paths: `/srv/apps`, `/srv/edge`, `/srv/secrets`, `/srv/backups`, and
  `/srv/actions-runner`.

Docker defaults future published ports to VM loopback, uses bounded local logs,
and has live restore enabled. The current design has no `ports` entry and does
not mount the Docker socket into public containers. UFW denies incoming and
routed traffic; SSH is allowed only from the detected Multipass NAT subnet.

## Known pre-cutover work

- The frontend audit reports 125 legacy dependency findings: 15 low, 34
  moderate, 72 high, and 4 critical. A successful build does not remediate
  them. Review production-reachable findings before cutover.
- macOS Software Update offers recommended Sequoia 15.7.7 and Command Line
  Tools 16.4 updates. Apply them in an approved maintenance window and repeat
  recovery tests. Do not install the optional major Tahoe upgrade without a
  separate compatibility review.
- The macOS application firewall is off. AirPlay listens on LAN ports 5000 and
  7000, and Synergy listens on LAN port 24802. Review active use before changing
  those host services or enabling the firewall.
- A full Mac cold boot/power-loss recovery without desktop login is untested.
- Backups currently exist only inside the VM; an encrypted off-VM target and a
  full restore drill are required before production.
- A UPS is strongly recommended.

## 1. Mac host settings

Review or apply the server-style AC power configuration from the repository:

```bash
bash host/configure-macos.sh --check
bash host/configure-macos.sh --apply
```

The live settings disable system sleep, enable restart after power failure, and
enable Wake-on-LAN. Display sleep is unchanged. `disksleep` still reports 10;
on this all-flash Mac that does not suspend the host, but reapply/verify the
admin script during maintenance if a zero value is desired. Check FileVault:

```bash
sudo fdesetup status
```

FileVault is currently off. If it is enabled later, an unexpected reboot may
stop at pre-boot unlock; decide that security/availability tradeoff explicitly.

## 2. Rebuild the Ubuntu VM if ever required

Do not recreate the current VM merely to clear its historical cloud-init schema
warning. For a genuinely new VM, install Multipass with its signed package and
launch from the repository root:

```bash
multipass launch 24.04 \
  --name hosting \
  --cpus 4 \
  --memory 4G \
  --disk 60G \
  --cloud-init host/cloud-init.yaml
multipass exec hosting -- cloud-init status --wait
multipass exec hosting -- cat /srv/HOSTING_BOOTSTRAP.log
```

The tracked cloud-init file validates with quoted `0o644` modes. The current
VM's launch record remains `degraded done` because Multipass reserialized an
earlier template's modes as integers; all bootstrap commands completed and the
live services/files were independently verified.

Install repository-managed files after bootstrap:

```bash
bash host/install-vm-files.sh hosting
```

This idempotent helper installs the edge and portfolio Compose files, Caddyfile,
secret examples, fixed root-owned helpers, Docker daemon config, this runbook,
and the official ARM64 runner archive when absent. The runner version/checksum
are pinned in the helper. It does not overwrite populated secrets or enable
cloudflared, runner registration, production, or DNS. It starts only Caddy and
installs GitHub's recommended `needrestart` exclusion so package maintenance
cannot restart a registered runner in the middle of a job.

## 3. Credentials and local configuration

Still required from the owner:

- Confirmation of `staging.ghobrial.dev` and `ghobrial.dev`.
- Production PostgreSQL password and matching connection string.
- Existing production JWT signing key, or explicit rotation approval. HS256
  keys must contain at least 32 UTF-8 bytes.
- A custom-format dump of the existing DigitalOcean production database.

The staging database password and JWT key were generated inside the VM and are
stored only in `/srv/secrets/portfolio/staging.env` as `root:deploy` mode `0640`.

Enter the VM, copy examples, and use `sudoedit`; do not display values:

```bash
multipass shell hosting
sudo install -o root -g deploy -m 0640 \
  /srv/secrets/examples/cloudflare-tunnel.env.example \
  /srv/secrets/cloudflare-tunnel.env
sudo install -o root -g deploy -m 0640 \
  /srv/secrets/examples/portfolio-prod.env.example \
  /srv/secrets/portfolio/prod.env
sudoedit /srv/secrets/cloudflare-tunnel.env
sudoedit /srv/secrets/edge.env
sudoedit /srv/secrets/portfolio/prod.env
exit
```

Use distinct staging/production values. In each app env file,
`CONNECTION_STRING` must use the same database, username, and password as the
three `POSTGRES_*` values. Verify metadata without reading values:

```bash
multipass exec hosting -- sudo find /srv/secrets -type f \
  -printf '%M %u:%g %p\n'
```

Do not run `cat`, shell tracing, or an expanded `docker compose config` against
populated env files in any captured log.

## 4. Enable staging-only Cloudflare access

Caddy and cloudflared are running privately; four tunnel connections registered
successfully. For restart/recovery, manage the full edge project as `deploy`:

```bash
multipass shell hosting
sudo -iu deploy
cd /srv/edge
docker compose -p edge config --quiet
docker compose -p edge up -d
docker compose -p edge ps
exit
exit
```

In Cloudflare, create one remotely managed tunnel and initially add only:

- Public hostname: `staging.ghobrial.dev`.
- Origin service: `http://edge-proxy:8080`.
- HTTP Host Header override: `staging.ghobrial.dev`.
- HTTPS redirect: enabled at Cloudflare.

Do not create the `ghobrial.dev` tunnel hostname, alter production DNS, or
remove the DigitalOcean route. Future apps join `web` with a unique alias and
receive a hostname block in `/srv/edge/conf/Caddyfile`.

## 5. Register the GitHub Actions runner

GitHub Actions runner 2.335.1 for Linux ARM64 is installed at
`/srv/actions-runner/portfolio`; its official SHA-256 was verified. It is
registered as `hosting-portfolio`, enabled at boot, and listening for jobs as
the `deploy` user. The transient registration-token file was removed.

For a future rebuild or deliberate re-registration, open **Lyelt/Portfolio >
Settings > Actions > Runners > New self-hosted runner**, obtain a short-lived
repository registration token, and then:

```bash
multipass shell hosting
sudo install -o root -g root -m 0600 \
  /srv/secrets/examples/github-runner.env.example \
  /srv/secrets/github-runner.env
sudoedit /srv/secrets/github-runner.env
sudo /usr/local/sbin/register-portfolio-runner
exit
```

Set exactly one `RUNNER_REGISTRATION_TOKEN` assignment. The helper passes it via
an environment input instead of the process command line, registers the runner
as `deploy`, installs/starts its system service, and removes the transient token
file after successful configuration.

Workflows accept trusted pushes to `staging` and `master`; they do not execute
fork pull-request code. A self-hosted runner with Docker access effectively
controls this VM, so protect both branches and limit repository administration.

## 6. Branch deployment behavior

- Push/merge to `staging` invokes the fixed host entrypoint for the exact branch
  head and deploys project `portfolio-staging`.
- Push/merge to `master` is the production path. The workflow is skipped unless
  GitHub variable `PRODUCTION_DEPLOY_ENABLED` is exactly `true`.
- Even with that variable, production fails before mutation unless
  `/srv/secrets/portfolio/production-enabled` exists as a root-owned guard.
- Production backs up and validates PostgreSQL before build/restart.
- Once an environment has a current release, both staging and production create
  and validate a custom-format PostgreSQL dump plus SHA-256 sidecar before every
  build or service restart.
- Deployment applies migrations before replacing the app, checks readiness by
  connecting to PostgreSQL, and rolls the app image back if readiness fails.
- Deployment refuses to begin below 12 GiB VM free space. It never silently
  deletes releases, images, caches, or backups.

Do not create the production guard or GitHub variable during setup. After
explicit production approval only, create the guard inside the VM:

```bash
sudo install -o root -g deploy -m 0640 /dev/null \
  /srv/secrets/portfolio/production-enabled
```

The initial `staging` publish includes the workflow and deployment files needed
for this trigger. Do not merge/push these deployment changes to `master` until
production migration is explicitly approved. Enabling deployment is separate
from authorizing public production traffic or a production tunnel route.

## 7. Import and protect production data

Production cannot initialize an empty database. Before its first deployment,
export a custom-format PostgreSQL dump from DigitalOcean, transfer it without
printing it, and install it beneath `/srv/backups/portfolio/import` as
`root:root` mode `0600`. Confirm the production env file matches the source.

Only after explicit approval and creation of the host guard in section 6, run:

```bash
sudo /usr/local/sbin/import-production-database \
  /srv/backups/portfolio/import/digitalocean-production.dump
```

The helper validates the archive before creating anything, refuses any existing
production volume/current release/container, takes the global deployment lock,
restores into an isolated container with no network or host port, verifies that
tables exist, stops the container, and creates a root-owned import-complete
marker. It does not start the app, create a Cloudflare hostname, change DNS, or
enable the GitHub variable.

If import fails after volume creation, the volume is deliberately retained for
inspection and the helper refuses to overwrite it. Any deletion/retry requires
new explicit approval.

Before enabling automatic production deploys:

1. Restore the imported/pre-deploy dump into a separate disposable test volume.
2. Verify representative users/data and application behavior.
3. Store an encrypted backup outside this Mac/VM.
4. Review every new migration for backward compatibility.
5. Write the exact database restore/rollback commands for that release.

App rollback can restore the previous image but cannot reverse schema changes.
Production enablement and DNS cutover are blocked until the restore drill works.

## 7a. Reversible staging database switch

Staging uses a protected volume selector rather than deleting or renaming Docker
volumes. The selector is a one-line, root-owned `0640` file. Normal deployments
read it but cannot modify it. Production does not use a flexible selector and
remains fixed to `portfolio-prod-postgres-data`.

Before switching, restore a validated PostgreSQL 17 custom-format archive into a
new volume initialized with the existing staging `POSTGRES_*` credentials. Give
the volume these labels:

- `com.docker.compose.project=portfolio-staging`
- `com.docker.compose.volume=db_data`
- `com.ghobrial.portfolio.purpose=staging-restored-candidate`
- `com.ghobrial.portfolio.source-sha256=<archive SHA-256>`

Privately test DbUp and the exact intended application image on an internal-only
network. Stop those test containers before the switch, but retain the candidate
volume. Then run the fixed helper with the current staging commit and approved
archive checksum:

```bash
sudo /usr/local/sbin/switch-portfolio-staging-database \
  portfolio-staging-postgres-restored-<safe-id> \
  <40-character-current-staging-sha> \
  <64-character-approved-archive-sha256>
```

The helper takes the global deployment lock, stops the app to quiesce writes,
refuses replacement if the old staging database gained non-seed rows, creates a
validated backup and checksum, stops the old database, atomically changes the
selector, recreates the database and app, runs DbUp, and verifies local and
public health. On failure it switches back to the retained original volume and
attempts to restore the app. It never removes either volume.

For a deliberate manual rollback after a successful switch, first stop the app
and back up the active candidate, then rerun a reviewed switch procedure against
the retained original volume. Do not edit the selector while a deployment is
running, and never use `docker compose down -v`, `docker volume rm`, or an
automatic prune operation.

## 8. Verification

Current checks, runnable from the Mac before credentials exist:

```bash
multipass list
multipass exec hosting -- sudo docker version
multipass exec hosting -- sudo docker compose version
multipass exec hosting -- sudo docker network inspect web \
  --format '{{.Name}} {{.Driver}} {{(index .IPAM.Config 0).Subnet}}'
multipass exec hosting -- sudo -u deploy bash -lc \
  'cd /srv/edge && docker compose -p edge ps'
multipass exec hosting -- sudo docker exec edge-caddy-1 \
  wget -qO- http://127.0.0.1:8080/edge-healthz
multipass exec hosting -- sudo docker ps \
  --filter label=com.docker.compose.project=portfolio-staging
multipass exec hosting -- sudo systemctl is-active docker unattended-upgrades
multipass exec hosting -- sudo ufw status verbose
```

Expected now: Docker and Compose report versions; Caddy, staging app, and
staging DB are healthy; Caddy returns `healthy`; the runner service is active;
no host port is published; UFW permits SSH only from Multipass NAT; cloudflared
is connected; public staging returns `healthy` over HTTPS; Universal SSL is
active; HTTP redirects to HTTPS; and production is absent.

After the staging-only Cloudflare hostname exists, run inside the VM:

```bash
sudo bash -lc 'cd /srv/actions-runner/portfolio && ./svc.sh status'
sudo -iu deploy
cd /srv/edge
docker compose -p edge ps
curl -fsS https://staging.ghobrial.dev/healthz
exit
```

Expected then: runner service active, Caddy healthy, cloudflared running, and
public staging returning `healthy`. These cannot pass before credentials/routes
exist.

## 9. Capacity, backups, and maintenance

Check capacity regularly:

```bash
multipass exec hosting -- df -h / /srv/backups
multipass exec hosting -- sudo docker system df
```

One bootstrap generated several GiB of BuildKit cache. Automatic pruning is
disabled under the no-destructive-operation rule; the 12 GiB deployment guard
stops new builds before exhaustion. Before routine deployments, approve a
retention policy that keeps at least current/prior app images and releases,
preserves enough database backups for rollback, and copies encrypted backups
off-VM. Only then prune older unused cache/images/releases/backups. The VM must
never hold the sole production backup.

Validated pre-deploy dumps and SHA-256 sidecars protect deployment events, not
data written between deployments. Before production cutover, configure and prove a scheduled daily
production `pg_dump`, bounded retention, encrypted off-VM copy, failure alert,
and recurring restore test. Keep production disabled until the destination,
retention window, and alert recipient are explicitly chosen; they cannot be
safely inferred during this setup.

Ubuntu unattended upgrades are enabled without automatic reboot. Schedule
kernel/host reboots and the recommended macOS minor update, then retest.

## 10. Reboot and recovery

VM restart recovery has passed: Caddy, staging app, and staging database returned
healthy with data intact. A Mac reboot interrupts the host; obtain approval and
record status before:

```bash
sudo shutdown -r now
```

Without opening an interactive desktop session, verify from another machine that
Multipass restored `hosting`, Docker restored edge/staging, the registered runner
is active, the tunnel reconnected, and staging data persisted. Separately run a
database restore drill. Test power-loss recovery only in an approved maintenance
window, preferably with a UPS. Any failure blocks production cutover.

## Setup record

- Audited CPU/architecture, macOS, storage, RAM, host tools, power settings,
  FileVault, update availability, listeners, and firewall state.
- Removed Xcode/iOS simulator data only after owner instruction; no unrelated
  user data/service was deleted.
- Installed signed Multipass 1.16.3 and created the Ubuntu ARM64 VM.
- Installed Docker from its official apt repo; enabled boot services, UFW,
  unattended security updates, swap, capped logs, and `/srv` permissions.
- Installed pinned ARM64 Caddy/cloudflared/PostgreSQL images and official GitHub
  runner 2.335.1; the runner is active and its transient credential was removed,
  and cloudflared has four registered connections.
- Built the portfolio image successfully with immutable base digests, exercised
  migrations/readiness/Caddy routing, and validated staging backup/restart.
- The first automated staging run exposed an archive `umask` permission defect;
  it was cancelled before promotion, the bootstrap image was restored, and both
  archive modes and non-root runtime access were regression-tested after repair.
- The corrective automated run built the exact branch head, validated runtime
  permissions, applied migrations, promoted the healthy app, and updated the
  guarded `current` release link successfully.
- Verified the staging tunnel route over HTTPS. Cloudflare nameserver migration,
  staging DNS, Universal SSL, and the HTTP redirect are active; the production
  project, volume, credentials, import marker, sentinel, and route are absent.
- Kept `master`, production deployment guards, the production tunnel route, and
  router configuration untouched; only `staging` is enabled for deployment.
