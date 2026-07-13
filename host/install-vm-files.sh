#!/usr/bin/env bash

set -Eeuo pipefail
umask 027

readonly VM_NAME="${1:-hosting}"
readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
readonly REPOSITORY_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd -P)"

command -v multipass >/dev/null 2>&1 || {
  printf '%s\n' 'Multipass is not installed.' >&2
  exit 1
}
multipass info "${VM_NAME}" >/dev/null

remote_stage="$(multipass exec "${VM_NAME}" -- mktemp --directory /tmp/portfolio-app-install.XXXXXX)"
cleanup() {
  multipass exec "${VM_NAME}" -- rm -rf -- "${remote_stage}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

transfer() {
  local source="$1"
  local destination_name="$2"
  multipass transfer "${REPOSITORY_ROOT}/${source}" "${VM_NAME}:${remote_stage}/${destination_name}"
}

transfer HOSTING_SETUP.md PORTFOLIO_HOSTING.md
transfer deploy/portfolio/compose.yml portfolio-compose.yml
transfer deploy/portfolio/deploy-portfolio deploy-portfolio
transfer deploy/portfolio/backup-production backup-portfolio-production
transfer deploy/portfolio/staging-database-volume.default staging-database-volume.default
for example in "${REPOSITORY_ROOT}"/deploy/secrets/portfolio-*.env.example; do
  multipass transfer "${example}" "${VM_NAME}:${remote_stage}/$(basename "${example}")"
done

for required_path in \
  /srv/apps/.deploy.lock \
  /srv/edge/compose.yml \
  /usr/local/sbin/receive-deployment-manifest; do
  multipass exec "${VM_NAME}" -- sudo test -e "${required_path}" || {
    printf 'Infrastructure prerequisite is missing in VM %s: %s\n' "${VM_NAME}" "${required_path}" >&2
    exit 1
  }
done

multipass exec "${VM_NAME}" -- sudo test -f /srv/apps/.deploy.lock
multipass exec "${VM_NAME}" -- sudo test ! -L /srv/apps/.deploy.lock
lock_metadata="$(multipass exec "${VM_NAME}" -- sudo stat -c '%U:%G %a' /srv/apps/.deploy.lock)"
[[ "${lock_metadata}" == 'deploy:deploy 640' ]] || {
  printf '%s\n' 'Shared deployment lock must be deploy:deploy with mode 0640.' >&2
  exit 1
}

multipass exec "${VM_NAME}" -- sudo install -d -o deploy -g deploy -m 0750 \
  /srv/apps/portfolio \
  /srv/apps/portfolio/staging/releases \
  /srv/apps/portfolio/prod/releases \
  /srv/backups/portfolio/staging \
  /srv/backups/portfolio/prod \
  /srv/backups/portfolio/daily
multipass exec "${VM_NAME}" -- sudo install -d -o root -g deploy -m 0750 \
  /srv/secrets/portfolio \
  /srv/secrets/examples

multipass exec "${VM_NAME}" -- sudo install -o root -g deploy -m 0644 \
  "${remote_stage}/PORTFOLIO_HOSTING.md" /srv/PORTFOLIO_HOSTING.md
multipass exec "${VM_NAME}" -- sudo install -o root -g root -m 0644 \
  "${remote_stage}/portfolio-compose.yml" /srv/apps/portfolio/compose.reference.yml
multipass exec "${VM_NAME}" -- sudo install -o root -g root -m 0755 \
  "${remote_stage}/deploy-portfolio" /usr/local/sbin/deploy-portfolio
multipass exec "${VM_NAME}" -- sudo install -o root -g root -m 0755 \
  "${remote_stage}/backup-portfolio-production" /usr/local/sbin/backup-portfolio-production

for example in "${REPOSITORY_ROOT}"/deploy/secrets/portfolio-*.env.example; do
  name="$(basename "${example}")"
  multipass exec "${VM_NAME}" -- sudo install -o root -g deploy -m 0640 \
    "${remote_stage}/${name}" "/srv/secrets/examples/${name}"
done

if ! multipass exec "${VM_NAME}" -- sudo test -e /srv/secrets/portfolio/staging-database-volume; then
  multipass exec "${VM_NAME}" -- sudo install -o root -g deploy -m 0640 \
    "${remote_stage}/staging-database-volume.default" \
    /srv/secrets/portfolio/staging-database-volume
fi

for required_command in age curl docker git jq sha256sum; do
  multipass exec "${VM_NAME}" -- sh -c 'command -v "$1" >/dev/null' sh "${required_command}" || {
    printf 'The VM is missing required command: %s\n' "${required_command}" >&2
    exit 1
  }
done
multipass exec "${VM_NAME}" -- sudo sh -c 'docker compose version >/dev/null'
multipass exec "${VM_NAME}" -- sudo -u deploy sh -c \
  'docker version --format "{{.Server.Version}}" >/dev/null'

multipass exec "${VM_NAME}" -- sudo env \
  DEPLOY_ENV=staging \
  APP_ENVIRONMENT=Staging \
  DB_VOLUME_NAME=portfolio-staging-postgres-data \
  IMAGE_REF=portfolio:validation \
  WEB_ALIAS=portfolio-staging-web \
  docker compose \
    --env-file "${remote_stage}/portfolio-staging.env.example" \
    --project-name portfolio-staging \
    --file "${remote_stage}/portfolio-compose.yml" \
    config --quiet
multipass exec "${VM_NAME}" -- sudo env \
  DEPLOY_ENV=prod \
  APP_ENVIRONMENT=Production \
  DB_VOLUME_NAME=portfolio-prod-postgres-data \
  IMAGE_REF=portfolio:validation \
  WEB_ALIAS=portfolio-prod-web \
  docker compose \
    --env-file "${remote_stage}/portfolio-prod.env.example" \
    --project-name portfolio-prod \
    --file "${remote_stage}/portfolio-compose.yml" \
    config --quiet

web_subnet="$(multipass exec "${VM_NAME}" -- sudo docker network inspect web \
  --format '{{(index .IPAM.Config 0).Subnet}}')"
[[ "${web_subnet}" == '172.18.0.0/16' ]] || {
  printf '%s\n' 'Shared web network must use 172.18.0.0/16.' >&2
  exit 1
}

printf '%s\n' \
  "Installed Portfolio-owned deployment files into VM ${VM_NAME}." \
  'The infrastructure repository owns Caddy, cloudflared, Docker host policy, and runner installation.' \
  'No populated secret, production guard, running application, edge route, or DNS record was changed.'
