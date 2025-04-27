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
exports.ModelHostManager = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var logging_1 = require("../../common/logging");
var ModelSystemManager_1 = require("./ModelSystemManager");
var ModelStateManager_1 = require("./ModelStateManager");
var ModelHostManager = /** @class */ (function (_super) {
    __extends(ModelHostManager, _super);
    function ModelHostManager(logger, systemManager, stateManager) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.systemManager = systemManager;
        _this.stateManager = stateManager;
        _this.hostedProcesses = new Map();
        _this.maxRestartAttempts = 3;
        _this.restartDelayMs = 5000;
        _this.outputChannel = vscode.window.createOutputChannel('Model Host');
        _this.monitorInterval = setInterval(function () { return _this.monitorProcesses(); }, 10000);
        return _this;
    }
    ModelHostManager.prototype.startProcess = function (modelId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var pid, process_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        pid = Math.floor(Math.random() * 10000) + 1000;
                        process_1 = {
                            pid: pid,
                            modelId: modelId,
                            startTime: new Date(),
                            memoryUsage: 0,
                            cpuUsage: 0,
                            status: 'starting',
                            lastHealthCheck: new Date(),
                            restartCount: 0
                        };
                        this.hostedProcesses.set(modelId, process_1);
                        return [4 /*yield*/, this.systemManager.registerProcess(pid)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.stateManager.updateState(modelId, 'loading')];
                    case 2:
                        _a.sent();
                        // Simulate startup delay
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 3:
                        // Simulate startup delay
                        _a.sent();
                        process_1.status = 'running';
                        return [4 /*yield*/, this.stateManager.updateState(modelId, 'ready')];
                    case 4:
                        _a.sent();
                        this.emit('processStarted', { modelId: modelId, pid: pid });
                        this.logProcessUpdate(modelId, 'Process started successfully');
                        return [2 /*return*/, pid];
                    case 5:
                        error_1 = _a.sent();
                        this.handleError("Failed to start process for model ".concat(modelId), error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ModelHostManager.prototype.stopProcess = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var process_2, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        process_2 = this.hostedProcesses.get(modelId);
                        if (!process_2) {
                            throw new Error("No process found for model ".concat(modelId));
                        }
                        process_2.status = 'stopped';
                        return [4 /*yield*/, this.systemManager.unregisterProcess(process_2.pid)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.stateManager.updateState(modelId, 'unloading')];
                    case 2:
                        _a.sent();
                        this.hostedProcesses.delete(modelId);
                        return [4 /*yield*/, this.stateManager.updateState(modelId, 'unloaded')];
                    case 3:
                        _a.sent();
                        this.emit('processStopped', { modelId: modelId });
                        this.logProcessUpdate(modelId, 'Process stopped successfully');
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        this.handleError("Failed to stop process for model ".concat(modelId), error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ModelHostManager.prototype.monitorProcesses = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, modelId, process_3, metrics, processInfo, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, _a = this.hostedProcesses.entries();
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        _b = _a[_i], modelId = _b[0], process_3 = _b[1];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 7]);
                        if (process_3.status !== 'running')
                            return [3 /*break*/, 7];
                        return [4 /*yield*/, this.systemManager.getSystemMetrics()];
                    case 3:
                        metrics = _c.sent();
                        processInfo = metrics.processes.get(process_3.pid);
                        if (!!processInfo) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.handleCrashedProcess(modelId, process_3)];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        // Update process metrics
                        process_3.memoryUsage = processInfo.memoryBytes;
                        process_3.cpuUsage = processInfo.cpuUsagePercent;
                        process_3.lastHealthCheck = new Date();
                        this.emit('processMetrics', {
                            modelId: modelId,
                            pid: process_3.pid,
                            metrics: {
                                memoryUsage: process_3.memoryUsage,
                                cpuUsage: process_3.cpuUsage,
                                uptime: (Date.now() - process_3.startTime.getTime()) / 1000
                            }
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_3 = _c.sent();
                        this.handleError("Failed to monitor process for model ".concat(modelId), error_3);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ModelHostManager.prototype.handleCrashedProcess = function (modelId, process) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        process.status = 'crashed';
                        return [4 /*yield*/, this.stateManager.updateState(modelId, 'error')];
                    case 1:
                        _a.sent();
                        this.emit('processCrashed', { modelId: modelId, pid: process.pid });
                        this.logProcessUpdate(modelId, 'Process crashed, attempting restart');
                        if (!(process.restartCount < this.maxRestartAttempts)) return [3 /*break*/, 4];
                        process.restartCount++;
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, _this.restartDelayMs); })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.startProcess(modelId, {})];
                    case 3:
                        _a.sent(); // Use stored config in real implementation
                        return [3 /*break*/, 5];
                    case 4:
                        this.logProcessUpdate(modelId, "Process failed to restart after ".concat(this.maxRestartAttempts, " attempts"));
                        this.hostedProcesses.delete(modelId);
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_4 = _a.sent();
                        this.handleError("Failed to handle crashed process for model ".concat(modelId), error_4);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ModelHostManager.prototype.logProcessUpdate = function (modelId, message) {
        var timestamp = new Date().toISOString();
        this.outputChannel.appendLine("[".concat(timestamp, "] ").concat(modelId, ": ").concat(message));
    };
    ModelHostManager.prototype.handleError = function (message, error) {
        this.logger.error('[ModelHostManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelHostManager.prototype.dispose = function () {
        var _this = this;
        clearInterval(this.monitorInterval);
        this.outputChannel.dispose();
        this.removeAllListeners();
        // Stop all running processes
        Promise.all(Array.from(this.hostedProcesses.keys())
            .map(function (modelId) { return _this.stopProcess(modelId); })).catch(function (err) {
            _this.logger.error('Failed to stop all processes during disposal', err);
        });
        this.hostedProcesses.clear();
    };
    var _a;
    ModelHostManager = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logging_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelSystemManager_1.ModelSystemManager)),
        __param(2, (0, inversify_1.inject)(ModelStateManager_1.ModelStateManager)),
        __metadata("design:paramtypes", [typeof (_a = typeof logging_1.ILogger !== "undefined" && logging_1.ILogger) === "function" ? _a : Object, ModelSystemManager_1.ModelSystemManager,
            ModelStateManager_1.ModelStateManager])
    ], ModelHostManager);
    return ModelHostManager;
}(events_1.EventEmitter));
exports.ModelHostManager = ModelHostManager;
