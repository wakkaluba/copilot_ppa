export declare class Logger {
    private readonly scope;
    private outputChannel;
    constructor(scope: string);
    info(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    private log;
    dispose(): void;
}
