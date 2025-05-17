export interface ILogger {
  error(message: string, ...args: any[]): void;
  info?(message: string, ...args: any[]): void;
  warn?(message: string, ...args: any[]): void;
}

export class DummyLogger implements ILogger {
  error(message: string, ...args: any[]): void {
    // no-op for test
  }
  info(message: string, ...args: any[]): void {
    // no-op for test
  }
  warn(message: string, ...args: any[]): void {
    // no-op for test
  }
}
