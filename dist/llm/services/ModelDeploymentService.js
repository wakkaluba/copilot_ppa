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
exports.ModelDeploymentService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
/**
 * Service for model deployment operations
 */
let ModelDeploymentService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelDeploymentService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelDeploymentService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        deployments = new Map();
        deploymentCounter = 0;
        constructor(logger) {
            super();
            this.logger = logger;
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
    return ModelDeploymentService = _classThis;
})();
exports.ModelDeploymentService = ModelDeploymentService;
//# sourceMappingURL=ModelDeploymentService.js.map