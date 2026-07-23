#!/usr/bin/env bash
set -Eeuo pipefail

root_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
if ! command -v docker >/dev/null 2>&1 || ! timeout 5s docker info >/dev/null 2>&1; then
  printf '%s\n' 'SKIP: Docker is unavailable; run the Portfolio installer test in CI.'
  exit 0
fi

readonly ubuntu_image='ubuntu:24.04@sha256:4fbb8e6a8395de5a7550b33509421a2bafbc0aab6c06ba2cef9ebffbc7092d90'
MSYS_NO_PATHCONV=1 docker run --rm \
  --volume "${root_dir}:/repo:ro" \
  "${ubuntu_image}" \
  bash -ceu '
    groupadd --system deploy
    useradd --system --gid deploy --shell /bin/bash deploy
    for command in age curl git jq; do
      printf "%s\n" "#!/bin/sh" "exit 0" > "/usr/local/bin/${command}"
      chmod 0755 "/usr/local/bin/${command}"
    done
    printf "%s\n" "#!/bin/sh" "exit 0" > /usr/local/bin/docker
    chmod 0755 /usr/local/bin/docker
    install -d -o deploy -g deploy -m 0750 /srv/apps /srv/edge
    install -o deploy -g deploy -m 0640 /dev/null /srv/apps/.deploy.lock
    install -o root -g root -m 0644 /dev/null /srv/edge/compose.yml
    printf "%s\n" "#!/bin/sh" "exit 0" > /usr/local/sbin/receive-deployment-manifest
    chmod 0755 /usr/local/sbin/receive-deployment-manifest

    bash /repo/host/install-portfolio-linux-files.sh /repo
    bash /repo/host/install-portfolio-linux-files.sh /repo

    test "$(stat -c "%U:%G %a" /usr/local/sbin/deploy-portfolio)" = "root:root 755"
    test "$(stat -c "%U:%G %a" /srv/secrets/examples/portfolio-staging.env.example)" = "root:deploy 640"
    test -d /srv/apps/portfolio/staging/releases
    test -d /srv/backups/portfolio/daily
    test ! -e /srv/secrets/portfolio/staging-database-volume
  '
printf '%s\n' 'PASS: Portfolio target-host installer is idempotent and installs guarded app files.'
