# Monitoring and Error Reporting

This document describes how to enable application monitoring and error reporting.

Supported approaches
- Sentry (recommended) — for error aggregation, traces and performance
- File-based local logs — fallback when no external DSN is provided

Configuration

- Provide Sentry DSN via environment variable `SENTRY_DSN` to enable Sentry:

  export SENTRY_DSN=your_dsn_here

- The app will attempt to initialize Sentry if `SENTRY_DSN` is present and the `@sentry/node` package is available.

Local logs
- When Sentry is not configured, the app writes logs to `logs/monitoring.log` and performance metrics to `logs/perf.log`.

Files added
- `lib/server/monitoring.ts` — lightweight wrapper for Sentry + file logging. Exports:
  - `initMonitoring(dsn?)`
  - `captureException(error, context?)`
  - `capturePerformance(metricName, ms, context?)`
  - `withTiming(name, fn, context?)` — helper to time async operations

Load / stability testing
- A simple load script is available at `scripts/load-test.mjs`. It makes concurrent requests to selected endpoints and reports basic timing. See the script header for usage.

Security
- Do not commit `SENTRY_DSN` to source control. Use environment variables in deploy pipelines.
