import * as vscode from 'vscode';
import { SearchResult } from './models';
/**
 * Service for semantic code search functionality
 */
export declare class CodeSearchService {
    private context;
    constructor(context: vscode.ExtensionContext);
    /**
     * Search for semantically similar code
     */
    semanticSearch(query: string, limit?: number): Promise<SearchResult[]>;
    /**
     * Get relevant code based on current context
     */
    getRelevantCode(context: string, limit?: number): Promise<SearchResult[]>;
    /**
     * Index a single file
     */
    indexFile(file: vscode.Uri): Promise<boolean>;
    /**
     * Index multiple files
     */
    indexFiles(files: vscode.Uri[]): Promise<number>;
    /**
     * Index the current workspace
     */
    indexWorkspace(includePattern?: string, excludePattern?: string): Promise<number>;
}
/**
 * Initialize the code search service
 */
export declare function initializeCodeSearchService(context: vscode.ExtensionContext): CodeSearchService;
/**
 * Get the code search service instance
 */
export declare function getCodeSearchService(): CodeSearchService;
