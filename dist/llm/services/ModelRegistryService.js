"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRegistryService = void 0;
const events_1 = require("events");
const logger_1 = require("../../utils/logger");
class ModelRegistryService {
    constructor() {
        this._registryEmitter = new events_1.EventEmitter();
        this._registry = new Map();
        this._dependencies = new Map();
        this._logger = logger_1.Logger.for('ModelRegistryService');
    }
    async registerModel(modelId, info) {
        try {
            if (this._registry.has(modelId)) {
                throw new Error(`Model ${modelId} is already registered`);
            }
            this._registry.set(modelId, info);
            this._dependencies.set(modelId, new Set());
            this._registryEmitter.emit('modelRegistered', {
                modelId,
                info,
                timestamp: new Date()
            });
        }
        catch (error) {
            this._logger.error('Failed to register model', { modelId, error });
            throw error;
        }
    }
    async addDependency(modelId, dependency) {
        try {
            const dependencies = this._dependencies.get(modelId);
            if (!dependencies) {
                throw new Error(`Model ${modelId} not found`);
            }
            dependencies.add(dependency);
            this._registryEmitter.emit('dependencyAdded', {
                modelId,
                dependency,
                timestamp: new Date()
            });
        }
        catch (error) {
            this._logger.error('Failed to add dependency', { modelId, error });
            throw error;
        }
    }
    async validateDependencies(modelId) {
        try {
            const dependencies = this._dependencies.get(modelId);
            if (!dependencies) {
                throw new Error(`Model ${modelId} not found`);
            }
            const validations = Array.from(dependencies).map(dep => this.validateDependency(dep));
            const results = await Promise.all(validations);
            return results.every(result => result);
        }
        catch (error) {
            this._logger.error('Failed to validate dependencies', { modelId, error });
            throw error;
        }
    }
    async validateDependency(dependency) {
        // Add actual dependency validation logic here
        // This is a placeholder implementation
        return true;
    }
    async getModel(modelId) {
        return this._registry.get(modelId);
    }
    async getDependencies(modelId) {
        const dependencies = this._dependencies.get(modelId);
        return dependencies ? Array.from(dependencies) : [];
    }
    onModelRegistered(listener) {
        this._registryEmitter.on('modelRegistered', listener);
        return {
            dispose: () => this._registryEmitter.removeListener('modelRegistered', listener)
        };
    }
    dispose() {
        this._registryEmitter.removeAllListeners();
        this._registry.clear();
        this._dependencies.clear();
    }
}
exports.ModelRegistryService = ModelRegistryService;
//# sourceMappingURL=ModelRegistryService.js.map