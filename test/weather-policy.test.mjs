import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldDelayForWeather, normalizeWeather } from '../src/weather-policy.mjs';

test('Rain, Snow, and Extreme delay an order', () => {
  for (const status of ['Rain', 'Snow', 'Extreme']) assert.equal(shouldDelayForWeather(status), true);
});

test('non-golden statuses do not delay an order', () => {
  for (const status of ['Clear', 'Clouds', 'Mist', 'Thunderstorm']) assert.equal(shouldDelayForWeather(status), false);
});

test('weather normalization rejects missing main status', () => {
  assert.throws(() => normalizeWeather({ description: 'unknown' }), /main/);
});
