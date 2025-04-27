"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.ModelValidator = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var os = require("os");
var types_1 = require("../types");
var ModelValidator = /** @class */ (function (_super) {
    __extends(ModelValidator, _super);
    function ModelValidator(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.systemRequirements = null;
        _this.outputChannel = vscode.window.createOutputChannel('Model Validation');
        return _this;
    }
    ModelValidator.prototype.validateModel = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            var requirements, systemInfo, issues, result, error_1;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        requirements = this.inferModelRequirements(model);
                        return [4 /*yield*/, this.getSystemInfo()];
                    case 1:
                        systemInfo = _d.sent();
                        issues = [];
                        // Memory requirements
                        if (systemInfo.totalMemoryGB < requirements.minMemoryGB) {
                            issues.push("Insufficient memory: ".concat(systemInfo.totalMemoryGB, "GB available, ").concat(requirements.minMemoryGB, "GB required"));
                        }
                        // GPU requirements
                        if (requirements.requiresGPU && !((_a = systemInfo.gpuInfo) === null || _a === void 0 ? void 0 : _a.available)) {
                            issues.push('GPU required but not available');
                        }
                        else if (requirements.minGPUMemoryGB && ((_b = systemInfo.gpuInfo) === null || _b === void 0 ? void 0 : _b.memoryGB) < requirements.minGPUMemoryGB) {
                            issues.push("Insufficient GPU memory: ".concat((_c = systemInfo.gpuInfo) === null || _c === void 0 ? void 0 : _c.memoryGB, "GB available, ").concat(requirements.minGPUMemoryGB, "GB required"));
                        }
                        // CPU requirements
                        if (systemInfo.cpuCores < requirements.minCPUCores) {
                            issues.push("Insufficient CPU cores: ".concat(systemInfo.cpuCores, " available, ").concat(requirements.minCPUCores, " required"));
                        }
                        // Disk space requirements
                        if (systemInfo.freeDiskSpaceGB < requirements.minDiskSpaceGB) {
                            issues.push("Insufficient disk space: ".concat(systemInfo.freeDiskSpaceGB, "GB available, ").concat(requirements.minDiskSpaceGB, "GB required"));
                        }
                        // CUDA requirements
                        if (requirements.cudaSupport) {
                            if (!systemInfo.cudaAvailable) {
                                issues.push('CUDA support required but not available');
                            }
                            else if (requirements.minCudaVersion && systemInfo.cudaVersion) {
                                if (this.compareCudaVersions(systemInfo.cudaVersion, requirements.minCudaVersion) < 0) {
                                    issues.push("CUDA version ".concat(requirements.minCudaVersion, " required, but ").concat(systemInfo.cudaVersion, " found"));
                                }
                            }
                        }
                        result = {
                            isValid: issues.length === 0,
                            issues: issues,
                            requirements: requirements
                        };
                        this.logValidationResult(model, result);
                        return [2 /*return*/, result];
                    case 2:
                        error_1 = _d.sent();
                        this.handleError(new Error("Validation failed for model ".concat(model.id, ": ").concat(error_1 instanceof Error ? error_1.message : String(error_1))));
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelValidator.prototype.checkCompatibility = function (modelA, modelB) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, reqA, reqB, memoryRequired, gpuRequired, cpuCoresRequired, diskSpaceRequired, systemInfo;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        issues = [];
                        // Provider compatibility
                        if (modelA.provider !== modelB.provider) {
                            issues.push("Different providers: ".concat(modelA.provider, " vs ").concat(modelB.provider));
                        }
                        reqA = this.inferModelRequirements(modelA);
                        reqB = this.inferModelRequirements(modelB);
                        memoryRequired = Math.max(reqA.minMemoryGB, reqB.minMemoryGB);
                        gpuRequired = reqA.requiresGPU || reqB.requiresGPU;
                        cpuCoresRequired = Math.max(reqA.minCPUCores, reqB.minCPUCores);
                        diskSpaceRequired = Math.max(reqA.minDiskSpaceGB, reqB.minDiskSpaceGB);
                        return [4 /*yield*/, this.getSystemInfo()];
                    case 1:
                        systemInfo = _b.sent();
                        if (systemInfo.totalMemoryGB < memoryRequired) {
                            issues.push("Insufficient memory for concurrent operation: ".concat(systemInfo.totalMemoryGB, "GB available, ").concat(memoryRequired, "GB required"));
                        }
                        if (gpuRequired && !((_a = systemInfo.gpuInfo) === null || _a === void 0 ? void 0 : _a.available)) {
                            issues.push('GPU required for concurrent operation but not available');
                        }
                        if (systemInfo.cpuCores < cpuCoresRequired) {
                            issues.push("Insufficient CPU cores for concurrent operation: ".concat(systemInfo.cpuCores, " available, ").concat(cpuCoresRequired, " required"));
                        }
                        if (systemInfo.freeDiskSpaceGB < diskSpaceRequired) {
                            issues.push("Insufficient disk space for concurrent operation: ".concat(systemInfo.freeDiskSpaceGB, "GB available, ").concat(diskSpaceRequired, "GB required"));
                        }
                        return [2 /*return*/, {
                                isCompatible: issues.length === 0,
                                issues: issues
                            }];
                }
            });
        });
    };
    ModelValidator.prototype.inferModelRequirements = function (model) {
        var parameters = model.parameters || 0;
        var requirements = {
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
    };
    ModelValidator.prototype.getSystemInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!!this.systemRequirements) return [3 /*break*/, 2];
                        // Implementation specific to getting system info
                        // This would need platform-specific implementations
                        _a = this;
                        _b = {
                            totalMemoryGB: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
                            cpuCores: os.cpus().length,
                            freeDiskSpaceGB: 100, // Placeholder - would need actual implementation
                            cudaAvailable: false
                        };
                        return [4 /*yield*/, this.getGPUInfo()];
                    case 1:
                        // Implementation specific to getting system info
                        // This would need platform-specific implementations
                        _a.systemRequirements = (_b.gpuInfo = _c.sent(),
                            _b);
                        _c.label = 2;
                    case 2: return [2 /*return*/, this.systemRequirements];
                }
            });
        });
    };
    ModelValidator.prototype.getGPUInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Implementation would be platform-specific
                    // This is a placeholder
                    return [2 /*return*/, {
                            available: false,
                            memoryGB: undefined
                        }];
                }
                catch (error) {
                    this.logger.warn('Failed to get GPU information:', error);
                    return [2 /*return*/, undefined];
                }
                return [2 /*return*/];
            });
        });
    };
    ModelValidator.prototype.compareCudaVersions = function (version1, version2) {
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
    ModelValidator.prototype.logValidationResult = function (model, result) {
        var _this = this;
        this.outputChannel.appendLine("\nValidation result for model ".concat(model.id, ":"));
        this.outputChannel.appendLine("Valid: ".concat(result.isValid));
        if (result.issues.length > 0) {
            this.outputChannel.appendLine('Issues:');
            result.issues.forEach(function (issue) { return _this.outputChannel.appendLine("- ".concat(issue)); });
        }
        this.outputChannel.appendLine('Requirements:');
        Object.entries(result.requirements).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            _this.outputChannel.appendLine("- ".concat(key, ": ").concat(value));
        });
    };
    ModelValidator.prototype.handleError = function (error) {
        this.logger.error('[ModelValidator]', error);
        this.emit('error', error);
    };
    ModelValidator.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.removeAllListeners();
    };
    var _a;
    ModelValidator = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object])
    ], ModelValidator);
    return ModelValidator;
}(events_1.EventEmitter));
exports.ModelValidator = ModelValidator;
