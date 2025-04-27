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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineCache = void 0;
const vscode = __importStar(require("vscode"));
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class OfflineCache {
    constructor() {
        this.cachePath = path.join(vscode.workspace.rootPath || '', '.llm-cache');
        this.memoryCache = new Map();
    }
    async initialize() {
        await fs.mkdir(this.cachePath, { recursive: true });
        await this.loadCache();
    }
    async loadCache() {
        const files = await fs.readdir(this.cachePath);
        for (const file of files) {
            const content = await fs.readFile(path.join(this.cachePath, file), 'utf-8');
            this.memoryCache.set(file.replace('.json', ''), JSON.parse(content));
        }
    }
    async get(key) {
        return this.memoryCache.get(this.hashKey(key)) || null;
    }
    async set(key, value) {
        const hashedKey = this.hashKey(key);
        this.memoryCache.set(hashedKey, value);
        await fs.writeFile(path.join(this.cachePath, `${hashedKey}.json`), JSON.stringify(value));
    }
    hashKey(key) {
        return crypto.createHash('md5').update(key).digest('hex');
    }
}
exports.OfflineCache = OfflineCache;
//# sourceMappingURL=offlineCache.js.map