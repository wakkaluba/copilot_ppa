import { EventEmitter } from 'events';
import { Disposable } from '../types';
/**
 * Manages LLM model lifecycle, discovery, and runtime management
 */
export declare class LLMModelManager extends EventEmitter implements Disposable {
    private readonly modelRegistry;
    private readonly environmentConfigs;
    /**
     * Register a model deployment
     */
    registerDeployment(deployment: ModelDeployment): Promise<void>;
    /**
     * Configure environment for deployment
     */
    configureEnvironment(config: EnvironmentConfig): Promise<void>;
    /**
     * Initialize metrics collection
     */
    private initializeMetrics;
    /**
     * Persist registry state
     */
    private persistRegistry;
    /**
     * Cleanup and dispose resources
     */
    dispose(): void;
}
