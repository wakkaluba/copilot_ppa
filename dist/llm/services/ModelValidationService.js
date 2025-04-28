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
exports.ModelValidationService = void 0;
const vscode = __importStar(require("vscode"));
const os = __importStar(require("os"));
/**
 * Service for validating model compatibility with system capabilities
 */
class ModelValidationService {
    constructor() {
        this.validationCache = new Map();
        this.systemInfo = null;
        this.outputChannel = vscode.window.createOutputChannel('Model Validation');
    }
    /**
     * Validate a model against system capabilities
     */
    async validateModel(modelInfo) {
        // Check cache first
        const cached = this.validationCache.get(modelInfo.id);
        if (cached) {
            return cached;
        }
        const requirements = this.inferModelRequirements(modelInfo);
        const issues = [];
        const systemInfo = await this.getSystemInfo();
        // Memory check
        if (systemInfo.totalMemoryGB < requirements.minMemoryGB) {
            issues.push(`Insufficient memory: ${systemInfo.totalMemoryGB}GB available, ${requirements.minMemoryGB}GB required`);
        }
        // Disk space check
        if (systemInfo.freeDiskSpaceGB < requirements.minDiskSpaceGB) {
            issues.push(`Insufficient disk space: ${systemInfo.freeDiskSpaceGB}GB available, ${requirements.minDiskSpaceGB}GB required`);
        }
        // CUDA support check
        if (requirements.cudaSupport) {
            if (!systemInfo.cudaAvailable) {
                issues.push('CUDA support required but not available');
            }
            else if (requirements.minCudaVersion &&
                systemInfo.cudaVersion &&
                this.compareCudaVersions(systemInfo.cudaVersion, requirements.minCudaVersion) < 0) {
                issues.push(`CUDA version ${requirements.minCudaVersion} required, but ${systemInfo.cudaVersion} found`);
            }
        }
        // CPU cores check
        if (systemInfo.cpuCores < requirements.minCPUCores) {
            issues.push(`Insufficient CPU cores: ${systemInfo.cpuCores} available, ${requirements.minCPUCores} required`);
        }
        const result = {
            isValid: issues.length === 0,
            issues,
            requirements
        };
        // Cache the validation result
        this.validationCache.set(modelInfo.id, result);
        this.logValidationResult(modelInfo, result);
        return result;
    }
    /**
     * Get system information for validation
     */
    async getSystemInfo() {
        if (!this.systemInfo) {
            const totalMemory = os.totalmem() / (1024 * 1024 * 1024); // Convert to GB
            const freeDiskSpace = await this.getFreeDiskSpace();
            const cpuCores = os.cpus().length;
            const cudaInfo = await this.getCudaInfo();
            const systemInfo = {
                totalMemoryGB: Math.round(totalMemory),
                freeDiskSpaceGB: Math.round(freeDiskSpace),
                cpuCores,
                cudaAvailable: cudaInfo.available,
                cudaVersion: cudaInfo.version || undefined
            };
            this.systemInfo = systemInfo;
            if (systemInfo) {
                this.logSystemInfo(systemInfo);
            }
        }
        if (!this.systemInfo) {
            throw new Error('Failed to initialize system information');
        }
        return this.systemInfo;
    }
    /**
     * Infer model requirements based on parameters
     */
    inferModelRequirements(modelInfo) {
        const parameters = modelInfo.parameters || 0;
        return {
            minMemoryGB: Math.max(4, Math.ceil(parameters * 2)),
            recommendedMemoryGB: Math.max(8, Math.ceil(parameters * 3)),
            minDiskSpaceGB: Math.max(2, Math.ceil(parameters * 0.5)),
            cudaSupport: parameters > 7,
            minCPUCores: Math.max(2, Math.ceil(parameters / 4))
        };
    }
    /**
     * Get available disk space (platform specific implementation)
     */
    async getFreeDiskSpace() {
        try {
            // This is a placeholder - actual implementation would use platform-specific APIs
            // Windows: wmic logicaldisk, Mac/Linux: df command
            return 100; // Default to 100GB
        }
        catch (error) {
            this.outputChannel.appendLine(`Error getting disk space: ${error}`);
            return 0;
        }
    }
    /**
     * Get CUDA information (platform specific implementation)
     */
    async getCudaInfo() {
        try {
            // This is a placeholder - actual implementation would check:
            // - Windows: registry or nvidia-smi
            // - Linux: nvidia-smi or libcuda.so
            // - Mac: No CUDA support
            return { available: false };
        }
        catch (error) {
            this.outputChannel.appendLine(`Error checking CUDA info: ${error}`);
            return { available: false };
        }
    }
    /**
     * Compare CUDA versions
     */
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
    /**
     * Clear validation cache
     */
    clearCache() {
        this.validationCache.clear();
    }
    /**
     * Invalidate system info (forces recheck)
     */
    invalidateSystemInfo() {
        this.systemInfo = null;
        this.clearCache();
    }
    logValidationResult(modelInfo, result) {
        this.outputChannel.appendLine(`\nValidation result for model ${modelInfo.id}:`);
        this.outputChannel.appendLine(`Valid: ${result.isValid}`);
        if (result.issues.length > 0) {
            this.outputChannel.appendLine('Issues:');
            result.issues.forEach(issue => this.outputChannel.appendLine(`- ${issue}`));
        }
    }
    logSystemInfo(info) {
        this.outputChannel.appendLine('\nSystem Information:');
        this.outputChannel.appendLine(`Memory: ${info.totalMemoryGB}GB`);
        this.outputChannel.appendLine(`Disk Space: ${info.freeDiskSpaceGB}GB`);
        this.outputChannel.appendLine(`CPU Cores: ${info.cpuCores}`);
        this.outputChannel.appendLine(`CUDA Available: ${info.cudaAvailable}`);
        if (info.cudaVersion) {
            this.outputChannel.appendLine(`CUDA Version: ${info.cudaVersion}`);
        }
    }
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.ModelValidationService = ModelValidationService;
//# sourceMappingURL=ModelValidationService.js.map