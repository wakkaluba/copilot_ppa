import * as vscode from 'vscode';

/**
 * Logging service for the extension
 * Provides consistent logging across the extension with multiple log levels
 */
export class LoggingService implements vscode.Disposable {
  private outputChannel: vscode.OutputChannel;
  private extensionName: string;

  /**
   * Creates a new logging service
   * @param extensionName The name of the extension for the output channel
   */
  constructor(extensionName: string) {
    this.extensionName = extensionName;
    this.outputChannel = vscode.window.createOutputChannel(`${extensionName}`);
  }

  /**
   * Log an informational message
   * @param message The message to log
   */
  public log(message: string): void {
    this.logWithLevel('INFO', message);
  }

  /**
   * Log a debug message
   * @param message The message to log
   */
  public debug(message: string): void {
    const config = vscode.workspace.getConfiguration('copilot-ppa');
    if (config.get<boolean>('debugLogging', false)) {
      this.logWithLevel('DEBUG', message);
    }
  }

  /**
   * Log a warning message
   * @param message The warning message
   */
  public warn(message: string): void {
    this.logWithLevel('WARN', message);
  }

  /**
   * Log an error message with optional Error object
   * @param message The error message
   * @param error Optional Error object
   */
  public error(message: string, error?: Error | unknown): void {
    this.logWithLevel('ERROR', message);
    
    if (error) {
      if (error instanceof Error) {
        this.outputChannel.appendLine(`  Error Details: ${error.message}`);
        if (error.stack) {
          this.outputChannel.appendLine(`  Stack Trace: ${error.stack}`);
        }
      } else {
        this.outputChannel.appendLine(`  Error Details: ${String(error)}`);
      }
    }
  }

  /**
   * Internal method to format and log a message with the specified level
   * @param level The log level
   * @param message The message to log
   */
  private logWithLevel(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
  }

  /**
   * Show the output channel
   */
  public show(): void {
    this.outputChannel.show();
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.outputChannel.dispose();
  }
}