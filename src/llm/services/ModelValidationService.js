"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelValidationService = void 0;
var vscode = require("vscode");
var os = require("os");
/**
 * Service for validating model compatibility with system capabilities
 */
var ModelValidationService = /** @class */ (function () {
    function ModelValidationService() {
        this.validationCache = new Map();
        this.systemInfo = null;
        this.outputChannel = vscode.window.createOutputChannel('Model Validation');
    }
    /**
     * Validate a model against system capabilities
     */
    ModelValidationService.prototype.validateModel = function (modelInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, requirements, issues, systemInfo, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cached = this.validationCache.get(modelInfo.id);
                        if (cached) {
                            return [2 /*return*/, cached];
                        }
                        requirements = this.inferModelRequirements(modelInfo);
                        issues = [];
                        return [4 /*yield*/, this.getSystemInfo()];
                    case 1:
                        systemInfo = _a.sent();
                        // Memory check
                        if (systemInfo.totalMemoryGB < requirements.minMemoryGB) {
                            issues.push("Insufficient memory: ".concat(systemInfo.totalMemoryGB, "GB available, ").concat(requirements.minMemoryGB, "GB required"));
                        }
                        // Disk space check
                        if (systemInfo.freeDiskSpaceGB < requirements.minDiskSpaceGB) {
                            issues.push("Insufficient disk space: ".concat(systemInfo.freeDiskSpaceGB, "GB available, ").concat(requirements.minDiskSpaceGB, "GB required"));
                        }
                        // CUDA support check
                        if (requirements.cudaSupport) {
                            if (!systemInfo.cudaAvailable) {
                                issues.push('CUDA support required but not available');
                            }
                            else if (requirements.minCudaVersion &&
                                systemInfo.cudaVersion &&
                                this.compareCudaVersions(systemInfo.cudaVersion, requirements.minCudaVersion) < 0) {
                                issues.push("CUDA version ".concat(requirements.minCudaVersion, " required, but ").concat(systemInfo.cudaVersion, " found"));
                            }
                        }
                        // CPU cores check
                        if (systemInfo.cpuCores < requirements.minCPUCores) {
                            issues.push("Insufficient CPU cores: ".concat(systemInfo.cpuCores, " available, ").concat(requirements.minCPUCores, " required"));
                        }
                        result = {
                            isValid: issues.length === 0,
                            issues: issues,
                            requirements: requirements
                        };
                        // Cache the validation result
                        this.validationCache.set(modelInfo.id, result);
                        this.logValidationResult(modelInfo, result);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Get system information for validation
     */
    ModelValidationService.prototype.getSystemInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalMemory, freeDiskSpace, cpuCores, cudaInfo, systemInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.systemInfo) return [3 /*break*/, 3];
                        totalMemory = os.totalmem() / (1024 * 1024 * 1024);
                        return [4 /*yield*/, this.getFreeDiskSpace()];
                    case 1:
                        freeDiskSpace = _a.sent();
                        cpuCores = os.cpus().length;
                        return [4 /*yield*/, this.getCudaInfo()];
                    case 2:
                        cudaInfo = _a.sent();
                        systemInfo = {
                            totalMemoryGB: Math.round(totalMemory),
                            freeDiskSpaceGB: Math.round(freeDiskSpace),
                            cpuCores: cpuCores,
                            cudaAvailable: cudaInfo.available,
                            cudaVersion: cudaInfo.version || undefined
                        };
                        this.systemInfo = systemInfo;
                        if (systemInfo) {
                            this.logSystemInfo(systemInfo);
                        }
                        _a.label = 3;
                    case 3:
                        if (!this.systemInfo) {
                            throw new Error('Failed to initialize system information');
                        }
                        return [2 /*return*/, this.systemInfo];
                }
            });
        });
    };
    /**
     * Infer model requirements based on parameters
     */
    ModelValidationService.prototype.inferModelRequirements = function (modelInfo) {
        var parameters = modelInfo.parameters || 0;
        return {
            minMemoryGB: Math.max(4, Math.ceil(parameters * 2)),
            recommendedMemoryGB: Math.max(8, Math.ceil(parameters * 3)),
            minDiskSpaceGB: Math.max(2, Math.ceil(parameters * 0.5)),
            cudaSupport: parameters > 7,
            minCPUCores: Math.max(2, Math.ceil(parameters / 4))
        };
    };
    /**
     * Get available disk space (platform specific implementation)
     */
    ModelValidationService.prototype.getFreeDiskSpace = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // This is a placeholder - actual implementation would use platform-specific APIs
                    // Windows: wmic logicaldisk, Mac/Linux: df command
                    return [2 /*return*/, 100]; // Default to 100GB
                }
                catch (error) {
                    this.outputChannel.appendLine("Error getting disk space: ".concat(error));
                    return [2 /*return*/, 0];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get CUDA information (platform specific implementation)
     */
    ModelValidationService.prototype.getCudaInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // This is a placeholder - actual implementation would check:
                    // - Windows: registry or nvidia-smi
                    // - Linux: nvidia-smi or libcuda.so
                    // - Mac: No CUDA support
                    return [2 /*return*/, { available: false }];
                }
                catch (error) {
                    this.outputChannel.appendLine("Error checking CUDA info: ".concat(error));
                    return [2 /*return*/, { available: false }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Compare CUDA versions
     */
    ModelValidationService.prototype.compareCudaVersions = function (version1, version2) {
        var v1Parts = version1.split('.').map(Number);
        var v2Parts = version2.split('.').map(Number);
        for (var i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            var v1 = v1Parts[i] || 0;
            var v2 = v2Parts[i] || 0;
            if (v1 !== v2) {
                return v1 - v2;
            }
        }
        return 0;
    };
    /**
     * Clear validation cache
     */
    ModelValidationService.prototype.clearCache = function () {
        this.validationCache.clear();
    };
    /**
     * Invalidate system info (forces recheck)
     */
    ModelValidationService.prototype.invalidateSystemInfo = function () {
        this.systemInfo = null;
        this.clearCache();
    };
    ModelValidationService.prototype.logValidationResult = function (modelInfo, result) {
        var _this = this;
        this.outputChannel.appendLine("\nValidation result for model ".concat(modelInfo.id, ":"));
        this.outputChannel.appendLine("Valid: ".concat(result.isValid));
        if (result.issues.length > 0) {
            this.outputChannel.appendLine('Issues:');
            result.issues.forEach(function (issue) { return _this.outputChannel.appendLine("- ".concat(issue)); });
        }
    };
    ModelValidationService.prototype.logSystemInfo = function (info) {
        this.outputChannel.appendLine('\nSystem Information:');
        this.outputChannel.appendLine("Memory: ".concat(info.totalMemoryGB, "GB"));
        this.outputChannel.appendLine("Disk Space: ".concat(info.freeDiskSpaceGB, "GB"));
        this.outputChannel.appendLine("CPU Cores: ".concat(info.cpuCores));
        this.outputChannel.appendLine("CUDA Available: ".concat(info.cudaAvailable));
        if (info.cudaVersion) {
            this.outputChannel.appendLine("CUDA Version: ".concat(info.cudaVersion));
        }
    };
    ModelValidationService.prototype.dispose = function () {
        this.outputChannel.dispose();
    };
    return ModelValidationService;
}());
exports.ModelValidationService = ModelValidationService;
