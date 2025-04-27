"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMConnectionManager = void 0;
const LLMConnectionManager_1 = require("./llm/LLMConnectionManager");
/**
 * @deprecated Use the new LLMConnectionManager from services/llm instead
 * This class is kept for backward compatibility and forwards all calls to the new implementation
 */
class LLMConnectionManager {
    constructor() {
        this.newManager = LLMConnectionManager_1.NewLLMConnectionManager.getInstance({
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
    setupEventForwarding() {
        // Forward all events from new to old manager for compatibility
        this.newManager.on('stateChanged', (state) => this.emit('stateChanged', state));
        this.newManager.on('error', (error) => this.emit('error', error));
        this.newManager.on('connected', () => this.emit('connected'));
        this.newManager.on('disconnected', () => this.emit('disconnected'));
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new LLMConnectionManager();
        }
        return this.instance;
    }
    async connectToLLM() {
        return this.newManager.connectToLLM();
    }
    async disconnect() {
        await this.newManager.disconnect();
    }
    async reconnect() {
        return this.newManager.connectToLLM();
    }
    getConnectionState() {
        return this.newManager.connectionState;
    }
    getStatus() {
        const status = this.newManager.getStatus();
        return {
            isConnected: status.isConnected,
            status: status.error || (status.isConnected ? 'Connected' : 'Disconnected')
        };
    }
    dispose() {
        this.newManager.dispose();
    }
}
exports.LLMConnectionManager = LLMConnectionManager;
//# sourceMappingURL=LLMConnectionManager.js.map