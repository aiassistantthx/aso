import test from 'node:test';
import assert from 'node:assert/strict';
import { extractTokenUsage } from './aiUsageLogger';

test('aiUsageLogger: extracts token usage safely', () => {
  const usage = extractTokenUsage({ usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 } });
  assert.deepEqual(usage, { promptTokens: 10, completionTokens: 20, totalTokens: 30 });
});

test('aiUsageLogger: handles missing usage', () => {
  const usage = extractTokenUsage({});
  assert.deepEqual(usage, { promptTokens: 0, completionTokens: 0, totalTokens: 0 });
});
