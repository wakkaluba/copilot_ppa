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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelCacheManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DEFAULT_CACHE_CONFIG = {
    maxMemorySize: 1024 * 1024 * 1024, // 1GB
    maxItems: 100,
    ttl: 60 * 60 * 1000, // 1 hour
    cleanupInterval: 5 * 60 * 1000 // 5 minutes
};
let ModelCacheManager = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelCacheManager = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelCacheManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        cacheConfig;
        cacheDir;
        memoryCache = new Map();
        diskCache = new Map();
        outputChannel;
        cleanupInterval = null;
        cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            memoryUsed: 0
        };
        constructor(logger, cacheConfig = DEFAULT_CACHE_CONFIG, cacheDir = path_1.default.join(vscode.workspace.rootPath || '', '.model-cache')) {
            super();
            this.logger = logger;
            this.cacheConfig = cacheConfig;
            this.cacheDir = cacheDir;
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
                timestamp: Date.now(),
                size
            });
            this.cacheStats.memoryUsed += size;
        }
        async cacheOnDisk(key, model) {
            const filePath = path_1.default.join(this.cacheDir, `${key}.json`);
            await fs_1.default.promises.writeFile(filePath, JSON.stringify({ model, timestamp: Date.now() }), 'utf8');
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
    return ModelCacheManager = _classThis;
})();
exports.ModelCacheManager = ModelCacheManager;
//# sourceMappingURL=ModelCacheManager.js.map