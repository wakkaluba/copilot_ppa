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
exports.ChromaProvider = void 0;
const vscode = __importStar(require("vscode"));
const ChromaClientService_1 = require("./services/ChromaClientService");
const ChromaEmbeddingService_1 = require("./services/ChromaEmbeddingService");
const ChromaDocumentService_1 = require("./services/ChromaDocumentService");
class ChromaProvider {
    constructor(context) {
        this.name = 'Chroma';
        this.clientService = new ChromaClientService_1.ChromaClientService(context);
        this.embeddingService = new ChromaEmbeddingService_1.ChromaEmbeddingService();
        this.documentService = new ChromaDocumentService_1.ChromaDocumentService();
    }
    get isAvailable() {
        return this.clientService.isAvailable;
    }
    async initialize(options) {
        try {
            await this.clientService.initialize();
            await this.embeddingService.initialize();
            this.documentService.setCollection(this.clientService.getCollection());
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize Chroma: ${error.message}`);
            console.error('Chroma initialization error:', error);
            throw error;
        }
    }
    async addDocument(document) {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        const embedding = document.embedding || await this.getEmbedding(document.content);
        return this.documentService.addDocument({ ...document, embedding });
    }
    async addDocuments(documents) {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        const processedDocs = await Promise.all(documents.map(async (doc) => ({
            ...doc,
            embedding: doc.embedding || await this.getEmbedding(doc.content)
        })));
        return this.documentService.addDocuments(processedDocs);
    }
    async getDocument(id) {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        return this.documentService.getDocument(id);
    }
    async updateDocument(id, document) {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        if (document.content && !document.embedding) {
            document.embedding = await this.getEmbedding(document.content);
        }
        return this.documentService.updateDocument(id, document);
    }
    async deleteDocument(id) {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        return this.documentService.deleteDocument(id);
    }
    async deleteAll() {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        await this.documentService.deleteAll();
    }
    async search(query, options) {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        const queryEmbedding = Array.isArray(query)
            ? query
            : await this.getEmbedding(query);
        return this.documentService.search(queryEmbedding, options);
    }
    async getEmbedding(text) {
        return this.embeddingService.generateEmbedding(text);
    }
    async close() {
        await this.clientService.close();
        this.documentService.reset();
    }
}
exports.ChromaProvider = ChromaProvider;
//# sourceMappingURL=chromaProvider.js.map