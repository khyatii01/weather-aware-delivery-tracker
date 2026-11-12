export function parseArguments(argv) {
  const options = {
    input: 'data/orders.json',
    output: 'artifacts/live-orders.updated.json',
    messages: 'artifacts/live-apologies.json',
    errors: 'artifacts/live-errors.json',
    summary: 'artifacts/live-run-summary.json',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help' || argument === '-h') return { ...options, help: true };
    if (!argument.startsWith('--')) throw new TypeError(`Unknown argument: ${argument}`);
    const key = argument.slice(2);
    if (!(key in options)) throw new TypeError(`Unknown option: ${argument}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new TypeError(`${argument} requires a value`);
    options[key] = value;
    index += 1;
  }
  return options;
}

export const HELP_TEXT = `Weather Delay Processor

Usage:
  npm start -- [options]

Options:
  --input <path>      Orders JSON input (default: data/orders.json)
  --output <path>     Updated orders output
  --messages <path>   Generated apologies output
  --errors <path>     Per-city errors output
  --summary <path>    Run summary output
  --help              Show this help

Environment:
  OPENWEATHER_API_KEY       Required
  OPENWEATHER_UNITS         Optional, default metric
  OPENWEATHER_TIMEOUT_MS    Optional, default 10000
`;
