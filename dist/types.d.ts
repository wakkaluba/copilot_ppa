export declare enum LogLevel {
    Trace = 0,
    Debug = 1,
    Info = 2,
    Warning = 3,
    Error = 4,
    Critical = 5,
    None = 6
}
export interface ILogger {
    trace(message: string): void;
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string, error?: Error): void;
    critical(message: string, error?: Error): void;
}
export interface IDisposable {
    dispose(): void;
}
export interface IExtensionContext {
    subscriptions: IDisposable[];
    extensionPath: string;
    storagePath?: string;
    globalStoragePath: string;
    logPath: string;
    asAbsolutePath(relativePath: string): string;
    workspaceState: {
        get<T>(key: string, defaultValue?: T): T | undefined;
        update(key: string, value: any): Promise<void>;
    };
    globalState: {
        get<T>(key: string, defaultValue?: T): T | undefined;
        update(key: string, value: any): Promise<void>;
    };
}
