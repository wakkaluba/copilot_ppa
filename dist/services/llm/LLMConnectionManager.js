"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMConnectionManager = exports.ConnectionStatus = void 0;
const events_1 = require("events");
const LLMProviderValidator_1 = require("./validators/LLMProviderValidator");
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["Disconnected"] = "disconnected";
    ConnectionStatus["Connecting"] = "connecting";
    ConnectionStatus["Connected"] = "connected";
    ConnectionStatus["Error"] = "error";
})(ConnectionStatus || (exports.ConnectionStatus = ConnectionStatus = {}));
class LLMConnectionManager extends events_1.EventEmitter {
    provider = null;
    status = ConnectionStatus.Disconnected;
    validator;
    connectionTimeout = 30000; // 30 seconds default timeout
    connectionAttempts = 0;
    maxConnectionAttempts = 3;
    constructor() {
        super();
        this.validator = new LLMProviderValidator_1.LLMProviderValidator();
    }
    /**
     * Set the LLM provider to use
     * @param provider The LLM provider implementation
     * @returns True if the provider was set successfully
     */
    setProvider(provider) {
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
    getProvider() {
        return this.provider;
    }
    /**
     * Connect to the LLM provider
     * @returns True if connected successfully
     */
    async connectToLLM() {
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
            const isAvailable = await this.withTimeout(this.provider.isAvailable(), this.connectionTimeout, 'Connection timeout');
            if (!isAvailable) {
                throw new Error('Provider is not available');
            }
            this.setStatus(ConnectionStatus.Connected);
            this.connectionAttempts = 0;
            return true;
        }
        catch (error) {
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
    disconnectFromLLM() {
        this.setStatus(ConnectionStatus.Disconnected);
    }
    /**
     * Get the current connection status
     * @returns The current connection status
     */
    getConnectionStatus() {
        return this.status;
    }
    /**
     * Get the capabilities of the current provider
     * @returns The provider capabilities or null if no provider is set
     */
    getCapabilities() {
        if (!this.provider) {
            return null;
        }
        return this.provider.getCapabilities();
    }
    /**
     * Set the connection timeout
     * @param timeoutMs Timeout in milliseconds
     */
    setConnectionTimeout(timeoutMs) {
        if (timeoutMs < 1000) {
            throw new Error('Timeout must be at least 1000ms (1 second)');
        }
        this.connectionTimeout = timeoutMs;
    }
    /**
     * Set the maximum number of connection attempts
     * @param attempts Maximum number of attempts
     */
    setMaxConnectionAttempts(attempts) {
        if (attempts < 1) {
            throw new Error('Max connection attempts must be at least 1');
        }
        this.maxConnectionAttempts = attempts;
    }
    setStatus(status, error) {
        this.status = status;
        const event = {
            provider: this.provider?.getName(),
            status,
            timestamp: Date.now()
        };
        if (error) {
            event.error = error;
        }
        this.emit('statusChanged', event);
    }
    async withTimeout(promise, timeoutMs, message) {
        return Promise.race([
            promise,
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(message));
                }, timeoutMs);
            })
        ]);
    }
    dispose() {
        this.removeAllListeners();
    }
}
exports.LLMConnectionManager = LLMConnectionManager;
//# sourceMappingURL=LLMConnectionManager.js.map