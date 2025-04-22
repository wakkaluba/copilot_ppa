"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMConnectionManager = void 0;
const events_1 = require("events");
const types_1 = require("./types");
const LLMProviderRegistryService_1 = require("./services/LLMProviderRegistryService");
const LLMConnectionHandlerService_1 = require("./services/LLMConnectionHandlerService");
const LLMRetryManagerService_1 = require("./services/LLMRetryManagerService");
const LLMStatusReporterService_1 = require("./services/LLMStatusReporterService");
const LLMHealthMonitorService_1 = require("./services/LLMHealthMonitorService");
const LLMMetricsService_1 = require("./services/LLMMetricsService");
const LLMErrorHandlerService_1 = require("./services/LLMErrorHandlerService");
const LLMConnectionEventService_1 = require("./services/LLMConnectionEventService");
const ConnectionMetricsTracker_1 = require("./ConnectionMetricsTracker");
const ConnectionPoolManager_1 = require("./services/ConnectionPoolManager");
/**
 * Primary manager for LLM connections
 * Handles connection lifecycle, error handling, metrics, events, and health monitoring
 */
class LLMConnectionManager extends events_1.EventEmitter {
    static instance;
    providerRegistry;
    connectionHandler;
    retryManager;
    statusReporter;
    healthMonitor;
    metricsService;
    errorHandler;
    eventService;
    metricsTracker;
    connectionPool;
    healthCheckInterval = null;
    activeProvider = null;
    connectionOptions = {};
    currentStatus = {
        isConnected: false,
        isAvailable: false,
        error: ''
    };
    constructor(options = {}) {
        super();
        this.providerRegistry = new LLMProviderRegistryService_1.LLMProviderRegistryService();
        this.connectionHandler = new LLMConnectionHandlerService_1.LLMConnectionHandlerService(options);
        this.retryManager = new LLMRetryManagerService_1.LLMRetryManagerService(options);
        this.statusReporter = new LLMStatusReporterService_1.LLMStatusReporterService();
        this.healthMonitor = new LLMHealthMonitorService_1.LLMHealthMonitorService();
        this.metricsService = new LLMMetricsService_1.LLMMetricsService();
        this.errorHandler = new LLMErrorHandlerService_1.LLMErrorHandlerService();
        this.eventService = new LLMConnectionEventService_1.LLMConnectionEventService(this.metricsService);
        this.metricsTracker = new ConnectionMetricsTracker_1.ConnectionMetricsTracker();
        this.connectionPool = ConnectionPoolManager_1.ConnectionPoolManager.getInstance({
            maxSize: options.maxConnections || 5,
            minSize: options.minConnections || 1,
            acquireTimeout: options.connectionTimeout || 30000
        });
        this.connectionOptions = options;
        this.setupEventListeners();
        this.startHealthMonitoring();
    }
    static getInstance(options = {}) {
        if (!LLMConnectionManager.instance) {
            LLMConnectionManager.instance = new LLMConnectionManager(options);
        }
        return LLMConnectionManager.instance;
    }
    setupEventListeners() {
        this.providerRegistry.on('providerStatusChanged', this.handleProviderStatusChange.bind(this));
    }
    setupEventHandlers() {
        this.errorHandler.on('error', this.handleError.bind(this));
        this.errorHandler.on('retrying', this.handleRetry.bind(this));
        this.healthMonitor.on(types_1.ConnectionEvent.HealthCheckFailed, this.handleHealthCheckFailure.bind(this));
        this.eventService.on(types_1.ConnectionEvent.StateChanged, this.handleStateChange.bind(this));
    }
    get connectionState() {
        return this.connectionHandler.currentState;
    }
    registerProvider(name, provider) {
        this.providerRegistry.registerProvider(name, provider);
        this.metricsService.initializeMetrics(name);
        provider.on('statusChanged', (status) => {
            this.handleProviderStatusChange(name, status);
        });
    }
    getProvider(name) {
        return this.providerRegistry.getProvider(name);
    }
    async setActiveProvider(name) {
        const provider = this.providerRegistry.getProvider(name);
        if (!provider) {
            throw new types_1.LLMConnectionError(types_1.LLMConnectionErrorCode.ProviderNotFound, `Provider ${name} not found`);
        }
        await this.disconnect(); // Ensure clean disconnect from current provider
        await this.connectionHandler.setActiveProvider(provider);
        this.activeProvider = provider;
        this.statusReporter.updateStatusBar(this.connectionState, provider.name);
        this.healthMonitor.setActiveProvider(provider);
        this.metricsService.setActiveProvider(name);
    }
    async connectToLLM() {
        try {
            if (this.connectionState === types_1.ConnectionState.CONNECTED) {
                return true;
            }
            const startTime = Date.now();
            const connection = await this.connectionPool.acquire(this.connectionHandler.activeProviderName || 'default');
            await this.connectionHandler.connect(connection);
            this.metricsTracker.recordConnectionSuccess();
            this.metricsTracker.recordRequest(Date.now() - startTime);
            this.currentStatus.isConnected = true;
            this.currentStatus.isAvailable = true;
            this.currentStatus.error = '';
            this.emit(types_1.ConnectionEvent.Connected);
            this.emit(types_1.ConnectionEvent.StateChanged, this.createConnectionEventData());
            this.updateStatus();
            return true;
        }
        catch (error) {
            await this.handleConnectionError(error);
            return await this.retryManager.handleConnectionFailure(() => this.connectToLLM());
        }
    }
    async disconnect() {
        this.retryManager.clearRetryTimeout();
        this.stopHealthMonitoring();
        if (this.connectionHandler.activeProviderName) {
            await this.connectionPool.clear(this.connectionHandler.activeProviderName);
        }
        await this.connectionHandler.disconnect();
        this.currentStatus.isConnected = false;
        this.currentStatus.isAvailable = false;
        this.emit(types_1.ConnectionEvent.Disconnected);
        this.emit(types_1.ConnectionEvent.StateChanged, this.createConnectionEventData());
        this.updateStatus();
    }
    startHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.healthCheckInterval = setInterval(async () => {
            try {
                const health = await this.healthMonitor.performHealthCheck();
                if (health.status === 'error') {
                    await this.handleHealthCheckFailure(health);
                }
                else {
                    this.metricsService.recordSuccessfulHealthCheck(this.connectionHandler.activeProviderName || 'unknown');
                }
            }
            catch (error) {
                await this.handleConnectionError(error);
            }
        }, 30000); // 30 second interval
    }
    stopHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }
    handleProviderStatusChange(providerName, status) {
        this.emit('providerStatusChanged', providerName, status);
        if (this.connectionHandler.activeProviderName === providerName) {
            this.updateStatus();
        }
        this.metricsService.recordProviderStatus(providerName, status);
    }
    async handleConnectionError(error) {
        const formattedError = error instanceof Error ? error : new Error(String(error));
        await this.eventService.transitionTo('error', { error: formattedError });
        await this.errorHandler.handleError(error);
    }
    async handleError(event) {
        if (this.activeProvider) {
            this.metricsService.recordError(this.activeProvider.name, event.error);
        }
    }
    async handleRetry(event) {
        await this.eventService.transitionTo('reconnecting', { error: event.error });
        if (this.activeProvider) {
            try {
                await this.activeProvider.connect(this.connectionOptions);
                await this.eventService.transitionTo('connected', {
                    modelInfo: await this.activeProvider.getModelInfo()
                });
            }
            catch (error) {
                await this.handleConnectionError(error);
            }
        }
    }
    async handleHealthCheckFailure(event) {
        await this.handleConnectionError(event.error);
    }
    handleStateChange(event) {
        this.emit(types_1.ConnectionEvent.StateChanged, event);
    }
    createConnectionEventData() {
        return {
            state: this.currentStatus.isConnected ? 'connected' : 'disconnected',
            timestamp: new Date(),
            error: this.currentStatus.error ? new Error(this.currentStatus.error) : undefined,
            modelInfo: this.currentStatus.metadata?.modelInfo
        };
    }
    updateStatus() {
        const currentState = this.connectionState;
        const providerName = this.connectionHandler.activeProviderName;
        const eventData = {
            state: currentState,
            timestamp: new Date(),
            error: this.connectionHandler.lastError,
            modelInfo: this.connectionHandler.activeProvider?.getModelInfo()
        };
        this.emit('stateChanged', eventData);
        this.statusReporter.updateStatusBar(currentState, providerName);
    }
    getCurrentState() {
        return this.eventService.getCurrentState();
    }
    getActiveProvider() {
        return this.activeProvider;
    }
    getStatus() {
        return this.currentStatus;
    }
    getMetrics() {
        return this.metricsService.getAllMetrics();
    }
    getConnectionPoolStats() {
        return this.connectionHandler.activeProviderName ?
            this.connectionPool.getStats(this.connectionHandler.activeProviderName) :
            {};
    }
    dispose() {
        this.retryManager.clearRetryTimeout();
        this.stopHealthMonitoring();
        this.disconnect().catch(console.error);
        this.connectionPool.dispose();
        this.statusReporter.dispose();
        this.metricsService.dispose();
        this.errorHandler.dispose();
        this.eventService.dispose();
        this.healthMonitor.dispose();
        this.removeAllListeners();
    }
}
exports.LLMConnectionManager = LLMConnectionManager;
//# sourceMappingURL=LLMConnectionManager.js.map