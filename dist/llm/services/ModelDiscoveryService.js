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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelDiscoveryService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const types_1 = require("../types");
const ModelValidationService_1 = require("./ModelValidationService");
let ModelDiscoveryService = class ModelDiscoveryService extends events_1.EventEmitter {
    constructor(logger, validationService) {
        super();
        this.logger = logger;
        this.validationService = validationService;
        this.modelRegistry = new Map();
        this.providers = [];
        this.discoveryInProgress = false;
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
ModelDiscoveryService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelValidationService_1.ModelValidationService)),
    __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, ModelValidationService_1.ModelValidationService])
], ModelDiscoveryService);
exports.ModelDiscoveryService = ModelDiscoveryService;
//# sourceMappingURL=ModelDiscoveryService.js.map