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
exports.ModelCompatibilityManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelCompatibilityManager = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelCompatibilityManager = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelCompatibilityManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        compatibilityCache = new Map();
        outputChannel;
        constructor(logger) {
            super();
            this.logger = logger;
            this.outputChannel = vscode.window.createOutputChannel('Model Compatibility');
        }
        async checkModelCompatibility(model, hardware) {
            try {
                const cacheKey = `${model.id}-${this.getHardwareHash(hardware)}`;
                if (this.compatibilityCache.has(cacheKey)) {
                    return {
                        compatible: this.compatibilityCache.get(cacheKey),
                        issues: []
                    };
                }
                const requirements = this.inferModelRequirements(model);
                const issues = [];
                // Check RAM requirements
                if (hardware.ram.total < requirements.minRAM) {
                    issues.push(`Insufficient RAM: ${hardware.ram.total}MB available, ${requirements.minRAM}MB required`);
                }
                // Check VRAM if GPU is required
                if (requirements.gpuRequired) {
                    if (!hardware.gpu.available) {
                        issues.push('GPU required but not available');
                    }
                    else if (hardware.gpu.vram && hardware.gpu.vram < requirements.minVRAM) {
                        issues.push(`Insufficient VRAM: ${hardware.gpu.vram}MB available, ${requirements.minVRAM}MB required`);
                    }
                    if (requirements.cudaRequired && !hardware.gpu.cudaSupport) {
                        issues.push('CUDA support required but not available');
                    }
                }
                // Check CPU requirements
                if (hardware.cpu.cores < requirements.minCPUCores) {
                    issues.push(`Insufficient CPU cores: ${hardware.cpu.cores} available, ${requirements.minCPUCores} required`);
                }
                const compatible = issues.length === 0;
                this.compatibilityCache.set(cacheKey, compatible);
                this.logCompatibilityCheck(model, hardware, compatible, issues);
                this.emit('compatibilityChecked', { modelId: model.id, compatible, issues });
                return { compatible, issues };
            }
            catch (error) {
                this.handleError('Failed to check model compatibility', error);
                throw error;
            }
        }
        async validateDependencies(modelId, dependencies) {
            try {
                const missing = [];
                for (const dep of dependencies) {
                    try {
                        // This is a simplified check - in reality we would do proper version validation
                        await vscode.workspace.fs.stat(vscode.Uri.file(dep));
                    }
                    catch {
                        missing.push(dep);
                    }
                }
                const valid = missing.length === 0;
                this.emit('dependenciesValidated', { modelId, valid, missing });
                return { valid, missing };
            }
            catch (error) {
                this.handleError('Failed to validate dependencies', error);
                throw error;
            }
        }
        inferModelRequirements(model) {
            const requirements = {
                minRAM: 4096, // Base 4GB RAM requirement
                minCPUCores: 2 // Base 2 cores requirement
            };
            // Adjust requirements based on model parameters
            if (model.parameters) {
                if (model.parameters > 7) {
                    requirements.gpuRequired = true;
                    requirements.minVRAM = 6144; // 6GB VRAM for 7B+ models
                    requirements.minRAM = 16384; // 16GB RAM for 7B+ models
                    requirements.cudaRequired = true;
                    requirements.minCPUCores = 4;
                }
                else if (model.parameters > 3) {
                    requirements.minRAM = 8192; // 8GB RAM for 3B+ models
                    requirements.minCPUCores = 4;
                }
            }
            // Adjust for quantization
            if (model.quantization) {
                const quantLevel = parseInt(model.quantization.replace(/[^\d]/g, ''));
                if (quantLevel <= 4) {
                    requirements.minRAM = Math.max(requirements.minRAM / 2, 4096);
                    if (requirements.minVRAM) {
                        requirements.minVRAM = Math.max(requirements.minVRAM / 2, 4096);
                    }
                }
            }
            return requirements;
        }
        getHardwareHash(hardware) {
            return JSON.stringify({
                ram: hardware.ram,
                gpu: hardware.gpu,
                cpu: hardware.cpu
            });
        }
        logCompatibilityCheck(model, hardware, compatible, issues) {
            this.outputChannel.appendLine('\nModel Compatibility Check:');
            this.outputChannel.appendLine(`Model: ${model.id}`);
            this.outputChannel.appendLine(`Compatible: ${compatible}`);
            if (issues.length > 0) {
                this.outputChannel.appendLine('Issues:');
                issues.forEach(issue => this.outputChannel.appendLine(`- ${issue}`));
            }
            this.outputChannel.appendLine('Hardware:');
            this.outputChannel.appendLine(`- RAM: ${hardware.ram.total}MB`);
            if (hardware.gpu.available) {
                this.outputChannel.appendLine(`- GPU: ${hardware.gpu.name || 'Unknown'}`);
                this.outputChannel.appendLine(`- VRAM: ${hardware.gpu.vram || 'Unknown'}MB`);
                this.outputChannel.appendLine(`- CUDA: ${hardware.gpu.cudaSupport ? 'Yes' : 'No'}`);
            }
            this.outputChannel.appendLine(`- CPU Cores: ${hardware.cpu.cores}`);
            this.outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);
        }
        handleError(message, error) {
            this.logger.error('[ModelCompatibilityManager]', message, error);
            this.emit('error', error);
            this.outputChannel.appendLine(`\nError: ${message}`);
            this.outputChannel.appendLine(error.stack || error.message);
        }
        clearCache() {
            this.compatibilityCache.clear();
            this.emit('cacheCleared');
        }
        dispose() {
            this.outputChannel.dispose();
            this.removeAllListeners();
            this.compatibilityCache.clear();
        }
    };
    return ModelCompatibilityManager = _classThis;
})();
exports.ModelCompatibilityManager = ModelCompatibilityManager;
//# sourceMappingURL=ModelCompatibilityManager.js.map