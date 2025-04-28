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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelCompatibilityManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelCompatibilityManager = class ModelCompatibilityManager extends events_1.EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
        this.compatibilityCache = new Map();
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
exports.ModelCompatibilityManager = ModelCompatibilityManager;
exports.ModelCompatibilityManager = ModelCompatibilityManager = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
    __metadata("design:paramtypes", [Object])
], ModelCompatibilityManager);
//# sourceMappingURL=ModelCompatibilityManager.js.map