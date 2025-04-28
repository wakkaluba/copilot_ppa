"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelDeploymentManagerService = void 0;
const inversify_1 = require("inversify");
const logger_1 = require("../../utils/logger");
const events_1 = require("events");
const ModelVersioningService_1 = require("./ModelVersioningService");
const ModelDeploymentService_1 = require("./ModelDeploymentService");
let ModelDeploymentManagerService = class ModelDeploymentManagerService extends events_1.EventEmitter {
    constructor(logger, versioningService, deploymentService = {}) {
        super();
        this.logger = logger;
        this.versioningService = versioningService;
        this.deploymentService = deploymentService;
        this.deployments = new Map();
        this.deploymentCounter = 0;
        this.logger.info('ModelDeploymentManagerService initialized');
    }
    /**
     * Create a new model deployment
     * @param options Deployment options
     * @returns The deployment ID
     */
    async createDeployment(options) {
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
        }
        catch (error) {
            this.logger.error(`Error creating deployment for model ${options.modelId}`, error);
            throw error;
        }
    }
    /**
     * Get a deployment by ID
     * @param deploymentId Deployment ID
     * @returns The deployment details
     */
    async getDeployment(deploymentId) {
        try {
            const deployment = await this.deploymentService.getDeployment(deploymentId);
            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            return deployment;
        }
        catch (error) {
            this.logger.error(`Error getting deployment ${deploymentId}`, error);
            throw error;
        }
    }
    /**
     * Update an existing deployment
     * @param deploymentId Deployment ID
     * @param metadata Metadata to update
     */
    async updateDeployment(deploymentId, metadata) {
        try {
            await this.deploymentService.updateDeployment(deploymentId, { metadata });
            this.logger.info(`Updated deployment ${deploymentId}`);
            this.emit('deployment.updated', {
                deploymentId,
                metadata
            });
        }
        catch (error) {
            this.logger.error(`Error updating deployment ${deploymentId}`, error);
            throw error;
        }
    }
    /**
     * Delete a deployment
     * @param deploymentId Deployment ID
     */
    async deleteDeployment(deploymentId) {
        try {
            await this.deploymentService.deleteDeployment(deploymentId);
            this.deployments.delete(deploymentId);
            this.logger.info(`Deleted deployment ${deploymentId}`);
            this.emit('deployment.deleted', { deploymentId });
        }
        catch (error) {
            this.logger.error(`Error deleting deployment ${deploymentId}`, error);
            throw error;
        }
    }
    /**
     * List all deployments (optionally filtered by model ID)
     * @param modelId Optional model ID filter
     * @returns Array of deployments
     */
    async listDeployments(modelId) {
        try {
            const deployments = await this.deploymentService.listDeployments(modelId);
            return deployments;
        }
        catch (error) {
            this.logger.error(`Error listing deployments${modelId ? ` for model ${modelId}` : ''}`, error);
            throw error;
        }
    }
    /**
     * Get the status of a deployment
     * @param deploymentId Deployment ID
     */
    async getDeploymentStatus(deploymentId) {
        try {
            const deployment = await this.getDeployment(deploymentId);
            return deployment.status;
        }
        catch (error) {
            this.logger.error(`Error getting status for deployment ${deploymentId}`, error);
            throw error;
        }
    }
    /**
     * Restart a deployment
     * @param deploymentId Deployment ID
     */
    async restartDeployment(deploymentId) {
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
                }
                catch (error) {
                    this.logger.error(`Error finishing restart for deployment ${deploymentId}`, error);
                }
            }, 2000);
            this.logger.info(`Restarted deployment ${deploymentId}`);
            this.emit('deployment.restarting', { deploymentId });
        }
        catch (error) {
            this.logger.error(`Error restarting deployment ${deploymentId}`, error);
            throw error;
        }
    }
    /**
     * Scale a deployment
     * @param deploymentId Deployment ID
     * @param replicas New replica count
     */
    async scaleDeployment(deploymentId, replicas) {
        try {
            await this.deploymentService.updateDeployment(deploymentId, {
                config: { replicas }
            });
            this.logger.info(`Scaled deployment ${deploymentId} to ${replicas} replicas`);
            this.emit('deployment.scaled', { deploymentId, replicas });
        }
        catch (error) {
            this.logger.error(`Error scaling deployment ${deploymentId}`, error);
            throw error;
        }
    }
    /**
     * Update the resources for a deployment
     * @param deploymentId Deployment ID
     * @param resources New resource configuration
     */
    async updateResources(deploymentId, resources) {
        try {
            await this.deploymentService.updateDeployment(deploymentId, {
                config: { resources }
            });
            this.logger.info(`Updated resources for deployment ${deploymentId}`, resources);
            this.emit('deployment.resourcesUpdated', { deploymentId, resources });
        }
        catch (error) {
            this.logger.error(`Error updating resources for deployment ${deploymentId}`, error);
            throw error;
        }
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.removeAllListeners();
        this.deployments.clear();
        this.logger.info('ModelDeploymentManagerService disposed');
    }
};
exports.ModelDeploymentManagerService = ModelDeploymentManagerService;
exports.ModelDeploymentManagerService = ModelDeploymentManagerService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelVersioningService_1.ModelVersioningService)),
    __param(2, (0, inversify_1.inject)(ModelDeploymentService_1.ModelDeploymentService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, ModelVersioningService_1.ModelVersioningService,
        ModelDeploymentService_1.ModelDeploymentService])
], ModelDeploymentManagerService);
//# sourceMappingURL=ModelDeploymentManagerService.js.map