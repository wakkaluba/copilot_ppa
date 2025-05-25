import * as vscode from 'vscode';
import { ILogger, LogLevel } from './ILogger';

/**
 * Simple logger implementation
 */
export class Logger implements ILogger {
  private static instance: Logger;
  private outputChannel: vscode.OutputChannel;
  private logLevel: LogLevel = LogLevel.Info;

  constructor(channelName: string = 'Copilot PPA') {
    this.outputChannel = vscode.window.createOutputChannel(channelName);
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public debug(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.Debug) {
      this.log('DEBUG', message, ...args);
    }
  }

  public info(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.Info) {
      this.log('INFO', message, ...args);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.Warning) {
      this.log('WARN', message, ...args);
    }
  }

  public error(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.Error) {
      this.log('ERROR', message, ...args);
    }
  }

  private log(level: string, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;

    this.outputChannel.appendLine(formattedMessage);

    if (args.length > 0) {
      for (const arg of args) {
        if (arg instanceof Error) {
          this.outputChannel.appendLine(`  ${arg.message}`);
          if (arg.stack) {
            this.outputChannel.appendLine(`  ${arg.stack}`);
          }
        } else {
          try {
            const stringified =
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
            this.outputChannel.appendLine(`  ${stringified}`);
          } catch (err) {
            this.outputChannel.appendLine(`  [Unstringifiable object]`);
          }
        }
      }
    }
  }

  public dispose(): void {
    this.outputChannel.dispose();
  }
}
