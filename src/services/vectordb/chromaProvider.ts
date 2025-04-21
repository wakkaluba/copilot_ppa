import * as vscode from 'vscode';
import { VectorDatabaseProvider } from './provider';
import { VectorDocument, SearchResult, VectorDatabaseOptions, SearchOptions } from './models';
import { ChromaClientService } from './services/ChromaClientService';
import { ChromaEmbeddingService } from './services/ChromaEmbeddingService';
import { ChromaDocumentService } from './services/ChromaDocumentService';

export class ChromaProvider implements VectorDatabaseProvider {
    public readonly name = 'Chroma';
    private readonly clientService: ChromaClientService;
    private readonly embeddingService: ChromaEmbeddingService;
    private readonly documentService: ChromaDocumentService;
    
    constructor(context: vscode.ExtensionContext) {
        this.clientService = new ChromaClientService(context);
        this.embeddingService = new ChromaEmbeddingService();
        this.documentService = new ChromaDocumentService();
    }
    
    public get isAvailable(): boolean {
        return this.clientService.isAvailable;
    }
    
    public async initialize(options?: VectorDatabaseOptions): Promise<void> {
        try {
            await this.clientService.initialize();
            await this.embeddingService.initialize();
            this.documentService.setCollection(this.clientService.getCollection());
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize Chroma: ${error.message}`);
            console.error('Chroma initialization error:', error);
            throw error;
        }
    }
    
    public async addDocument(document: VectorDocument): Promise<string> {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        
        const embedding = document.embedding || await this.getEmbedding(document.content);
        return this.documentService.addDocument({ ...document, embedding });
    }
    
    public async addDocuments(documents: VectorDocument[]): Promise<string[]> {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        
        const processedDocs = await Promise.all(documents.map(async doc => ({
            ...doc,
            embedding: doc.embedding || await this.getEmbedding(doc.content)
        })));
        
        return this.documentService.addDocuments(processedDocs);
    }
    
    public async getDocument(id: string): Promise<VectorDocument | null> {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        
        return this.documentService.getDocument(id);
    }
    
    public async updateDocument(id: string, document: Partial<VectorDocument>): Promise<boolean> {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        
        if (document.content && !document.embedding) {
            document.embedding = await this.getEmbedding(document.content);
        }
        
        return this.documentService.updateDocument(id, document);
    }
    
    public async deleteDocument(id: string): Promise<boolean> {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        
        return this.documentService.deleteDocument(id);
    }
    
    public async deleteAll(): Promise<void> {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        
        await this.documentService.deleteAll();
    }
    
    public async search(query: string | number[], options?: SearchOptions): Promise<SearchResult[]> {
        if (!this.isAvailable) {
            throw new Error('Chroma is not initialized');
        }
        
        const queryEmbedding = Array.isArray(query)
            ? query
            : await this.getEmbedding(query);
            
        return this.documentService.search(queryEmbedding, options);
    }
    
    public async getEmbedding(text: string): Promise<number[]> {
        return this.embeddingService.generateEmbedding(text);
    }
    
    public async close(): Promise<void> {
        await this.clientService.close();
        this.documentService.reset();
    }
}
