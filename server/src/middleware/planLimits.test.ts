import test from 'node:test';
import assert from 'node:assert/strict';
import { getPlanLimits } from './planLimits';

test('plan limits: free plan has expected limits', () => {
  const limits = getPlanLimits('FREE');
  assert.equal(limits.maxProjects, 3);
  assert.equal(limits.maxTargetLanguages, 2);
  assert.equal(limits.maxWizardProjects, 1);
});

test('plan limits: pro plan is unlimited', () => {
  const limits = getPlanLimits('PRO');
  assert.equal(limits.maxProjects, Infinity);
  assert.equal(limits.maxTargetLanguages, Infinity);
});
