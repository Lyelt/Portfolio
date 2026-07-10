#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: configure-macos.sh [--check|--apply]

  --check  Show current power settings and the proposed changes (default).
  --apply  Apply server-style power settings; prompts for administrator access.
EOF
}

mode="${1:---check}"
case "$mode" in
  --check|--apply) ;;
  -h|--help)
    usage
    exit 0
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This script must run on macOS." >&2
  exit 1
fi

echo "Current macOS power settings:"
/usr/bin/pmset -g custom

if [[ "$mode" == "--check" ]]; then
  cat <<'EOF'

No settings were changed. With --apply, this script will:
  - disable system and disk sleep on AC power
  - enable restart after a power failure
  - enable Wake-on-LAN/network access

Display sleep is intentionally left unchanged. Run with --apply only while the
Mac mini is connected to reliable AC power. FileVault may still require a human
to unlock the Mac after an unexpected power loss.
EOF
  exit 0
fi

echo
echo "Requesting administrator access to apply power settings..."
/usr/bin/sudo -v

# pmset is the authoritative low-level configuration. Restrict changes to AC
# power because this host is a Mac mini and should remain available as a server.
/usr/bin/sudo /usr/bin/pmset -c sleep 0 disksleep 0 autorestart 1 womp 1

# Apply and expose the corresponding systemsetup settings as a second,
# human-readable verification surface. These commands do not open any ports.
/usr/bin/sudo /usr/sbin/systemsetup -setcomputersleep Off
/usr/bin/sudo /usr/sbin/systemsetup -setharddisksleep Off
/usr/bin/sudo /usr/sbin/systemsetup -setrestartpowerfailure On
/usr/bin/sudo /usr/sbin/systemsetup -setwakeonnetworkaccess On

echo
echo "Verified macOS power settings:"
/usr/bin/pmset -g custom
/usr/bin/sudo /usr/sbin/systemsetup -getcomputersleep
/usr/bin/sudo /usr/sbin/systemsetup -getharddisksleep
/usr/bin/sudo /usr/sbin/systemsetup -getrestartpowerfailure
/usr/bin/sudo /usr/sbin/systemsetup -getwakeonnetworkaccess

echo
echo "Power settings applied. No router, firewall, DNS, or application settings were changed."
