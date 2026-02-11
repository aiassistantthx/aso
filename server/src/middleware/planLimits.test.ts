import test from 'node:test';
import assert from 'node:assert/strict';
import { getPlanLimits } from './planLimits';

test('plan limits: free plan has expected limits', () => {
  const limits = getPlanLimits('FREE');
  assert.equal(limits.maxLifetimeProjects, 1);
  assert.equal(limits.maxGenerationsPerProject, 3);
  assert.equal(limits.maxTargetLanguages, 2);
});

test('plan limits: pro plan is unlimited', () => {
  const limits = getPlanLimits('PRO');
  assert.equal(limits.maxLifetimeProjects, Infinity);
  assert.equal(limits.maxGenerationsPerProject, Infinity);
  assert.equal(limits.maxTargetLanguages, Infinity);
});
