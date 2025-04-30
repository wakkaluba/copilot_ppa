import { ILogger } from '../../utils/logger';
import { EventEmitter } from 'events';
export interface ModelVersion {
    modelId: string;
    version: string;
    createdAt: number;
    metadata: Record<string, any>;
    status: 'pending' | 'ready' | 'failed';
}
/**
 * Service for managing model versions
 */
export declare class ModelVersioningService extends EventEmitter {
    private readonly logger;
    private versions;
    constructor(logger: ILogger);
    /**
     * Register a new model version
     */
    registerVersion(modelId: string, version: string, metadata?: Record<string, any>): Promise<void>;
    /**
     * Get all versions for a model
     */
    getVersions(modelId: string): Promise<ModelVersion[]>;
    /**
     * Get a specific version of a model
     */
    getVersion(modelId: string, version: string): Promise<ModelVersion | null>;
    /**
     * Update the status of a version
     */
    updateVersionStatus(modelId: string, version: string, status: 'pending' | 'ready' | 'failed'): Promise<void>;
    /**
     * Verify that a version exists and is ready
     */
    verifyVersion(modelId: string, version: string): Promise<boolean>;
    /**
     * Delete a version
     */
    deleteVersion(modelId: string, version: string): Promise<void>;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
