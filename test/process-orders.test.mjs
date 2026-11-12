import test from 'node:test';
import assert from 'node:assert/strict';
import { processOrders } from '../src/process-orders.mjs';

const orders = [
  { order_id: '1001', customer: 'Alice Smith', city: 'New York', status: 'Pending' },
  { order_id: '1002', customer: 'Bob Jones', city: 'Mumbai', status: 'Pending' },
  { order_id: '1003', customer: 'Charlie Green', city: 'London', status: 'Pending' },
  { order_id: '1004', customer: 'InvalidCity123', city: 'InvalidCity123', status: 'Pending' },
];

test('starts weather lookups concurrently and survives one invalid city', async () => {
  let active = 0;
  let maximumActive = 0;
  let started = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const observations = {
    'New York': { main: 'Rain', description: 'heavy rain' },
    Mumbai: { main: 'Clear', description: 'clear sky' },
    London: { main: 'Snow', description: 'light snow' },
  };

  const client = {
    async getCurrent(city) {
      started += 1;
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      if (started === orders.length) release();
      await gate;
      active -= 1;
      if (city === 'InvalidCity123') throw new Error('city not found');
      return observations[city];
    },
  };

  const loggedErrors = [];
  const result = await processOrders({
    orders,
    weatherClient: client,
    logger: { info() {}, error(entry) { loggedErrors.push(entry); } },
  });

  assert.equal(maximumActive, 4, 'all four lookups should be in flight together');
  assert.deepEqual(result.orders.map((order) => order.status), ['Delayed', 'Pending', 'Delayed', 'Pending']);
  assert.equal(result.messages.length, 2);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].city, 'InvalidCity123');
  assert.equal(loggedErrors.length, 1);
  assert.equal(result.summary.processed, 3);
  assert.equal(result.summary.failed, 1);
});

test('does not mutate caller-owned order objects', async () => {
  const original = structuredClone(orders.slice(0, 1));
  await processOrders({
    orders: original,
    weatherClient: { async getCurrent() { return { main: 'Rain', description: 'rain' }; } },
    logger: { info() {}, error() {} },
  });
  assert.equal(original[0].status, 'Pending');
});
