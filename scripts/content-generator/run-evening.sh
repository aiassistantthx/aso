#!/bin/bash
# Evening content generation - 1 blog only

cd "$(dirname "$0")"

# Load environment
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
source ~/.zshrc 2>/dev/null || true

# Run generator
/opt/homebrew/bin/node generate-content.cjs --type=blog 2>&1 | tee -a logs/evening-$(date +%Y-%m-%d).log
