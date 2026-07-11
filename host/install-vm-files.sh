#!/usr/bin/env bash

set -Eeuo pipefail
umask 027

readonly VM_NAME="${1:-hosting}"
readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
readonly REPOSITORY_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd -P)"
readonly RUNNER_VERSION='2.335.1'
readonly RUNNER_ARCHIVE="actions-runner-linux-arm64-${RUNNER_VERSION}.tar.gz"
readonly RUNNER_SHA256='6d1e85bfd1a506a8b17c1f1b9b57dba458ffed90898799aaa9f599520b0d9207'

command -v multipass >/dev/null 2>&1 || {
  printf 'Multipass is not installed.\n' >&2
  exit 1
}
multipass info "${VM_NAME}" >/dev/null

remote_stage="$(multipass exec "${VM_NAME}" -- mktemp --directory /tmp/portfolio-hosting-install.XXXXXX)"
cleanup() {
  multipass exec "${VM_NAME}" -- rm -rf -- "${remote_stage}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

transfer() {
  local source="$1"
  local destination_name="$2"
  multipass transfer "${REPOSITORY_ROOT}/${source}" "${VM_NAME}:${remote_stage}/${destination_name}"
}

transfer HOSTING_SETUP.md HOSTING_SETUP.md
transfer host/actions-runner-needrestart.conf actions-runner-needrestart.conf
transfer host/docker-daemon.json docker-daemon.json
transfer deploy/edge/compose.yml edge-compose.yml
transfer deploy/edge/conf/Caddyfile Caddyfile
transfer deploy/portfolio/compose.yml portfolio-compose.yml
transfer deploy/portfolio/deploy-portfolio deploy-portfolio
transfer deploy/portfolio/switch-staging-database switch-staging-database
transfer deploy/portfolio/staging-database-volume.default staging-database-volume.default
transfer deploy/portfolio/import-production-database import-production-database
transfer deploy/portfolio/backup-production backup-production
transfer deploy/portfolio/register-runner register-runner
for example in "${REPOSITORY_ROOT}"/deploy/secrets/*.env.example; do
  multipass transfer "${example}" "${VM_NAME}:${remote_stage}/$(basename "${example}")"
done

multipass exec "${VM_NAME}" -- sudo install -d -o deploy -g deploy -m 0750 \
  /srv/edge /srv/edge/conf /srv/apps/portfolio /srv/secrets/examples \
  /srv/backups/portfolio/import /srv/backups/portfolio/staging \
  /srv/backups/portfolio/prod /srv/backups/portfolio/daily
multipass exec "${VM_NAME}" -- sudo install -o root -g deploy -m 0644 \
  "${remote_stage}/HOSTING_SETUP.md" /srv/HOSTING_SETUP.md
multipass exec "${VM_NAME}" -- sudo install -o root -g root -m 0644 \
  "${remote_stage}/edge-compose.yml" /srv/edge/compose.yml
multipass exec "${VM_NAME}" -- sudo install -o root -g root -m 0644 \
  "${remote_stage}/Caddyfile" /srv/edge/conf/Caddyfile
multipass exec "${VM_NAME}" -- sudo chmod 0755 /srv/edge/conf
multipass exec "${VM_NAME}" -- sudo install -o root -g root -m 0644 \
  "${remote_stage}/portfolio-compose.yml" /srv/apps/portfolio/compose.reference.yml
multipass exec "${VM_NAME}" -- sudo install -o root -g root -m 0755 \
  "${remote_stage}/deploy-portfolio" /usr/local/sbin/deploy-portfolio
multipass exec "${VM_NAME}" -- sudo install -o root -g root -m 0755 \
  "${remote_stage}/switch-staging-database" /usr/local/sbin/switch-portfolio-staging-database
multipass exec "${VM_NAME}" -- sudo install -o root -g root -m 0755 \
  "${remote_stage}/import-production-database" /usr/local/sbin/import-production-database
multipass exec "${VM_NAME}" -- sudo install -o root -g root -m 0755 \
  "${remote_stage}/backup-production" /usr/local/sbin/backup-portfolio-production
multipass exec "${VM_NAME}" -- sudo install -o root -g root -m 0755 \
  "${remote_stage}/register-runner" /usr/local/sbin/register-portfolio-runner
multipass exec "${VM_NAME}" -- sudo install -d -o root -g root -m 0755 \
  /etc/needrestart/conf.d
multipass exec "${VM_NAME}" -- sudo install -o root -g root -m 0644 \
  "${remote_stage}/actions-runner-needrestart.conf" \
  /etc/needrestart/conf.d/actions_runner_services.conf

for example in "${REPOSITORY_ROOT}"/deploy/secrets/*.env.example; do
  name="$(basename "${example}")"
  multipass exec "${VM_NAME}" -- sudo install -o root -g deploy -m 0640 \
    "${remote_stage}/${name}" "/srv/secrets/examples/${name}"
done

if ! multipass exec "${VM_NAME}" -- sudo test -e /srv/secrets/edge.env; then
  multipass exec "${VM_NAME}" -- sudo install -o root -g deploy -m 0640 \
    "${remote_stage}/edge.env.example" /srv/secrets/edge.env
fi

if ! multipass exec "${VM_NAME}" -- sudo test -e /srv/secrets/portfolio/staging-database-volume; then
  multipass exec "${VM_NAME}" -- sudo install -o root -g deploy -m 0640 \
    "${remote_stage}/staging-database-volume.default" \
    /srv/secrets/portfolio/staging-database-volume
fi

multipass exec "${VM_NAME}" -- sudo dockerd --validate --config-file "${remote_stage}/docker-daemon.json"
multipass exec "${VM_NAME}" -- sudo install -o root -g root -m 0644 \
  "${remote_stage}/docker-daemon.json" /etc/docker/daemon.json

if ! multipass exec "${VM_NAME}" -- sudo test -x /srv/actions-runner/portfolio/config.sh; then
  multipass exec "${VM_NAME}" -- curl --proto '=https' --tlsv1.2 --fail --location --show-error \
    --output "${remote_stage}/${RUNNER_ARCHIVE}" \
    "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${RUNNER_ARCHIVE}"
  multipass exec "${VM_NAME}" -- bash -lc \
    "printf '%s  %s\\n' '${RUNNER_SHA256}' '${remote_stage}/${RUNNER_ARCHIVE}' | sha256sum --check --strict"
  multipass exec "${VM_NAME}" -- sudo tar --extract --gzip --file "${remote_stage}/${RUNNER_ARCHIVE}" \
    --directory /srv/actions-runner/portfolio
  multipass exec "${VM_NAME}" -- sudo chown -R deploy:deploy /srv/actions-runner/portfolio
  multipass exec "${VM_NAME}" -- sudo /srv/actions-runner/portfolio/bin/installdependencies.sh
fi

multipass exec "${VM_NAME}" -- sudo -u deploy bash -lc \
  'cd /srv/edge && docker compose -p edge up --detach --wait --wait-timeout 60 caddy'

printf '%s\n' \
  "Installed repository-managed hosting files into VM ${VM_NAME}." \
  'No populated secret was overwritten.' \
  'Cloudflared, runner registration, production services, and DNS were not enabled.'
