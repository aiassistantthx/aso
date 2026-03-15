#!/usr/bin/env node

/**
 * LocalizeShots Content Generator - Catch Up Script
 *
 * Runs on system wake/login to execute any missed scheduled jobs.
 * Checks what should have run since last execution and catches up.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STATE_FILE = path.join(__dirname, 'state.json');
const GENERATOR_SCRIPT = path.join(__dirname, 'generate-content.cjs');

function log(msg) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${msg}`);
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return { lastRun: null, lastMorningRun: null, lastEveningRun: null };
  }
}

function saveState(updates) {
  const state = loadState();
  Object.assign(state, updates);
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function getScheduledRuns(since) {
  const now = new Date();
  const runs = [];

  // Start from the day after lastRun
  let checkDate = new Date(since);
  checkDate.setHours(0, 0, 0, 0);

  while (checkDate <= now) {
    const dateStr = checkDate.toISOString().split('T')[0];

    // Morning run at 9:00
    const morningTime = new Date(checkDate);
    morningTime.setHours(9, 0, 0, 0);
    if (morningTime > since && morningTime <= now) {
      runs.push({ type: 'morning', time: morningTime, dateStr });
    }

    // Evening run at 18:00
    const eveningTime = new Date(checkDate);
    eveningTime.setHours(18, 0, 0, 0);
    if (eveningTime > since && eveningTime <= now) {
      runs.push({ type: 'evening', time: eveningTime, dateStr });
    }

    // Move to next day
    checkDate.setDate(checkDate.getDate() + 1);
  }

  return runs;
}

async function runGenerator(type) {
  const typeArg = type === 'morning' ? 'both' : 'blog';
  log(`Running generator: ${typeArg}`);

  try {
    execSync(`node "${GENERATOR_SCRIPT}" --type=${typeArg}`, {
      stdio: 'inherit',
      cwd: __dirname
    });
    return true;
  } catch (error) {
    log(`Error running generator: ${error.message}`);
    return false;
  }
}

async function main() {
  log('=== Content Generator Catch-Up ===');

  const state = loadState();
  const lastRun = state.lastRun ? new Date(state.lastRun) : null;

  if (!lastRun) {
    log('No previous run found. Running morning job for today...');
    await runGenerator('morning');
    saveState({ lastCatchUp: new Date().toISOString() });
    return;
  }

  log(`Last run: ${lastRun.toISOString()}`);

  // Check for missed runs
  const missedRuns = getScheduledRuns(lastRun);

  if (missedRuns.length === 0) {
    log('No missed runs. All caught up!');
    return;
  }

  log(`Found ${missedRuns.length} missed run(s):`);
  missedRuns.forEach(run => {
    log(`  - ${run.type} on ${run.dateStr} at ${run.time.toTimeString().slice(0, 5)}`);
  });

  // Limit catch-up to avoid overwhelming
  const MAX_CATCHUP = 6; // Max 3 days worth
  const runsToExecute = missedRuns.slice(-MAX_CATCHUP);

  if (missedRuns.length > MAX_CATCHUP) {
    log(`Limiting catch-up to last ${MAX_CATCHUP} runs (skipping ${missedRuns.length - MAX_CATCHUP} older runs)`);
  }

  // Execute missed runs with delay between them
  for (let i = 0; i < runsToExecute.length; i++) {
    const run = runsToExecute[i];
    log(`\n--- Executing missed ${run.type} run from ${run.dateStr} ---`);

    await runGenerator(run.type);

    // Wait 30 seconds between runs to avoid rate limits
    if (i < runsToExecute.length - 1) {
      log('Waiting 30 seconds before next run...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }

  saveState({ lastCatchUp: new Date().toISOString() });
  log('\n=== Catch-up complete! ===');
}

main().catch(error => {
  log(`Fatal error: ${error.message}`);
  process.exit(1);
});
