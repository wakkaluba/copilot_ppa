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
exports.LLMHostHealthMonitor = void 0;
var events_1 = require("events");
var LLMHostHealthMonitor = /** @class */ (function (_super) {
    __extends(LLMHostHealthMonitor, _super);
    function LLMHostHealthMonitor(outputChannel) {
        var _this = _super.call(this) || this;
        _this.outputChannel = outputChannel;
        _this.monitoredProcesses = new Map();
        _this.healthChecks = new Map();
        _this.checkInterval = 5000; // 5 seconds
        return _this;
    }
    LLMHostHealthMonitor.prototype.startMonitoring = function (processInfo) {
        var _this = this;
        var pid = processInfo.pid;
        if (this.monitoredProcesses.has(pid)) {
            return;
        }
        this.healthChecks.set(pid, {
            lastCheck: Date.now(),
            checkCount: 0,
            warningCount: 0,
            status: 'healthy'
        });
        var intervalId = setInterval(function () { return _this.checkHealth(pid); }, this.checkInterval);
        this.monitoredProcesses.set(pid, intervalId);
    };
    LLMHostHealthMonitor.prototype.stopMonitoring = function (pid) {
        var intervalId = this.monitoredProcesses.get(pid);
        if (intervalId) {
            clearInterval(intervalId);
            this.monitoredProcesses.delete(pid);
            this.healthChecks.delete(pid);
        }
    };
    LLMHostHealthMonitor.prototype.checkHealth = function (pid) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, healthCheck, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.collectMetrics(pid)];
                    case 1:
                        metrics = _a.sent();
                        healthCheck = this.healthChecks.get(pid);
                        if (!healthCheck) {
                            return [2 /*return*/];
                        }
                        healthCheck.lastCheck = Date.now();
                        healthCheck.checkCount++;
                        if (metrics.cpuUsage > 90 || metrics.memoryUsage > 90) {
                            healthCheck.warningCount++;
                            healthCheck.status = 'warning';
                            this.emit('health:warning', "High resource usage detected (CPU: ".concat(metrics.cpuUsage, "%, Memory: ").concat(metrics.memoryUsage, "%)"), metrics);
                        }
                        else {
                            healthCheck.status = 'healthy';
                        }
                        if (healthCheck.warningCount >= 3) {
                            healthCheck.status = 'critical';
                            this.emit('health:critical', new Error("Process ".concat(pid, " has shown high resource usage for an extended period")), metrics);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.outputChannel.appendLine("[ERROR] Health check failed for process ".concat(pid, ": ").concat(error_1));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    LLMHostHealthMonitor.prototype.collectMetrics = function (pid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would integrate with node's process module or OS-specific tools
                return [2 /*return*/, {
                        cpuUsage: Math.random() * 100,
                        memoryUsage: Math.random() * 100,
                        timestamp: new Date()
                    }];
            });
        });
    };
    LLMHostHealthMonitor.prototype.dispose = function () {
        for (var _i = 0, _a = this.monitoredProcesses; _i < _a.length; _i++) {
            var pid = _a[_i][0];
            this.stopMonitoring(pid);
        }
        this.removeAllListeners();
    };
    return LLMHostHealthMonitor;
}(events_1.EventEmitter));
exports.LLMHostHealthMonitor = LLMHostHealthMonitor;
