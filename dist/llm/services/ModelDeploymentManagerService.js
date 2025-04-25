"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelDeploymentManagerService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelDeploymentManagerService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelDeploymentManagerService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelDeploymentManagerService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        versioningService;
        deploymentService;
        deployments = new Map();
        deploymentCounter = 0;
        constructor(logger, versioningService, deploymentService = {}) {
            super();
            this.logger = logger;
            this.versioningService = versioningService;
            this.deploymentService = deploymentService;
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
    return ModelDeploymentManagerService = _classThis;
})();
exports.ModelDeploymentManagerService = ModelDeploymentManagerService;
//# sourceMappingURL=ModelDeploymentManagerService.js.map