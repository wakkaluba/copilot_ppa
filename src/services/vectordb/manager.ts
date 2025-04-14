import * as vscode from 'vscode';
import { VectorDatabaseProvider } from './provider';
import { ChromaProvider } from './chromaProvider';
import { FaissProvider } from './faissProvider';
import { VectorDocument, SearchResult, VectorDatabaseOptions, SearchOptions } from './models';

/**
 * Manager for vector database providers
 */
export class VectorDatabaseManager {
    private providers: Map<string, VectorDatabaseProvider> = new Map();
    private activeProvider: VectorDatabaseProvider | null = null;
    private isEnabled = false;
    
    constructor(private context: vscode.ExtensionContext) {
        // Register providers
        this.registerProvider(new ChromaProvider(context));
        this.registerProvider(new FaissProvider(context));
    }
    
    /**
     * Register a provider
     */
    public registerProvider(provider: VectorDatabaseProvider): void {
        this.providers.set(provider.name.toLowerCase(), provider);
    }
    
    /**
     * Get a list of available providers
     */
    public getProviders(): VectorDatabaseProvider[] {
        return Array.from(this.providers.values());
    }
    
    /**
     * Get a provider by name
     */
    public getProvider(name: string): VectorDatabaseProvider | undefined {
        return this.providers.get(name.toLowerCase());
    }
    
    /**
     * Get the active provider
     */
    public getActiveProvider(): VectorDatabaseProvider | null {
        return this.activeProvider;
    }
    
    /**
     * Set the active provider
     */
    public async setActiveProvider(name: string, options?: VectorDatabaseOptions): Promise<boolean> {
        // Close existing provider if one is active
        if (this.activeProvider) {
            await this.activeProvider.close();
            this.activeProvider = null;
        }
        
        const provider = this.getProvider(name);
        if (!provider) {
            return false;
        }
        
        try {
            // Initialize the provider
            await provider.initialize(options);
            this.activeProvider = provider;
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize ${name} provider: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Enable/disable vector database functionality
     */
    public setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        vscode.commands.executeCommand('setContext', 'copilotPPA.vectorDatabaseEnabled', enabled);
    }
    
    /**
     * Check if vector database functionality is enabled
     */
    public isVectorDatabaseEnabled(): boolean {
        return this.isEnabled;
    }
    
    /**
     * Add a document to the database
     */
    public async addDocument(document: VectorDocument): Promise<string | null> {
        if (!this.isEnabled || !this.activeProvider) {
            return null;
        }
        
        try {
            return await this.activeProvider.addDocument(document);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to add document: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Add multiple documents to the database
     */
    public async addDocuments(documents: VectorDocument[]): Promise<string[] | null> {
        if (!this.isEnabled || !this.activeProvider) {
            return null;
        }
        
        try {
            return await this.activeProvider.addDocuments(documents);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to add documents: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Search for similar documents
     */
    public async search(query: string | number[], options?: SearchOptions): Promise<SearchResult[]> {
        if (!this.isEnabled || !this.activeProvider) {
            return [];
        }
        
        try {
            return await this.activeProvider.search(query, options);
        } catch (error) {
            vscode.window.showErrorMessage(`Search failed: ${error.message}`);
            return [];
        }
    }
    
    /**
     * Get embedding for text
     */
    public async getEmbedding(text: string): Promise<number[] | null> {
        if (!this.isEnabled || !this.activeProvider) {
            return null;
        }
        
        try {
            return await this.activeProvider.getEmbedding(text);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate embedding: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Close all providers
     */
    public async close(): Promise<void> {
        if (this.activeProvider) {
            await this.activeProvider.close();
            this.activeProvider = null;
        }
    }
}

// Singleton instance
let vectorDatabaseManager: VectorDatabaseManager | null = null;

/**
 * Initialize the vector database manager
 */
export function initializeVectorDatabaseManager(context: vscode.ExtensionContext): VectorDatabaseManager {
    if (!vectorDatabaseManager) {
        vectorDatabaseManager = new VectorDatabaseManager(context);
    }
    return vectorDatabaseManager;
}

/**
 * Get the vector database manager instance
 */
export function getVectorDatabaseManager(): VectorDatabaseManager {
    if (!vectorDatabaseManager) {
        throw new Error('Vector Database Manager not initialized');
    }
    return vectorDatabaseManager;
}
