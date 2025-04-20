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
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
/**
 * Provider for Chroma vector database
 */
class ChromaProvider {
    name = 'Chroma';
    _isAvailable = false;
    _client = null;
    _collection = null;
    _embedder = null;
    _storageDir;
    constructor(context) {
        // Store Chroma databases in the extension's global storage directory
        this._storageDir = path.join(context.globalStorageUri.fsPath, 'chroma');
    }
    get isAvailable() {
        return this._isAvailable;
    }
    async initialize(options) {
        try {
            // Dynamic imports to avoid requiring these packages
            // until they're actually needed
            const { ChromaClient } = await Promise.resolve().then(() => __importStar(require('chromadb')));
            const { PersistentClient } = await Promise.resolve().then(() => __importStar(require('chromadb')));
            const { OpenAIEmbeddingFunction } = await Promise.resolve().then(() => __importStar(require('chromadb')));
            // Create directory if it doesn't exist
            const fs = require('fs');
            if (!fs.existsSync(this._storageDir)) {
                fs.mkdirSync(this._storageDir, { recursive: true });
            }
            // Initialize Chroma client
            this._client = new PersistentClient({
                path: this._storageDir
            });
            // Create or get collection
            this._collection = await this._client.getOrCreateCollection({
                name: 'code_documents',
                metadata: {
                    'description': 'VSCode extension code documents'
                }
            });
            // Initialize embedding function using OpenAI
            // Note: In a real implementation, we might want to use a local model
            const apiKey = vscode.workspace.getConfiguration('copilotPPA').get('openaiApiKey');
            if (apiKey) {
                this._embedder = new OpenAIEmbeddingFunction({
                    openai_api_key: apiKey,
                    model_name: 'text-embedding-ada-002'
                });
            }
            else {
                // If no API key, we'll need to handle embedding differently
                throw new Error('OpenAI API key is required for embeddings');
            }
            this._isAvailable = true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize Chroma: ${error.message}`);
            console.error('Chroma initialization error:', error);
            this._isAvailable = false;
            throw error;
        }
    }
    async addDocument(document) {
        if (!this._isAvailable || !this._collection) {
            throw new Error('Chroma is not initialized');
        }
        const id = document.id || this._generateId();
        // Get embedding if not provided
        const embedding = document.embedding || await this.getEmbedding(document.content);
        await this._collection.add({
            ids: [id],
            embeddings: [embedding],
            metadatas: [document.metadata || {}],
            documents: [document.content]
        });
        return id;
    }
    async addDocuments(documents) {
        if (!this._isAvailable || !this._collection) {
            throw new Error('Chroma is not initialized');
        }
        const ids = [];
        const embeddings = [];
        const metadatas = [];
        const contents = [];
        // Prepare document batches
        for (const doc of documents) {
            const id = doc.id || this._generateId();
            ids.push(id);
            // Get embedding if not provided
            if (doc.embedding) {
                embeddings.push(doc.embedding);
            }
            else {
                const embedding = await this.getEmbedding(doc.content);
                embeddings.push(embedding);
            }
            metadatas.push(doc.metadata || {});
            contents.push(doc.content);
        }
        await this._collection.add({
            ids: ids,
            embeddings: embeddings,
            metadatas: metadatas,
            documents: contents
        });
        return ids;
    }
    async getDocument(id) {
        if (!this._isAvailable || !this._collection) {
            throw new Error('Chroma is not initialized');
        }
        const result = await this._collection.get({
            ids: [id],
            include: ['embeddings', 'metadatas', 'documents']
        });
        if (result.ids.length === 0) {
            return null;
        }
        return {
            id: result.ids[0],
            content: result.documents[0],
            metadata: result.metadatas[0],
            embedding: result.embeddings[0]
        };
    }
    async updateDocument(id, document) {
        if (!this._isAvailable || !this._collection) {
            throw new Error('Chroma is not initialized');
        }
        const existing = await this.getDocument(id);
        if (!existing) {
            return false;
        }
        // Delete the existing document
        await this.deleteDocument(id);
        // Add the updated document
        const updated = {
            id,
            content: document.content || existing.content,
            metadata: document.metadata || existing.metadata,
            embedding: document.embedding || (document.content ? await this.getEmbedding(document.content) : existing.embedding)
        };
        await this.addDocument(updated);
        return true;
    }
    async deleteDocument(id) {
        if (!this._isAvailable || !this._collection) {
            throw new Error('Chroma is not initialized');
        }
        try {
            await this._collection.delete({
                ids: [id]
            });
            return true;
        }
        catch (error) {
            console.error('Error deleting document:', error);
            return false;
        }
    }
    async deleteAll() {
        if (!this._isAvailable || !this._collection) {
            throw new Error('Chroma is not initialized');
        }
        await this._collection.delete({});
    }
    async search(query, options) {
        if (!this._isAvailable || !this._collection) {
            throw new Error('Chroma is not initialized');
        }
        const queryEmbedding = Array.isArray(query)
            ? query
            : await this.getEmbedding(query);
        const result = await this._collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: options?.limit || 10,
            include: ['embeddings', 'metadatas', 'documents', 'distances'],
            where: options?.filter
        });
        if (!result.ids[0] || result.ids[0].length === 0) {
            return [];
        }
        const searchResults = [];
        for (let i = 0; i < result.ids[0].length; i++) {
            // Calculate score from distance (convert distance to similarity score)
            const distance = result.distances[0][i];
            const score = 1 / (1 + distance); // Convert distance to similarity score between 0 and 1
            if (options?.minScore && score < options.minScore) {
                continue;
            }
            searchResults.push({
                document: {
                    id: result.ids[0][i],
                    content: result.documents[0][i],
                    metadata: result.metadatas[0][i],
                    embedding: result.embeddings[0][i]
                },
                score
            });
        }
        return searchResults;
    }
    async getEmbedding(text) {
        if (!this._embedder) {
            throw new Error('Embedder is not initialized');
        }
        try {
            return await this._embedder.generate(text);
        }
        catch (error) {
            console.error('Error generating embedding:', error);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }
    async close() {
        if (this._client) {
            await this._client.close();
            this._client = null;
            this._collection = null;
            this._isAvailable = false;
        }
    }
    _generateId() {
        return crypto.randomUUID();
    }
}
exports.ChromaProvider = ChromaProvider;
//# sourceMappingURL=chromaProvider.js.map