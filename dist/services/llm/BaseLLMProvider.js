"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLLMProvider = void 0;
const events_1 = require("events");
const ConnectionMetricsTracker_1 = require("./ConnectionMetricsTracker");
const connectionUtils_1 = require("./connectionUtils");
const errors_1 = require("./errors");
const llm_1 = require("../../types/llm");
class BaseLLMProvider extends events_1.EventEmitter {
    id;
    name;
    connectionState = llm_1.ConnectionState.DISCONNECTED;
    metricsTracker;
    lastError;
    currentModel;
    constructor(id, name) {
        super();
        this.id = id;
        this.name = name;
        this.metricsTracker = new ConnectionMetricsTracker_1.ConnectionMetricsTracker();
    }
    isConnected() {
        return this.connectionState === llm_1.ConnectionState.CONNECTED;
    }
    async connect() {
        try {
            this.connectionState = llm_1.ConnectionState.CONNECTING;
            this.emit('stateChanged', this.connectionState);
            const startTime = Date.now();
            await this.performConnect();
            const endTime = Date.now();
            this.metricsTracker.recordConnectionSuccess();
            this.metricsTracker.recordRequest(endTime - startTime);
            this.connectionState = llm_1.ConnectionState.CONNECTED;
            this.emit('stateChanged', this.connectionState);
            this.emit('connected');
        }
        catch (error) {
            const formattedError = (0, connectionUtils_1.formatProviderError)(error, this.name);
            this.handleError(formattedError);
            throw formattedError;
        }
    }
    async disconnect() {
        try {
            await this.performDisconnect();
            this.connectionState = llm_1.ConnectionState.DISCONNECTED;
            this.emit('stateChanged', this.connectionState);
            this.emit('disconnected');
        }
        catch (error) {
            const formattedError = (0, connectionUtils_1.formatProviderError)(error, this.name);
            this.handleError(formattedError);
            throw formattedError;
        }
    }
    handleError(error) {
        this.lastError = error;
        this.emit('error', error);
        if (error instanceof errors_1.LLMConnectionError) {
            if (error.code === 'PROVIDER_UNAVAILABLE') {
                this.connectionState = llm_1.ConnectionState.DISCONNECTED;
            }
            else {
                this.connectionState = llm_1.ConnectionState.ERROR;
            }
        }
        else {
            this.connectionState = llm_1.ConnectionState.ERROR;
        }
        this.emit('stateChanged', this.connectionState);
        this.metricsTracker.recordRequestFailure(error);
    }
    dispose() {
        if (this.connectionState === llm_1.ConnectionState.CONNECTED) {
            this.disconnect().catch(console.error);
        }
        this.removeAllListeners();
    }
}
exports.BaseLLMProvider = BaseLLMProvider;
//# sourceMappingURL=BaseLLMProvider.js.map