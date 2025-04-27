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
exports.ModelCacheManager = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../types");
var types_2 = require("../types");
var path_1 = require("path");
var fs_1 = require("fs");
var DEFAULT_CACHE_CONFIG = {
    maxMemorySize: 1024 * 1024 * 1024, // 1GB
    maxItems: 100,
    ttl: 60 * 60 * 1000, // 1 hour
    cleanupInterval: 5 * 60 * 1000 // 5 minutes
};
var ModelCacheManager = /** @class */ (function (_super) {
    __extends(ModelCacheManager, _super);
    function ModelCacheManager(logger, cacheConfig, cacheDir) {
        if (cacheConfig === void 0) { cacheConfig = DEFAULT_CACHE_CONFIG; }
        if (cacheDir === void 0) { cacheDir = path_1.default.join(vscode.workspace.rootPath || '', '.model-cache'); }
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.cacheConfig = cacheConfig;
        _this.cacheDir = cacheDir;
        _this.memoryCache = new Map();
        _this.diskCache = new Map();
        _this.cleanupInterval = null;
        _this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            memoryUsed: 0
        };
        _this.outputChannel = vscode.window.createOutputChannel('Model Cache');
        _this.initializeCache();
        return _this;
    }
    ModelCacheManager.prototype.initializeCache = function () {
        var _this = this;
        // Ensure cache directory exists
        if (!fs_1.default.existsSync(this.cacheDir)) {
            fs_1.default.mkdirSync(this.cacheDir, { recursive: true });
        }
        // Start cleanup interval
        this.cleanupInterval = setInterval(function () {
            _this.cleanup();
        }, this.cacheConfig.cleanupInterval);
    };
    ModelCacheManager.prototype.cacheModel = function (model_1) {
        return __awaiter(this, arguments, void 0, function (model, strategy) {
            var key, error_1;
            if (strategy === void 0) { strategy = 'memory'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = this.generateCacheKey(model);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        if (!(strategy === 'memory')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.cacheInMemory(key, model)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        if (!(strategy === 'disk')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.cacheOnDisk(key, model)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5: throw new Error("Invalid cache strategy: ".concat(strategy));
                    case 6:
                        this.emit('modelCached', { modelId: model.id, strategy: strategy });
                        this.logCacheOperation('cache', model.id, strategy);
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        this.handleError('Failed to cache model', error_1);
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManager.prototype.getModel = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var memoryModel, diskPath, model, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        memoryModel = this.memoryCache.get(modelId);
                        if (memoryModel && !this.isExpired(memoryModel)) {
                            this.cacheStats.hits++;
                            this.emit('cacheHit', { modelId: modelId, source: 'memory' });
                            return [2 /*return*/, memoryModel.model];
                        }
                        diskPath = this.diskCache.get(modelId);
                        if (!(diskPath && fs_1.default.existsSync(diskPath))) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadFromDisk(diskPath)];
                    case 1:
                        model = _a.sent();
                        if (model) {
                            this.cacheStats.hits++;
                            this.emit('cacheHit', { modelId: modelId, source: 'disk' });
                            return [2 /*return*/, model];
                        }
                        _a.label = 2;
                    case 2:
                        this.cacheStats.misses++;
                        this.emit('cacheMiss', { modelId: modelId });
                        return [2 /*return*/, null];
                    case 3:
                        error_2 = _a.sent();
                        this.handleError('Failed to retrieve model from cache', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManager.prototype.invalidateModel = function (modelId) {
        try {
            // Remove from memory cache
            if (this.memoryCache.has(modelId)) {
                var model = this.memoryCache.get(modelId);
                this.cacheStats.memoryUsed -= this.estimateSize(model.model);
                this.memoryCache.delete(modelId);
            }
            // Remove from disk cache
            var diskPath = this.diskCache.get(modelId);
            if (diskPath && fs_1.default.existsSync(diskPath)) {
                fs_1.default.unlinkSync(diskPath);
                this.diskCache.delete(modelId);
            }
            this.cacheStats.evictions++;
            this.emit('modelInvalidated', { modelId: modelId });
            this.logCacheOperation('invalidate', modelId);
        }
        catch (error) {
            this.handleError('Failed to invalidate model', error);
            throw error;
        }
    };
    ModelCacheManager.prototype.cacheInMemory = function (key, model) {
        return __awaiter(this, void 0, void 0, function () {
            var size;
            return __generator(this, function (_a) {
                size = this.estimateSize(model);
                // Check if we need to make space
                while (this.cacheStats.memoryUsed + size > this.cacheConfig.maxMemorySize) {
                    this.evictOldest();
                }
                this.memoryCache.set(key, {
                    model: model,
                    timestamp: new Date(),
                    size: size
                });
                this.cacheStats.memoryUsed += size;
                return [2 /*return*/];
            });
        });
    };
    ModelCacheManager.prototype.cacheOnDisk = function (key, model) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filePath = path_1.default.join(this.cacheDir, "".concat(key, ".json"));
                        return [4 /*yield*/, fs_1.default.promises.writeFile(filePath, JSON.stringify({ model: model, timestamp: new Date() }), 'utf8')];
                    case 1:
                        _a.sent();
                        this.diskCache.set(key, filePath);
                        return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManager.prototype.loadFromDisk = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var data, _a, _b, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, fs_1.default.promises.readFile(filePath, 'utf8')];
                    case 1:
                        data = _b.apply(_a, [_c.sent()]);
                        if (this.isExpired({ timestamp: data.timestamp })) {
                            fs_1.default.unlinkSync(filePath);
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, data.model];
                    case 2:
                        error_3 = _c.sent();
                        this.logger.error('[ModelCacheManager]', 'Failed to load model from disk', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelCacheManager.prototype.cleanup = function () {
        var now = Date.now();
        // Cleanup memory cache
        for (var _i = 0, _a = this.memoryCache.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], model = _b[1];
            if (this.isExpired(model)) {
                this.invalidateModel(key);
            }
        }
        // Cleanup disk cache
        for (var _c = 0, _d = this.diskCache.entries(); _c < _d.length; _c++) {
            var _e = _d[_c], key = _e[0], filePath = _e[1];
            if (!fs_1.default.existsSync(filePath)) {
                this.diskCache.delete(key);
                continue;
            }
            try {
                var stats = fs_1.default.statSync(filePath);
                if (now - stats.mtimeMs > this.cacheConfig.ttl) {
                    this.invalidateModel(key);
                }
            }
            catch (error) {
                this.logger.error('[ModelCacheManager]', 'Failed to check file stats', error);
            }
        }
        this.emit('cleanup', this.getCacheStats());
    };
    ModelCacheManager.prototype.evictOldest = function () {
        var oldestKey = null;
        var oldestTime = Infinity;
        for (var _i = 0, _a = this.memoryCache.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], model = _b[1];
            if (model.timestamp < oldestTime) {
                oldestTime = model.timestamp;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.invalidateModel(oldestKey);
        }
    };
    ModelCacheManager.prototype.isExpired = function (model) {
        return Date.now() - model.timestamp > this.cacheConfig.ttl;
    };
    ModelCacheManager.prototype.generateCacheKey = function (model) {
        return model.id;
    };
    ModelCacheManager.prototype.estimateSize = function (model) {
        return Buffer.byteLength(JSON.stringify(model));
    };
    ModelCacheManager.prototype.getCacheStats = function () {
        return __assign({}, this.cacheStats);
    };
    ModelCacheManager.prototype.logCacheOperation = function (operation, modelId, strategy) {
        this.outputChannel.appendLine("[".concat(new Date().toISOString(), "] ").concat(operation, " - Model: ").concat(modelId).concat(strategy ? " (".concat(strategy, ")") : ''));
        var stats = this.getCacheStats();
        this.outputChannel.appendLine("Cache Stats: ".concat(JSON.stringify(stats, null, 2)));
    };
    ModelCacheManager.prototype.handleError = function (message, error) {
        this.logger.error('[ModelCacheManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelCacheManager.prototype.dispose = function () {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.memoryCache.clear();
        this.diskCache.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    };
    var _a, _b;
    ModelCacheManager = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof types_2.CacheConfig !== "undefined" && types_2.CacheConfig) === "function" ? _b : Object, String])
    ], ModelCacheManager);
    return ModelCacheManager;
}(events_1.EventEmitter));
exports.ModelCacheManager = ModelCacheManager;
