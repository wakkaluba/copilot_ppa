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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSystemManager = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var os_1 = require("os");
var child_process_1 = require("child_process");
var util_1 = require("util");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
var ModelSystemManager = /** @class */ (function (_super) {
    __extends(ModelSystemManager, _super);
    function ModelSystemManager(logger, monitoringIntervalMs) {
        if (monitoringIntervalMs === void 0) { monitoringIntervalMs = 5000; }
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.monitoringIntervalMs = monitoringIntervalMs;
        _this.monitoringInterval = null;
        _this.metricsHistory = new Array();
        _this.maxHistoryLength = 100;
        _this.processMap = new Map();
        _this.outputChannel = vscode.window.createOutputChannel('System Monitor');
        _this.startMonitoring();
        return _this;
    }
    ModelSystemManager.prototype.getSystemMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, resourceUsage, processMetrics, metrics, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.getResourceUsage(),
                                this.getProcessMetrics()
                            ])];
                    case 1:
                        _a = _b.sent(), resourceUsage = _a[0], processMetrics = _a[1];
                        metrics = {
                            timestamp: new Date(),
                            resources: resourceUsage,
                            processes: processMetrics
                        };
                        this.updateMetricsHistory(metrics);
                        this.emit('metricsUpdated', metrics);
                        return [2 /*return*/, metrics];
                    case 2:
                        error_1 = _b.sent();
                        this.handleError('Failed to get system metrics', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelSystemManager.prototype.registerProcess = function (pid_1) {
        return __awaiter(this, arguments, void 0, function (pid, info) {
            var processInfo, error_2;
            if (info === void 0) { info = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getProcessInfo(pid)];
                    case 1:
                        processInfo = _a.sent();
                        if (processInfo) {
                            this.processMap.set(pid, __assign(__assign({}, processInfo), info));
                            this.emit('processRegistered', { pid: pid, info: this.processMap.get(pid) });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.handleError("Failed to register process ".concat(pid), error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelSystemManager.prototype.unregisterProcess = function (pid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.processMap.has(pid)) {
                    this.processMap.delete(pid);
                    this.emit('processUnregistered', { pid: pid });
                }
                return [2 /*return*/];
            });
        });
    };
    ModelSystemManager.prototype.getResourceUsage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalMem, freeMem, cpuInfo, loads, cpuUsage;
            return __generator(this, function (_a) {
                totalMem = (0, os_1.totalmem)();
                freeMem = (0, os_1.freemem)();
                cpuInfo = (0, os_1.cpus)();
                loads = (0, os_1.loadavg)();
                cpuUsage = cpuInfo.reduce(function (acc, cpu) {
                    var total = Object.values(cpu.times).reduce(function (sum, time) { return sum + time; }, 0);
                    var idle = cpu.times.idle;
                    return acc + ((total - idle) / total) * 100;
                }, 0) / cpuInfo.length;
                return [2 /*return*/, {
                        cpuUsagePercent: cpuUsage,
                        memoryUsagePercent: ((totalMem - freeMem) / totalMem) * 100,
                        totalMemoryBytes: totalMem,
                        freeMemoryBytes: freeMem,
                        loadAverages: loads
                    }];
            });
        });
    };
    ModelSystemManager.prototype.getProcessMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, _i, _a, pid, info, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        metrics = new Map();
                        _i = 0, _a = this.processMap;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        pid = _a[_i][0];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.getProcessInfo(pid)];
                    case 3:
                        info = _b.sent();
                        if (info) {
                            metrics.set(pid, info);
                        }
                        else {
                            this.unregisterProcess(pid);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _b.sent();
                        this.logger.warn('[ModelSystemManager]', "Failed to get metrics for process ".concat(pid), error_3);
                        // Process might have terminated
                        this.unregisterProcess(pid);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, metrics];
                }
            });
        });
    };
    ModelSystemManager.prototype.getProcessInfo = function (pid) {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, _a, _, cpu, memory, stdout, _b, _, cpu, memPercent, rss, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        if (!(process.platform === 'win32')) return [3 /*break*/, 2];
                        return [4 /*yield*/, execAsync("powershell \"Get-Process -Id ".concat(pid, " | Select-Object CPU,WorkingSet,Path\""))];
                    case 1:
                        stdout = (_d.sent()).stdout;
                        _a = stdout.trim().split(/\s+/), _ = _a[0], cpu = _a[1], memory = _a[2];
                        return [2 /*return*/, {
                                pid: pid,
                                cpuUsagePercent: parseFloat(cpu),
                                memoryBytes: parseInt(memory, 10),
                                timestamp: new Date()
                            }];
                    case 2: return [4 /*yield*/, execAsync("ps -p ".concat(pid, " -o %cpu,%mem,rss"))];
                    case 3:
                        stdout = (_d.sent()).stdout;
                        _b = stdout.trim().split(/\s+/), _ = _b[0], cpu = _b[1], memPercent = _b[2], rss = _b[3];
                        return [2 /*return*/, {
                                pid: pid,
                                cpuUsagePercent: parseFloat(cpu),
                                memoryBytes: parseInt(rss, 10) * 1024, // Convert KB to bytes
                                timestamp: new Date()
                            }];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        _c = _d.sent();
                        return [2 /*return*/, null]; // Process not found or access denied
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ModelSystemManager.prototype.startMonitoring = function () {
        var _this = this;
        if (this.monitoringInterval) {
            return;
        }
        this.monitoringInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getSystemMetrics()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        this.handleError('Error during system monitoring', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, this.monitoringIntervalMs);
    };
    ModelSystemManager.prototype.stopMonitoring = function () {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    };
    ModelSystemManager.prototype.updateMetricsHistory = function (metrics) {
        this.metricsHistory.push(metrics);
        // Maintain fixed size history
        while (this.metricsHistory.length > this.maxHistoryLength) {
            this.metricsHistory.shift();
        }
    };
    ModelSystemManager.prototype.getMetricsHistory = function () {
        return __spreadArray([], this.metricsHistory, true);
    };
    ModelSystemManager.prototype.handleError = function (message, error) {
        this.logger.error('[ModelSystemManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelSystemManager.prototype.dispose = function () {
        this.stopMonitoring();
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.metricsHistory.length = 0;
        this.processMap.clear();
    };
    ModelSystemManager = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
        __metadata("design:paramtypes", [Object, Object])
    ], ModelSystemManager);
    return ModelSystemManager;
}(events_1.EventEmitter));
exports.ModelSystemManager = ModelSystemManager;
