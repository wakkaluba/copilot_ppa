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
exports.ModelValidator = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const os = __importStar(require("os"));
let ModelValidator = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelValidator = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelValidator = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        outputChannel;
        systemRequirements = null;
        constructor(logger) {
            super();
            this.logger = logger;
            this.outputChannel = vscode.window.createOutputChannel('Model Validation');
        }
        async validateModel(model) {
            try {
                const requirements = this.inferModelRequirements(model);
                const systemInfo = await this.getSystemInfo();
                const issues = [];
                // Memory requirements
                if (systemInfo.totalMemoryGB < requirements.minMemoryGB) {
                    issues.push(`Insufficient memory: ${systemInfo.totalMemoryGB}GB available, ${requirements.minMemoryGB}GB required`);
                }
                // GPU requirements
                if (requirements.requiresGPU && !systemInfo.gpuInfo?.available) {
                    issues.push('GPU required but not available');
                }
                else if (requirements.minGPUMemoryGB && systemInfo.gpuInfo?.memoryGB < requirements.minGPUMemoryGB) {
                    issues.push(`Insufficient GPU memory: ${systemInfo.gpuInfo?.memoryGB}GB available, ${requirements.minGPUMemoryGB}GB required`);
                }
                // CPU requirements
                if (systemInfo.cpuCores < requirements.minCPUCores) {
                    issues.push(`Insufficient CPU cores: ${systemInfo.cpuCores} available, ${requirements.minCPUCores} required`);
                }
                // Disk space requirements
                if (systemInfo.freeDiskSpaceGB < requirements.minDiskSpaceGB) {
                    issues.push(`Insufficient disk space: ${systemInfo.freeDiskSpaceGB}GB available, ${requirements.minDiskSpaceGB}GB required`);
                }
                // CUDA requirements
                if (requirements.cudaSupport) {
                    if (!systemInfo.cudaAvailable) {
                        issues.push('CUDA support required but not available');
                    }
                    else if (requirements.minCudaVersion && systemInfo.cudaVersion) {
                        if (this.compareCudaVersions(systemInfo.cudaVersion, requirements.minCudaVersion) < 0) {
                            issues.push(`CUDA version ${requirements.minCudaVersion} required, but ${systemInfo.cudaVersion} found`);
                        }
                    }
                }
                const result = {
                    isValid: issues.length === 0,
                    issues,
                    requirements
                };
                this.logValidationResult(model, result);
                return result;
            }
            catch (error) {
                this.handleError(new Error(`Validation failed for model ${model.id}: ${error instanceof Error ? error.message : String(error)}`));
                throw error;
            }
        }
        async checkCompatibility(modelA, modelB) {
            const issues = [];
            // Provider compatibility
            if (modelA.provider !== modelB.provider) {
                issues.push(`Different providers: ${modelA.provider} vs ${modelB.provider}`);
            }
            // Hardware requirements
            const reqA = this.inferModelRequirements(modelA);
            const reqB = this.inferModelRequirements(modelB);
            const memoryRequired = Math.max(reqA.minMemoryGB, reqB.minMemoryGB);
            const gpuRequired = reqA.requiresGPU || reqB.requiresGPU;
            const cpuCoresRequired = Math.max(reqA.minCPUCores, reqB.minCPUCores);
            const diskSpaceRequired = Math.max(reqA.minDiskSpaceGB, reqB.minDiskSpaceGB);
            const systemInfo = await this.getSystemInfo();
            if (systemInfo.totalMemoryGB < memoryRequired) {
                issues.push(`Insufficient memory for concurrent operation: ${systemInfo.totalMemoryGB}GB available, ${memoryRequired}GB required`);
            }
            if (gpuRequired && !systemInfo.gpuInfo?.available) {
                issues.push('GPU required for concurrent operation but not available');
            }
            if (systemInfo.cpuCores < cpuCoresRequired) {
                issues.push(`Insufficient CPU cores for concurrent operation: ${systemInfo.cpuCores} available, ${cpuCoresRequired} required`);
            }
            if (systemInfo.freeDiskSpaceGB < diskSpaceRequired) {
                issues.push(`Insufficient disk space for concurrent operation: ${systemInfo.freeDiskSpaceGB}GB available, ${diskSpaceRequired}GB required`);
            }
            return {
                isCompatible: issues.length === 0,
                issues
            };
        }
        inferModelRequirements(model) {
            const parameters = model.parameters || 0;
            const requirements = {
                minMemoryGB: Math.max(4, Math.ceil(parameters * 1.5)),
                minCPUCores: Math.max(2, Math.ceil(parameters / 4)),
                minDiskSpaceGB: Math.max(2, Math.ceil(parameters * 0.5)),
                requiresGPU: parameters > 7,
                minGPUMemoryGB: parameters > 7 ? Math.ceil(parameters * 0.75) : undefined,
                cudaSupport: parameters > 7
            };
            if (parameters > 13) {
                requirements.minCudaVersion = '11.0';
            }
            return requirements;
        }
        async getSystemInfo() {
            if (!this.systemRequirements) {
                // Implementation specific to getting system info
                // This would need platform-specific implementations
                this.systemRequirements = {
                    totalMemoryGB: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
                    cpuCores: os.cpus().length,
                    freeDiskSpaceGB: 100, // Placeholder - would need actual implementation
                    cudaAvailable: false, // Placeholder - would need actual implementation
                    gpuInfo: await this.getGPUInfo()
                };
            }
            return this.systemRequirements;
        }
        async getGPUInfo() {
            try {
                // Implementation would be platform-specific
                // This is a placeholder
                return {
                    available: false,
                    memoryGB: undefined
                };
            }
            catch (error) {
                this.logger.warn('Failed to get GPU information:', error);
                return undefined;
            }
        }
        compareCudaVersions(version1, version2) {
            const v1Parts = version1.split('.').map(Number);
            const v2Parts = version2.split('.').map(Number);
            for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
                const v1 = v1Parts[i] || 0;
                const v2 = v2Parts[i] || 0;
                if (v1 !== v2) {
                    return v1 - v2;
                }
            }
            return 0;
        }
        logValidationResult(model, result) {
            this.outputChannel.appendLine(`\nValidation result for model ${model.id}:`);
            this.outputChannel.appendLine(`Valid: ${result.isValid}`);
            if (result.issues.length > 0) {
                this.outputChannel.appendLine('Issues:');
                result.issues.forEach(issue => this.outputChannel.appendLine(`- ${issue}`));
            }
            this.outputChannel.appendLine('Requirements:');
            Object.entries(result.requirements).forEach(([key, value]) => {
                this.outputChannel.appendLine(`- ${key}: ${value}`);
            });
        }
        handleError(error) {
            this.logger.error('[ModelValidator]', error);
            this.emit('error', error);
        }
        dispose() {
            this.outputChannel.dispose();
            this.removeAllListeners();
        }
    };
    return ModelValidator = _classThis;
})();
exports.ModelValidator = ModelValidator;
//# sourceMappingURL=ModelValidator.js.map