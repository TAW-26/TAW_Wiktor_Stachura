import fs from "fs";
import path from "path";

type Context = Record<string, unknown> | undefined;

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir);
  } catch {}
}

let sentry: any = null;
let sentryEnabled = false;

export const initMonitoring = (dsn?: string) => {
  if (!dsn) return;
  try {
    // Dynamically require to avoid hard dependency if not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require("@sentry/node");
    Sentry.init({ dsn });
    sentry = Sentry;
    sentryEnabled = true;
    console.info("Monitoring: Sentry initialized");
  } catch (err) {
    console.warn("Monitoring: Failed to initialize Sentry, falling back to file logger");
  }
};

const appendJson = (file: string, obj: Record<string, unknown>) => {
  try {
    fs.appendFileSync(path.join(logsDir, file), JSON.stringify(obj) + "\n");
  } catch (e) {
    // ignore
  }
};

export const captureException = (error: unknown, context?: Context) => {
  const payload = {
    time: new Date().toISOString(),
    error: (error instanceof Error) ? { message: error.message, stack: error.stack } : String(error),
    context: context || {},
  } as Record<string, unknown>;

  if (sentryEnabled && sentry) {
    try {
      sentry.captureException(error);
    } catch {
      appendJson("monitoring.log", payload);
    }
  } else {
    appendJson("monitoring.log", payload);
  }
};

export const capturePerformance = (metricName: string, ms: number, context?: Context) => {
  const payload = {
    time: new Date().toISOString(),
    metric: metricName,
    durationMs: ms,
    context: context || {},
  } as Record<string, unknown>;
  appendJson("perf.log", payload);
};

export const withTiming = async <T>(name: string, fn: () => Promise<T>, context?: Context) => {
  const start = Date.now();
  try {
    const res = await fn();
    const duration = Date.now() - start;
    capturePerformance(name, duration, context);
    return res;
  } catch (err) {
    const duration = Date.now() - start;
    capturePerformance(name + ".error", duration, context);
    captureException(err, { ...context, phase: "timed" });
    throw err;
  }
};

export default {
  initMonitoring,
  captureException,
  capturePerformance,
  withTiming,
};
