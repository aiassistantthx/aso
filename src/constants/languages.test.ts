import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_STORE_LANGUAGES, getLanguageName } from './languages';

test('languages: contains 39 App Store locales', () => {
  assert.equal(APP_STORE_LANGUAGES.length, 39);
});

test('languages: returns a readable name for known codes', () => {
  assert.equal(getLanguageName('en-US'), 'English (US)');
});

test('languages: falls back to code for unknown languages', () => {
  assert.equal(getLanguageName('xx-YY'), 'xx-YY');
});
