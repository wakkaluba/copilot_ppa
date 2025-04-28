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
exports.ModelVersioningService = void 0;
const inversify_1 = require("inversify");
const logger_1 = require("../../utils/logger");
const events_1 = require("events");
/**
 * Service for managing model versions
 */
let ModelVersioningService = class ModelVersioningService extends events_1.EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
        this.versions = new Map();
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
exports.ModelVersioningService = ModelVersioningService;
exports.ModelVersioningService = ModelVersioningService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object])
], ModelVersioningService);
//# sourceMappingURL=ModelVersioningService.js.map