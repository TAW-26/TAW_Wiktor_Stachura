import { NextResponse } from "next/server";
import { DomainError, isDomainError } from "./errors";
import monitoring, { captureException, capturePerformance } from "./monitoring";

// initialize monitoring (Sentry or file fallback) on module load
try {
  monitoring.initMonitoring(process.env.SENTRY_DSN);
} catch (e) {
  // ignore
}

export const toIntId = (value: string): number => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new DomainError("Invalid numeric id", 400);
  }
  return parsed;
};

export const toDate = (value: string, fieldName: string): Date => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new DomainError(`Invalid date for field: ${fieldName}`, 400);
  }

  return parsed;
};

export const parseJsonBody = async <T>(request: Request): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    throw new DomainError("Invalid JSON body", 400);
  }
};

export const handleRouteError = (error: unknown, context?: Record<string, unknown>) => {
  if (isDomainError(error)) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  // capture to monitoring (Sentry or file fallback)
  try {
    captureException(error, context);
  } catch (e) {
    // ignore
  }
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};

export const instrument = async <T>(
  request: Request | undefined,
  route: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> => {
  const start = Date.now();
  try {
    const res = await fn();
    const duration = Date.now() - start;
    try { capturePerformance(route, duration, { ...(context || {}), method: request?.method }); } catch {}
    return res;
  } catch (err) {
    const duration = Date.now() - start;
    try { capturePerformance(route + ".error", duration, { ...(context || {}), method: request?.method }); } catch {}
    try { captureException(err, { ...(context || {}), route, method: request?.method }); } catch {}
    // Return a proper HTTP response instead of re-throwing — prevents Next.js from
    // converting every DomainError (400/401/403/404/409) into a 500.
    return handleRouteError(err, { route }) as unknown as T;
  }
};
