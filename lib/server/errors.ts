export class DomainError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export const isDomainError = (error: unknown): error is DomainError =>
  error instanceof DomainError;
