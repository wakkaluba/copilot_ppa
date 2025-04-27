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
exports.ModelCompatibilityManager = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var ModelCompatibilityManager = /** @class */ (function (_super) {
    __extends(ModelCompatibilityManager, _super);
    function ModelCompatibilityManager(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.compatibilityCache = new Map();
        _this.outputChannel = vscode.window.createOutputChannel('Model Compatibility');
        return _this;
    }
    ModelCompatibilityManager.prototype.checkModelCompatibility = function (model, hardware) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, requirements, issues, compatible;
            return __generator(this, function (_a) {
                try {
                    cacheKey = "".concat(model.id, "-").concat(this.getHardwareHash(hardware));
                    if (this.compatibilityCache.has(cacheKey)) {
                        return [2 /*return*/, {
                                compatible: this.compatibilityCache.get(cacheKey),
                                issues: []
                            }];
                    }
                    requirements = this.inferModelRequirements(model);
                    issues = [];
                    // Check RAM requirements
                    if (hardware.ram.total < requirements.minRAM) {
                        issues.push("Insufficient RAM: ".concat(hardware.ram.total, "MB available, ").concat(requirements.minRAM, "MB required"));
                    }
                    // Check VRAM if GPU is required
                    if (requirements.gpuRequired) {
                        if (!hardware.gpu.available) {
                            issues.push('GPU required but not available');
                        }
                        else if (hardware.gpu.vram && hardware.gpu.vram < requirements.minVRAM) {
                            issues.push("Insufficient VRAM: ".concat(hardware.gpu.vram, "MB available, ").concat(requirements.minVRAM, "MB required"));
                        }
                        if (requirements.cudaRequired && !hardware.gpu.cudaSupport) {
                            issues.push('CUDA support required but not available');
                        }
                    }
                    // Check CPU requirements
                    if (hardware.cpu.cores < requirements.minCPUCores) {
                        issues.push("Insufficient CPU cores: ".concat(hardware.cpu.cores, " available, ").concat(requirements.minCPUCores, " required"));
                    }
                    compatible = issues.length === 0;
                    this.compatibilityCache.set(cacheKey, compatible);
                    this.logCompatibilityCheck(model, hardware, compatible, issues);
                    this.emit('compatibilityChecked', { modelId: model.id, compatible: compatible, issues: issues });
                    return [2 /*return*/, { compatible: compatible, issues: issues }];
                }
                catch (error) {
                    this.handleError('Failed to check model compatibility', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelCompatibilityManager.prototype.validateDependencies = function (modelId, dependencies) {
        return __awaiter(this, void 0, void 0, function () {
            var missing, _i, dependencies_1, dep, _a, valid, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        missing = [];
                        _i = 0, dependencies_1 = dependencies;
                        _b.label = 1;
                    case 1:
                        if (!(_i < dependencies_1.length)) return [3 /*break*/, 6];
                        dep = dependencies_1[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        // This is a simplified check - in reality we would do proper version validation
                        return [4 /*yield*/, vscode.workspace.fs.stat(vscode.Uri.file(dep))];
                    case 3:
                        // This is a simplified check - in reality we would do proper version validation
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _a = _b.sent();
                        missing.push(dep);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        valid = missing.length === 0;
                        this.emit('dependenciesValidated', { modelId: modelId, valid: valid, missing: missing });
                        return [2 /*return*/, { valid: valid, missing: missing }];
                    case 7:
                        error_1 = _b.sent();
                        this.handleError('Failed to validate dependencies', error_1);
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ModelCompatibilityManager.prototype.inferModelRequirements = function (model) {
        var requirements = {
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
            var quantLevel = parseInt(model.quantization.replace(/[^\d]/g, ''));
            if (quantLevel <= 4) {
                requirements.minRAM = Math.max(requirements.minRAM / 2, 4096);
                if (requirements.minVRAM) {
                    requirements.minVRAM = Math.max(requirements.minVRAM / 2, 4096);
                }
            }
        }
        return requirements;
    };
    ModelCompatibilityManager.prototype.getHardwareHash = function (hardware) {
        return JSON.stringify({
            ram: hardware.ram,
            gpu: hardware.gpu,
            cpu: hardware.cpu
        });
    };
    ModelCompatibilityManager.prototype.logCompatibilityCheck = function (model, hardware, compatible, issues) {
        var _this = this;
        this.outputChannel.appendLine('\nModel Compatibility Check:');
        this.outputChannel.appendLine("Model: ".concat(model.id));
        this.outputChannel.appendLine("Compatible: ".concat(compatible));
        if (issues.length > 0) {
            this.outputChannel.appendLine('Issues:');
            issues.forEach(function (issue) { return _this.outputChannel.appendLine("- ".concat(issue)); });
        }
        this.outputChannel.appendLine('Hardware:');
        this.outputChannel.appendLine("- RAM: ".concat(hardware.ram.total, "MB"));
        if (hardware.gpu.available) {
            this.outputChannel.appendLine("- GPU: ".concat(hardware.gpu.name || 'Unknown'));
            this.outputChannel.appendLine("- VRAM: ".concat(hardware.gpu.vram || 'Unknown', "MB"));
            this.outputChannel.appendLine("- CUDA: ".concat(hardware.gpu.cudaSupport ? 'Yes' : 'No'));
        }
        this.outputChannel.appendLine("- CPU Cores: ".concat(hardware.cpu.cores));
        this.outputChannel.appendLine("Timestamp: ".concat(new Date().toISOString()));
    };
    ModelCompatibilityManager.prototype.handleError = function (message, error) {
        this.logger.error('[ModelCompatibilityManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelCompatibilityManager.prototype.clearCache = function () {
        this.compatibilityCache.clear();
        this.emit('cacheCleared');
    };
    ModelCompatibilityManager.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.compatibilityCache.clear();
    };
    ModelCompatibilityManager = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
        __metadata("design:paramtypes", [Object])
    ], ModelCompatibilityManager);
    return ModelCompatibilityManager;
}(events_1.EventEmitter));
exports.ModelCompatibilityManager = ModelCompatibilityManager;
