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
exports.FaissProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
/**
 * Provider for FAISS vector database
 */
class FaissProvider {
    name = 'FAISS';
    _isAvailable = false;
    _docStore = new Map();
    _faiss = null;
    _index = null;
    _embedder = null;
    _dimensions = 1536; // Default dimension for OpenAI embeddings
    _metric = 'cosine';
    _storageDir;
    _indexPath;
    _docStorePath;
    constructor(context) {
        // Store FAISS index in the extension's global storage directory
        this._storageDir = path.join(context.globalStorageUri.fsPath, 'faiss');
        this._indexPath = path.join(this._storageDir, 'index.faiss');
        this._docStorePath = path.join(this._storageDir, 'docstore.json');
    }
    get isAvailable() {
        return this._isAvailable;
    }
    async initialize(options) {
        try {
            // Use user-specified options if provided
            if (options) {
                if (options.dimensions)
                    this._dimensions = options.dimensions;
                if (options.metric)
                    this._metric = options.metric;
            }
            // Create storage directory if it doesn't exist
            if (!fs.existsSync(this._storageDir)) {
                fs.mkdirSync(this._storageDir, { recursive: true });
            }
            // Dynamic imports to avoid requiring these packages
            // until they're actually needed
            const faissNode = await Promise.resolve().then(() => __importStar(require('faiss-node')));
            const { IndexFlatIP, IndexFlatL2, MetricType } = faissNode;
            // Initialize embedder - using OpenAI's embedding API
            // In a production app, we'd prefer to use a local model
            const apiKey = vscode.workspace.getConfiguration('copilotPPA').get('openaiApiKey');
            if (apiKey) {
                const { OpenAIEmbeddings } = await Promise.resolve().then(() => __importStar(require('langchain/embeddings/openai')));
                this._embedder = new OpenAIEmbeddings({
                    openAIApiKey: apiKey,
                    modelName: 'text-embedding-ada-002'
                });
            }
            else {
                // Fallback to a local embedding model
                throw new Error('OpenAI API key is required for embeddings');
            }
            // Create or load the FAISS index
            if (fs.existsSync(this._indexPath)) {
                // Load existing index
                this._index = await faissNode.Index.fromFile(this._indexPath);
                // Load document store
                if (fs.existsSync(this._docStorePath)) {
                    const docStoreData = JSON.parse(fs.readFileSync(this._docStorePath, 'utf8'));
                    this._docStore = new Map(Object.entries(docStoreData));
                }
            }
            else {
                // Create new index
                const metricType = this._metric === 'cosine'
                    ? MetricType.METRIC_INNER_PRODUCT
                    : MetricType.METRIC_L2;
                if (metricType === MetricType.METRIC_INNER_PRODUCT) {
                    this._index = new IndexFlatIP(this._dimensions);
                }
                else {
                    this._index = new IndexFlatL2(this._dimensions);
                }
                // Save empty index
                await this._index.writeToFile(this._indexPath);
                // Save empty document store
                fs.writeFileSync(this._docStorePath, JSON.stringify({}));
            }
            this._isAvailable = true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize FAISS: ${error.message}`);
            console.error('FAISS initialization error:', error);
            this._isAvailable = false;
            throw error;
        }
    }
    async addDocument(document) {
        if (!this._isAvailable || !this._index) {
            throw new Error('FAISS is not initialized');
        }
        const id = document.id || this._generateId();
        // Get embedding if not provided
        const embedding = document.embedding || await this.getEmbedding(document.content);
        // Add to FAISS index
        await this._index.add(embedding);
        // Save document metadata separately (FAISS only stores vectors)
        this._docStore.set(id, {
            id,
            content: document.content,
            metadata: document.metadata
        });
        // Save changes
        await this._saveIndex();
        await this._saveDocStore();
        return id;
    }
    async addDocuments(documents) {
        if (!this._isAvailable || !this._index) {
            throw new Error('FAISS is not initialized');
        }
        const ids = [];
        const embeddings = [];
        // Prepare document batches
        for (const doc of documents) {
            const id = doc.id || this._generateId();
            ids.push(id);
            // Get embedding if not provided
            const embedding = doc.embedding || await this.getEmbedding(doc.content);
            embeddings.push(embedding);
            // Save document metadata separately
            this._docStore.set(id, {
                id,
                content: doc.content,
                metadata: doc.metadata
            });
        }
        // Add to FAISS index
        await this._index.addAll(embeddings);
        // Save changes
        await this._saveIndex();
        await this._saveDocStore();
        return ids;
    }
    async getDocument(id) {
        if (!this._isAvailable) {
            throw new Error('FAISS is not initialized');
        }
        const doc = this._docStore.get(id);
        if (!doc) {
            return null;
        }
        return {
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
            // Note: We don't return the embedding as it's not directly accessible from FAISS
        };
    }
    async updateDocument(id, document) {
        if (!this._isAvailable) {
            throw new Error('FAISS is not initialized');
        }
        // FAISS doesn't support direct updates, so we need to
        // recreate the entire index if we want to update a document
        // For simplicity, we'll just throw an error here
        throw new Error('Document updates are not supported in FAISS. Delete and add again instead.');
    }
    async deleteDocument(id) {
        if (!this._isAvailable) {
            throw new Error('FAISS is not initialized');
        }
        // FAISS doesn't support direct deletions, so we need to
        // recreate the entire index if we want to remove a document
        // For simplicity, we'll just throw an error here
        throw new Error('Document deletions are not supported in FAISS. Create a new index instead.');
    }
    async deleteAll() {
        if (!this._isAvailable || !this._index) {
            throw new Error('FAISS is not initialized');
        }
        // Create a new empty index
        const faissNode = await Promise.resolve().then(() => __importStar(require('faiss-node')));
        const { IndexFlatIP, IndexFlatL2, MetricType } = faissNode;
        const metricType = this._metric === 'cosine'
            ? MetricType.METRIC_INNER_PRODUCT
            : MetricType.METRIC_L2;
        if (metricType === MetricType.METRIC_INNER_PRODUCT) {
            this._index = new IndexFlatIP(this._dimensions);
        }
        else {
            this._index = new IndexFlatL2(this._dimensions);
        }
        // Clear document store
        this._docStore.clear();
        // Save changes
        await this._saveIndex();
        await this._saveDocStore();
    }
    async search(query, options) {
        if (!this._isAvailable || !this._index) {
            throw new Error('FAISS is not initialized');
        }
        const queryEmbedding = Array.isArray(query)
            ? query
            : await this.getEmbedding(query);
        // Perform search
        const limit = options?.limit || 10;
        const searchResults = await this._index.search(queryEmbedding, limit);
        // Format results
        const documents = [];
        // Map of docstore ID to FAISS index
        const idMap = Array.from(this._docStore.keys());
        for (let i = 0; i < searchResults.distances.length; i++) {
            const faissIndex = searchResults.labels[i];
            const distance = searchResults.distances[i];
            // Skip if FAISS returns -1 (no match)
            if (faissIndex === -1)
                continue;
            // Get the document ID from our mapping
            // This assumes documents were added in the same order they appear in the FAISS index
            const id = idMap[faissIndex];
            if (!id)
                continue;
            const doc = this._docStore.get(id);
            if (!doc)
                continue;
            // Calculate similarity score (convert distance to similarity)
            // For cosine similarity, FAISS returns the inner product, which is already a similarity measure
            // For L2 distance, smaller values are better, so we convert to a similarity
            let score = this._metric === 'cosine'
                ? distance // Already a similarity
                : 1 / (1 + distance); // Convert distance to similarity
            if (options?.minScore && score < options.minScore) {
                continue;
            }
            // Filter by metadata if requested
            if (options?.filter && doc.metadata) {
                let matches = true;
                for (const [key, value] of Object.entries(options.filter)) {
                    if (doc.metadata[key] !== value) {
                        matches = false;
                        break;
                    }
                }
                if (!matches)
                    continue;
            }
            documents.push({
                document: {
                    id: doc.id,
                    content: doc.content,
                    metadata: doc.metadata
                },
                score
            });
        }
        return documents;
    }
    async getEmbedding(text) {
        if (!this._embedder) {
            throw new Error('Embedder is not initialized');
        }
        try {
            const embeddings = await this._embedder.embedQuery(text);
            return embeddings;
        }
        catch (error) {
            console.error('Error generating embedding:', error);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }
    async close() {
        if (this._index) {
            // Save any pending changes
            await this._saveIndex();
            await this._saveDocStore();
            this._index = null;
            this._isAvailable = false;
        }
    }
    async _saveIndex() {
        if (this._index) {
            await this._index.writeToFile(this._indexPath);
        }
    }
    async _saveDocStore() {
        const docStoreData = Object.fromEntries(this._docStore);
        fs.writeFileSync(this._docStorePath, JSON.stringify(docStoreData, null, 2));
    }
    _generateId() {
        return crypto.randomUUID();
    }
}
exports.FaissProvider = FaissProvider;
//# sourceMappingURL=faissProvider.js.map