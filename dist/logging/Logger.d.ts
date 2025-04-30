import { ILogger, LogLevel } from './ILogger';
/**
 * Simple logger implementation
 */
export declare class Logger implements ILogger {
    private outputChannel;
    private logLevel;
    constructor(channelName?: string);
    setLogLevel(level: LogLevel): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    private log;
    dispose(): void;
}
