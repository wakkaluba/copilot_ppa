import { LogLevel } from './LogLevel';

export class Logger {
    private static instance: Logger;

    private constructor() {}

    public static getInstance(): Logger {
        if (!Logger.getInstance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public log(message: string, level: LogLevel = LogLevel.Info): void {
        // Implement logging logic
    }

    public for(context: string): Logger {
        // Create scoped logger
        return new Logger();
    }
}