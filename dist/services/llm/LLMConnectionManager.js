"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMConnectionManager = void 0;
const events_1 = require("events");
const connectionStatusService_1 = require("../../status/connectionStatusService");
/**
 * Manager for handling connections to LLM providers
 */
class LLMConnectionManager extends events_1.EventEmitter {
    static instance;
    providers = new Map();
    activeProvider = null;
    connectionState = connectionStatusService_1.ConnectionState.Disconnected;
    hostState = 'unknown';
    constructor() {
        super();
    }
    static getInstance() {
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
    registerProvider(name, provider) {
        this.providers.set(name, provider);
        // Listen for provider state changes
        provider.on('stateChanged', (status) => {
            if (name === this.activeProvider) {
                this.updateConnectionState(status.isConnected ? connectionStatusService_1.ConnectionState.Connected : connectionStatusService_1.ConnectionState.Disconnected);
            }
        });
    }
    /**
     * Sets the active provider
     * @param name Provider name to activate
     */
    setActiveProvider(name) {
        if (!this.providers.has(name)) {
            throw new Error(`Provider ${name} not registered`);
        }
        this.activeProvider = name;
        // Update state based on provider's current state
        const provider = this.providers.get(name);
        if (provider) {
            const status = provider.getStatus();
            this.updateConnectionState(status.isConnected ? connectionStatusService_1.ConnectionState.Connected : connectionStatusService_1.ConnectionState.Disconnected);
        }
    }
    /**
     * Gets the active provider
     * @returns The active provider or null if none set
     */
    getActiveProvider() {
        if (!this.activeProvider) {
            return null;
        }
        return this.providers.get(this.activeProvider) || null;
    }
    /**
     * Initiates a connection to the active provider
     * @returns True if connection was successful
     */
    async connectToLLM() {
        if (!this.activeProvider) {
            throw new Error('No active provider set');
        }
        const provider = this.providers.get(this.activeProvider);
        if (!provider) {
            throw new Error(`Provider ${this.activeProvider} not found`);
        }
        try {
            this.updateConnectionState(connectionStatusService_1.ConnectionState.Connecting);
            await provider.connect();
            this.updateConnectionState(connectionStatusService_1.ConnectionState.Connected);
            return true;
        }
        catch (error) {
            this.updateConnectionState(connectionStatusService_1.ConnectionState.Error);
            throw error;
        }
    }
    /**
     * Disconnects the current active provider
     */
    async disconnectFromLLM() {
        if (!this.activeProvider) {
            return;
        }
        const provider = this.providers.get(this.activeProvider);
        if (!provider) {
            return;
        }
        try {
            await provider.disconnect();
            this.updateConnectionState(connectionStatusService_1.ConnectionState.Disconnected);
        }
        catch (error) {
            this.updateConnectionState(connectionStatusService_1.ConnectionState.Error);
            throw error;
        }
    }
    /**
     * Gets the current connection state
     */
    async getCurrentState() {
        return this.connectionState;
    }
    /**
     * Updates the connection state and emits an event
     */
    updateConnectionState(state) {
        this.connectionState = state;
        this.emit('stateChanged', state);
    }
    /**
     * Sets the host state (running/stopped) and emits an event
     */
    setHostState(state) {
        this.hostState = state;
        this.emit('hostStateChanged', state);
    }
    /**
     * Sets the active model for the current provider
     * @param modelName Name of the model to activate
     */
    async setActiveModel(modelName) {
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
exports.LLMConnectionManager = LLMConnectionManager;
//# sourceMappingURL=LLMConnectionManager.js.map