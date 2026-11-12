# Weather-Aware Delivery Tracker

A Node.js application that tracks delivery orders and adjusts delivery estimates based on real-time weather conditions.

## Prerequisites

- Node.js >= 22

```bash
npm install
```

---

## Offline Deterministic Demo

No API key is needed to run the offline simulation:

```bash
# Run tests
npm test

# Run the deterministic demo
npm run demo
```

### Review Generated Artifacts:
- `artifacts/orders.updated.json` — Orders with weather-adjusted statuses (`Delayed` or `Pending`).
- `artifacts/apologies.json` — Personalized customer apology messages.
- `artifacts/errors.json` — Diagnostic log of failed city lookups.
- `artifacts/run-summary.json` — High-level run metrics.
- `artifacts/structured-log.json` — Event log of all processed orders.

---

## Live OpenWeatherMap Run

To run against live weather data, set up your OpenWeatherMap API key:

1. Create your local environment file:
   ```bash
   cp .env.example .env
   ```

2. Populate `OPENWEATHER_API_KEY` inside `.env`.

3. Run the live tracker:
   ```bash
   npm start
   ```

> **Note:** Default live outputs use `artifacts/live-*.json` filenames so the deterministic demo submission evidence is not overwritten.

### In-Place Database Update
To update the source file (`data/orders.json`) directly:
```bash
npm run start:in-place
```

### Custom File Paths
You can pass custom input and output paths via CLI arguments:
```bash
npm start -- \
  --input data/orders.json \
  --output artifacts/live-orders.updated.json \
  --messages artifacts/live-apologies.json \
  --errors artifacts/live-errors.json \
  --summary artifacts/live-run-summary.json
```

> **Resilience:** Invalid cities (such as `InvalidCity123`) are handled as per-order errors. They are logged to the error output file and do not crash or abort the batch.

---

## Testing & Validation

```bash
# Run all unit and integration tests
npm test

# Run tests with coverage
npm run test:coverage

# Validate required project files and contract
npm run validate
```
