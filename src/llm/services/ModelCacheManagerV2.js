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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelCacheManagerV2 = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var fs = require("fs");
var path = require("path");
var ModelCacheManagerV2 = /** @class */ (function (_super) {
    __extends(ModelCacheManagerV2, _super);
    function ModelCacheManagerV2(logger, config) {
        if (config === void 0) { config = {
            maxMemorySize: 1024 * 1024 * 1024, // 1GB
            maxDiskSize: 5 * 1024 * 1024 * 1024, // 5GB
            ttl: 24 * 60 * 60 * 1000, // 24 hours
            cleanupInterval: 15 * 60 * 1000, // 15 minutes
            compressionEnabled: true,
            persistPath: path.join(vscode.workspace.rootPath || '', '.model-cache')
        }; }
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.config = config;
        _this.memoryCache = new Map();
        _this.diskCache = new Map();
        _this.outputChannel = vscode.window.createOutputChannel('Model Cache Manager');
        _this.metrics = _this.initializeMetrics();
        _this.initializeCache();
        _this.cleanupInterval = setInterval(function () { return _this.runCleanup(); }, _this.config.cleanupInterval);
        return _this;
    }
    ModelCacheManagerV2.prototype.initializeMetrics = function () {
        return {
            memoryUsed: 0,
            diskUsed: 0,
            memoryHits: 0,
            diskHits: 0,
            misses: 0,
            evictions: 0
        };
    };
    ModelCacheManagerV2.prototype.initializeCache = function () {
        if (!fs.existsSync(this.config.persistPath)) {
            fs.mkdirSync(this.config.persistPath, { recursive: true });
        }
        this.loadPersistedCache();
    };
    ModelCacheManagerV2.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var memoryItem, diskPath, diskItem, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        memoryItem = this.memoryCache.get(key);
                        if (memoryItem && !this.isExpired(memoryItem)) {
                            this.metrics.memoryHits++;
                            this.updateItemAccess(key, memoryItem);
                            return [2 /*return*/, memoryItem.data];
                        }
                        diskPath = this.diskCache.get(key);
                        if (!(diskPath && fs.existsSync(diskPath))) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.loadFromDisk(diskPath)];
                    case 1:
                        diskItem = _a.sent();
                        if (!diskItem) return [3 /*break*/, 3];
                        this.metrics.diskHits++;
                        // Promote to memory if possible
                        return [4 /*yield*/, this.promoteToMemory(key, diskItem)];
                    case 2:
                        // Promote to memory if possible
                        _a.sent();
                        return [2 /*return*/, diskItem];
                    case 3:
                        this.metrics.misses++;
                        return [2 /*return*/, null];
                    case 4:
                        error_1 = _a.sent();
                        this.handleError("Failed to retrieve item: ".concat(key), error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManagerV2.prototype.set = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var size, item, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        size = this.estimateSize(value);
                        item = {
                            data: value,
                            size: size,
                            lastAccess: Date.now(),
                            accessCount: 1
                        };
                        if (!(size <= this.getAvailableMemory())) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.setInMemory(key, item)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: 
                    // Fall back to disk if too large for memory
                    return [4 /*yield*/, this.setOnDisk(key, value)];
                    case 3:
                        // Fall back to disk if too large for memory
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        this.emit('itemCached', { key: key, location: size <= this.getAvailableMemory() ? 'memory' : 'disk' });
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        this.handleError("Failed to cache item: ".concat(key), error_2);
                        throw error_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManagerV2.prototype.setInMemory = function (key, item) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                while (this.metrics.memoryUsed + item.size > this.config.maxMemorySize) {
                    if (!this.evictFromMemory()) {
                        throw new Error('Unable to make space in memory cache');
                    }
                }
                this.memoryCache.set(key, item);
                this.metrics.memoryUsed += item.size;
                return [2 /*return*/];
            });
        });
    };
    ModelCacheManagerV2.prototype.setOnDisk = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var diskPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        diskPath = this.getDiskPath(key);
                        _a.label = 1;
                    case 1:
                        if (!(this.metrics.diskUsed + this.estimateSize(value) > this.config.maxDiskSize)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.evictFromDisk()];
                    case 2:
                        if (!(_a.sent())) {
                            throw new Error('Unable to make space in disk cache');
                        }
                        return [3 /*break*/, 1];
                    case 3: return [4 /*yield*/, this.saveToDisk(diskPath, value)];
                    case 4:
                        _a.sent();
                        this.diskCache.set(key, diskPath);
                        return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManagerV2.prototype.promoteToMemory = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var size;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        size = this.estimateSize(value);
                        if (!(size <= this.getAvailableMemory())) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.setInMemory(key, {
                                data: value,
                                size: size,
                                lastAccess: Date.now(),
                                accessCount: 1
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManagerV2.prototype.loadFromDisk = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var data, cached, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fs.promises.readFile(filePath, 'utf8')];
                    case 1:
                        data = _a.sent();
                        cached = JSON.parse(data);
                        if (!this.isExpired(cached)) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs.promises.unlink(filePath)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/, cached.data];
                    case 4:
                        error_3 = _a.sent();
                        this.handleError("Failed to load from disk: ".concat(filePath), error_3);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManagerV2.prototype.saveToDisk = function (filePath, value) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            data: value,
                            timestamp: new Date()
                        };
                        return [4 /*yield*/, fs.promises.writeFile(filePath, JSON.stringify(data), 'utf8')];
                    case 1:
                        _a.sent();
                        this.metrics.diskUsed += this.estimateSize(value);
                        return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManagerV2.prototype.evictFromMemory = function () {
        var lruKey = this.findLRUKey();
        if (!lruKey)
            return false;
        var item = this.memoryCache.get(lruKey);
        this.memoryCache.delete(lruKey);
        this.metrics.memoryUsed -= item.size;
        this.metrics.evictions++;
        return true;
    };
    ModelCacheManagerV2.prototype.evictFromDisk = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oldestKey, filePath, stats, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        oldestKey = this.findOldestDiskKey();
                        if (!oldestKey)
                            return [2 /*return*/, false];
                        filePath = this.diskCache.get(oldestKey);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fs.promises.stat(filePath)];
                    case 2:
                        stats = _a.sent();
                        return [4 /*yield*/, fs.promises.unlink(filePath)];
                    case 3:
                        _a.sent();
                        this.diskCache.delete(oldestKey);
                        this.metrics.diskUsed -= stats.size;
                        this.metrics.evictions++;
                        return [2 /*return*/, true];
                    case 4:
                        error_4 = _a.sent();
                        this.handleError("Failed to evict from disk: ".concat(filePath), error_4);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManagerV2.prototype.invalidate = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var memoryItem, diskPath, stats, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        memoryItem = this.memoryCache.get(key);
                        if (memoryItem) {
                            this.metrics.memoryUsed -= memoryItem.size;
                            this.memoryCache.delete(key);
                        }
                        diskPath = this.diskCache.get(key);
                        if (!(diskPath && fs.existsSync(diskPath))) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs.promises.stat(diskPath)];
                    case 1:
                        stats = _a.sent();
                        return [4 /*yield*/, fs.promises.unlink(diskPath)];
                    case 2:
                        _a.sent();
                        this.metrics.diskUsed -= stats.size;
                        this.diskCache.delete(key);
                        _a.label = 3;
                    case 3:
                        this.emit('itemInvalidated', { key: key });
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        this.handleError("Failed to invalidate item: ".concat(key), error_5);
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManagerV2.prototype.runCleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, _i, _a, _b, key, item, _c, _d, _e, key, filePath, data, _f, _g, error_6, error_7;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 14, , 15]);
                        now = Date.now();
                        _i = 0, _a = Array.from(this.memoryCache.entries());
                        _h.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        _b = _a[_i], key = _b[0], item = _b[1];
                        if (!this.isExpired(item)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.invalidate(key)];
                    case 2:
                        _h.sent();
                        _h.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        _c = 0, _d = Array.from(this.diskCache.entries());
                        _h.label = 5;
                    case 5:
                        if (!(_c < _d.length)) return [3 /*break*/, 13];
                        _e = _d[_c], key = _e[0], filePath = _e[1];
                        if (!fs.existsSync(filePath)) {
                            this.diskCache.delete(key);
                            return [3 /*break*/, 12];
                        }
                        _h.label = 6;
                    case 6:
                        _h.trys.push([6, 10, , 12]);
                        _g = (_f = JSON).parse;
                        return [4 /*yield*/, fs.promises.readFile(filePath, 'utf8')];
                    case 7:
                        data = _g.apply(_f, [_h.sent()]);
                        if (!this.isExpired(data)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.invalidate(key)];
                    case 8:
                        _h.sent();
                        _h.label = 9;
                    case 9: return [3 /*break*/, 12];
                    case 10:
                        error_6 = _h.sent();
                        return [4 /*yield*/, this.invalidate(key)];
                    case 11:
                        _h.sent();
                        return [3 /*break*/, 12];
                    case 12:
                        _c++;
                        return [3 /*break*/, 5];
                    case 13:
                        this.emit('cleanup', this.getMetrics());
                        return [3 /*break*/, 15];
                    case 14:
                        error_7 = _h.sent();
                        this.handleError('Failed to run cleanup', error_7);
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManagerV2.prototype.updateItemAccess = function (key, item) {
        item.lastAccess = Date.now();
        item.accessCount++;
    };
    ModelCacheManagerV2.prototype.isExpired = function (item) {
        var timestamp = item.lastAccess || item.timestamp;
        return timestamp ? Date.now() - timestamp > this.config.ttl : true;
    };
    ModelCacheManagerV2.prototype.findLRUKey = function () {
        var lruKey;
        var lruTime = Infinity;
        for (var _i = 0, _a = Array.from(this.memoryCache.entries()); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], item = _b[1];
            if (item.lastAccess < lruTime) {
                lruTime = item.lastAccess;
                lruKey = key;
            }
        }
        return lruKey;
    };
    ModelCacheManagerV2.prototype.findOldestDiskKey = function () {
        var oldestKey;
        var oldestTime = Infinity;
        for (var _i = 0, _a = Array.from(this.diskCache.entries()); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], filePath = _b[1];
            try {
                var stats = fs.statSync(filePath);
                if (stats.mtimeMs < oldestTime) {
                    oldestTime = stats.mtimeMs;
                    oldestKey = key;
                }
            }
            catch (error) {
                this.diskCache.delete(key);
            }
        }
        return oldestKey;
    };
    ModelCacheManagerV2.prototype.getAvailableMemory = function () {
        return this.config.maxMemorySize - this.metrics.memoryUsed;
    };
    ModelCacheManagerV2.prototype.getDiskPath = function (key) {
        return path.join(this.config.persistPath, "".concat(key, ".json"));
    };
    ModelCacheManagerV2.prototype.estimateSize = function (value) {
        return Buffer.byteLength(JSON.stringify(value));
    };
    ModelCacheManagerV2.prototype.getMetrics = function () {
        return __assign({}, this.metrics);
    };
    ModelCacheManagerV2.prototype.loadPersistedCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files, _i, files_1, file, key, filePath, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.promises.readdir(this.config.persistPath)];
                    case 1:
                        files = _a.sent();
                        for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                            file = files_1[_i];
                            if (file.endsWith('.json')) {
                                key = file.slice(0, -5);
                                filePath = path.join(this.config.persistPath, file);
                                this.diskCache.set(key, filePath);
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        this.handleError('Failed to load persisted cache', error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManagerV2.prototype.handleError = function (message, error) {
        this.logger.error("[ModelCacheManager] ".concat(message, ": ").concat(error.message));
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelCacheManagerV2.prototype.logOperation = function (operation, details) {
        var timestamp = new Date().toISOString();
        this.outputChannel.appendLine("[".concat(timestamp, "] ").concat(operation, ": ").concat(JSON.stringify(details)));
    };
    ModelCacheManagerV2.prototype.dispose = function () {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.memoryCache.clear();
        this.diskCache.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    };
    ModelCacheManagerV2 = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)('ILogger')),
        __metadata("design:paramtypes", [Object, Object])
    ], ModelCacheManagerV2);
    return ModelCacheManagerV2;
}(events_1.EventEmitter));
exports.ModelCacheManagerV2 = ModelCacheManagerV2;
