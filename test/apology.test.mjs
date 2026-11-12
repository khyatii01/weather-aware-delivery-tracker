import test from 'node:test';
import assert from 'node:assert/strict';
import { createWeatherAwareApology } from '../src/apology.mjs';

test('creates a personalized weather-aware apology', () => {
  const message = createWeatherAwareApology({
    customer: 'Alice Smith',
    city: 'New York',
    weather: { main: 'Rain', description: 'heavy rain' },
  });
  assert.equal(message, 'Hi Alice, your order to New York is delayed due to heavy rain. We appreciate your patience!');
});
