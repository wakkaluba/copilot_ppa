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
exports.ResourceManager = void 0;
var os = require("os");
/**
 * Manages system resource usage and provides methods to optimize resource utilization
 * for LLM operations.
 */
var ResourceManager = /** @class */ (function () {
    function ResourceManager(context, conversationHistory) {
        this.context = context;
        this.conversationHistory = conversationHistory;
        this.monitoringInterval = null;
        this.memoryWarningThreshold = 80; // 80% memory usage warning threshold
        this.memoryCriticalThreshold = 90; // 90% memory usage critical threshold
        this.cpuWarningThreshold = 70; // 70% CPU usage warning threshold
        this.cpuCriticalThreshold = 85; // 85% CPU usage critical threshold
    }
    /**
     * Gets the current memory usage of the system
     */
    ResourceManager.prototype.getCurrentMemoryUsage = function () {
        var totalMemory = os.totalmem() / (1024 * 1024); // Convert to MB
        var freeMemory = os.freemem() / (1024 * 1024); // Convert to MB
        var usedMemory = totalMemory - freeMemory;
        var percentUsed = (usedMemory / totalMemory) * 100;
        return {
            total: Math.round(totalMemory),
            used: Math.round(usedMemory),
            free: Math.round(freeMemory),
            percentUsed: Math.round(percentUsed)
        };
    };
    /**
     * Gets the current CPU usage of the system and process
     */
    ResourceManager.prototype.getCurrentCpuUsage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cpus, totalCpuTime, totalIdleTime, systemPercent, processPercent;
            return __generator(this, function (_a) {
                cpus = os.cpus();
                totalCpuTime = cpus.reduce(function (acc, cpu) {
                    return acc + Object.values(cpu.times).reduce(function (sum, time) { return sum + time; }, 0);
                }, 0);
                totalIdleTime = cpus.reduce(function (acc, cpu) { return acc + cpu.times.idle; }, 0);
                systemPercent = 100 - (totalIdleTime / totalCpuTime * 100);
                processPercent = systemPercent * 0.6;
                return [2 /*return*/, {
                        systemPercent: Math.round(systemPercent),
                        processPercent: Math.round(processPercent)
                    }];
            });
        });
    };
    /**
     * Checks if the system is under memory pressure
     */
    ResourceManager.prototype.isUnderMemoryPressure = function () {
        var memoryUsage = this.getCurrentMemoryUsage();
        return memoryUsage.percentUsed > this.memoryCriticalThreshold;
    };
    /**
     * Checks if the system is under CPU pressure
     */
    ResourceManager.prototype.isUnderCpuPressure = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cpuUsage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentCpuUsage()];
                    case 1:
                        cpuUsage = _a.sent();
                        return [2 /*return*/, cpuUsage.systemPercent > this.cpuCriticalThreshold];
                }
            });
        });
    };
    /**
     * Checks the status of memory resources
     */
    ResourceManager.prototype.checkMemoryStatus = function () {
        var memoryUsage = this.getCurrentMemoryUsage();
        if (memoryUsage.percentUsed > this.memoryCriticalThreshold) {
            return {
                status: 'critical',
                message: "Critical memory usage: ".concat(memoryUsage.percentUsed.toFixed(1), "% used, ").concat(memoryUsage.free.toFixed(0), " MB free")
            };
        }
        else if (memoryUsage.percentUsed > this.memoryWarningThreshold) {
            return {
                status: 'warning',
                message: "High memory usage: ".concat(memoryUsage.percentUsed.toFixed(1), "% used, ").concat(memoryUsage.free.toFixed(0), " MB free")
            };
        }
        return {
            status: 'normal',
            message: "Normal memory usage: ".concat(memoryUsage.percentUsed.toFixed(1), "% used, ").concat(memoryUsage.free.toFixed(0), " MB free")
        };
    };
    /**
     * Checks the status of CPU resources
     */
    ResourceManager.prototype.checkCpuStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cpuUsage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentCpuUsage()];
                    case 1:
                        cpuUsage = _a.sent();
                        if (cpuUsage.systemPercent > this.cpuCriticalThreshold) {
                            return [2 /*return*/, {
                                    status: 'critical',
                                    message: "Critical CPU usage: ".concat(cpuUsage.systemPercent.toFixed(1), "% system, ").concat(cpuUsage.processPercent.toFixed(1), "% process")
                                }];
                        }
                        else if (cpuUsage.systemPercent > this.cpuWarningThreshold) {
                            return [2 /*return*/, {
                                    status: 'warning',
                                    message: "High CPU usage: ".concat(cpuUsage.systemPercent.toFixed(1), "% system, ").concat(cpuUsage.processPercent.toFixed(1), "% process")
                                }];
                        }
                        return [2 /*return*/, {
                                status: 'normal',
                                message: "Normal CPU usage: ".concat(cpuUsage.systemPercent.toFixed(1), "% system, ").concat(cpuUsage.processPercent.toFixed(1), "% process")
                            }];
                }
            });
        });
    };
    /**
     * Checks overall resource status
     */
    ResourceManager.prototype.checkResourceStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var memoryStatus, cpuStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        memoryStatus = this.checkMemoryStatus();
                        return [4 /*yield*/, this.checkCpuStatus()];
                    case 1:
                        cpuStatus = _a.sent();
                        // Return the most severe status
                        if (memoryStatus.status === 'critical' || cpuStatus.status === 'critical') {
                            return [2 /*return*/, {
                                    status: 'critical',
                                    message: "Critical resource usage - ".concat(memoryStatus.message, "; ").concat(cpuStatus.message)
                                }];
                        }
                        else if (memoryStatus.status === 'warning' || cpuStatus.status === 'warning') {
                            return [2 /*return*/, {
                                    status: 'warning',
                                    message: "Warning: resource pressure detected - ".concat(memoryStatus.message, "; ").concat(cpuStatus.message)
                                }];
                        }
                        return [2 /*return*/, {
                                status: 'normal',
                                message: 'Normal resource usage'
                            }];
                }
            });
        });
    };
    /**
     * Starts periodic monitoring of system resources
     */
    ResourceManager.prototype.startMonitoring = function (intervalMs) {
        var _this = this;
        if (intervalMs === void 0) { intervalMs = 5000; }
        // Clear any existing interval
        this.stopMonitoring();
        this.monitoringInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkResourceStatus()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, intervalMs);
    };
    /**
     * Stops the resource monitoring
     */
    ResourceManager.prototype.stopMonitoring = function () {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    };
    /**
     * Optimizes memory usage by cleaning up resources
     */
    ResourceManager.prototype.optimizeMemoryUsage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var beforeMemory, afterMemory, freedMemory;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        beforeMemory = this.getCurrentMemoryUsage();
                        // Perform optimization actions
                        return [4 /*yield*/, this.cleanupConversationCache()];
                    case 1:
                        // Perform optimization actions
                        _b.sent();
                        (_a = global.gc) === null || _a === void 0 ? void 0 : _a.call(global); // Request garbage collection if available
                        afterMemory = this.getCurrentMemoryUsage();
                        freedMemory = beforeMemory.used - afterMemory.used;
                        return [2 /*return*/, {
                                optimized: freedMemory > 0,
                                freedMemory: Math.max(0, freedMemory)
                            }];
                }
            });
        });
    };
    /**
     * Cleans up conversation cache to free memory
     */
    ResourceManager.prototype.cleanupConversationCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var conversations, sortedConversations, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversations = this.conversationHistory.getAllConversations();
                        if (!(conversations.length > 10)) return [3 /*break*/, 4];
                        sortedConversations = conversations.sort(function (a, b) {
                            var aLastUpdated = a.messages.length ?
                                a.messages[a.messages.length - 1].timestamp : 0;
                            var bLastUpdated = b.messages.length ?
                                b.messages[b.messages.length - 1].timestamp : 0;
                            return bLastUpdated - aLastUpdated;
                        });
                        i = 10;
                        _a.label = 1;
                    case 1:
                        if (!(i < sortedConversations.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.conversationHistory.deleteConversation(sortedConversations[i].id)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Allocates resources for an operation
     */
    ResourceManager.prototype.allocateResourcesForOperation = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var memoryUnderPressure, cpuUnderPressure, memoryUsage, cpuUsage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        memoryUnderPressure = this.isUnderMemoryPressure();
                        return [4 /*yield*/, this.isUnderCpuPressure()];
                    case 1:
                        cpuUnderPressure = _a.sent();
                        memoryUsage = this.getCurrentMemoryUsage();
                        return [4 /*yield*/, this.getCurrentCpuUsage()];
                    case 2:
                        cpuUsage = _a.sent();
                        // If system is under pressure and request is not high priority, deny it
                        if ((memoryUnderPressure || cpuUnderPressure) && request.priority !== 'high') {
                            return [2 /*return*/, {
                                    allocated: false,
                                    reason: "System under resource pressure: memory=".concat(memoryUsage.percentUsed.toFixed(1), "%, CPU=").concat(cpuUsage.systemPercent.toFixed(1), "%"),
                                    availableMemory: memoryUsage.free,
                                    availableCpu: 100 - cpuUsage.systemPercent
                                }];
                        }
                        // If estimated resource needs exceed available resources, deny
                        if (request.estimatedMemory > memoryUsage.free) {
                            return [2 /*return*/, {
                                    allocated: false,
                                    reason: "Insufficient memory: requested ".concat(request.estimatedMemory, "MB but only ").concat(memoryUsage.free.toFixed(0), "MB available"),
                                    availableMemory: memoryUsage.free,
                                    availableCpu: 100 - cpuUsage.systemPercent
                                }];
                        }
                        if (request.estimatedCpuLoad + cpuUsage.systemPercent > 100) {
                            return [2 /*return*/, {
                                    allocated: false,
                                    reason: "Insufficient CPU: requested ".concat(request.estimatedCpuLoad, "% but only ").concat((100 - cpuUsage.systemPercent).toFixed(0), "% available"),
                                    availableMemory: memoryUsage.free,
                                    availableCpu: 100 - cpuUsage.systemPercent
                                }];
                        }
                        // Resources are available, approve allocation
                        return [2 /*return*/, {
                                allocated: true,
                                availableMemory: memoryUsage.free,
                                availableCpu: 100 - cpuUsage.systemPercent
                            }];
                }
            });
        });
    };
    return ResourceManager;
}());
exports.ResourceManager = ResourceManager;
