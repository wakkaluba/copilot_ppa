"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMModelManager = void 0;
const events_1 = require("events");
const inversify_1 = require("inversify");
const types_1 = require("../types");
// Update the code to use provider instead of providerId
const mapProviderField = (info) => ({
    ...info,
    providerId: info.provider // Map provider to providerId for backward compatibility
});
/**
 * Manages LLM model lifecycle, discovery, and runtime management
 */
let LLMModelManager = class LLMModelManager extends events_1.EventEmitter {
    modelRegistry = new Map();
    environmentConfigs = new Map();
    /**
     * Register a model deployment
     */
    async registerDeployment(deployment) {
        try {
            const entry = {
                deployment,
                status: 'registered',
                metrics: this.initializeMetrics(),
                lastUpdated: Date.now()
            };
            this.modelRegistry.set(deployment.id, entry);
            await this.persistRegistry();
            this.emit(types_1.ModelEvents.DeploymentRegistered, {
                deploymentId: deployment.id,
                timestamp: entry.lastUpdated
            });
        }
        catch (error) {
            this.handleError('Failed to register deployment', error);
            throw error;
        }
    }
    /**
     * Configure environment for deployment
     */
    async configureEnvironment(config) {
        try {
            this.validateEnvironmentConfig(config);
            this.environmentConfigs.set(config.id, config);
            await this.persistEnvironments();
        }
        catch (error) {
            this.handleError('Failed to configure environment', error);
            throw error;
        }
    }
    /**
     * Initialize metrics collection
     */
    initializeMetrics() {
        return {
            requestCount: 0,
            errorCount: 0,
            averageLatency: 0,
            lastActive: Date.now(),
            resourceUsage: {
                cpu: 0,
                memory: 0,
                gpu: 0
            }
        };
    }
    /**
     * Persist registry state
     */
    async persistRegistry() {
        try {
            const registryData = Array.from(this.modelRegistry.entries());
            await fs.promises.writeFile(this.getRegistryPath(), JSON.stringify(registryData, null, 2));
        }
        catch (error) {
            this.handleError('Failed to persist registry', error);
        }
    }
    /**
     * Cleanup and dispose resources
     */
    dispose() {
        try {
            // Persist final state
            this.persistRegistry().catch(error => this.logger.error('Failed to persist registry during disposal', error));
            // Clean up resources
            this.modelRegistry.clear();
            this.environmentConfigs.clear();
            // Dispose event emitter
            this.removeAllListeners();
        }
        catch (error) {
            this.handleError('Error during disposal', error);
        }
    }
};
exports.LLMModelManager = LLMModelManager;
exports.LLMModelManager = LLMModelManager = __decorate([
    (0, inversify_1.injectable)()
], LLMModelManager);
//# sourceMappingURL=LLMModelManager.js.map