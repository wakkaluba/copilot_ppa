import { ConnectionState } from './llm/types';
/**
 * @deprecated Use the new LLMConnectionManager from services/llm instead
 * This class is kept for backward compatibility and forwards all calls to the new implementation
 */
export declare class LLMConnectionManager {
    private static instance;
    private readonly newManager;
    private constructor();
    private setupEventForwarding;
    static getInstance(): LLMConnectionManager;
    connectToLLM(): Promise<boolean>;
    disconnect(): Promise<void>;
    reconnect(): Promise<boolean>;
    getConnectionState(): ConnectionState;
    getStatus(): {
        isConnected: boolean;
        status: string;
    };
    dispose(): void;
}
