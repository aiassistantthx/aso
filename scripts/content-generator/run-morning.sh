#!/bin/bash
# Morning content generation - 1 blog + 1 page

cd "$(dirname "$0")"

# Load environment
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
source ~/.zshrc 2>/dev/null || true

# Run generator
/opt/homebrew/bin/node generate-content.cjs --type=both 2>&1 | tee -a logs/morning-$(date +%Y-%m-%d).log
