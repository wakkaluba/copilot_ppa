// Minimal logger for test and runtime compatibility
export interface ILogger {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

export class DummyLogger implements ILogger {
  info(..._args: any[]) {}
  warn(..._args: any[]) {}
  error(..._args: any[]) {}
  debug(..._args: any[]) {}
}
