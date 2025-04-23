"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelDiscoveryService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const types_1 = require("../types");
let ModelDiscoveryService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelDiscoveryService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelDiscoveryService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        validationService;
        outputChannel;
        modelRegistry = new Map();
        providers = [];
        discoveryInProgress = false;
        constructor(logger, validationService) {
            super();
            this.logger = logger;
            this.validationService = validationService;
            this.outputChannel = vscode.window.createOutputChannel('Model Discovery');
        }
        registerProvider(provider) {
            this.providers.push(provider);
            this.logger.debug(`[ModelDiscoveryService] Registered provider: ${provider.name}`);
        }
        async startDiscovery() {
            if (this.discoveryInProgress) {
                this.logger.debug('[ModelDiscoveryService] Discovery already in progress');
                return;
            }
            this.discoveryInProgress = true;
            this.emit('discoveryStarted');
            try {
                const startTime = Date.now();
                const models = await this.discoverModels();
                this.logger.info(`[ModelDiscoveryService] Discovery completed in ${Date.now() - startTime}ms`);
                this.emit('discoveryCompleted', models);
            }
            catch (error) {
                this.handleError(new Error(`Discovery failed: ${error instanceof Error ? error.message : String(error)}`));
            }
            finally {
                this.discoveryInProgress = false;
            }
        }
        async discoverModels() {
            const discoveredModels = [];
            for (const provider of this.providers) {
                try {
                    const models = await provider.getAvailableModels();
                    for (const model of models) {
                        if (!this.modelRegistry.has(model.id)) {
                            const validation = await this.validationService.validateModel(model);
                            if (validation.isValid) {
                                this.modelRegistry.set(model.id, model);
                                discoveredModels.push(model);
                                this.emit(types_1.ModelEvent.ModelRegistered, model);
                                this.logModelDiscovered(model, validation);
                            }
                            else {
                                this.logModelSkipped(model, validation);
                            }
                        }
                    }
                }
                catch (error) {
                    this.logger.error(`[ModelDiscoveryService] Provider ${provider.name} discovery failed:`, error);
                }
            }
            return discoveredModels;
        }
        getDiscoveredModels() {
            return Array.from(this.modelRegistry.values());
        }
        getModel(modelId) {
            return this.modelRegistry.get(modelId);
        }
        clearRegistry() {
            this.modelRegistry.clear();
            this.emit('registryCleared');
        }
        logModelDiscovered(model, validation) {
            this.outputChannel.appendLine(`\nDiscovered model: ${model.id}`);
            this.outputChannel.appendLine(`Provider: ${model.provider}`);
            this.outputChannel.appendLine(`Parameters: ${JSON.stringify(model.parameters)}`);
            this.outputChannel.appendLine(`Validation: Passed`);
        }
        logModelSkipped(model, validation) {
            this.outputChannel.appendLine(`\nSkipped incompatible model: ${model.id}`);
            this.outputChannel.appendLine(`Provider: ${model.provider}`);
            this.outputChannel.appendLine(`Issues: ${validation.issues.join(', ')}`);
        }
        handleError(error) {
            this.logger.error('[ModelDiscoveryService]', error);
            this.emit('error', error);
        }
        dispose() {
            this.outputChannel.dispose();
            this.modelRegistry.clear();
            this.removeAllListeners();
        }
    };
    return ModelDiscoveryService = _classThis;
})();
exports.ModelDiscoveryService = ModelDiscoveryService;
//# sourceMappingURL=ModelDiscoveryService.js.map