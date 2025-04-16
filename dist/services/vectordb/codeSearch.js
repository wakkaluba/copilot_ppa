"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeSearchService = void 0;
exports.initializeCodeSearchService = initializeCodeSearchService;
exports.getCodeSearchService = getCodeSearchService;
const vscode = __importStar(require("vscode"));
const manager_1 = require("./manager");
/**
 * Service for semantic code search functionality
 */
class CodeSearchService {
    constructor(context) {
        this.context = context;
    }
    /**
     * Search for semantically similar code
     */
    async semanticSearch(query, limit = 5) {
        const manager = (0, manager_1.getVectorDatabaseManager)();
        if (!manager.isVectorDatabaseEnabled() || !manager.getActiveProvider()) {
            throw new Error('Vector database is not enabled or no active provider');
        }
        return await manager.search(query, { limit });
    }
    /**
     * Get relevant code based on current context
     */
    async getRelevantCode(context, limit = 3) {
        const manager = (0, manager_1.getVectorDatabaseManager)();
        if (!manager.isVectorDatabaseEnabled() || !manager.getActiveProvider()) {
            throw new Error('Vector database is not enabled or no active provider');
        }
        return await manager.search(context, { limit });
    }
    /**
     * Index a single file
     */
    async indexFile(file) {
        const manager = (0, manager_1.getVectorDatabaseManager)();
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
            const vectorDoc = {
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
        }
        catch (error) {
            console.error(`Failed to index file ${file.fsPath}:`, error);
            return false;
        }
    }
    /**
     * Index multiple files
     */
    async indexFiles(files) {
        const manager = (0, manager_1.getVectorDatabaseManager)();
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
                const documents = [];
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
                    }
                    catch (error) {
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
    async indexWorkspace(includePattern = '**/*.{js,ts,jsx,tsx,py,java,c,cpp,h,hpp,cs,go,rust}', excludePattern = '**/node_modules/**,**/dist/**,**/build/**,**/.git/**') {
        const files = await vscode.workspace.findFiles(includePattern, excludePattern);
        return await this.indexFiles(files);
    }
}
exports.CodeSearchService = CodeSearchService;
// Singleton instance
let codeSearchService = null;
/**
 * Initialize the code search service
 */
function initializeCodeSearchService(context) {
    if (!codeSearchService) {
        codeSearchService = new CodeSearchService(context);
    }
    return codeSearchService;
}
/**
 * Get the code search service instance
 */
function getCodeSearchService() {
    if (!codeSearchService) {
        throw new Error('Code Search Service not initialized');
    }
    return codeSearchService;
}
//# sourceMappingURL=codeSearch.js.map