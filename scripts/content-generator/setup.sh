#!/bin/bash
# Setup script for LocalizeShots Content Generator
# Installs launchd jobs for automatic content generation

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
WAKEUP_SCRIPT="$HOME/.wakeup"

echo "🚀 LocalizeShots Content Generator Setup"
echo "========================================"

# Create directories
mkdir -p "$SCRIPT_DIR/logs"
mkdir -p "$SCRIPT_DIR/reports"
mkdir -p "$LAUNCH_AGENTS_DIR"

# Make scripts executable
chmod +x "$SCRIPT_DIR/run-morning.sh"
chmod +x "$SCRIPT_DIR/run-evening.sh"
chmod +x "$SCRIPT_DIR/run-catchup.sh"
chmod +x "$SCRIPT_DIR/generate-content.cjs"
chmod +x "$SCRIPT_DIR/catch-up.cjs"

# Unload existing jobs if any
echo "📦 Removing old jobs (if any)..."
launchctl unload "$LAUNCH_AGENTS_DIR/com.localizeshots.content-morning.plist" 2>/dev/null || true
launchctl unload "$LAUNCH_AGENTS_DIR/com.localizeshots.content-evening.plist" 2>/dev/null || true
launchctl unload "$LAUNCH_AGENTS_DIR/com.localizeshots.content-catchup.plist" 2>/dev/null || true

# Copy plist files
echo "📋 Installing launchd jobs..."
cp "$SCRIPT_DIR/launchd/com.localizeshots.content-morning.plist" "$LAUNCH_AGENTS_DIR/"
cp "$SCRIPT_DIR/launchd/com.localizeshots.content-evening.plist" "$LAUNCH_AGENTS_DIR/"
cp "$SCRIPT_DIR/launchd/com.localizeshots.content-catchup.plist" "$LAUNCH_AGENTS_DIR/"

# Load jobs
echo "▶️ Loading jobs..."
launchctl load "$LAUNCH_AGENTS_DIR/com.localizeshots.content-morning.plist"
launchctl load "$LAUNCH_AGENTS_DIR/com.localizeshots.content-evening.plist"
launchctl load "$LAUNCH_AGENTS_DIR/com.localizeshots.content-catchup.plist"

# Setup sleepwatcher if available
if command -v sleepwatcher &> /dev/null; then
    echo "🌙 Setting up sleepwatcher for wake detection..."
    # Add to .wakeup file
    if [ -f "$WAKEUP_SCRIPT" ]; then
        if ! grep -q "localizeshots" "$WAKEUP_SCRIPT"; then
            echo "" >> "$WAKEUP_SCRIPT"
            echo "# LocalizeShots content catch-up on wake" >> "$WAKEUP_SCRIPT"
            echo "$SCRIPT_DIR/run-catchup.sh &" >> "$WAKEUP_SCRIPT"
        fi
    else
        echo "#!/bin/bash" > "$WAKEUP_SCRIPT"
        echo "# LocalizeShots content catch-up on wake" >> "$WAKEUP_SCRIPT"
        echo "$SCRIPT_DIR/run-catchup.sh &" >> "$WAKEUP_SCRIPT"
        chmod +x "$WAKEUP_SCRIPT"
    fi
    echo "   ✓ Wake detection configured via sleepwatcher"
else
    echo "💡 Tip: Install sleepwatcher for immediate wake detection:"
    echo "   brew install sleepwatcher"
    echo "   brew services start sleepwatcher"
    echo ""
    echo "   Currently using hourly catch-up checks as fallback."
fi

# Verify
echo ""
echo "✅ Setup complete!"
echo ""
echo "📅 Schedule:"
echo "   - Morning (9:00): 1 blog + 1 page"
echo "   - Evening (18:00): 1 blog"
echo "   - Catch-up: On login + every hour"
echo ""
echo "🔄 Missed job handling:"
echo "   - Runs on login automatically"
echo "   - Checks every hour for missed jobs"
echo "   - Catches up to 3 days of missed content"
echo ""
echo "📁 Reports: $SCRIPT_DIR/reports/"
echo "📁 Logs: $SCRIPT_DIR/logs/"
echo ""
echo "🔧 Commands:"
echo "   Test morning run:  node $SCRIPT_DIR/generate-content.cjs --type=both"
echo "   Test evening run:  node $SCRIPT_DIR/generate-content.cjs --type=blog"
echo "   Run catch-up:      node $SCRIPT_DIR/catch-up.cjs"
echo "   View jobs:         launchctl list | grep localizeshots"
echo "   Unload jobs:       launchctl unload ~/Library/LaunchAgents/com.localizeshots.content-*.plist"
echo ""
