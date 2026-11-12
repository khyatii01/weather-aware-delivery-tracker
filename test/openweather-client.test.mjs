import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { OpenWeatherClient, WeatherLookupError } from '../src/openweather-client.mjs';

async function withServer(handler, work) {
  const server = createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  try {
    await work(`http://127.0.0.1:${address.port}/weather`);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

test('encodes city and API key and maps a successful response', async () => {
  await withServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    assert.equal(url.searchParams.get('q'), 'New York');
    assert.equal(url.searchParams.get('appid'), 'secret-from-env');
    assert.equal(url.searchParams.get('units'), 'metric');
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ weather: [{ main: 'Rain', description: 'heavy rain' }], main: { temp: 12.5 } }));
  }, async (baseUrl) => {
    const client = new OpenWeatherClient({ apiKey: 'secret-from-env', baseUrl });
    const weather = await client.getCurrent('New York');
    assert.deepEqual(weather, { main: 'Rain', description: 'heavy rain', temperatureC: 12.5 });
  });
});

test('maps a 404 city response to WeatherLookupError', async () => {
  await withServer((_request, response) => {
    response.writeHead(404, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ cod: '404', message: 'city not found' }));
  }, async (baseUrl) => {
    const client = new OpenWeatherClient({ apiKey: 'secret-from-env', baseUrl });
    await assert.rejects(
      () => client.getCurrent('InvalidCity123'),
      (error) => error instanceof WeatherLookupError && error.httpStatus === 404 && /city not found/.test(error.message),
    );
  });
});
