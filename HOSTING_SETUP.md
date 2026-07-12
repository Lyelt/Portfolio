# Mac mini hosting runbook

Status recorded 2026-07-11: the Mac power settings, Multipass VM, Docker
Engine, shared `web` network, UFW rules, `/srv` skeleton, registered GitHub
runner service, and private Caddy edge service are installed. GitHub Actions
automatically deploys the exact `staging` branch head as an ARM64 image with a
separate healthy PostgreSQL volume. The authoritative DigitalOcean MySQL data
was converted and staging now runs from
`portfolio-staging-postgres-restored-20260710t200625z`: 24 source tables and
30,410 rows including the legacy EF journal were content-verified before
cutover. Public HTTPS, authenticated reads, migrations, database-aware
readiness, the Caddy Host route, VM restart recovery, checksum-backed staging
backups, and rollback retention were verified. Production was restored into its
separate guarded volume, restore-tested with the exact application image, and
deployed privately from `master` at `dd97763782bdcf61c7393ccb58bf92ab7724b724`.

Cloudflared is connected with four registered tunnel connections. Cloudflare is
now authoritative for `ghobrial.dev`, and the proxied staging CNAME and tunnel
route return database-aware `healthy` over HTTPS with an active Universal SSL
certificate and an active HTTP-to-HTTPS redirect. The production containers,
data, enablement guards, pre-deploy backup, and private Caddy route are healthy;
the production tunnel route remains separate from deployment and is not yet
cut over in this status record. `staging` remains the pre-production branch and
`master` is the production deployment branch.

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

The old DigitalOcean service and its MySQL data remain the production source
and rollback evidence until production migration and cutover are separately
approved and proven.

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
- Host mutations across application runners serialize on the shared
  `/srv/apps/.deploy.lock`, preventing concurrent builds or backups from
  exhausting the VM.

Docker defaults future published ports to VM loopback, uses bounded local logs,
and has live restore enabled. The current design has no `ports` entry and does
not mount the Docker socket into public containers. UFW denies incoming and
routed traffic; SSH is allowed only from the detected Multipass NAT subnet.

## Known pre-cutover work

- The Angular 21 refresh reports zero npm audit findings during the exact image
  build. GitHub may continue displaying legacy alerts until it rescans the new
  default-branch lockfile.
- macOS Software Update offers recommended Sequoia 15.7.7 and Command Line
  Tools 16.4 updates. Apply them in an approved maintenance window and repeat
  recovery tests. Do not install the optional major Tahoe upgrade without a
  separate compatibility review.
- The macOS application firewall is off. AirPlay listens on LAN ports 5000 and
  7000, and Synergy listens on LAN port 24802. Review active use before changing
  those host services or enabling the firewall.
- A full Mac cold boot/power-loss recovery without desktop login is untested.
- The production seed has decrypt-tested age-encrypted copies in iCloud Drive
  and the Mac login Keychain holds its recovery identity. Production restore
  drills passed; confirm the first scheduled GitHub artifact after promotion.
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

- Production PostgreSQL password and matching connection string.
- Existing production JWT signing key, or explicit rotation approval. HS256
  keys must contain at least 32 UTF-8 bytes.
- A fresh authoritative MySQL backup from DigitalOcean, unless its canonical
  checksum still exactly matches the already converted source snapshot.
- An encrypted off-VM backup destination and failure-alert recipient.
- A dedicated age identity stored both in `/srv/secrets/portfolio/backup.env`
  and in a separate recovery system outside the VM.

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
sudo install -o root -g deploy -m 0640 \
  /srv/secrets/examples/portfolio-backup.env.example \
  /srv/secrets/portfolio/backup.env
sudoedit /srv/secrets/cloudflare-tunnel.env
sudoedit /srv/secrets/edge.env
sudoedit /srv/secrets/portfolio/prod.env
sudoedit /srv/secrets/portfolio/backup.env
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

The shared edge configuration also reserves these Five Roosters routes once
that app's isolated containers and Cloudflare public hostnames are installed:

- `staging.fiveroostersbakery.com` to `five-roosters-staging-web:8080`.
- `fiveroostersbakery.com` and `www.fiveroostersbakery.com` to
  `five-roosters-prod-web:8080`.

All three Cloudflare public hostnames must use origin service
`http://edge-proxy:8080` and an HTTP Host Header override matching the public
hostname. Do not expose a VM port or start a second tunnel for the bakery.

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

