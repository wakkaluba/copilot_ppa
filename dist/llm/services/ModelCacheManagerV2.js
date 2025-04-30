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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelCacheManagerV2 = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let ModelCacheManagerV2 = class ModelCacheManagerV2 extends events_1.EventEmitter {
    logger;
    config;
    memoryCache = new Map();
    diskCache = new Map();
    metrics;
    outputChannel;
    cleanupInterval;
    constructor(logger, config = {
        maxMemorySize: 1024 * 1024 * 1024, // 1GB
        maxDiskSize: 5 * 1024 * 1024 * 1024, // 5GB
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        cleanupInterval: 15 * 60 * 1000, // 15 minutes
        compressionEnabled: true,
        persistPath: path.join(vscode.workspace.rootPath || '', '.model-cache')
    }) {
        super();
        this.logger = logger;
        this.config = config;
        this.outputChannel = vscode.window.createOutputChannel('Model Cache Manager');
        this.metrics = this.initializeMetrics();
        this.initializeCache();
        this.cleanupInterval = setInterval(() => this.runCleanup(), this.config.cleanupInterval);
    }
    initializeMetrics() {
        return {
            memoryUsed: 0,
            diskUsed: 0,
            memoryHits: 0,
            diskHits: 0,
            misses: 0,
            evictions: 0
        };
    }
    initializeCache() {
        if (!fs.existsSync(this.config.persistPath)) {
            fs.mkdirSync(this.config.persistPath, { recursive: true });
        }
        this.loadPersistedCache();
    }
    async get(key) {
        try {
            // Check memory cache first
            const memoryItem = this.memoryCache.get(key);
            if (memoryItem && !this.isExpired(memoryItem)) {
                this.metrics.memoryHits++;
                this.updateItemAccess(key, memoryItem);
                return memoryItem.data;
            }
            // Check disk cache
            const diskPath = this.diskCache.get(key);
            if (diskPath && fs.existsSync(diskPath)) {
                const diskItem = await this.loadFromDisk(diskPath);
                if (diskItem) {
                    this.metrics.diskHits++;
                    // Promote to memory if possible
                    await this.promoteToMemory(key, diskItem);
                    return diskItem;
                }
            }
            this.metrics.misses++;
            return null;
        }
        catch (error) {
            this.handleError(`Failed to retrieve item: ${key}`, error);
            throw error;
        }
    }
    async set(key, value) {
        try {
            const size = this.estimateSize(value);
            const item = {
                data: value,
                size,
                lastAccess: Date.now(),
                accessCount: 1
            };
            // Try memory cache first
            if (size <= this.getAvailableMemory()) {
                await this.setInMemory(key, item);
            }
            else {
                // Fall back to disk if too large for memory
                await this.setOnDisk(key, value);
            }
            this.emit('itemCached', { key, location: size <= this.getAvailableMemory() ? 'memory' : 'disk' });
        }
        catch (error) {
            this.handleError(`Failed to cache item: ${key}`, error);
            throw error;
        }
    }
    async setInMemory(key, item) {
        while (this.metrics.memoryUsed + item.size > this.config.maxMemorySize) {
            if (!this.evictFromMemory()) {
                throw new Error('Unable to make space in memory cache');
            }
        }
        this.memoryCache.set(key, item);
        this.metrics.memoryUsed += item.size;
    }
    async setOnDisk(key, value) {
        const diskPath = this.getDiskPath(key);
        while (this.metrics.diskUsed + this.estimateSize(value) > this.config.maxDiskSize) {
            if (!await this.evictFromDisk()) {
                throw new Error('Unable to make space in disk cache');
            }
        }
        await this.saveToDisk(diskPath, value);
        this.diskCache.set(key, diskPath);
    }
    async promoteToMemory(key, value) {
        const size = this.estimateSize(value);
        if (size <= this.getAvailableMemory()) {
            await this.setInMemory(key, {
                data: value,
                size,
                lastAccess: Date.now(),
                accessCount: 1
            });
        }
    }
    async loadFromDisk(filePath) {
        try {
            const data = await fs.promises.readFile(filePath, 'utf8');
            const cached = JSON.parse(data);
            if (this.isExpired(cached)) {
                await fs.promises.unlink(filePath);
                return null;
            }
            return cached.data;
        }
        catch (error) {
            this.handleError(`Failed to load from disk: ${filePath}`, error);
            return null;
        }
    }
    async saveToDisk(filePath, value) {
        const data = {
            data: value,
            timestamp: new Date()
        };
        await fs.promises.writeFile(filePath, JSON.stringify(data), 'utf8');
        this.metrics.diskUsed += this.estimateSize(value);
    }
    evictFromMemory() {
        const lruKey = this.findLRUKey();
        if (!lruKey)
            return false;
        const item = this.memoryCache.get(lruKey);
        this.memoryCache.delete(lruKey);
        this.metrics.memoryUsed -= item.size;
        this.metrics.evictions++;
        return true;
    }
    async evictFromDisk() {
        const oldestKey = this.findOldestDiskKey();
        if (!oldestKey)
            return false;
        const filePath = this.diskCache.get(oldestKey);
        try {
            const stats = await fs.promises.stat(filePath);
            await fs.promises.unlink(filePath);
            this.diskCache.delete(oldestKey);
            this.metrics.diskUsed -= stats.size;
            this.metrics.evictions++;
            return true;
        }
        catch (error) {
            this.handleError(`Failed to evict from disk: ${filePath}`, error);
            return false;
        }
    }
    async invalidate(key) {
        try {
            // Remove from memory
            const memoryItem = this.memoryCache.get(key);
            if (memoryItem) {
                this.metrics.memoryUsed -= memoryItem.size;
                this.memoryCache.delete(key);
            }
            // Remove from disk
            const diskPath = this.diskCache.get(key);
            if (diskPath && fs.existsSync(diskPath)) {
                const stats = await fs.promises.stat(diskPath);
                await fs.promises.unlink(diskPath);
                this.metrics.diskUsed -= stats.size;
                this.diskCache.delete(key);
            }
            this.emit('itemInvalidated', { key });
        }
        catch (error) {
            this.handleError(`Failed to invalidate item: ${key}`, error);
            throw error;
        }
    }
    async runCleanup() {
        try {
            const now = Date.now();
            // Cleanup memory cache
            for (const [key, item] of Array.from(this.memoryCache.entries())) {
                if (this.isExpired(item)) {
                    await this.invalidate(key);
                }
            }
            // Cleanup disk cache
            for (const [key, filePath] of Array.from(this.diskCache.entries())) {
                if (!fs.existsSync(filePath)) {
                    this.diskCache.delete(key);
                    continue;
                }
                try {
                    const data = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
                    if (this.isExpired(data)) {
                        await this.invalidate(key);
                    }
                }
                catch (error) {
                    await this.invalidate(key);
                }
            }
            this.emit('cleanup', this.getMetrics());
        }
        catch (error) {
            this.handleError('Failed to run cleanup', error);
        }
    }
    updateItemAccess(key, item) {
        item.lastAccess = Date.now();
        item.accessCount++;
    }
    isExpired(item) {
        const timestamp = item.lastAccess || item.timestamp;
        return timestamp ? Date.now() - timestamp > this.config.ttl : true;
    }
    findLRUKey() {
        let lruKey;
        let lruTime = Infinity;
        for (const [key, item] of Array.from(this.memoryCache.entries())) {
            if (item.lastAccess < lruTime) {
                lruTime = item.lastAccess;
                lruKey = key;
            }
        }
        return lruKey;
    }
    findOldestDiskKey() {
        let oldestKey;
        let oldestTime = Infinity;
        for (const [key, filePath] of Array.from(this.diskCache.entries())) {
            try {
                const stats = fs.statSync(filePath);
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
    }
    getAvailableMemory() {
        return this.config.maxMemorySize - this.metrics.memoryUsed;
    }
    getDiskPath(key) {
        return path.join(this.config.persistPath, `${key}.json`);
    }
    estimateSize(value) {
        return Buffer.byteLength(JSON.stringify(value));
    }
    getMetrics() {
        return { ...this.metrics };
    }
    async loadPersistedCache() {
        try {
            const files = await fs.promises.readdir(this.config.persistPath);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const key = file.slice(0, -5);
                    const filePath = path.join(this.config.persistPath, file);
                    this.diskCache.set(key, filePath);
                }
            }
        }
        catch (error) {
            this.handleError('Failed to load persisted cache', error);
        }
    }
    handleError(message, error) {
        this.logger.error(`[ModelCacheManager] ${message}: ${error.message}`);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }
    logOperation(operation, details) {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ${operation}: ${JSON.stringify(details)}`);
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
exports.ModelCacheManagerV2 = ModelCacheManagerV2;
exports.ModelCacheManagerV2 = ModelCacheManagerV2 = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ILogger')),
    __metadata("design:paramtypes", [Object, Object])
], ModelCacheManagerV2);
//# sourceMappingURL=ModelCacheManagerV2.js.map