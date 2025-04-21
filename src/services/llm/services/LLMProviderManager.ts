import { EventEmitter } from 'events';
import {
    LLMProvider,
    ProviderInfo,
    ProviderEvent,
    ProviderError,
    ProviderState,
    ProviderCapabilities,
    ProviderMetrics,
    ProviderConfig,
    ProviderHealthStatus,
    ProviderConnectionState
} from '../types';
import { LLMProviderValidator } from '../validators/LLMProviderValidator';
import { LLMProviderRegistry } from './LLMProviderRegistry';
import { LLMProviderMetricsTracker } from '../metrics/LLMProviderMetricsTracker';
import { ProviderConfigValidator } from '../validators/ProviderConfigValidator';
import { ConnectionPoolManager } from '../connection/ConnectionPoolManager';

/**
 * Manages LLM provider lifecycle, registration, and runtime state with comprehensive
 * metrics tracking, health monitoring, and connection pooling
 */
export class LLMProviderManager extends EventEmitter {
    private readonly validator: LLMProviderValidator;
    private readonly registry: LLMProviderRegistry;
    private readonly metricsTracker: LLMProviderMetricsTracker;
    private readonly configValidator: ProviderConfigValidator;
    private readonly connectionPool: ConnectionPoolManager;
    private readonly activeProviders = new Map<string, LLMProvider>();
    private readonly providerStates = new Map<string, ProviderState>();
    private readonly healthStatuses = new Map<string, ProviderHealthStatus>();
    private readonly healthCheckIntervals = new Map<string, NodeJS.Timer>();

    constructor(
        validator: LLMProviderValidator,
        registry: LLMProviderRegistry,
        metricsTracker: LLMProviderMetricsTracker,
        configValidator: ProviderConfigValidator,
        connectionPool: ConnectionPoolManager
    ) {
        super();
        this.validator = validator;
        this.registry = registry;
        this.metricsTracker = metricsTracker;
        this.configValidator = configValidator;
        this.connectionPool = connectionPool;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.registry.on(ProviderEvent.Registered, this.handleProviderRegistered.bind(this));
        this.registry.on(ProviderEvent.Unregistered, this.handleProviderUnregistered.bind(this));
        this.connectionPool.on('connectionStateChanged', this.handleConnectionStateChanged.bind(this));
        this.metricsTracker.on('metricsUpdated', this.handleMetricsUpdated.bind(this));
    }

