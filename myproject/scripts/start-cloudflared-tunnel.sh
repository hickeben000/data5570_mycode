#!/usr/bin/env bash
# Quick HTTPS tunnel to Django on this machine (class assignment workflow).
#
# 1) In another terminal, start Django:
#    cd ~/data5570_mycode/myproject
#    source ~/myvenv/bin/activate   # if you use a venv
#    python manage.py runserver 0.0.0.0:8000
#
# 2) Run this script:
#    bash ~/data5570_mycode/myproject/scripts/start-cloudflared-tunnel.sh
#
# 3) cloudflared prints a URL like https://something.trycloudflare.com
#    Set your Expo API base (no trailing slash after /api):
#    EXPO_PUBLIC_API_BASE_URL=https://something.trycloudflare.com/api
#
# Note: The tunnel URL changes each time you restart cloudflared (unless you
# configure a named Cloudflare Tunnel in the Cloudflare dashboard).

set -euo pipefail
echo "Tunneling to Django at http://127.0.0.1:8000 ..."
echo "Copy the https URL cloudflared prints below into hw3/.env as EXPO_PUBLIC_API_BASE_URL=.../api"
exec cloudflared tunnel --url http://127.0.0.1:8000
