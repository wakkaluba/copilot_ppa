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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeExampleSearch = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
class CodeExampleSearch {
    cachePath;
    cacheLifetime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    context;
    constructor(context) {
        this.context = context;
        this.cachePath = path.join(context.globalStorageUri.fsPath, 'example-cache');
        // Ensure cache directory exists
        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath, { recursive: true });
        }
    }
    /**
     * Searches for code examples based on the current context
     * @param query The search query
     * @param language The programming language
     * @returns Array of code examples
     */
    async searchExamples(query, language) {
        // Generate a cache key based on query and language
        const cacheKey = this.generateCacheKey(query, language);
        // Check if we have a cached result
        const cachedResult = this.getCachedResult(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }
        try {
            // Search GitHub API for code examples
            const results = await this.searchGitHub(query, language);
            // Filter results based on relevance
            const filteredResults = this.filterByRelevance(results, query);
            // Cache the results
            this.cacheResults(cacheKey, filteredResults);
            return filteredResults;
        }
        catch (error) {
            console.error('Error searching for code examples:', error);
            throw new Error(`Failed to search for code examples: ${error.message}`);
        }
    }
    /**
     * Searches GitHub API for code examples
     */
    async searchGitHub(query, language) {
        const encodedQuery = encodeURIComponent(`${query} language:${language}`);
        const url = `https://api.github.com/search/code?q=${encodedQuery}&per_page=30`;
        const response = await axios_1.default.get(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'VSCode-Local-LLM-Agent'
            }
        });
        if (response.status !== 200) {
            throw new Error(`GitHub API returned status ${response.status}`);
        }
        const items = response.data.items || [];
        // Fetch file contents for each result
        const contentPromises = items.map(async (item) => {
            try {
                const contentResponse = await axios_1.default.get(item.url, {
                    headers: {
                        'Accept': 'application/vnd.github.v3.raw',
                        'User-Agent': 'VSCode-Local-LLM-Agent'
                    }
                });
                return {
                    ...item,
                    content: contentResponse.data,
                    fetchSuccess: true
                };
            }
            catch (error) {
                console.warn(`Failed to fetch content for ${item.html_url}:`, error);
                return {
                    ...item,
                    content: null,
                    fetchSuccess: false
                };
            }
        });
        return Promise.all(contentPromises);
    }
    /**
     * Filters results based on relevance to query
     */
    filterByRelevance(results, query) {
        // Basic relevance filtering - can be enhanced with more complex algorithms
        return results
            .filter(item => item.fetchSuccess && item.content)
            .map(item => {
            // Calculate a simple relevance score
            const content = typeof item.content === 'string' ? item.content : '';
            const queryTerms = query.toLowerCase().split(/\s+/);
            // Count occurrences of query terms in content
            const termFrequency = queryTerms.reduce((count, term) => {
                const regex = new RegExp(term, 'gi');
                const matches = content.match(regex);
                return count + (matches ? matches.length : 0);
            }, 0);
            // Higher score for smaller files (assuming more focused examples)
            const sizeScore = Math.max(0, 1 - (content.length / 10000));
            // Calculate final score
            const relevanceScore = termFrequency * 0.7 + sizeScore * 0.3;
            return {
                id: item.sha,
                filename: item.name,
                content: content,
                language: path.extname(item.name).slice(1),
                url: item.html_url,
                repository: item.repository?.full_name || 'Unknown',
                relevanceScore: relevanceScore
            };
        })
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 10); // Return top 10 most relevant results
    }
    /**
     * Generates a cache key based on query and language
     */
    generateCacheKey(query, language) {
        const hash = crypto.createHash('md5').update(`${query}-${language}`).digest('hex');
        return hash;
    }
    /**
     * Gets cached results if available and not expired
     */
    getCachedResult(cacheKey) {
        const cacheFilePath = path.join(this.cachePath, `${cacheKey}.json`);
        if (!fs.existsSync(cacheFilePath)) {
            return null;
        }
        try {
            const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
            const cacheTime = new Date(cacheData.timestamp).getTime();
            const currentTime = new Date().getTime();
            // Check if cache is expired
            if (currentTime - cacheTime > this.cacheLifetime) {
                fs.unlinkSync(cacheFilePath);
                return null;
            }
            return cacheData.examples;
        }
        catch (error) {
            console.warn('Error reading cache:', error);
            return null;
        }
    }
    /**
     * Caches search results
     */
    cacheResults(cacheKey, results) {
        const cacheFilePath = path.join(this.cachePath, `${cacheKey}.json`);
        const cacheData = {
            timestamp: new Date().toISOString(),
            examples: results
        };
        fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2));
    }
    /**
     * Shows a UI to display code examples
     */
    async showExampleUI(examples) {
        if (examples.length === 0) {
            vscode.window.showInformationMessage('No code examples found.');
            return;
        }
        // Create a webview panel
        const panel = vscode.window.createWebviewPanel('codeExamples', 'Code Examples', vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        // Generate HTML content
        panel.webview.html = this.generateExampleHTML(examples, panel.webview);
        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'insertExample':
                    const example = examples.find(e => e.id === message.id);
                    if (example && vscode.window.activeTextEditor) {
                        const position = vscode.window.activeTextEditor.selection.active;
                        await vscode.window.activeTextEditor.edit(editBuilder => {
                            editBuilder.insert(position, example.content);
                        });
                        vscode.window.showInformationMessage('Code example inserted.');
                    }
                    break;
            }
        }, undefined, this.context.subscriptions);
    }
    /**
     * Generates HTML for the example display webview
     */
    generateExampleHTML(examples, webview) {
        const nonce = this.getNonce();
        const examplesHTML = examples.map(example => `
            <div class="example-card">
                <div class="example-header">
                    <h3>${this.escapeHtml(example.filename)}</h3>
                    <span class="repository">${this.escapeHtml(example.repository)}</span>
                </div>
                <div class="example-actions">
                    <button class="insert-btn" data-id="${example.id}">Insert Code</button>
                    <a href="${example.url}" class="view-source-link">View Source</a>
                </div>
                <pre class="example-content"><code class="language-${example.language}">${this.escapeHtml(example.content)}</code></pre>
            </div>
        `).join('');
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https:;">
            <title>Code Examples</title>
            <style>
                body {
                    padding: 0;
                    margin: 0;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                }
                .container {
                    max-width: 100%;
                    padding: 15px;
                }
                .example-card {
                    margin-bottom: 20px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 5px;
                    overflow: hidden;
                }
                .example-header {
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    padding: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .example-header h3 {
                    margin: 0;
                    font-size: 14px;
                }
                .repository {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                }
                .example-actions {
                    padding: 10px;
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    border-top: 1px solid var(--vscode-panel-border);
                    display: flex;
                    justify-content: flex-start;
                    gap: 10px;
                }
                .insert-btn {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 5px 10px;
                    cursor: pointer;
                    border-radius: 3px;
                }
                .insert-btn:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .view-source-link {
                    color: var(--vscode-textLink-foreground);
                    text-decoration: none;
                    padding: 5px 0;
                }
                .view-source-link:hover {
                    text-decoration: underline;
                }
                .example-content {
                    padding: 10px;
                    margin: 0;
                    background-color: var(--vscode-editor-background);
                    white-space: pre-wrap;
                    overflow-x: auto;
                    font-family: var(--vscode-editor-font-family);
                    font-size: var(--vscode-editor-font-size);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Code Examples</h2>
                ${examplesHTML}
            </div>
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                
                document.querySelectorAll('.insert-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const id = button.getAttribute('data-id');
                        vscode.postMessage({
                            command: 'insertExample',
                            id: id
                        });
                    });
                });
            </script>
        </body>
        </html>`;
    }
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
exports.CodeExampleSearch = CodeExampleSearch;
//# sourceMappingURL=codeExampleSearch.js.map