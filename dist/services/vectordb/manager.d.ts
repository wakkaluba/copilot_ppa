import * as vscode from 'vscode';
import { VectorDatabaseProvider } from './provider';
import { VectorDocument, SearchResult, VectorDatabaseOptions, SearchOptions } from './models';
/**
 * Manager for vector database providers
 */
export declare class VectorDatabaseManager {
    private context;
    private providers;
    private activeProvider;
    private isEnabled;
    constructor(context: vscode.ExtensionContext);
    /**
     * Register a provider
     */
    registerProvider(provider: VectorDatabaseProvider): void;
    /**
     * Get a list of available providers
     */
    getProviders(): VectorDatabaseProvider[];
    /**
     * Get a provider by name
     */
    getProvider(name: string): VectorDatabaseProvider | undefined;
    /**
     * Get the active provider
     */
    getActiveProvider(): VectorDatabaseProvider | null;
    /**
     * Set the active provider
     */
    setActiveProvider(name: string, options?: VectorDatabaseOptions): Promise<boolean>;
    /**
     * Enable/disable vector database functionality
     */
    setEnabled(enabled: boolean): void;
    /**
     * Check if vector database functionality is enabled
     */
    isVectorDatabaseEnabled(): boolean;
    /**
     * Add a document to the database
     */
    addDocument(document: VectorDocument): Promise<string | null>;
    /**
     * Add multiple documents to the database
     */
    addDocuments(documents: VectorDocument[]): Promise<string[] | null>;
    /**
     * Search for similar documents
     */
    search(query: string | number[], options?: SearchOptions): Promise<SearchResult[]>;
    /**
     * Get embedding for text
     */
    getEmbedding(text: string): Promise<number[] | null>;
    /**
     * Close all providers
     */
    close(): Promise<void>;
}
/**
 * Initialize the vector database manager
 */
export declare function initializeVectorDatabaseManager(context: vscode.ExtensionContext): VectorDatabaseManager;
/**
 * Get the vector database manager instance
 */
export declare function getVectorDatabaseManager(): VectorDatabaseManager;
