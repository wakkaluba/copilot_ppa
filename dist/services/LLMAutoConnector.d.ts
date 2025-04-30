export declare class LLMAutoConnector {
    private static instance;
    private isConnected;
    private connectionAttempts;
    private readonly maxAttempts;
    private readonly retryDelay;
    private constructor();
    static getInstance(): LLMAutoConnector;
    tryConnect(): Promise<boolean>;
    disconnect(): Promise<void>;
    isLLMConnected(): boolean;
}
