import * as vscode from 'vscode';
import { VectorDatabaseProvider } from './provider';
import { VectorDocument, SearchResult, VectorDatabaseOptions, SearchOptions } from './models';
export declare class ChromaProvider implements VectorDatabaseProvider {
    readonly name = "Chroma";
    private readonly clientService;
    private readonly embeddingService;
    private readonly documentService;
    constructor(context: vscode.ExtensionContext);
    get isAvailable(): boolean;
    initialize(options?: VectorDatabaseOptions): Promise<void>;
    addDocument(document: VectorDocument): Promise<string>;
    addDocuments(documents: VectorDocument[]): Promise<string[]>;
    getDocument(id: string): Promise<VectorDocument | null>;
    updateDocument(id: string, document: Partial<VectorDocument>): Promise<boolean>;
    deleteDocument(id: string): Promise<boolean>;
    deleteAll(): Promise<void>;
    search(query: string | number[], options?: SearchOptions): Promise<SearchResult[]>;
    getEmbedding(text: string): Promise<number[]>;
    close(): Promise<void>;
}
