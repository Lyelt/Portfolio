#!/bin/zsh

set -euo pipefail

BREW=/opt/homebrew/bin/brew

echo "This will install the signed Multipass package and configure server power settings."
echo "Enter your Mac password at the sudo prompt. It will not be displayed."
sudo -v

if ! command -v multipass >/dev/null 2>&1; then
  package_path="$($BREW --cache --cask multipass)"
  if [[ ! -f "$package_path" ]]; then
    echo "Multipass package is not present in the Homebrew cache." >&2
    exit 1
  fi

  sudo /usr/sbin/installer -pkg "$package_path" -target /
fi

sudo /usr/bin/pmset -a sleep 0 autorestart 1

if ! sudo /usr/sbin/systemsetup -setwaitforstartupafterpowerfailure 30; then
  echo "Warning: macOS did not accept the 30-second post-power-loss startup delay." >&2
fi

echo
echo "Verification"
/usr/local/bin/multipass version 2>/dev/null || multipass version
/usr/bin/pmset -g custom
sudo /usr/sbin/systemsetup -getwaitforstartupafterpowerfailure || true

echo
read -k 1 "?Host authorization step completed. Press any key to close this window."
echo
