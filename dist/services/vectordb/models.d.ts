/**
 * Represents a document that can be indexed in a vector database
 */
export interface VectorDocument {
    /**
     * Unique identifier for the document
     */
    id: string;
    /**
     * The textual content of the document
     */
    content: string;
    /**
     * Optional metadata about the document
     */
    metadata?: Record<string, any>;
    /**
     * Vector embedding of the document (if available)
     */
    embedding?: number[];
}
/**
 * Search result from vector database
 */
export interface SearchResult {
    /**
     * The document that matched the search
     */
    document: VectorDocument;
    /**
     * Similarity score (higher means more similar)
     */
    score: number;
}
/**
 * Options for vector database operations
 */
export interface VectorDatabaseOptions {
    /**
     * Number of dimensions for the embeddings
     */
    dimensions?: number;
    /**
     * Similarity metric to use
     */
    metric?: 'cosine' | 'euclidean' | 'dot';
}
/**
 * Search options
 */
export interface SearchOptions {
    /**
     * Number of results to return
     */
    limit?: number;
    /**
     * Minimum similarity score
     */
    minScore?: number;
    /**
     * Filter based on metadata
     */
    filter?: Record<string, any>;
}
