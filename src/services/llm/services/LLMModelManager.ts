import { EventEmitter } from 'events';
import { injectable, inject } from 'inversify';
import { ILogger } from '../../../logging/ILogger';
import { ITelemetryService } from '../../../telemetry/ITelemetryService';
import { IDisposable } from '../../../types/IDisposable';
import {
    LLMModelInfo,
    ModelStats,
    ModelStatus,
    ModelUpdate,
    ModelOperationResult,
    ModelLoadError,
    ModelInitError,
    ModelEvents,
    ModelLoadOptions,
    ModelConfig,
    ProviderRegistry,
    LLMConfigManager,
    LLMMetricsService,
    Disposable
} from '../types';

/**
 * Interface for model state tracking
 */
interface ModelState {
    info: LLMModelInfo;
    status: ModelStatus;
    stats: ModelStats;
    lastUsed: number;
    loadAttempts: number;
    config?: ModelConfig;
}

// Update the code to use provider instead of providerId
const mapProviderField = (info: LLMModelInfo) => ({
    ...info,
    providerId: info.provider // Map provider to providerId for backward compatibility
});

/**
 * Manages LLM model lifecycle, discovery, and runtime management
 */
@injectable()
export class LLMModelManager extends EventEmitter implements Disposable {
    private readonly modelRegistry = new Map<string, ModelRegistryEntry>();
    private readonly environmentConfigs = new Map<string, EnvironmentConfig>();

    /**
     * Register a model deployment
     */
    public async registerDeployment(deployment: ModelDeployment): Promise<void> {
        try {
            const entry: ModelRegistryEntry = {
                deployment,
                status: 'registered',
                metrics: this.initializeMetrics(),
                lastUpdated: Date.now()
            };

            this.modelRegistry.set(deployment.id, entry);
            await this.persistRegistry();
            
            this.emit(ModelEvents.DeploymentRegistered, { 
                deploymentId: deployment.id,
                timestamp: entry.lastUpdated
            });

        } catch (error) {
            this.handleError('Failed to register deployment', error);
            throw error;
        }
    }

    /**
     * Configure environment for deployment
     */
    public async configureEnvironment(config: EnvironmentConfig): Promise<void> {
        try {
            this.validateEnvironmentConfig(config);
            this.environmentConfigs.set(config.id, config);
            await this.persistEnvironments();

        } catch (error) {
            this.handleError('Failed to configure environment', error);
            throw error;
        }
    }

    /**
     * Initialize metrics collection
     */
    private initializeMetrics(): ModelMetrics {
        return {
            requestCount: 0,
            errorCount: 0,
            averageLatency: 0,
            lastActive: Date.now(),
            resourceUsage: {
                cpu: 0,
                memory: 0,
                gpu: 0
            }
        };
    }

    /**
     * Persist registry state
     */
    private async persistRegistry(): Promise<void> {
        try {
            const registryData = Array.from(this.modelRegistry.entries());
            await fs.promises.writeFile(
                this.getRegistryPath(),
                JSON.stringify(registryData, null, 2)
            );
        } catch (error) {
            this.handleError('Failed to persist registry', error);
        }
    }

    /**
     * Cleanup and dispose resources
     */
    public dispose(): void {
        try {
            // Persist final state
            this.persistRegistry().catch(error => 
                this.logger.error('Failed to persist registry during disposal', error)
            );
            
            // Clean up resources
            this.modelRegistry.clear();
            this.environmentConfigs.clear();
            
            // Dispose event emitter
            this.removeAllListeners();
            
        } catch (error) {
            this.handleError('Error during disposal', error);
        }
    }
}