Production cannot initialize an empty database. The linked DigitalOcean
PostgreSQL service is empty: the December 2025 `pgloader` attempts failed MySQL
authentication before copying data. Do not use that empty PostgreSQL service as
the production source.

Instead, take a fresh MySQL dump, restore it privately, and run the reviewed
`migration/portfolio-etl` converter against a new PostgreSQL 17 target created
from all DbUp scripts. The converter must report exact counts/content hashes and
complete every invariant. Create a custom-format PostgreSQL dump with
`--no-owner --no-acl`, checksum it, restore-test it with the exact production
image, and install it beneath `/srv/backups/portfolio/import` as `root:root`
mode `0600`. Confirm the production env file matches the PostgreSQL restore
target.

Only after explicit approval and creation of the host guard in section 6, run:

```bash
sudo /usr/local/sbin/import-production-database \
  /srv/backups/portfolio/import/portfolio-mysql-to-postgres-<timestamp>.dump
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
active; HTTP redirects to HTTPS; the protected selector and live database mount
both name `portfolio-staging-postgres-restored-20260710t200625z`; migrated users
and application data are present; and production is absent.

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
data written between deployments. The default-branch workflow
`.github/workflows/backup-production.yml` runs daily at 08:17 UTC and can also
be dispatched manually. It invokes the fixed host helper, creates a custom
PostgreSQL dump, encrypts it with authenticated age encryption, decrypt-validates
it, restores it into a disposable network-isolated PostgreSQL instance, checks
the restored schema and migration history, and uploads only the encrypted archive
and its SHA-256 sidecar as a 30-day GitHub Actions artifact. Validated encrypted
copies remain in `/srv/backups/portfolio/daily` for 90 days. GitHub Actions run
failure is the primary backup alert; keep Actions notifications enabled for this
repository and investigate any missed or failed scheduled run.

The production seed also has a decrypt-tested encrypted copy in the Mac owner's
iCloud Drive. The recurring backup age identity is stored in the macOS login
Keychain as `Portfolio Production Backup Age Identity` and provisioned separately
into the VM backup env file. Never print it in a shell transcript or Actions log. Run a
manual workflow after first production deployment and confirm the artifact is
downloadable before treating the recurring backup requirement as complete.

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
- Diagnosed the empty DigitalOcean PostgreSQL service: its December 2025
  `pgloader` attempts failed MySQL authentication, while the original MySQL 8.1
  data remained intact. Verified the current and December MySQL dumps have the
  same canonical content checksum.
- Saved and verified root-only MySQL and PostgreSQL source backups on both the
  droplet and VM. Restored all 24 MySQL tables privately and passed MySQL table
  integrity checks before conversion.
- Added DbUp migrations 007/008 for the corrected `CardIds`/`DogTimes` keys,
  claim identities, and preserved legacy tables. Added explicit
  `timestamp(6) without time zone` application mappings so imported temporal
  values retain their MySQL clock digits and intended UTC/wall-clock semantics.
- Converted 30,410 rows into PostgreSQL 17 and verified content hashes, counts,
  keys, indexes, foreign keys, identity sequences, the Guest identity, and
  game-night users. ASP.NET Identity's derived normalization fields were
  uppercased to preserve MySQL's former case-insensitive lookup behavior under
  PostgreSQL.
- Created and restore-validated
  `/srv/backups/portfolio/import/portfolio-mysql-to-postgres-20260710T200625Z.dump`
  (SHA-256
  `3b914f923e5909a070e40a5a2394aaf7fa20c950a2df70b6133fbd2bef69d21c`).
  The exact commit image passed Guest login plus authenticated bowling, dog,
  speedrun, and game-night reads on the restored candidate.
- Deployed commit `b1a338e53bf0f87e151ed2d1ccb79958c3601a81`, then used the guarded
  switch helper to move staging to
  `portfolio-staging-postgres-restored-20260710t200625z`. Public health, Guest
  login, representative authenticated reads, 19 users, 2,421 bowling games,
  24,210 bowling frames, and all migration/constraint checks passed after
  cutover.
- Retained the original `portfolio-staging-postgres-data` volume stopped after
  cutover, plus validated pre-deployment and quiesced pre-cutover dumps with
  SHA-256 sidecars. Future staging deploys read the protected selector and take
  a validated checksum-backed backup before mutation.
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
