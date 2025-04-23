import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { NewLLMConnectionManager } from './llm/LLMConnectionManager';
import { ConnectionState, LLMConnectionError } from './llm/types';

/**
 * @deprecated Use the new LLMConnectionManager from services/llm instead
 * This class is kept for backward compatibility and forwards all calls to the new implementation
 */
export class LLMConnectionManager {
    private static instance: LLMConnectionManager;
    private readonly newManager: NewLLMConnectionManager;
    
    private constructor() {
        this.newManager = NewLLMConnectionManager.getInstance({
            maxRetries: 3,
            initialRetryDelay: 1000,
            maxRetryDelay: 30000,
            connectionTimeout: 30000,
            reconnectOnError: true,
            healthCheckInterval: 60000
        });
        
        console.warn('LLMConnectionManager is deprecated. Use services/llm/LLMConnectionManager instead.');
        this.setupEventForwarding();
    }

    private setupEventForwarding(): void {
        // Forward all events from new to old manager for compatibility
        this.newManager.on('stateChanged', (state) => this.emit('stateChanged', state));
        this.newManager.on('error', (error) => this.emit('error', error));
        this.newManager.on('connected', () => this.emit('connected'));
        this.newManager.on('disconnected', () => this.emit('disconnected'));
    }

    static getInstance(): LLMConnectionManager {
        if (!this.instance) {
            this.instance = new LLMConnectionManager();
        }
        return this.instance;
    }

    async connectToLLM(): Promise<boolean> {
        return this.newManager.connectToLLM();
    }

    async disconnect(): Promise<void> {
        await this.newManager.disconnect();
    }

    async reconnect(): Promise<boolean> {
        return this.newManager.connectToLLM();
    }

    getConnectionState(): ConnectionState {
        return this.newManager.connectionState;
    }

    getStatus(): { isConnected: boolean; status: string } {
        const status = this.newManager.getStatus();
        return {
            isConnected: status.isConnected,
            status: status.error || (status.isConnected ? 'Connected' : 'Disconnected')
        };
    }

    dispose(): void {
        this.newManager.dispose();
    }
}
