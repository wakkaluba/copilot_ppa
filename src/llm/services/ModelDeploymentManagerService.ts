import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { IDeploymentConfig, IModelDeploymentService } from './ModelDeploymentService';
import { IModelVersioningService } from './ModelVersioningService';

export interface IDeploymentCreateOptions {
    modelId: string;
    version: string;
    config: IDeploymentConfig;
    metadata?: Record<string, unknown>;
}

export interface IDeploymentMetadata {
    createdAt: number;
    lastUpdated: number;
    status: string;
    health?: {
        lastCheck: number;
        status: string;
        details?: Record<string, unknown>;
    };
}

@injectable()
export class ModelDeploymentManagerService extends EventEmitter {
    private deployments = new Map<string, any>();
    private deploymentCounter = 0;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(IModelVersioningService) private readonly versioningService: IModelVersioningService,
        @inject(IModelDeploymentService) private readonly deploymentService: IModelDeploymentService
    ) {
        super();
        this.logger.info('ModelDeploymentManagerService initialized');
    }

    /**
     * Create a new model deployment
     * @param options Deployment options
     * @returns The deployment ID
     */
    public async createDeployment(options: IDeploymentCreateOptions): Promise<string> {
        try {
            this.logger.info(`Creating deployment for model ${options.modelId}`, options);

            // Verify model version exists
            await this.versioningService.verifyVersion(options.modelId, options.version);

            // Set defaults for missing options
            const config = options.config || {
                replicas: 1,
                resources: {
                    cpu: '1',
                    memory: '2Gi'
                }
            };

            const metadata = options.metadata || {};

            // Create deployment
            const deploymentId = await this.deploymentService.createDeployment({
                modelId: options.modelId,
                version: options.version,
                environmentId: options.environmentId,
                config,
                metadata
            });

            this.logger.info(`Created deployment ${deploymentId} for model ${options.modelId}`);

            // Store deployment reference
            this.deployments.set(deploymentId, {
                id: deploymentId,
                modelId: options.modelId,
                version: options.version,
                environmentId: options.environmentId,
                createdAt: Date.now()
            });

            this.emit('deployment.created', {
                deploymentId,
                modelId: options.modelId,
                environment: options.environmentId
            });

            return deploymentId;
        } catch (error) {
            this.logger.error(`Error creating deployment for model ${options.modelId}`, error);
            throw error;
        }
    }

    /**
     * Get a deployment by ID
     * @param deploymentId Deployment ID
     * @returns The deployment details
     */
    public async getDeployment(deploymentId: string): Promise<any> {
        try {
            const deployment = await this.deploymentService.getDeployment(deploymentId);

            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }

            return deployment;
        } catch (error) {
            this.logger.error(`Error getting deployment ${deploymentId}`, error);
            throw error;
        }
    }

    /**
     * Update an existing deployment
     * @param deploymentId Deployment ID
     * @param metadata Metadata to update
     */
    public async updateDeployment(deploymentId: string, metadata: IDeploymentMetadata): Promise<void> {
        try {
            await this.deploymentService.updateDeployment(deploymentId, { metadata });
            this.logger.info(`Updated deployment ${deploymentId}`);

            this.emit('deployment.updated', {
                deploymentId,
                metadata
            });
        } catch (error) {
            this.logger.error(`Error updating deployment ${deploymentId}`, error);
            throw error;
        }
    }

    /**
     * Delete a deployment
     * @param deploymentId Deployment ID
     */
    public async deleteDeployment(deploymentId: string): Promise<void> {
        try {
            await this.deploymentService.deleteDeployment(deploymentId);
            this.deployments.delete(deploymentId);

            this.logger.info(`Deleted deployment ${deploymentId}`);
            this.emit('deployment.deleted', { deploymentId });
        } catch (error) {
            this.logger.error(`Error deleting deployment ${deploymentId}`, error);
            throw error;
        }
    }

    /**
     * List all deployments (optionally filtered by model ID)
     * @param modelId Optional model ID filter
     * @returns Array of deployments
     */
    public async listDeployments(modelId?: string): Promise<any[]> {
        try {
            const deployments = await this.deploymentService.listDeployments(modelId);
            return deployments;
        } catch (error) {
            this.logger.error(`Error listing deployments${modelId ? ` for model ${modelId}` : ''}`, error);
            throw error;
        }
    }

    /**
     * Get the status of a deployment
     * @param deploymentId Deployment ID
     */
    public async getDeploymentStatus(deploymentId: string): Promise<string> {
        try {
            const deployment = await this.getDeployment(deploymentId);
            return deployment.status;
        } catch (error) {
            this.logger.error(`Error getting status for deployment ${deploymentId}`, error);
            throw error;
        }
    }

    /**
     * Restart a deployment
     * @param deploymentId Deployment ID
     */
    public async restartDeployment(deploymentId: string): Promise<void> {
        try {
            const deployment = await this.getDeployment(deploymentId);

            // Simulate restart
            await this.deploymentService.updateDeployment(deploymentId, {
                status: 'restarting'
            });

            // Simulate restart completion after delay
            setTimeout(async () => {
                try {
                    await this.deploymentService.updateDeployment(deploymentId, {
                        status: 'running',
                        updatedAt: Date.now()
                    });

                    this.emit('deployment.restarted', { deploymentId });
                } catch (error) {
                    this.logger.error(`Error finishing restart for deployment ${deploymentId}`, error);
                }
            }, 2000);

            this.logger.info(`Restarted deployment ${deploymentId}`);
            this.emit('deployment.restarting', { deploymentId });
        } catch (error) {
            this.logger.error(`Error restarting deployment ${deploymentId}`, error);
            throw error;
        }
    }

    /**
     * Scale a deployment
     * @param deploymentId Deployment ID
     * @param replicas New replica count
     */
    public async scaleDeployment(deploymentId: string, replicas: number): Promise<void> {
        try {
            await this.deploymentService.updateDeployment(deploymentId, {
                config: { replicas }
            });

            this.logger.info(`Scaled deployment ${deploymentId} to ${replicas} replicas`);
            this.emit('deployment.scaled', { deploymentId, replicas });
        } catch (error) {
            this.logger.error(`Error scaling deployment ${deploymentId}`, error);
            throw error;
        }
    }

    /**
     * Update the resources for a deployment
     * @param deploymentId Deployment ID
     * @param resources New resource configuration
     */
    public async updateResources(deploymentId: string, resources: { cpu?: string; memory?: string; gpu?: string }): Promise<void> {
        try {
            await this.deploymentService.updateDeployment(deploymentId, {
                config: { resources }
            });

            this.logger.info(`Updated resources for deployment ${deploymentId}`, resources);
            this.emit('deployment.resourcesUpdated', { deploymentId, resources });
        } catch (error) {
            this.logger.error(`Error updating resources for deployment ${deploymentId}`, error);
            throw error;
        }
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.removeAllListeners();
        this.deployments.clear();
        this.logger.info('ModelDeploymentManagerService disposed');
    }
}
