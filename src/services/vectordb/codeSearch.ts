import * as vscode from 'vscode';
import * as path from 'path';
import { getVectorDatabaseManager } from './manager';
import { VectorDocument, SearchResult } from './models';

/**
 * Service for semantic code search functionality
 */
export class CodeSearchService {
    constructor(private context: vscode.ExtensionContext) {}
    
    /**
     * Search for semantically similar code
     */
    public async semanticSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
        const manager = getVectorDatabaseManager();
        
        if (!manager.isVectorDatabaseEnabled() || !manager.getActiveProvider()) {
            throw new Error('Vector database is not enabled or no active provider');
        }
        
        return await manager.search(query, { limit });
    }
    
    /**
     * Get relevant code based on current context
     */
    public async getRelevantCode(context: string, limit: number = 3): Promise<SearchResult[]> {
        const manager = getVectorDatabaseManager();
        
        if (!manager.isVectorDatabaseEnabled() || !manager.getActiveProvider()) {
            throw new Error('Vector database is not enabled or no active provider');
        }
        
        return await manager.search(context, { limit });
    }
    
    /**
     * Index a single file
     */
    public async indexFile(file: vscode.Uri): Promise<boolean> {
        const manager = getVectorDatabaseManager();
        
        if (!manager.isVectorDatabaseEnabled() || !manager.getActiveProvider()) {
            return false;
        }
        
        try {
            const document = await vscode.workspace.openTextDocument(file);
            const content = document.getText();
            
            // Skip if empty or too large
            if (!content || content.length > 100000) {
                return false;
            }
            
            // Prepare document to be indexed
            const vectorDoc: VectorDocument = {
                id: file.toString(),
                content,
                metadata: {
                    path: file.fsPath,
                    language: document.languageId,
                    lineCount: document.lineCount,
                    lastModified: new Date().toISOString()
                }
            };
            
            // Add to vector database
            const result = await manager.addDocument(vectorDoc);
            return result !== null;
        } catch (error) {
            console.error(`Failed to index file ${file.fsPath}:`, error);
            return false;
        }
    }
    
    /**
     * Index multiple files
     */
    public async indexFiles(files: vscode.Uri[]): Promise<number> {
        const manager = getVectorDatabaseManager();
        
        if (!manager.isVectorDatabaseEnabled() || !manager.getActiveProvider()) {
            return 0;
        }
        
        let successful = 0;
        const progressOptions = {
            location: vscode.ProgressLocation.Notification,
            title: "Indexing files for semantic search",
            cancellable: true
        };
        
        await vscode.window.withProgress(progressOptions, async (progress, token) => {
            const total = files.length;
            const batchSize = 10; // Process files in batches
            
            for (let i = 0; i < total && !token.isCancellationRequested; i += batchSize) {
                const batch = files.slice(i, i + batchSize);
                const documents: VectorDocument[] = [];
                
                // Process batch of files
                for (const file of batch) {
                    try {
                        const document = await vscode.workspace.openTextDocument(file);
                        const content = document.getText();
                        
                        // Skip if empty or too large
                        if (!content || content.length > 100000) {
                            continue;
                        }
                        
                        documents.push({
                            id: file.toString(),
                            content,
                            metadata: {
                                path: file.fsPath,
                                language: document.languageId,
                                lineCount: document.lineCount,
                                lastModified: new Date().toISOString()
                            }
                        });
                    } catch (error) {
                        console.error(`Failed to read file ${file.fsPath}:`, error);
                    }
                }
                
                // Add batch to vector database
                if (documents.length > 0) {
                    const results = await manager.addDocuments(documents);
                    if (results) {
                        successful += results.length;
                    }
                }
                
                // Update progress
                progress.report({
                    message: `Indexed ${successful} files`,
                    increment: (batch.length / total) * 100
                });
            }
        });
        
        return successful;
    }
    
    /**
     * Index the current workspace
     */
    public async indexWorkspace(
        includePattern: string = '**/*.{js,ts,jsx,tsx,py,java,c,cpp,h,hpp,cs,go,rust}',
        excludePattern: string = '**/node_modules/**,**/dist/**,**/build/**,**/.git/**'
    ): Promise<number> {
        const files = await vscode.workspace.findFiles(includePattern, excludePattern);
        return await this.indexFiles(files);
    }
}

// Singleton instance
let codeSearchService: CodeSearchService | null = null;

/**
 * Initialize the code search service
 */
export function initializeCodeSearchService(context: vscode.ExtensionContext): CodeSearchService {
    if (!codeSearchService) {
        codeSearchService = new CodeSearchService(context);
    }
    return codeSearchService;
}

/**
 * Get the code search service instance
 */
export function getCodeSearchService(): CodeSearchService {
    if (!codeSearchService) {
        throw new Error('Code Search Service not initialized');
    }
    return codeSearchService;
}
