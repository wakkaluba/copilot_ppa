import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { LLMProvider, ProviderCapabilities } from '../../llm/types';
import { LLMProviderValidator } from './validators/LLMProviderValidator';

export enum ConnectionStatus {
    Disconnected = 'disconnected',
    Connecting = 'connecting',
    Connected = 'connected',
    Error = 'error'
}

export interface ConnectionEvent {
    provider?: string;
    status: ConnectionStatus;
    timestamp: number;
    error?: Error;
    details?: Record<string, any>;
}

export class LLMConnectionManager extends EventEmitter implements vscode.Disposable {
    private provider: LLMProvider | null = null;
    private status: ConnectionStatus = ConnectionStatus.Disconnected;
    private validator: LLMProviderValidator;
    private connectionTimeout: number = 30000; // 30 seconds default timeout
    private connectionAttempts: number = 0;
    private maxConnectionAttempts: number = 3;
    
    constructor() {
        super();
        this.validator = new LLMProviderValidator();
    }
    
    /**
     * Set the LLM provider to use
     * @param provider The LLM provider implementation
     * @returns True if the provider was set successfully
     */
    setProvider(provider: LLMProvider): boolean {
        if (!provider) {
            throw new Error('Provider cannot be null or undefined');
        }
        
        // Validate the provider
        const validationResult = this.validator.validate(provider);
        if (!validationResult.isValid) {
            const errors = validationResult.errors.join(', ');
            throw new Error(`Invalid LLM provider: ${errors}`);
        }
        
        this.provider = provider;
        
        this.emit('providerChanged', {
            provider: provider.getName(),
            status: this.status,
            timestamp: Date.now()
        });
        
        return true;
    }
    
    /**
     * Get the current LLM provider
     * @returns The current LLM provider or null if not set
     */
    getProvider(): LLMProvider | null {
        return this.provider;
    }
    
    /**
     * Connect to the LLM provider
     * @returns True if connected successfully
     */
    async connectToLLM(): Promise<boolean> {
        if (!this.provider) {
            throw new Error('No provider set - call setProvider first');
        }
        
        // Prevent connection if already connecting or connected
        if (this.status === ConnectionStatus.Connecting || this.status === ConnectionStatus.Connected) {
            return this.status === ConnectionStatus.Connected;
        }
        
        this.setStatus(ConnectionStatus.Connecting);
        this.connectionAttempts += 1;
        
        try {
            // Check if provider is available with timeout
            const isAvailable = await this.withTimeout(
                this.provider.isAvailable(),
                this.connectionTimeout,
                'Connection timeout'
            );
            
            if (!isAvailable) {
                throw new Error('Provider is not available');
            }
            
            this.setStatus(ConnectionStatus.Connected);
            this.connectionAttempts = 0;
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.setStatus(ConnectionStatus.Error, new Error(`Failed to connect: ${errorMessage}`));
            
            // If we haven't exceeded max attempts, try again
            if (this.connectionAttempts < this.maxConnectionAttempts) {
                console.log(`Connection attempt ${this.connectionAttempts} failed, retrying...`);
                return this.connectToLLM();
            }
            
            this.connectionAttempts = 0;
            return false;
        }
    }
    
    /**
     * Disconnect from the LLM provider
     */
    disconnectFromLLM(): void {
        this.setStatus(ConnectionStatus.Disconnected);
    }
    
    /**
     * Get the current connection status
     * @returns The current connection status
     */
    getConnectionStatus(): ConnectionStatus {
        return this.status;
    }
    
    /**
     * Get the capabilities of the current provider
     * @returns The provider capabilities or null if no provider is set
     */
    getCapabilities(): ProviderCapabilities | null {
        if (!this.provider) {
            return null;
        }
        
        return this.provider.getCapabilities();
    }
    
    /**
     * Set the connection timeout
     * @param timeoutMs Timeout in milliseconds
     */
    setConnectionTimeout(timeoutMs: number): void {
        if (timeoutMs < 1000) {
            throw new Error('Timeout must be at least 1000ms (1 second)');
        }
        
        this.connectionTimeout = timeoutMs;
    }
    
    /**
     * Set the maximum number of connection attempts
     * @param attempts Maximum number of attempts
     */
    setMaxConnectionAttempts(attempts: number): void {
        if (attempts < 1) {
            throw new Error('Max connection attempts must be at least 1');
        }
        
        this.maxConnectionAttempts = attempts;
    }
    
    private setStatus(status: ConnectionStatus, error?: Error): void {
        this.status = status;
        
        const event: ConnectionEvent = {
            provider: this.provider?.getName(),
            status,
            timestamp: Date.now()
        };
        
        if (error) {
            event.error = error;
        }
        
        this.emit('statusChanged', event);
    }
    
    private async withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
        return Promise.race([
            promise,
            new Promise<T>((_, reject) => {
                setTimeout(() => {
                    reject(new Error(message));
                }, timeoutMs);
            })
        ]);
    }
    
    dispose(): void {
        this.removeAllListeners();
    }
}