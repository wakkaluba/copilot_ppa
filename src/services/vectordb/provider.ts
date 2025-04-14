import { VectorDocument, SearchResult, VectorDatabaseOptions, SearchOptions } from './models';

/**
 * Interface for vector database providers
 */
export interface VectorDatabaseProvider {
    /**
     * Name of the provider
     */
    readonly name: string;
    
    /**
     * Whether the provider is available
     */
    readonly isAvailable: boolean;
    
    /**
     * Initialize the vector database
     */
    initialize(options?: VectorDatabaseOptions): Promise<void>;
    
    /**
     * Add a document to the database
     */
    addDocument(document: VectorDocument): Promise<string>;
    
    /**
     * Add multiple documents to the database
     */
    addDocuments(documents: VectorDocument[]): Promise<string[]>;
    
    /**
     * Get a document by ID
     */
    getDocument(id: string): Promise<VectorDocument | null>;
    
    /**
     * Update a document in the database
     */
    updateDocument(id: string, document: Partial<VectorDocument>): Promise<boolean>;
    
    /**
     * Delete a document from the database
     */
    deleteDocument(id: string): Promise<boolean>;
    
    /**
     * Delete all documents from the database
     */
    deleteAll(): Promise<void>;
    
    /**
     * Search for similar documents
     */
    search(query: string | number[], options?: SearchOptions): Promise<SearchResult[]>;
    
    /**
     * Get the embedding for a text
     */
    getEmbedding(text: string): Promise<number[]>;
    
    /**
     * Close the database connection
     */
    close(): Promise<void>;
}
