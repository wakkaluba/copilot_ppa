import { ILogger } from '../../utils/logger';
import { EventEmitter } from 'events';
import { ModelVersioningService } from './ModelVersioningService';
import { ModelDeploymentService, DeploymentConfig } from './ModelDeploymentService';
export interface IDeploymentCreateOptions {
    modelId: string;
    version: string;
    environmentId: string;
    config?: DeploymentConfig;
    metadata?: Record<string, any>;
}
export interface IDeploymentMetadata {
    name?: string;
    description?: string;
    tags?: string[];
    [key: string]: any;
}
export declare class ModelDeploymentManagerService extends EventEmitter {
    private readonly logger;
    private readonly versioningService;
    private readonly deploymentService;
    private deployments;
    private deploymentCounter;
    constructor(logger: ILogger, versioningService: ModelVersioningService, deploymentService?: ModelDeploymentService);
    /**
     * Create a new model deployment
     * @param options Deployment options
     * @returns The deployment ID
     */
    createDeployment(options: IDeploymentCreateOptions): Promise<string>;
    /**
     * Get a deployment by ID
     * @param deploymentId Deployment ID
     * @returns The deployment details
     */
    getDeployment(deploymentId: string): Promise<any>;
    /**
     * Update an existing deployment
     * @param deploymentId Deployment ID
     * @param metadata Metadata to update
     */
    updateDeployment(deploymentId: string, metadata: IDeploymentMetadata): Promise<void>;
    /**
     * Delete a deployment
     * @param deploymentId Deployment ID
     */
    deleteDeployment(deploymentId: string): Promise<void>;
    /**
     * List all deployments (optionally filtered by model ID)
     * @param modelId Optional model ID filter
     * @returns Array of deployments
     */
    listDeployments(modelId?: string): Promise<any[]>;
    /**
     * Get the status of a deployment
     * @param deploymentId Deployment ID
     */
    getDeploymentStatus(deploymentId: string): Promise<string>;
    /**
     * Restart a deployment
     * @param deploymentId Deployment ID
     */
    restartDeployment(deploymentId: string): Promise<void>;
    /**
     * Scale a deployment
     * @param deploymentId Deployment ID
     * @param replicas New replica count
     */
    scaleDeployment(deploymentId: string, replicas: number): Promise<void>;
    /**
     * Update the resources for a deployment
     * @param deploymentId Deployment ID
     * @param resources New resource configuration
     */
    updateResources(deploymentId: string, resources: {
        cpu?: string;
        memory?: string;
        gpu?: string;
    }): Promise<void>;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
