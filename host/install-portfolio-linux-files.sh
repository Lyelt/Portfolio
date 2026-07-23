#!/usr/bin/env bash
set -Eeuo pipefail
umask 027

readonly REPOSITORY_ROOT="$(cd -- "${1:-$(dirname -- "${BASH_SOURCE[0]}")/..}" && pwd -P)"

fail() { printf '[portfolio-install] ERROR: %s\n' "$*" >&2; exit 1; }
source_file() {
  local relative_path="$1"
  local path="${REPOSITORY_ROOT}/${relative_path}"
  [[ -f "${path}" && ! -L "${path}" ]] || fail "Missing regular source file: ${relative_path}"
  printf '%s\n' "${path}"
}

[[ "$(id -u)" == '0' ]] || fail 'Run as root.'
[[ "$(uname -s)" == 'Linux' ]] || fail 'The target host must run Linux.'
id deploy >/dev/null 2>&1 || fail 'The shared host installer must create the deploy account first.'
for required_command in cmp docker; do
  command -v "${required_command}" >/dev/null 2>&1 ||
    fail "Missing required command: ${required_command}"
done
docker compose version >/dev/null 2>&1 || fail 'Docker Compose v2 is required.'

for required_path in \
  /srv/apps/.deploy.lock \
  /srv/edge/compose.yml \
  /usr/local/sbin/receive-deployment-manifest \
  /usr/local/sbin/validate-deployment-manifest; do
  [[ -e "${required_path}" ]] || fail "Shared infrastructure prerequisite is missing: ${required_path}"
done
[[ -f /srv/apps/.deploy.lock && ! -L /srv/apps/.deploy.lock ]] ||
  fail 'Shared deployment lock must be a regular file.'
[[ "$(stat -c '%U:%G %a' /srv/apps/.deploy.lock)" == 'deploy:deploy 640' ]] ||
  fail 'Shared deployment lock must be deploy:deploy with mode 0640.'

bash -n \
  "$(source_file deploy/portfolio/deploy-portfolio)" \
  "$(source_file deploy/portfolio/backup-production)" \
  "$(source_file deploy/portfolio/restore-production)"

install -d -o deploy -g deploy -m 0750 \
  /srv/apps/portfolio \
  /srv/apps/portfolio/staging/releases \
  /srv/apps/portfolio/prod/releases \
  /srv/apps/portfolio/prod/recovery-consumed \
  /srv/backups/portfolio/staging \
  /srv/backups/portfolio/prod \
  /srv/backups/portfolio/daily
install -d -o root -g deploy -m 0750 \
  /srv/secrets/portfolio \
  /srv/secrets/examples
install -d -o root -g root -m 0755 /usr/local/share/portfolio

install -o root -g root -m 0755 \
  "$(source_file deploy/portfolio/deploy-portfolio)" /usr/local/sbin/deploy-portfolio
install -o root -g root -m 0755 \
  "$(source_file deploy/portfolio/backup-production)" /usr/local/sbin/backup-portfolio-production
install -o root -g root -m 0755 \
  "$(source_file deploy/portfolio/restore-production)" /usr/local/sbin/restore-portfolio-production
install -o root -g root -m 0644 \
  "$(source_file deploy/portfolio/schema-contract.sql)" /usr/local/share/portfolio/schema-contract.sql
cmp -s "$(source_file deploy/portfolio/deploy-portfolio)" /usr/local/sbin/deploy-portfolio ||
  fail 'The installed deployment command differs from this checkout.'
cmp -s "$(source_file deploy/portfolio/backup-production)" /usr/local/sbin/backup-portfolio-production ||
  fail 'The installed backup command differs from this checkout.'
cmp -s "$(source_file deploy/portfolio/restore-production)" /usr/local/sbin/restore-portfolio-production ||
  fail 'The installed restore command differs from this checkout.'
cmp -s "$(source_file deploy/portfolio/schema-contract.sql)" /usr/local/share/portfolio/schema-contract.sql ||
  fail 'The installed schema contract differs from this checkout.'

for relative_example in \
  deploy/secrets/portfolio-staging.env.example \
  deploy/secrets/portfolio-prod.env.example \
  deploy/secrets/portfolio-backup.env.example; do
  example="$(source_file "${relative_example}")"
  install -o root -g deploy -m 0640 \
    "${example}" "/srv/secrets/examples/$(basename "${example}")"
done

for environment in staging prod; do
  if [[ "${environment}" == 'staging' ]]; then
    app_environment='Staging'
    database_volume='portfolio-staging-postgres-data'
  else
    app_environment='Production'
    database_volume='portfolio-prod-postgres-data'
  fi
  env \
    DEPLOY_ENV="${environment}" \
    APP_ENVIRONMENT="${app_environment}" \
    DB_VOLUME_NAME="${database_volume}" \
    IMAGE_REF='portfolio:validation' \
    WEB_ALIAS="portfolio-${environment}-web" \
    docker compose \
      --env-file "$(source_file "deploy/secrets/portfolio-${environment}.env.example")" \
      --project-name "portfolio-${environment}" \
      --file "$(source_file deploy/portfolio/compose.yml)" \
      config --quiet
done

docker network inspect web >/dev/null 2>&1 ||
  fail 'The shared web network is unavailable.'
printf '%s\n' 'Installed Portfolio host files. Populated secrets, runner registration, production gate, deployment, routing, and DNS remain explicit.'
