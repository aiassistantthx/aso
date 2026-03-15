#!/bin/bash
# Setup script for LocalizeShots Content Generator
# Installs launchd jobs for automatic content generation

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"

echo "🚀 LocalizeShots Content Generator Setup"
echo "========================================"

# Create directories
mkdir -p "$SCRIPT_DIR/logs"
mkdir -p "$SCRIPT_DIR/reports"
mkdir -p "$LAUNCH_AGENTS_DIR"

# Make scripts executable
chmod +x "$SCRIPT_DIR/run-morning.sh"
chmod +x "$SCRIPT_DIR/run-evening.sh"
chmod +x "$SCRIPT_DIR/generate-content.js"

# Unload existing jobs if any
echo "📦 Removing old jobs (if any)..."
launchctl unload "$LAUNCH_AGENTS_DIR/com.localizeshots.content-morning.plist" 2>/dev/null || true
launchctl unload "$LAUNCH_AGENTS_DIR/com.localizeshots.content-evening.plist" 2>/dev/null || true

# Copy plist files
echo "📋 Installing launchd jobs..."
cp "$SCRIPT_DIR/launchd/com.localizeshots.content-morning.plist" "$LAUNCH_AGENTS_DIR/"
cp "$SCRIPT_DIR/launchd/com.localizeshots.content-evening.plist" "$LAUNCH_AGENTS_DIR/"

# Load jobs
echo "▶️ Loading jobs..."
launchctl load "$LAUNCH_AGENTS_DIR/com.localizeshots.content-morning.plist"
launchctl load "$LAUNCH_AGENTS_DIR/com.localizeshots.content-evening.plist"

# Verify
echo ""
echo "✅ Setup complete!"
echo ""
echo "📅 Schedule:"
echo "   - Morning (9:00): 1 blog + 1 page"
echo "   - Evening (18:00): 1 blog"
echo ""
echo "📁 Reports: $SCRIPT_DIR/reports/"
echo "📁 Logs: $SCRIPT_DIR/logs/"
echo ""
echo "🔧 Commands:"
echo "   Test morning run:  node $SCRIPT_DIR/generate-content.js --type=both"
echo "   Test evening run:  node $SCRIPT_DIR/generate-content.js --type=blog"
echo "   View jobs:         launchctl list | grep localizeshots"
echo "   Unload jobs:       launchctl unload ~/Library/LaunchAgents/com.localizeshots.content-*.plist"
echo ""
