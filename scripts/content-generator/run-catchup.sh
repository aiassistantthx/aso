#!/bin/bash
# Catch-up script wrapper - runs on wake/login

cd "$(dirname "$0")"

# Load environment
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# Log
echo "[$(date -Iseconds)] Running catch-up script..." >> logs/catchup.log

# Run catch-up
/opt/homebrew/bin/node catch-up.cjs 2>&1 >> logs/catchup.log
