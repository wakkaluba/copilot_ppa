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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileIndexer = void 0;
const vscode = __importStar(require("vscode"));
class FileIndexer {
    index;
    workers;
    constructor() {
        this.index = new Map();
        this.workers = [];
    }
    async buildIndex() {
        const files = await vscode.workspace.findFiles('**/*.*');
        const chunks = this.splitWork(files);
        await Promise.all(chunks.map(chunk => this.indexChunk(chunk)));
    }
    async searchIndex(query) {
        const terms = query.toLowerCase().split(/\s+/);
        const results = terms.map(term => this.index.get(term) || new Set());
        return Array.from(this.intersectSets(results));
    }
    splitWork(files) {
        const workerCount = require('os').cpus().length;
        return Array.from({ length: workerCount }, (_, i) => files.filter((_, index) => index % workerCount === i));
    }
    async indexChunk(files) {
        // Index chunk of files using worker thread
    }
    intersectSets(sets) {
        return sets.reduce((a, b) => new Set([...a].filter(x => b.has(x))));
    }
}
exports.FileIndexer = FileIndexer;
//# sourceMappingURL=fileIndexer.js.map