// Custom error for SecurityScanner
export class SecurityScannerError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'SecurityScannerError';
  }
}
