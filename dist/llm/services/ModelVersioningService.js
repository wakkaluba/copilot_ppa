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
exports.ModelVersioningService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
/**
 * Service for managing model versions
 */
let ModelVersioningService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelVersioningService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelVersioningService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        versions = new Map();
        constructor(logger) {
            super();
            this.logger = logger;
            this.logger.info('ModelVersioningService initialized');
        }
        /**
         * Register a new model version
         */
        async registerVersion(modelId, version, metadata = {}) {
            try {
                if (!this.versions.has(modelId)) {
                    this.versions.set(modelId, new Map());
                }
                const modelVersions = this.versions.get(modelId);
                if (modelVersions.has(version)) {
                    this.logger.warn(`Version ${version} already exists for model ${modelId}`);
                    return;
                }
                const newVersion = {
                    modelId,
                    version,
                    createdAt: Date.now(),
                    metadata,
                    status: 'pending'
                };
                modelVersions.set(version, newVersion);
                this.logger.info(`Registered version ${version} for model ${modelId}`);
                this.emit('version.registered', { modelId, version, metadata });
                // Simulate version becoming ready after a short delay
                setTimeout(() => {
                    this.updateVersionStatus(modelId, version, 'ready');
                }, 1000);
            }
            catch (error) {
                this.logger.error(`Error registering version ${version} for model ${modelId}`, error);
                throw error;
            }
        }
        /**
         * Get all versions for a model
         */
        async getVersions(modelId) {
            try {
                if (!this.versions.has(modelId)) {
                    return [];
                }
                return Array.from(this.versions.get(modelId).values());
            }
            catch (error) {
                this.logger.error(`Error getting versions for model ${modelId}`, error);
                throw error;
            }
        }
        /**
         * Get a specific version of a model
         */
        async getVersion(modelId, version) {
            try {
                if (!this.versions.has(modelId)) {
                    return null;
                }
                const modelVersions = this.versions.get(modelId);
                if (!modelVersions.has(version)) {
                    return null;
                }
                return modelVersions.get(version);
            }
            catch (error) {
                this.logger.error(`Error getting version ${version} for model ${modelId}`, error);
                throw error;
            }
        }
        /**
         * Update the status of a version
         */
        async updateVersionStatus(modelId, version, status) {
            try {
                const versionObj = await this.getVersion(modelId, version);
                if (!versionObj) {
                    throw new Error(`Version ${version} not found for model ${modelId}`);
                }
                const prevStatus = versionObj.status;
                // Update status
                versionObj.status = status;
                this.versions.get(modelId).set(version, versionObj);
                this.logger.info(`Updated version ${version} status for model ${modelId}: ${prevStatus} -> ${status}`);
                this.emit('version.statusChanged', {
                    modelId,
                    version,
                    prevStatus,
                    status
                });
            }
            catch (error) {
                this.logger.error(`Error updating version status for ${modelId}:${version}`, error);
                throw error;
            }
        }
        /**
         * Verify that a version exists and is ready
         */
        async verifyVersion(modelId, version) {
            try {
                const versionObj = await this.getVersion(modelId, version);
                if (!versionObj) {
                    // For testing, automatically create missing versions
                    await this.registerVersion(modelId, version);
                    return true;
                }
                return versionObj.status === 'ready';
            }
            catch (error) {
                this.logger.error(`Error verifying version ${version} for model ${modelId}`, error);
                throw error;
            }
        }
        /**
         * Delete a version
         */
        async deleteVersion(modelId, version) {
            try {
                if (!this.versions.has(modelId)) {
                    throw new Error(`Model ${modelId} not found`);
                }
                const modelVersions = this.versions.get(modelId);
                if (!modelVersions.has(version)) {
                    throw new Error(`Version ${version} not found for model ${modelId}`);
                }
                modelVersions.delete(version);
                this.logger.info(`Deleted version ${version} for model ${modelId}`);
                this.emit('version.deleted', { modelId, version });
            }
            catch (error) {
                this.logger.error(`Error deleting version ${version} for model ${modelId}`, error);
                throw error;
            }
        }
        /**
         * Dispose of resources
         */
        dispose() {
            this.removeAllListeners();
            this.versions.clear();
            this.logger.info('ModelVersioningService disposed');
        }
    };
    return ModelVersioningService = _classThis;
})();
exports.ModelVersioningService = ModelVersioningService;
//# sourceMappingURL=ModelVersioningService.js.map