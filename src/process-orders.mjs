import { normalizeOrders } from './order.mjs';
import { normalizeWeather, shouldDelayForWeather } from './weather-policy.mjs';
import { createWeatherAwareApology } from './apology.mjs';

function serializeError(error, order) {
  return {
    order_id: order.order_id,
    city: order.city,
    name: error?.name || 'Error',
    message: error?.message || String(error),
    code: error?.code ?? null,
    httpStatus: Number.isInteger(error?.httpStatus) ? error.httpStatus : null,
  };
}

export async function processOrders({ orders: input, weatherClient, logger = console }) {
  if (!weatherClient || typeof weatherClient.getCurrent !== 'function') {
    throw new TypeError('weatherClient.getCurrent(city) is required');
  }

  const orders = normalizeOrders(input);
  const startedAt = new Date().toISOString();

  // All promises are created before awaiting. Promise.allSettled preserves resilience:
  // one invalid city does not reject the complete batch.
  const settled = await Promise.allSettled(
    orders.map(async (order) => {
      const weather = normalizeWeather(await weatherClient.getCurrent(order.city));
      const delayed = shouldDelayForWeather(weather.main);
      const updatedOrder = {
        ...order,
        status: delayed ? 'Delayed' : order.status,
      };
      const apology = delayed
        ? createWeatherAwareApology({ customer: order.customer, city: order.city, weather })
        : null;
      return { order: updatedOrder, weather, apology };
    }),
  );

  const updatedOrders = [];
  const messages = [];
  const errors = [];

  settled.forEach((result, index) => {
    const original = orders[index];
    if (result.status === 'fulfilled') {
      updatedOrders.push(result.value.order);
      if (result.value.apology) {
        messages.push({
          order_id: original.order_id,
          city: original.city,
          weather: result.value.weather,
          message: result.value.apology,
        });
      }
      logger.info?.({ event: 'weather-processed', order_id: original.order_id, city: original.city });
    } else {
      updatedOrders.push({ ...original });
      const serialized = serializeError(result.reason, original);
      errors.push(serialized);
      logger.error?.({ event: 'weather-error', ...serialized });
    }
  });

  return {
    orders: updatedOrders,
    messages,
    errors,
    summary: {
      startedAt,
      finishedAt: new Date().toISOString(),
      total: orders.length,
      processed: settled.filter((result) => result.status === 'fulfilled').length,
      delayed: updatedOrders.filter((order) => order.status === 'Delayed').length,
      failed: errors.length,
    },
  };
}
