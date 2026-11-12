import { parseArguments, HELP_TEXT } from './cli-args.mjs';
import { readJson, writeJsonAtomic } from './file-store.mjs';
import { OpenWeatherClient } from './openweather-client.mjs';
import { processOrders } from './process-orders.mjs';

try {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error('OPENWEATHER_API_KEY is missing. Copy .env.example to .env and populate it.');

  const orders = await readJson(options.input);
  const client = new OpenWeatherClient({
    apiKey,
    units: process.env.OPENWEATHER_UNITS || 'metric',
    timeoutMs: Number(process.env.OPENWEATHER_TIMEOUT_MS || 10_000),
  });

  const logger = {
    info(entry) { console.log(JSON.stringify(entry)); },
    error(entry) { console.error(JSON.stringify(entry)); },
  };

  const result = await processOrders({ orders, weatherClient: client, logger });
  await Promise.all([
    writeJsonAtomic(options.output, result.orders),
    writeJsonAtomic(options.messages, result.messages),
    writeJsonAtomic(options.errors, result.errors),
    writeJsonAtomic(options.summary, result.summary),
  ]);

  console.log(JSON.stringify({
    event: 'run-complete',
    summary: result.summary,
    outputs: options,
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ event: 'fatal-error', name: error.name, message: error.message }, null, 2));
  process.exitCode = 1;
}
