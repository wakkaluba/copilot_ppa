import { EventEmitter } from 'events';
import { LLMProvider } from '../../llm/llm-provider';
import { ConnectionState } from '../../status/connectionStatusService';

/**
 * Manager for handling connections to LLM providers
 */
export class LLMConnectionManager extends EventEmitter {
    private static instance: LLMConnectionManager;
    private providers: Map<string, LLMProvider> = new Map();
    private activeProvider: string | null = null;
    private connectionState: ConnectionState = ConnectionState.Disconnected;
    private hostState: 'running' | 'stopped' | 'unknown' = 'unknown';

    private constructor() {
        super();
    }

    public static getInstance(): LLMConnectionManager {
        if (!LLMConnectionManager.instance) {
            LLMConnectionManager.instance = new LLMConnectionManager();
        }
        return LLMConnectionManager.instance;
    }

    /**
     * Registers a provider with the connection manager
     * @param name Unique provider name
     * @param provider Provider instance
     */
    public registerProvider(name: string, provider: LLMProvider): void {
        this.providers.set(name, provider);
        
        // Listen for provider state changes
        provider.on('stateChanged', (status) => {
            if (name === this.activeProvider) {
                this.updateConnectionState(
                    status.isConnected ? ConnectionState.Connected : ConnectionState.Disconnected
                );
            }
        });
    }

    /**
     * Sets the active provider
     * @param name Provider name to activate
     */
    public setActiveProvider(name: string): void {
        if (!this.providers.has(name)) {
            throw new Error(`Provider ${name} not registered`);
        }
        
        this.activeProvider = name;
        
        // Update state based on provider's current state
        const provider = this.providers.get(name);
        if (provider) {
            const status = provider.getStatus();
            this.updateConnectionState(
                status.isConnected ? ConnectionState.Connected : ConnectionState.Disconnected
            );
        }
    }

    /**
     * Gets the active provider
     * @returns The active provider or null if none set
     */
    public getActiveProvider(): LLMProvider | null {
        if (!this.activeProvider) {
            return null;
        }
        
        return this.providers.get(this.activeProvider) || null;
    }

    /**
     * Initiates a connection to the active provider
     * @returns True if connection was successful
     */
    public async connectToLLM(): Promise<boolean> {
        if (!this.activeProvider) {
            throw new Error('No active provider set');
        }
        
        const provider = this.providers.get(this.activeProvider);
        if (!provider) {
            throw new Error(`Provider ${this.activeProvider} not found`);
        }
        
        try {
            this.updateConnectionState(ConnectionState.Connecting);
            await provider.connect();
            this.updateConnectionState(ConnectionState.Connected);
            return true;
        } catch (error) {
            this.updateConnectionState(ConnectionState.Error);
            throw error;
        }
    }

    /**
     * Disconnects the current active provider
     */
    public async disconnectFromLLM(): Promise<void> {
        if (!this.activeProvider) {
            return;
        }
        
        const provider = this.providers.get(this.activeProvider);
        if (!provider) {
            return;
        }
        
        try {
            await provider.disconnect();
            this.updateConnectionState(ConnectionState.Disconnected);
        } catch (error) {
            this.updateConnectionState(ConnectionState.Error);
            throw error;
        }
    }

    /**
     * Gets the current connection state
     */
    public async getCurrentState(): Promise<ConnectionState> {
        return this.connectionState;
    }

    /**
     * Updates the connection state and emits an event
     */
    private updateConnectionState(state: ConnectionState): void {
        this.connectionState = state;
        this.emit('stateChanged', state);
    }

    /**
     * Sets the host state (running/stopped) and emits an event
     */
    public setHostState(state: 'running' | 'stopped'): void {
        this.hostState = state;
        this.emit('hostStateChanged', state);
    }

    /**
     * Sets the active model for the current provider
     * @param modelName Name of the model to activate
     */
    public async setActiveModel(modelName: string): Promise<void> {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new Error('No active provider set');
        }
        
        // For now, we'll just update the provider status
        // In a real implementation, this might involve API calls to change the model
        const currentStatus = provider.getStatus();
        const updatedStatus = { 
            ...currentStatus,
            activeModel: modelName 
        };
        
        // Emit a state change event - the provider should implement this properly
        provider.emit('stateChanged', updatedStatus);
    }
}