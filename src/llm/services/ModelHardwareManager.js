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
exports.ModelHardwareManager = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../types");
var types_2 = require("../types");
var child_process_1 = require("child_process");
var util_1 = require("util");
var os_1 = require("os");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
var ModelHardwareManager = /** @class */ (function (_super) {
    __extends(ModelHardwareManager, _super);
    function ModelHardwareManager(logger, monitoringIntervalMs) {
        if (monitoringIntervalMs === void 0) { monitoringIntervalMs = 5000; }
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.monitoringIntervalMs = monitoringIntervalMs;
        _this.monitoringInterval = null;
        _this.metricsHistory = new Map();
        _this.maxHistoryLength = 100;
        _this.outputChannel = vscode.window.createOutputChannel('Hardware Monitor');
        _this.startMonitoring();
        return _this;
    }
    ModelHardwareManager.prototype.getHardwareSpecs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, gpuInfo, cudaInfo, specs, error_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.detectGPU(),
                                this.detectCUDA()
                            ])];
                    case 1:
                        _a = _d.sent(), gpuInfo = _a[0], cudaInfo = _a[1];
                        specs = {
                            gpu: {
                                available: gpuInfo.available,
                                name: gpuInfo.name,
                                vram: gpuInfo.vram,
                                cudaSupport: cudaInfo.available,
                                cudaVersion: cudaInfo.version
                            },
                            ram: {
                                total: os_1.default.totalmem() / (1024 * 1024), // Convert to MB
                                free: os_1.default.freemem() / (1024 * 1024)
                            },
                            cpu: {
                                cores: os_1.default.cpus().length,
                                model: ((_c = (_b = os_1.default.cpus()[0]) === null || _b === void 0 ? void 0 : _b.model) === null || _c === void 0 ? void 0 : _c.trim()) || 'Unknown'
                            }
                        };
                        this.emit(types_2.HardwareEvent.SpecsUpdated, specs);
                        this.logHardwareSpecs(specs);
                        return [2 /*return*/, specs];
                    case 2:
                        error_1 = _d.sent();
                        this.handleError('Failed to get hardware specifications', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelHardwareManager.prototype.getHardwareMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, gpuMetrics, systemMetrics, metrics, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.getGPUMetrics(),
                                this.getSystemMetrics()
                            ])];
                    case 1:
                        _a = _b.sent(), gpuMetrics = _a[0], systemMetrics = _a[1];
                        metrics = {
                            timestamp: new Date(),
                            gpu: gpuMetrics,
                            system: systemMetrics
                        };
                        this.updateMetricsHistory('default', metrics);
                        this.emit(types_2.HardwareEvent.MetricsUpdated, metrics);
                        return [2 /*return*/, metrics];
                    case 2:
                        error_2 = _b.sent();
                        this.handleError('Failed to get hardware metrics', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelHardwareManager.prototype.detectGPU = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, _a, name_1, vramStr, vram, stdout, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        if (!(process.platform === 'win32')) return [3 /*break*/, 2];
                        return [4 /*yield*/, execAsync('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader')];
                    case 1:
                        stdout = (_d.sent()).stdout;
                        if (stdout) {
                            _a = stdout.split(',').map(function (s) { return s.trim(); }), name_1 = _a[0], vramStr = _a[1];
                            vram = parseInt(vramStr) * 1024 * 1024;
                            return [2 /*return*/, { available: true, name: name_1, vram: vram }];
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(process.platform === 'linux')) return [3 /*break*/, 4];
                        return [4 /*yield*/, execAsync('lspci | grep -i nvidia')];
                    case 3:
                        stdout = (_d.sent()).stdout;
                        if (stdout) {
                            return [2 /*return*/, { available: true, name: (_c = stdout.split(':')[2]) === null || _c === void 0 ? void 0 : _c.trim() }];
                        }
                        _d.label = 4;
                    case 4: return [2 /*return*/, { available: false }];
                    case 5:
                        _b = _d.sent();
                        return [2 /*return*/, { available: false }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ModelHardwareManager.prototype.detectCUDA = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, match, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        if (!(process.platform === 'win32' || process.platform === 'linux')) return [3 /*break*/, 2];
                        return [4 /*yield*/, execAsync('nvcc --version')];
                    case 1:
                        stdout = (_b.sent()).stdout;
                        match = stdout.match(/release (\d+\.\d+)/i);
                        if (match) {
                            return [2 /*return*/, { available: true, version: match[1] }];
                        }
                        _b.label = 2;
                    case 2: return [2 /*return*/, { available: false }];
                    case 3:
                        _a = _b.sent();
                        return [2 /*return*/, { available: false }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelHardwareManager.prototype.getGPUMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, _a, utilization, memory, temp, power, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        if (!process.platform.match(/^(win32|linux)$/)) {
                            return [2 /*return*/, {}];
                        }
                        return [4 /*yield*/, execAsync('nvidia-smi --query-gpu=utilization.gpu,memory.used,temperature.gpu,power.draw --format=csv,noheader')];
                    case 1:
                        stdout = (_c.sent()).stdout;
                        _a = stdout.split(',').map(function (s) { return parseFloat(s); }), utilization = _a[0], memory = _a[1], temp = _a[2], power = _a[3];
                        return [2 /*return*/, {
                                utilizationPercent: utilization,
                                memoryUsedBytes: memory * 1024 * 1024,
                                temperature: temp,
                                powerWatts: power
                            }];
                    case 2:
                        _b = _c.sent();
                        return [2 /*return*/, {}];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelHardwareManager.prototype.getSystemMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cpus, totalCpuTime, cpuUsagePercent, totalMem, freeMem, memoryUsedPercent;
            return __generator(this, function (_a) {
                cpus = os_1.default.cpus();
                totalCpuTime = cpus.reduce(function (acc, cpu) {
                    Object.values(cpu.times).forEach(function (time) { return acc += time; });
                    return acc;
                }, 0);
                cpuUsagePercent = 100 - (os_1.default.cpus()[0].times.idle / totalCpuTime * 100);
                totalMem = os_1.default.totalmem();
                freeMem = os_1.default.freemem();
                memoryUsedPercent = ((totalMem - freeMem) / totalMem) * 100;
                return [2 /*return*/, {
                        cpuUsagePercent: cpuUsagePercent,
                        memoryUsedPercent: memoryUsedPercent,
                        loadAverage: os_1.default.loadavg()
                    }];
            });
        });
    };
    ModelHardwareManager.prototype.startMonitoring = function () {
        var _this = this;
        if (this.monitoringInterval) {
            return;
        }
        this.monitoringInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getHardwareMetrics()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        this.handleError('Error during hardware monitoring', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, this.monitoringIntervalMs);
    };
    ModelHardwareManager.prototype.stopMonitoring = function () {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    };
    ModelHardwareManager.prototype.getMetricsHistory = function (id) {
        if (id === void 0) { id = 'default'; }
        return this.metricsHistory.get(id) || [];
    };
    ModelHardwareManager.prototype.updateMetricsHistory = function (id, metrics) {
        var history = this.metricsHistory.get(id) || [];
        history.push(metrics);
        // Maintain fixed size history
        if (history.length > this.maxHistoryLength) {
            history.shift();
        }
        this.metricsHistory.set(id, history);
    };
    ModelHardwareManager.prototype.logHardwareSpecs = function (specs) {
        this.outputChannel.appendLine('\nHardware Specifications:');
        this.outputChannel.appendLine('CPU:');
        this.outputChannel.appendLine("  Model: ".concat(specs.cpu.model));
        this.outputChannel.appendLine("  Cores: ".concat(specs.cpu.cores));
        this.outputChannel.appendLine('\nMemory:');
        this.outputChannel.appendLine("  Total: ".concat(Math.round(specs.ram.total / 1024), "GB"));
        this.outputChannel.appendLine("  Free: ".concat(Math.round(specs.ram.free / 1024), "GB"));
        this.outputChannel.appendLine('\nGPU:');
        if (specs.gpu.available) {
            this.outputChannel.appendLine("  Name: ".concat(specs.gpu.name));
            if (specs.gpu.vram) {
                this.outputChannel.appendLine("  VRAM: ".concat(Math.round(specs.gpu.vram / (1024 * 1024)), "GB"));
            }
            this.outputChannel.appendLine("  CUDA Support: ".concat(specs.gpu.cudaSupport ? "Yes (".concat(specs.gpu.cudaVersion, ")") : 'No'));
        }
        else {
            this.outputChannel.appendLine('  No GPU detected');
        }
    };
    ModelHardwareManager.prototype.handleError = function (message, error) {
        this.logger.error('[ModelHardwareManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelHardwareManager.prototype.dispose = function () {
        this.stopMonitoring();
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.metricsHistory.clear();
    };
    var _a;
    ModelHardwareManager = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, Object])
    ], ModelHardwareManager);
    return ModelHardwareManager;
}(events_1.EventEmitter));
exports.ModelHardwareManager = ModelHardwareManager;
