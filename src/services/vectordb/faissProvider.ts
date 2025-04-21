import * as vscode from 'vscode';
import { VectorDatabaseProvider } from './provider';
import { VectorDocument, SearchResult, VectorDatabaseOptions, SearchOptions } from './models';
import { FaissProviderService } from './services/FaissProviderService';

export class FaissProvider implements VectorDatabaseProvider {
    public readonly name = 'FAISS';
    private service: FaissProviderService;

    constructor(context: vscode.ExtensionContext) {
        this.service = new FaissProviderService(context);
    }

    public get isAvailable(): boolean {
        return this.service.isAvailable;
    }

    public async initialize(options?: VectorDatabaseOptions): Promise<void> {
        return this.service.initialize(options);
    }

    public async addDocument(document: VectorDocument): Promise<string> {
        return this.service.addDocument(document);
    }

    public async addDocuments(documents: VectorDocument[]): Promise<string[]> {
        return this.service.addDocuments(documents);
    }

    public async getDocument(id: string): Promise<VectorDocument | null> {
        return this.service.getDocument(id);
    }

    public async updateDocument(id: string, document: Partial<VectorDocument>): Promise<boolean> {
        return this.service.updateDocument(id, document);
    }

    public async deleteDocument(id: string): Promise<boolean> {
        return this.service.deleteDocument(id);
    }

    public async deleteAll(): Promise<void> {
        return this.service.deleteAll();
    }

    public async search(query: string | number[], options?: SearchOptions): Promise<SearchResult[]> {
        return this.service.search(query, options);
    }

    public async getEmbedding(text: string): Promise<number[]> {
        return this.service.getEmbedding(text);
    }

    public async close(): Promise<void> {
        return this.service.close();
    }
}
