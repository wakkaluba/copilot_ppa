import { BaseConnectionManager } from './BaseConnectionManager';
import { ConnectionOptions, HealthCheckResponse } from './types';
export interface OllamaModelMetadata {
    name: string;
    modified_at: string;
    size: number;
    details: Record<string, unknown>;
}
/**
 * Specialized connection manager for Ollama LLM service
 */
export declare class OllamaConnectionManager extends BaseConnectionManager {
    private endpoint;
    private currentModel;
    protected establishConnection(): Promise<void>;
    protected terminateConnection(): Promise<void>;
    protected performHealthCheck(): Promise<HealthCheckResponse>;
    configure(options: ConnectionOptions): Promise<void>;
    getCurrentModel(): string;
    setModel(modelName: string): Promise<void>;
}