    /**
     * Register a new provider with comprehensive validation and initialization
     */
    public async registerProvider(
        provider: LLMProvider,
        config: ProviderConfig
    ): Promise<void> {
        try {
            // Validate provider implementation
            const validationResult = await this.validator.validateProvider(provider);
            if (!validationResult.isValid) {
                throw new ProviderError(
                    'Provider validation failed',
                    provider.id,
                    validationResult.errors?.join(', ')
                );
            }

            // Validate provider configuration
            const configValidation = await this.configValidator.validateConfig(config);
            if (!configValidation.isValid) {
                throw new ProviderError(
                    'Provider configuration validation failed',
                    provider.id,
                    configValidation.errors?.join(', ')
                );
            }

            // Initialize provider metrics tracking
            await this.metricsTracker.initializeProvider(provider.id);

            // Register with registry
            await this.registry.registerProvider(provider, config);

            // Initialize connection pool
            await this.connectionPool.initializeProvider(provider.id, config);

            this.emit(ProviderEvent.Registered, {
                providerId: provider.id,
                timestamp: Date.now(),
                config: config
            });

        } catch (error) {
            throw new ProviderError(
                'Failed to register provider',
                provider.id,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Initialize a provider with connection pooling and health monitoring
     */
    public async initializeProvider(providerId: string): Promise<void> {
        const provider = await this.registry.getProvider(providerId);
        if (!provider) {
            throw new ProviderError('Provider not found', providerId);
        }

        try {
            this.setProviderState(providerId, ProviderState.Initializing);

            // Get provider configuration
            const config = await this.registry.getProviderConfig(providerId);
            
            // Initialize provider
            await provider.initialize(config);
            
            // Initialize connection pool
            await this.connectionPool.initializeConnections(providerId, config);

            // Start health monitoring
            await this.startHealthMonitoring(providerId);
            
            this.activeProviders.set(providerId, provider);
            this.setProviderState(providerId, ProviderState.Active);

            this.emit(ProviderEvent.Initialized, {
                providerId,
                timestamp: Date.now(),
                config: config
            });

        } catch (error) {
            this.setProviderState(providerId, ProviderState.Error);
            throw new ProviderError(
                'Failed to initialize provider',
                providerId,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Start health monitoring for a provider
     */
    private async startHealthMonitoring(providerId: string): Promise<void> {
        try {
            // Initialize health status
            this.healthStatuses.set(providerId, {
                status: 'healthy',
                lastChecked: Date.now(),
                errorCount: 0,
                lastError: null
            });

            // Start periodic health checks
            setInterval(async () => {
                try {
                    await this.checkProviderHealth(providerId);
                } catch (error) {
                    console.error(`Health check failed for provider ${providerId}:`, error);
                }
            }, 30000); // Check every 30 seconds
        } catch (error) {
            console.error(`Failed to start health monitoring for provider ${providerId}:`, error);
        }
    }

    /**
     * Check provider health status
     */
    private async checkProviderHealth(providerId: string): Promise<void> {
        const provider = this.getProvider(providerId);
        if (!provider) return;

        try {
            const health = this.healthStatuses.get(providerId) || {
                status: 'unknown',
                lastChecked: 0,
                errorCount: 0,
                lastError: null
            };

            // Check connection pool health
            const poolHealth = await this.connectionPool.checkHealth(providerId);
            
            // Check provider responsiveness
            const isResponsive = await provider.ping();

            // Update health status
            health.lastChecked = Date.now();
            
            if (!poolHealth.isHealthy || !isResponsive) {
                health.status = 'unhealthy';
                health.errorCount++;
                this.emit(ProviderEvent.HealthChanged, {
                    providerId,
                    status: health.status,
                    timestamp: Date.now()
                });
            } else {
                health.status = 'healthy';
                health.errorCount = 0;
            }

            this.healthStatuses.set(providerId, health);

        } catch (error) {
            const health = this.healthStatuses.get(providerId);
            if (health) {
                health.status = 'error';
                health.errorCount++;
                health.lastError = error instanceof Error ? error : new Error(String(error));
                this.healthStatuses.set(providerId, health);
            }
        }
    }

    /**
     * Get provider health status
     */
    public getProviderHealth(providerId: string): ProviderHealthStatus | undefined {
        return this.healthStatuses.get(providerId);
    }

    /**
     * Get an active provider
     */
    public getProvider(providerId: string): LLMProvider | undefined {
        return this.activeProviders.get(providerId);
    }

    /**
     * Check if a provider is active
     */
    public isProviderActive(providerId: string): boolean {
        return this.getProviderState(providerId) === ProviderState.Active;
    }

    /**
     * Get provider state
     */
    public getProviderState(providerId: string): ProviderState {
        return this.providerStates.get(providerId) || ProviderState.Unknown;
    }

    /**
     * Get provider information
     */
    public async getProviderInfo(providerId: string): Promise<ProviderInfo | null> {
        return this.registry.getProviderInfo(providerId);
    }

    /**
     * Get provider capabilities
     */
    public async getProviderCapabilities(
        providerId: string
    ): Promise<ProviderCapabilities | null> {
        const provider = this.getProvider(providerId);
        if (!provider) return null;

        try {
            return await provider.getCapabilities();
        } catch (error) {
            console.error(`Failed to get capabilities for provider ${providerId}:`, error);
            return null;
        }
    }

    /**
     * Record provider metrics
     */
    public recordMetrics(
        providerId: string,
        metrics: Partial<ProviderMetrics>
    ): void {
        this.metricsTracker.recordSuccess(
            providerId,
            metrics.averageResponseTime || 0,
            metrics.tokenUsage || 0
        );
    }

    /**
     * Get provider metrics
     */
    public getProviderMetrics(providerId: string): ProviderMetrics | undefined {
        return this.metricsTracker.getMetrics(providerId);
    }

    /**
     * Deactivate a provider with proper cleanup
     */
    public async deactivateProvider(providerId: string): Promise<void> {
        const provider = this.activeProviders.get(providerId);
        if (!provider) return;

        try {
            this.setProviderState(providerId, ProviderState.Deactivating);
            
            // Stop health monitoring
            clearInterval(this.healthCheckIntervals.get(providerId));
            this.healthCheckIntervals.delete(providerId);
            
            // Close connection pool
            await this.connectionPool.closeConnections(providerId);
            
            // Cleanup provider
            await provider.dispose();
            
            this.activeProviders.delete(providerId);
            this.providerStates.delete(providerId);
            this.healthStatuses.delete(providerId);
            
            this.setProviderState(providerId, ProviderState.Inactive);

            this.emit(ProviderEvent.Deactivated, {
                providerId,
                timestamp: Date.now()
            });

        } catch (error) {
            this.setProviderState(providerId, ProviderState.Error);
            throw new ProviderError(
                'Failed to deactivate provider',
                providerId,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Unregister a provider
     */
    public async unregisterProvider(providerId: string): Promise<void> {
        try {
            // Deactivate if active
            if (this.isProviderActive(providerId)) {
                await this.deactivateProvider(providerId);
            }

            // Remove from registry
            await this.registry.unregisterProvider(providerId);

            // Clean up state
            this.providerStates.delete(providerId);

            // Reset metrics
            this.metricsTracker.resetMetrics(providerId);

            this.emit(ProviderEvent.Unregistered, {
                providerId,
                timestamp: Date.now()
            });

        } catch (error) {
            throw new ProviderError(
                'Failed to unregister provider',
                providerId,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Set provider state
     */
    private setProviderState(providerId: string, state: ProviderState): void {
        this.providerStates.set(providerId, state);
        
        this.emit(ProviderEvent.StateChanged, {
            providerId,
            state,
            timestamp: Date.now()
        });
    }

    private handleProviderRegistered(event: { providerId: string }): void {
        this.setProviderState(event.providerId, ProviderState.Registered);
    }

    private handleProviderUnregistered(event: { providerId: string }): void {
        this.setProviderState(event.providerId, ProviderState.Unregistered);
    }

    /**
     * Handle connection state changes
     */
    private handleConnectionStateChanged(event: { 
        providerId: string, 
        state: ProviderConnectionState 
    }): void {
        this.emit(ProviderEvent.ConnectionStateChanged, {
            providerId: event.providerId,
            state: event.state,
            timestamp: Date.now()
        });
    }

    /**
     * Handle metrics updates
     */
    private handleMetricsUpdated(event: { 
        providerId: string, 
        metrics: ProviderMetrics 
    }): void {
        this.emit(ProviderEvent.MetricsUpdated, {
            providerId: event.providerId,
            metrics: event.metrics,
            timestamp: Date.now()
        });
    }

    public dispose(): void {
        // Deactivate all active providers
        for (const providerId of this.activeProviders.keys()) {
            this.deactivateProvider(providerId).catch(console.error);
        }

        // Clear all collections
        this.activeProviders.clear();
        this.providerStates.clear();
        this.healthStatuses.clear();
        this.healthCheckIntervals.forEach(clearInterval);
        this.healthCheckIntervals.clear();

        // Dispose dependencies
        this.connectionPool.dispose();
        this.metricsTracker.dispose();
        this.registry.dispose();

        // Remove all listeners
        this.removeAllListeners();
    }
}