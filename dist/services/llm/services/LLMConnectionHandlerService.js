"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMConnectionHandlerService = void 0;
const events_1 = require("events");
const types_1 = require("../types");
const errors_1 = require("../errors");
class LLMConnectionHandlerService extends events_1.EventEmitter {
    _currentState = types_1.ConnectionState.DISCONNECTED;
    _activeProvider = null;
    _activeConnection = null;
    _lastError;
    options;
    constructor(options = {}) {
        super();
        this.options = {
            maxRetries: options.maxRetries || 3,
            initialRetryDelay: options.initialRetryDelay || 1000,
            maxRetryDelay: options.maxRetryDelay || 30000,
            retryBackoffFactor: options.retryBackoffFactor || 2,
            connectionTimeout: options.connectionTimeout || 30000,
            reconnectOnError: options.reconnectOnError ?? true,
            healthCheckInterval: options.healthCheckInterval || 30000
        };
    }
    get currentState() {
        return this._currentState;
    }
    get activeProvider() {
        return this._activeProvider;
    }
    get activeProviderName() {
        return this._activeProvider?.name;
    }
    get lastError() {
        return this._lastError;
    }
    async setActiveProvider(provider) {
        if (this._activeConnection) {
            await this.disconnect();
        }
        this._activeProvider = provider;
        this._currentState = types_1.ConnectionState.DISCONNECTED;
        this.emit('providerChanged', provider);
    }
    async connect(connection) {
        if (!this._activeProvider) {
            throw new errors_1.LLMConnectionError(errors_1.LLMConnectionErrorCode.ProviderNotFound, 'No active provider set');
        }
        try {
            this._currentState = types_1.ConnectionState.CONNECTING;
            this.emit('stateChanged', this._currentState);
            await connection.connect({
                ...this.options,
                provider: this._activeProvider
            });
            this._activeConnection = connection;
            this._currentState = types_1.ConnectionState.CONNECTED;
            this._lastError = undefined;
            this.emit('connected', await this.getConnectionStatus());
            this.emit('stateChanged', this._currentState);
        }
        catch (error) {
            this._lastError = error instanceof Error ? error : new Error(String(error));
            this._currentState = types_1.ConnectionState.ERROR;
            this.emit('error', this._lastError);
            this.emit('stateChanged', this._currentState);
            throw error;
        }
    }
    async disconnect() {
        if (this._activeConnection) {
            try {
                await this._activeConnection.disconnect();
            }
            catch (error) {
                console.error('Error disconnecting:', error);
            }
            this._activeConnection = null;
        }
        this._currentState = types_1.ConnectionState.DISCONNECTED;
        this.emit('disconnected');
        this.emit('stateChanged', this._currentState);
    }
    async getConnectionStatus() {
        return {
            state: this._currentState,
            provider: this._activeProvider?.name || 'unknown',
            modelInfo: this._activeConnection ? await this._activeConnection.getModelInfo() : undefined,
            error: this._lastError?.message
        };
    }
    dispose() {
        this.disconnect().catch(console.error);
        this.removeAllListeners();
    }
}
exports.LLMConnectionHandlerService = LLMConnectionHandlerService;
//# sourceMappingURL=LLMConnectionHandlerService.js.map