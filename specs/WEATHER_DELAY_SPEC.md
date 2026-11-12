# Weather Delay Executable Specification

## Goal

Read the assignment's four orders, fetch current weather concurrently, mark weather-sensitive deliveries as delayed, create personalized apology messages, and continue when a city is invalid.

## Functional requirements

| ID | Requirement | Acceptance criterion |
|---|---|---|
| A2-FR-001 | Process the supplied orders and cities. | Input contains New York, Mumbai, London, and InvalidCity123 in the supplied order. |
| A2-FR-002 | Fetch weather concurrently. | All `getCurrent` promises are started before the batch awaits completion; a test observes four simultaneous calls. |
| A2-FR-003 | Apply the golden-flow policy. | `Rain`, `Snow`, or `Extreme` changes status to `Delayed`; other main statuses preserve the existing status. |
| A2-FR-004 | Generate a weather-aware apology. | Each newly delayed result has a message with the customer's first name, city, and weather description. |
| A2-FR-005 | Continue after an invalid city. | A failed lookup is logged and returned in `errors`; valid cities still finish and output is written. |

## Non-functional requirements

| ID | Requirement | Acceptance criterion |
|---|---|---|
| A2-NFR-001 | Keep the API key outside source code. | Live execution reads `OPENWEATHER_API_KEY`; `.env.example` contains only a placeholder. |
| A2-NFR-002 | Preserve source data integrity. | Processing does not mutate caller-owned order objects; file writes use a temporary file and atomic rename. |
| A2-NFR-003 | Make live HTTP failures diagnosable. | Errors include city, message, code, and HTTP status where available. |

## Evidence requirements

| ID | Deliverable |
|---|---|
| A2-EV-001 | Source code and tests. |
| A2-EV-002 | Deterministic `artifacts/orders.updated.json`. |
| A2-EV-003 | `docs/AI_LOG.md` listing prompts used for concurrency and error handling. |
| A2-EV-004 | `docs/DEMO_RECORDING_SCRIPT.md`. |

## Deterministic demo contract

The offline demo intentionally uses fixed observations so evidence does not change with real weather:

- New York -> Rain -> Delayed
- Mumbai -> Clear -> Pending
- London -> Snow -> Delayed
- InvalidCity123 -> 404-style error -> Pending, logged, batch continues

Live mode uses OpenWeatherMap and may produce different delayed cities because weather is time-dependent.
