import { Logger } from '../../utils/logger';
import { EventEmitter } from 'events';
export interface DeploymentConfig {
    replicas: number;
    resources?: {
        cpu?: string;
        memory?: string;
        gpu?: string;
    };
    autoScaling?: {
        enabled: boolean;
        minReplicas?: number;
        maxReplicas?: number;
        targetCPUUtilization?: number;
        targetMemoryUtilization?: number;
    };
    envVars?: Record<string, string>;
}
export interface DeploymentOptions {
    modelId: string;
    version: string;
    environmentId: string;
    config: DeploymentConfig;
    metadata?: Record<string, any>;
}
/**
 * Service for model deployment operations
 */
export declare class ModelDeploymentService extends EventEmitter {
    private readonly logger;
    private deployments;
    private deploymentCounter;
    constructor(logger: Logger);
    /**
     * Create a new deployment
     */
    createDeployment(options: DeploymentOptions): Promise<string>;
    /**
     * Mark a deployment as complete/running
     */
    private completeDeployment;
    /**
     * Get a deployment by ID
     */
    getDeployment(deploymentId: string): Promise<any | null>;
    /**
     * List all deployments, optionally filtered by model ID
     */
    listDeployments(modelId?: string): Promise<any[]>;
    /**
     * Update a deployment
     */
    updateDeployment(deploymentId: string, updates: Partial<{
        config: Partial<DeploymentConfig>;
        metadata: Record<string, any>;
        status: string;
    }>): Promise<void>;
    /**
     * Delete a deployment
     */
    deleteDeployment(deploymentId: string): Promise<void>;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
