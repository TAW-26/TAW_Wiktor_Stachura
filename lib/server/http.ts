import { NextResponse } from "next/server";
import { DomainError, isDomainError } from "./errors";

export const toIntId = (value: string): number => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new DomainError("Invalid numeric id", 400);
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

export const handleRouteError = (error: unknown) => {
  if (isDomainError(error)) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};
