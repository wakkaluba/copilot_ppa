export declare class ErrorHandler {
    private readonly outputChannel;
    constructor();
    handle(message: string, error: unknown): void;
    dispose(): void;
}
