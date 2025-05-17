export class Logger {
  static getInstance() {
    return new Logger();
  }
  info(...args: any[]) {}
  error(...args: any[]) {}
}
