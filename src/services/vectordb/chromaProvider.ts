import * as vscode from 'vscode';
import * as path from 'path';
import * as crypto from 'crypto';
import { VectorDatabaseProvider } from './provider';
import { VectorDocument, SearchResult, VectorDatabaseOptions, SearchOptions } from './models';

/**
 * Provider for Chroma vector database
 */
export class ChromaProvider implements VectorDatabaseProvider {
    public readonly name = 'Chroma';
    private _isAvailable = false;
    private _client: any = null;
    private _collection: any = null;
    private _embedder: any = null;
    private _storageDir: string;
    
    constructor(context: vscode.ExtensionContext) {
        // Store Chroma databases in the extension's global storage directory
        this._storageDir = path.join(context.globalStorageUri.fsPath, 'chroma');
    }
    
    public get isAvailable(): boolean {
        return this._isAvailable;
    }
    
    public async initialize(options?: VectorDatabaseOptions): Promise<void> {
        try {
            // Dynamic imports to avoid requiring these packages
            // until they're actually needed
            const { ChromaClient } = await import('chromadb');
            const { PersistentClient } = await import('chromadb');
            const { OpenAIEmbeddingFunction } = await import('chromadb');
            
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
            } else {
                // If no API key, we'll need to handle embedding differently
                throw new Error('OpenAI API key is required for embeddings');
            }
            
            this._isAvailable = true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize Chroma: ${error.message}`);
            console.error('Chroma initialization error:', error);
            this._isAvailable = false;
            throw error;
        }
    }
    
    public async addDocument(document: VectorDocument): Promise<string> {
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
    
    public async addDocuments(documents: VectorDocument[]): Promise<string[]> {
        if (!this._isAvailable || !this._collection) {
            throw new Error('Chroma is not initialized');
        }
        
        const ids: string[] = [];
        const embeddings: number[][] = [];
        const metadatas: Record<string, any>[] = [];
        const contents: string[] = [];
        
        // Prepare document batches
        for (const doc of documents) {
            const id = doc.id || this._generateId();
            ids.push(id);
            
            // Get embedding if not provided
            if (doc.embedding) {
                embeddings.push(doc.embedding);
            } else {
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
    
    public async getDocument(id: string): Promise<VectorDocument | null> {
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
    
    public async updateDocument(id: string, document: Partial<VectorDocument>): Promise<boolean> {
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
        const updated: VectorDocument = {
            id,
            content: document.content || existing.content,
            metadata: document.metadata || existing.metadata,
            embedding: document.embedding || (document.content ? await this.getEmbedding(document.content) : existing.embedding)
        };
        
        await this.addDocument(updated);
        return true;
    }
    
    public async deleteDocument(id: string): Promise<boolean> {
        if (!this._isAvailable || !this._collection) {
            throw new Error('Chroma is not initialized');
        }
        
        try {
            await this._collection.delete({
                ids: [id]
            });
            return true;
        } catch (error) {
            console.error('Error deleting document:', error);
            return false;
        }
    }
    
    public async deleteAll(): Promise<void> {
        if (!this._isAvailable || !this._collection) {
            throw new Error('Chroma is not initialized');
        }
        
        await this._collection.delete({});
    }
    
    public async search(query: string | number[], options?: SearchOptions): Promise<SearchResult[]> {
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
        
        const searchResults: SearchResult[] = [];
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
    
    public async getEmbedding(text: string): Promise<number[]> {
        if (!this._embedder) {
            throw new Error('Embedder is not initialized');
        }
        
        try {
            return await this._embedder.generate(text);
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }
    
    public async close(): Promise<void> {
        if (this._client) {
            await this._client.close();
            this._client = null;
            this._collection = null;
            this._isAvailable = false;
        }
    }
    
    private _generateId(): string {
        return crypto.randomUUID();
    }
}
