export class WeatherLookupError extends Error {
  constructor(message, { city, httpStatus = null, code = null, cause } = {}) {
    super(message, { cause });
    this.name = 'WeatherLookupError';
    this.city = city;
    this.httpStatus = httpStatus;
    this.code = code;
  }
}

export class OpenWeatherClient {
  constructor({
    apiKey,
    units = 'metric',
    timeoutMs = 10_000,
    baseUrl = 'https://api.openweathermap.org/data/2.5/weather',
    fetchImpl = globalThis.fetch,
  }) {
    if (typeof apiKey !== 'string' || apiKey.trim() === '') throw new TypeError('OpenWeatherMap API key is required');
    if (typeof fetchImpl !== 'function') throw new TypeError('A fetch implementation is required');
    this.apiKey = apiKey.trim();
    this.units = units;
    this.timeoutMs = Number(timeoutMs);
    this.baseUrl = baseUrl;
    this.fetchImpl = fetchImpl;
  }

  async getCurrent(city) {
    if (typeof city !== 'string' || city.trim() === '') throw new TypeError('city must be a non-empty string');
    const url = new URL(this.baseUrl);
    url.searchParams.set('q', city.trim());
    url.searchParams.set('appid', this.apiKey);
    url.searchParams.set('units', this.units);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response;
    try {
      response = await this.fetchImpl(url, {
        method: 'GET',
        headers: { accept: 'application/json' },
        signal: controller.signal,
      });
    } catch (error) {
      const message = error?.name === 'AbortError'
        ? `Weather lookup timed out for ${city}`
        : `Weather lookup failed for ${city}: ${error?.message || error}`;
      throw new WeatherLookupError(message, { city, code: error?.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR', cause: error });
    } finally {
      clearTimeout(timeout);
    }

    let body;
    try {
      body = await response.json();
    } catch (error) {
      throw new WeatherLookupError(`Weather service returned invalid JSON for ${city}`, {
        city,
        httpStatus: response.status,
        code: 'INVALID_JSON',
        cause: error,
      });
    }

    if (!response.ok) {
      const serviceMessage = typeof body?.message === 'string' ? body.message : response.statusText;
      throw new WeatherLookupError(`Weather lookup failed for ${city}: ${serviceMessage}`, {
        city,
        httpStatus: response.status,
        code: body?.cod ?? 'HTTP_ERROR',
      });
    }

    const observation = body?.weather?.[0];
    if (!observation || typeof observation.main !== 'string') {
      throw new WeatherLookupError(`Weather response is missing weather[0].main for ${city}`, {
        city,
        httpStatus: response.status,
        code: 'INVALID_PAYLOAD',
      });
    }

    return {
      main: observation.main,
      description: typeof observation.description === 'string' ? observation.description : observation.main,
      temperatureC: Number.isFinite(Number(body?.main?.temp)) ? Number(body.main.temp) : null,
    };
  }
}
