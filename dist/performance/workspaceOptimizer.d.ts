import * as vscode from 'vscode';
export declare class WorkspaceOptimizer {
    private indexer;
    private chunkManager;
    private readonly MAX_CHUNK_SIZE;
    constructor();
    initialize(): Promise<void>;
    processLargeFile(uri: vscode.Uri): Promise<void>;
    getRelevantContext(query: string): Promise<string[]>;
    private processChunk;
}
