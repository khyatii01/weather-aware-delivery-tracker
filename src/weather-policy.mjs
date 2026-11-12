export const DELAY_WEATHER_MAIN = Object.freeze(['Rain', 'Snow', 'Extreme']);
const DELAY_SET = new Set(DELAY_WEATHER_MAIN.map((value) => value.toLowerCase()));

export function normalizeWeather(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Weather result must be an object');
  }
  if (typeof input.main !== 'string' || input.main.trim() === '') {
    throw new TypeError('Weather result must include main');
  }
  return Object.freeze({
    main: input.main.trim(),
    description: typeof input.description === 'string' && input.description.trim()
      ? input.description.trim()
      : input.main.trim().toLowerCase(),
    temperatureC: Number.isFinite(Number(input.temperatureC)) ? Number(input.temperatureC) : null,
  });
}

export function shouldDelayForWeather(mainStatus) {
  return typeof mainStatus === 'string' && DELAY_SET.has(mainStatus.trim().toLowerCase());
}
