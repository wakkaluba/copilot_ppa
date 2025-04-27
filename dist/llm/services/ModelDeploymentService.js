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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelDeploymentService = void 0;
const inversify_1 = require("inversify");
const logger_1 = require("../../utils/logger");
const events_1 = require("events");
/**
 * Service for model deployment operations
 */
let ModelDeploymentService = class ModelDeploymentService extends events_1.EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
        this.deployments = new Map();
        this.deploymentCounter = 0;
        this.logger.info('ModelDeploymentService initialized');
    }
    /**
     * Create a new deployment
     */
    async createDeployment(options) {
        try {
            this.deploymentCounter++;
            const deploymentId = `deploy-${this.deploymentCounter}-${Date.now()}`;
            const deployment = {
                id: deploymentId,
                modelId: options.modelId,
                version: options.version,
                environmentId: options.environmentId,
                config: options.config,
                metadata: options.metadata || {},
                status: 'deploying',
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            this.deployments.set(deploymentId, deployment);
            this.logger.info(`Created deployment ${deploymentId} for model ${options.modelId}`);
            this.emit('deployment.created', { deployment });
            // Simulate deployment completion after delay
            setTimeout(() => {
                this.completeDeployment(deploymentId);
            }, 1000);
            return deploymentId;
        }
        catch (error) {
            this.logger.error('Error creating deployment', error);
            throw error;
        }
    }
    /**
     * Mark a deployment as complete/running
     */
    completeDeployment(deploymentId) {
        try {
            const deployment = this.deployments.get(deploymentId);
            if (!deployment) {
                return;
            }
            deployment.status = 'running';
            deployment.updatedAt = Date.now();
            this.deployments.set(deploymentId, deployment);
            this.emit('deployment.ready', { deploymentId, modelId: deployment.modelId });
            this.logger.info(`Deployment ${deploymentId} is now running`);
        }
        catch (error) {
            this.logger.error(`Error completing deployment ${deploymentId}`, error);
        }
    }
    /**
     * Get a deployment by ID
     */
    async getDeployment(deploymentId) {
        const deployment = this.deployments.get(deploymentId);
        if (!deployment) {
            return null;
        }
        return { ...deployment };
    }
    /**
     * List all deployments, optionally filtered by model ID
     */
    async listDeployments(modelId) {
        const allDeployments = Array.from(this.deployments.values());
        if (!modelId) {
            return allDeployments;
        }
        return allDeployments.filter(d => d.modelId === modelId);
    }
    /**
     * Update a deployment
     */
    async updateDeployment(deploymentId, updates) {
        try {
            const deployment = this.deployments.get(deploymentId);
            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            // Apply updates
            if (updates.config) {
                deployment.config = {
                    ...deployment.config,
                    ...updates.config,
                    resources: {
                        ...(deployment.config?.resources || {}),
                        ...(updates.config?.resources || {})
                    }
                };
            }
            if (updates.metadata) {
                deployment.metadata = {
                    ...deployment.metadata,
                    ...updates.metadata
                };
            }
            if (updates.status) {
                deployment.status = updates.status;
            }
            deployment.updatedAt = Date.now();
            this.deployments.set(deploymentId, deployment);
            this.logger.info(`Updated deployment ${deploymentId}`);
            this.emit('deployment.updated', { deploymentId, updates });
        }
        catch (error) {
            this.logger.error(`Error updating deployment ${deploymentId}`, error);
            throw error;
        }
    }
    /**
     * Delete a deployment
     */
    async deleteDeployment(deploymentId) {
        try {
            if (!this.deployments.has(deploymentId)) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            const deployment = this.deployments.get(deploymentId);
            this.deployments.delete(deploymentId);
            this.logger.info(`Deleted deployment ${deploymentId}`);
            this.emit('deployment.deleted', { deploymentId, modelId: deployment.modelId });
        }
        catch (error) {
            this.logger.error(`Error deleting deployment ${deploymentId}`, error);
            throw error;
        }
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.removeAllListeners();
        this.deployments.clear();
        this.logger.info('ModelDeploymentService disposed');
    }
};
ModelDeploymentService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ILogger')),
    __metadata("design:paramtypes", [Object])
], ModelDeploymentService);
exports.ModelDeploymentService = ModelDeploymentService;
//# sourceMappingURL=ModelDeploymentService.js.map