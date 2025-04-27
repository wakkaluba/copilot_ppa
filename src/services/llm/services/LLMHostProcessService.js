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
exports.LLMHostProcessService = void 0;
var events_1 = require("events");
var child_process = require("child_process");
var LLMHostProcessService = /** @class */ (function (_super) {
    __extends(LLMHostProcessService, _super);
    function LLMHostProcessService(outputChannel) {
        var _this = _super.call(this) || this;
        _this.outputChannel = outputChannel;
        _this.process = null;
        _this.processInfo = null;
        _this.metricsInterval = null;
        return _this;
    }
    LLMHostProcessService.prototype.startProcess = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.process) {
                            throw new Error('Process already running');
                        }
                        this.process = child_process.spawn(config.hostPath, ['--model', config.modelPath]);
                        this.processInfo = {
                            pid: this.process.pid,
                            startTime: Date.now(),
                            status: 'starting',
                            errorCount: 0
                        };
                        this.setupProcessHandlers();
                        this.startMetricsTracking();
                        return [4 /*yield*/, this.waitForStartup()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.processInfo];
                }
            });
        });
    };
    LLMHostProcessService.prototype.setupProcessHandlers = function () {
        var _a, _b;
        if (!this.process) {
            return;
        }
        (_a = this.process.stdout) === null || _a === void 0 ? void 0 : _a.on('data', this.handleOutput.bind(this));
        (_b = this.process.stderr) === null || _b === void 0 ? void 0 : _b.on('data', this.handleError.bind(this));
        this.process.on('error', this.handleProcessError.bind(this));
        this.process.on('exit', this.handleProcessExit.bind(this));
    };
    LLMHostProcessService.prototype.startMetricsTracking = function () {
        var _this = this;
        this.metricsInterval = setInterval(function () {
            _this.updateProcessMetrics();
        }, 5000);
    };
    LLMHostProcessService.prototype.waitForStartup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var timeout = setTimeout(function () {
                            reject(new Error('Process startup timeout'));
                        }, 30000);
                        _this.once('process:running', function () {
                            clearTimeout(timeout);
                            resolve();
                        });
                    })];
            });
        });
    };
    LLMHostProcessService.prototype.stopProcess = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.process) {
                    return [2 /*return*/];
                }
                this.process.kill();
                this.process = null;
                if (this.metricsInterval) {
                    clearInterval(this.metricsInterval);
                    this.metricsInterval = null;
                }
                if (this.processInfo) {
                    this.processInfo.status = 'stopped';
                    this.emit('process:stopped', __assign({}, this.processInfo));
                }
                return [2 /*return*/];
            });
        });
    };
    LLMHostProcessService.prototype.getProcessInfo = function () {
        return this.processInfo ? __assign({}, this.processInfo) : null;
    };
    LLMHostProcessService.prototype.hasProcess = function () {
        var _a;
        return this.process !== null && ((_a = this.processInfo) === null || _a === void 0 ? void 0 : _a.status) === 'running';
    };
    LLMHostProcessService.prototype.dispose = function () {
        this.stopProcess();
        this.removeAllListeners();
    };
    LLMHostProcessService.prototype.handleOutput = function (data) {
        var _a;
        var output = data.toString();
        this.outputChannel.appendLine(output);
        if (((_a = this.processInfo) === null || _a === void 0 ? void 0 : _a.status) === 'starting' && output.includes('Model loaded')) {
            this.processInfo.status = 'running';
            this.emit('process:running', __assign({}, this.processInfo));
        }
    };
    LLMHostProcessService.prototype.handleError = function (data) {
        var error = data.toString();
        this.outputChannel.appendLine("[ERROR] ".concat(error));
        if (this.processInfo) {
            this.processInfo.errorCount++;
            this.processInfo.lastError = new Error(error);
        }
    };
    LLMHostProcessService.prototype.handleProcessError = function (error) {
        if (this.processInfo) {
            this.processInfo.status = 'error';
            this.processInfo.errorCount++;
            this.processInfo.lastError = error;
            this.emit('process:error', error, __assign({}, this.processInfo));
        }
    };
    LLMHostProcessService.prototype.handleProcessExit = function (code) {
        if (code !== 0 && this.processInfo) {
            this.processInfo.status = 'error';
            this.emit('process:crash', new Error("Process exited with code ".concat(code)), __assign({}, this.processInfo));
        }
        this.process = null;
    };
    LLMHostProcessService.prototype.updateProcessMetrics = function () {
        if (!this.process || !this.processInfo) {
            return;
        }
        try {
            var usage = process.cpuUsage();
            var memory = process.memoryUsage();
            this.processInfo.cpuUsage = (usage.user + usage.system) / 1000000;
            this.processInfo.memoryUsage = memory.heapUsed / 1024 / 1024;
            this.emit('metrics:updated', {
                cpu: this.processInfo.cpuUsage,
                memory: this.processInfo.memoryUsage
            });
        }
        catch (error) {
            this.outputChannel.appendLine("[ERROR] Failed to update metrics: ".concat(error));
        }
    };
    return LLMHostProcessService;
}(events_1.EventEmitter));
exports.LLMHostProcessService = LLMHostProcessService;
