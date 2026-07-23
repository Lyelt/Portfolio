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

for directory in deploy/portfolio deploy/secrets host; do
  multipass exec "${VM_NAME}" -- mkdir -p "${remote_stage}/${directory}"
done
transfer() {
  local source="$1"
  multipass transfer "${REPOSITORY_ROOT}/${source}" "${VM_NAME}:${remote_stage}/${source}"
}

transfer HOSTING_SETUP.md
transfer deploy/portfolio/compose.yml
transfer deploy/portfolio/deploy-portfolio
transfer deploy/portfolio/backup-production
transfer host/install-portfolio-linux-files.sh
for example in "${REPOSITORY_ROOT}"/deploy/secrets/portfolio-*.env.example; do
  relative_path="${example#"${REPOSITORY_ROOT}/"}"
  transfer "${relative_path}"
done

multipass exec "${VM_NAME}" -- sudo bash \
  "${remote_stage}/host/install-portfolio-linux-files.sh" "${remote_stage}"
printf '%s\n' "Installed Portfolio-owned host files into VM ${VM_NAME} through the canonical target-side installer."
