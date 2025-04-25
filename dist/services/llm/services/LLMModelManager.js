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
let LLMModelManager = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var LLMModelManager = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LLMModelManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
    return LLMModelManager = _classThis;
})();
exports.LLMModelManager = LLMModelManager;
//# sourceMappingURL=LLMModelManager.js.map