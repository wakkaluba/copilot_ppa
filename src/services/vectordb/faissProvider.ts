import * as vscode from 'vscode';
import { VectorDatabaseProvider } from './provider';
import { VectorDocument, SearchResult, VectorDatabaseOptions, SearchOptions } from './models';
import { LoggerService } from '../LoggerService';
import { FaissProviderService } from './services/FaissProviderService';

/**
 * Provides FAISS vector database functionality with comprehensive error handling
 */
export class FaissProvider implements VectorDatabaseProvider {
    public readonly name = 'FAISS';
    private readonly service: FaissProviderService;
    private readonly logger: LoggerService;
    private disposed = false;

    constructor(context: vscode.ExtensionContext) {
        this.service = new FaissProviderService(context);
        this.logger = LoggerService.getInstance();
    }

    public get isAvailable(): boolean {
        try {
            return this.service.isAvailable;
        } catch (error) {
            this.handleError('Failed to check availability', error);
            return false;
        }
    }

    public async initialize(options?: VectorDatabaseOptions): Promise<void> {
        try {
            this.validateInitialization();
            await this.service.initialize(options);
        } catch (error) {
            this.handleError('Failed to initialize FAISS provider', error);
            throw error;
        }
    }

    public async addDocument(document: VectorDocument): Promise<string> {
        try {
            this.validateDocument(document);
            return await this.service.addDocument(document);
        } catch (error) {
            this.handleError('Failed to add document', error);
            throw error;
        }
    }

    public async addDocuments(documents: VectorDocument[]): Promise<string[]> {
        try {
            documents.forEach(this.validateDocument.bind(this));
            return await this.service.addDocuments(documents);
        } catch (error) {
            this.handleError('Failed to add multiple documents', error);
            throw error;
        }
    }

    public async getDocument(id: string): Promise<VectorDocument | null> {
        try {
            this.validateId(id);
            return await this.service.getDocument(id);
        } catch (error) {
            this.handleError(`Failed to get document: ${id}`, error);
            return null;
        }
    }

    public async updateDocument(id: string, document: Partial<VectorDocument>): Promise<boolean> {
        try {
            this.validateId(id);
            this.validatePartialDocument(document);
            return await this.service.updateDocument(id, document);
        } catch (error) {
            this.handleError(`Failed to update document: ${id}`, error);
            return false;
        }
    }

    public async deleteDocument(id: string): Promise<boolean> {
        try {
            this.validateId(id);
            return await this.service.deleteDocument(id);
        } catch (error) {
            this.handleError(`Failed to delete document: ${id}`, error);
            return false;
        }
    }

    public async deleteAll(): Promise<void> {
        try {
            await this.service.deleteAll();
        } catch (error) {
            this.handleError('Failed to delete all documents', error);
            throw error;
        }
    }

    public async search(query: string | number[], options?: SearchOptions): Promise<SearchResult[]> {
        try {
            this.validateQuery(query);
            return await this.service.search(query, options);
        } catch (error) {
            this.handleError('Failed to execute search', error);
            return [];
        }
    }

    public async getEmbedding(text: string): Promise<number[]> {
        try {
            this.validateText(text);
            return await this.service.getEmbedding(text);
        } catch (error) {
            this.handleError('Failed to get embedding', error);
            return [];
        }
    }

    public async close(): Promise<void> {
        try {
            await this.service.close();
            this.disposed = true;
        } catch (error) {
            this.handleError('Failed to close FAISS provider', error);
            throw error;
        }
    }

    private validateInitialization(): void {
        if (this.disposed) {
            throw new Error('FAISS provider has been disposed');
        }
    }

    private validateDocument(document: VectorDocument): void {
        if (!document || typeof document !== 'object') {
            throw new Error('Invalid document format');
        }
    }

    private validatePartialDocument(document: Partial<VectorDocument>): void {
        if (!document || typeof document !== 'object') {
            throw new Error('Invalid partial document format');
        }
    }

    private validateId(id: string): void {
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid document ID');
        }
    }

    private validateQuery(query: string | number[]): void {
        if (typeof query !== 'string' && !Array.isArray(query)) {
            throw new Error('Invalid query format');
        }
        if (Array.isArray(query) && !query.every(n => typeof n === 'number')) {
            throw new Error('Query vector must contain only numbers');
        }
    }

    private validateText(text: string): void {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid text input');
        }
    }

    private handleError(message: string, error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`FaissProvider: ${message}`, errorMessage);
        // Don't throw here - let the calling method decide how to handle the error
    }
}
