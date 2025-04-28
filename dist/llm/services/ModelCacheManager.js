"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelCacheManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const types_1 = require("../types");
const types_2 = require("../types");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DEFAULT_CACHE_CONFIG = {
    maxMemorySize: 1024 * 1024 * 1024, // 1GB
    maxItems: 100,
    ttl: 60 * 60 * 1000, // 1 hour
    cleanupInterval: 5 * 60 * 1000 // 5 minutes
};
let ModelCacheManager = class ModelCacheManager extends events_1.EventEmitter {
    constructor(logger, cacheConfig = DEFAULT_CACHE_CONFIG, cacheDir = path_1.default.join(vscode.workspace.rootPath || '', '.model-cache')) {
        super();
        this.logger = logger;
        this.cacheConfig = cacheConfig;
        this.cacheDir = cacheDir;
        this.memoryCache = new Map();
        this.diskCache = new Map();
        this.cleanupInterval = null;
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            memoryUsed: 0
        };
        this.outputChannel = vscode.window.createOutputChannel('Model Cache');
        this.initializeCache();
    }
    initializeCache() {
        // Ensure cache directory exists
        if (!fs_1.default.existsSync(this.cacheDir)) {
            fs_1.default.mkdirSync(this.cacheDir, { recursive: true });
        }
        // Start cleanup interval
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, this.cacheConfig.cleanupInterval);
    }
    async cacheModel(model, strategy = 'memory') {
        const key = this.generateCacheKey(model);
        try {
            if (strategy === 'memory') {
                await this.cacheInMemory(key, model);
            }
            else if (strategy === 'disk') {
                await this.cacheOnDisk(key, model);
            }
            else {
                throw new Error(`Invalid cache strategy: ${strategy}`);
            }
            this.emit('modelCached', { modelId: model.id, strategy });
            this.logCacheOperation('cache', model.id, strategy);
        }
        catch (error) {
            this.handleError('Failed to cache model', error);
            throw error;
        }
    }
    async getModel(modelId) {
        try {
            // Check memory cache first
            const memoryModel = this.memoryCache.get(modelId);
            if (memoryModel && !this.isExpired(memoryModel)) {
                this.cacheStats.hits++;
                this.emit('cacheHit', { modelId, source: 'memory' });
                return memoryModel.model;
            }
            // Check disk cache
            const diskPath = this.diskCache.get(modelId);
            if (diskPath && fs_1.default.existsSync(diskPath)) {
                const model = await this.loadFromDisk(diskPath);
                if (model) {
                    this.cacheStats.hits++;
                    this.emit('cacheHit', { modelId, source: 'disk' });
                    return model;
                }
            }
            this.cacheStats.misses++;
            this.emit('cacheMiss', { modelId });
            return null;
        }
        catch (error) {
            this.handleError('Failed to retrieve model from cache', error);
            throw error;
        }
    }
    invalidateModel(modelId) {
        try {
            // Remove from memory cache
            if (this.memoryCache.has(modelId)) {
                const model = this.memoryCache.get(modelId);
                this.cacheStats.memoryUsed -= this.estimateSize(model.model);
                this.memoryCache.delete(modelId);
            }
            // Remove from disk cache
            const diskPath = this.diskCache.get(modelId);
            if (diskPath && fs_1.default.existsSync(diskPath)) {
                fs_1.default.unlinkSync(diskPath);
                this.diskCache.delete(modelId);
            }
            this.cacheStats.evictions++;
            this.emit('modelInvalidated', { modelId });
            this.logCacheOperation('invalidate', modelId);
        }
        catch (error) {
            this.handleError('Failed to invalidate model', error);
            throw error;
        }
    }
    async cacheInMemory(key, model) {
        const size = this.estimateSize(model);
        // Check if we need to make space
        while (this.cacheStats.memoryUsed + size > this.cacheConfig.maxMemorySize) {
            this.evictOldest();
        }
        this.memoryCache.set(key, {
            model,
            timestamp: new Date(),
            size
        });
        this.cacheStats.memoryUsed += size;
    }
    async cacheOnDisk(key, model) {
        const filePath = path_1.default.join(this.cacheDir, `${key}.json`);
        await fs_1.default.promises.writeFile(filePath, JSON.stringify({ model, timestamp: new Date() }), 'utf8');
        this.diskCache.set(key, filePath);
    }
    async loadFromDisk(filePath) {
        try {
            const data = JSON.parse(await fs_1.default.promises.readFile(filePath, 'utf8'));
            if (this.isExpired({ timestamp: data.timestamp })) {
                fs_1.default.unlinkSync(filePath);
                return null;
            }
            return data.model;
        }
        catch (error) {
            this.logger.error('[ModelCacheManager]', 'Failed to load model from disk', error);
            return null;
        }
    }
    cleanup() {
        const now = Date.now();
        // Cleanup memory cache
        for (const [key, model] of this.memoryCache.entries()) {
            if (this.isExpired(model)) {
                this.invalidateModel(key);
            }
        }
        // Cleanup disk cache
        for (const [key, filePath] of this.diskCache.entries()) {
            if (!fs_1.default.existsSync(filePath)) {
                this.diskCache.delete(key);
                continue;
            }
            try {
                const stats = fs_1.default.statSync(filePath);
                if (now - stats.mtimeMs > this.cacheConfig.ttl) {
                    this.invalidateModel(key);
                }
            }
            catch (error) {
                this.logger.error('[ModelCacheManager]', 'Failed to check file stats', error);
            }
        }
        this.emit('cleanup', this.getCacheStats());
    }
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, model] of this.memoryCache.entries()) {
            if (model.timestamp < oldestTime) {
                oldestTime = model.timestamp;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.invalidateModel(oldestKey);
        }
    }
    isExpired(model) {
        return Date.now() - model.timestamp > this.cacheConfig.ttl;
    }
    generateCacheKey(model) {
        return model.id;
    }
    estimateSize(model) {
        return Buffer.byteLength(JSON.stringify(model));
    }
    getCacheStats() {
        return { ...this.cacheStats };
    }
    logCacheOperation(operation, modelId, strategy) {
        this.outputChannel.appendLine(`[${new Date().toISOString()}] ${operation} - Model: ${modelId}${strategy ? ` (${strategy})` : ''}`);
        const stats = this.getCacheStats();
        this.outputChannel.appendLine(`Cache Stats: ${JSON.stringify(stats, null, 2)}`);
    }
    handleError(message, error) {
        this.logger.error('[ModelCacheManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }
    dispose() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.memoryCache.clear();
        this.diskCache.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    }
};
exports.ModelCacheManager = ModelCacheManager;
exports.ModelCacheManager = ModelCacheManager = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof types_2.CacheConfig !== "undefined" && types_2.CacheConfig) === "function" ? _b : Object, String])
], ModelCacheManager);
//# sourceMappingURL=ModelCacheManager.js.map