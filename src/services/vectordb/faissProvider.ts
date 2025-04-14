import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { VectorDatabaseProvider } from './provider';
import { VectorDocument, SearchResult, VectorDatabaseOptions, SearchOptions } from './models';

/**
 * Provider for FAISS vector database
 */
export class FaissProvider implements VectorDatabaseProvider {
    public readonly name = 'FAISS';
    private _isAvailable = false;
    private _docStore: Map<string, Omit<VectorDocument, 'embedding'>> = new Map();
    private _faiss: any = null;
    private _index: any = null;
    private _embedder: any = null;
    private _dimensions = 1536; // Default dimension for OpenAI embeddings
    private _metric = 'cosine';
    private _storageDir: string;
    private _indexPath: string;
    private _docStorePath: string;
    
    constructor(context: vscode.ExtensionContext) {
        // Store FAISS index in the extension's global storage directory
        this._storageDir = path.join(context.globalStorageUri.fsPath, 'faiss');
        this._indexPath = path.join(this._storageDir, 'index.faiss');
        this._docStorePath = path.join(this._storageDir, 'docstore.json');
    }
    
    public get isAvailable(): boolean {
        return this._isAvailable;
    }
    
    public async initialize(options?: VectorDatabaseOptions): Promise<void> {
        try {
            // Use user-specified options if provided
            if (options) {
                if (options.dimensions) this._dimensions = options.dimensions;
                if (options.metric) this._metric = options.metric;
            }
            
            // Create storage directory if it doesn't exist
            if (!fs.existsSync(this._storageDir)) {
                fs.mkdirSync(this._storageDir, { recursive: true });
            }
            
            // Dynamic imports to avoid requiring these packages
            // until they're actually needed
            const faissNode = await import('faiss-node');
            const { IndexFlatIP, IndexFlatL2, MetricType } = faissNode;
            
            // Initialize embedder - using OpenAI's embedding API
            // In a production app, we'd prefer to use a local model
            const apiKey = vscode.workspace.getConfiguration('copilotPPA').get('openaiApiKey');
            if (apiKey) {
                const { OpenAIEmbeddings } = await import('langchain/embeddings/openai');
                this._embedder = new OpenAIEmbeddings({
                    openAIApiKey: apiKey,
                    modelName: 'text-embedding-ada-002'
                });
            } else {
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
            } else {
                // Create new index
                const metricType = this._metric === 'cosine' 
                    ? MetricType.METRIC_INNER_PRODUCT 
                    : MetricType.METRIC_L2;
                
                if (metricType === MetricType.METRIC_INNER_PRODUCT) {
                    this._index = new IndexFlatIP(this._dimensions);
                } else {
                    this._index = new IndexFlatL2(this._dimensions);
                }
                
                // Save empty index
                await this._index.writeToFile(this._indexPath);
                
                // Save empty document store
                fs.writeFileSync(this._docStorePath, JSON.stringify({}));
            }
            
            this._isAvailable = true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize FAISS: ${error.message}`);
            console.error('FAISS initialization error:', error);
            this._isAvailable = false;
            throw error;
        }
    }
    
    public async addDocument(document: VectorDocument): Promise<string> {
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
    
    public async addDocuments(documents: VectorDocument[]): Promise<string[]> {
        if (!this._isAvailable || !this._index) {
            throw new Error('FAISS is not initialized');
        }
        
        const ids: string[] = [];
        const embeddings: number[][] = [];
        
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
    
    public async getDocument(id: string): Promise<VectorDocument | null> {
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
    
    public async updateDocument(id: string, document: Partial<VectorDocument>): Promise<boolean> {
        if (!this._isAvailable) {
            throw new Error('FAISS is not initialized');
        }
        
        // FAISS doesn't support direct updates, so we need to
        // recreate the entire index if we want to update a document
        // For simplicity, we'll just throw an error here
        throw new Error('Document updates are not supported in FAISS. Delete and add again instead.');
    }
    
    public async deleteDocument(id: string): Promise<boolean> {
        if (!this._isAvailable) {
            throw new Error('FAISS is not initialized');
        }
        
        // FAISS doesn't support direct deletions, so we need to
        // recreate the entire index if we want to remove a document
        // For simplicity, we'll just throw an error here
        throw new Error('Document deletions are not supported in FAISS. Create a new index instead.');
    }
    
    public async deleteAll(): Promise<void> {
        if (!this._isAvailable || !this._index) {
            throw new Error('FAISS is not initialized');
        }
        
        // Create a new empty index
        const faissNode = await import('faiss-node');
        const { IndexFlatIP, IndexFlatL2, MetricType } = faissNode;
        
        const metricType = this._metric === 'cosine' 
            ? MetricType.METRIC_INNER_PRODUCT 
            : MetricType.METRIC_L2;
        
        if (metricType === MetricType.METRIC_INNER_PRODUCT) {
            this._index = new IndexFlatIP(this._dimensions);
        } else {
            this._index = new IndexFlatL2(this._dimensions);
        }
        
        // Clear document store
        this._docStore.clear();
        
        // Save changes
        await this._saveIndex();
        await this._saveDocStore();
    }
    
    public async search(query: string | number[], options?: SearchOptions): Promise<SearchResult[]> {
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
        const documents: SearchResult[] = [];
        
        // Map of docstore ID to FAISS index
        const idMap = Array.from(this._docStore.keys());
        
        for (let i = 0; i < searchResults.distances.length; i++) {
            const faissIndex = searchResults.labels[i];
            const distance = searchResults.distances[i];
            
            // Skip if FAISS returns -1 (no match)
            if (faissIndex === -1) continue;
            
            // Get the document ID from our mapping
            // This assumes documents were added in the same order they appear in the FAISS index
            const id = idMap[faissIndex];
            if (!id) continue;
            
            const doc = this._docStore.get(id);
            if (!doc) continue;
            
            // Calculate similarity score (convert distance to similarity)
            // For cosine similarity, FAISS returns the inner product, which is already a similarity measure
            // For L2 distance, smaller values are better, so we convert to a similarity
            let score = this._metric === 'cosine' 
                ? distance  // Already a similarity
                : 1 / (1 + distance);  // Convert distance to similarity
                
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
                if (!matches) continue;
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
    
    public async getEmbedding(text: string): Promise<number[]> {
        if (!this._embedder) {
            throw new Error('Embedder is not initialized');
        }
        
        try {
            const embeddings = await this._embedder.embedQuery(text);
            return embeddings;
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }
    
    public async close(): Promise<void> {
        if (this._index) {
            // Save any pending changes
            await this._saveIndex();
            await this._saveDocStore();
            
            this._index = null;
            this._isAvailable = false;
        }
    }
    
    private async _saveIndex(): Promise<void> {
        if (this._index) {
            await this._index.writeToFile(this._indexPath);
        }
    }
    
    private async _saveDocStore(): Promise<void> {
        const docStoreData = Object.fromEntries(this._docStore);
        fs.writeFileSync(this._docStorePath, JSON.stringify(docStoreData, null, 2));
    }
    
    private _generateId(): string {
        return crypto.randomUUID();
    }
}
