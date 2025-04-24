import * as vscode from 'vscode';
import { SnippetManager, ConversationSnippet } from '../services/snippetManager';

export class SnippetsPanelProvider {
    public static readonly viewType = 'copilotPPA.snippetsPanel';
    
    private panel: vscode.WebviewPanel | undefined;
    private snippetManager: SnippetManager;
    private disposables: vscode.Disposable[] = [];
    
    constructor(private readonly context: vscode.ExtensionContext) {
        this.snippetManager = SnippetManager.getInstance(context);
    }
    
    public dispose(): void {
        this.panel?.dispose();
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
    
    public open(): void {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        
        this.panel = vscode.window.createWebviewPanel(
            SnippetsPanelProvider.viewType,
            'Conversation Snippets',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'resources')
                ]
            }
        );
        
        this.panel.iconPath = vscode.Uri.joinPath(
            this.context.extensionUri, 
            'resources', 
            'icons', 
            'snippet.svg'
        );
        
        // Update webview content initially
        this.updateWebviewContent();
        
        // Listen for snippet changes
        this.disposables.push(
            this.snippetManager.onSnippetAdded(() => this.updateWebviewContent()),
            this.snippetManager.onSnippetUpdated(() => this.updateWebviewContent()),
            this.snippetManager.onSnippetDeleted(() => this.updateWebviewContent())
        );
        
        // Handle panel disposal
        this.panel.onDidDispose(() => {
            this.panel = undefined;
            this.dispose();
        }, null, this.disposables);
        
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'createSnippet':
                        await this.handleCreateSnippet(message.title, message.content, message.tags);
                        break;
                    case 'updateSnippet':
                        await this.handleUpdateSnippet(message.id, message.updates);
                        break;
                    case 'deleteSnippet':
                        await this.handleDeleteSnippet(message.id);
                        break;
                    case 'insertSnippet':
                        await vscode.commands.executeCommand('copilotPPA.insertSnippet', message.id);
                        break;
                    case 'copySnippet':
                        await this.handleCopySnippet(message.id);
                        break;
                    case 'openSource':
                        await this.handleOpenSource(message.id);
                        break;
                }
            },
            null,
            this.disposables
        );
    }
    
    private updateWebviewContent(): void {
        if (!this.panel) {
            return;
        }
        
        const snippets = this.snippetManager.getAllSnippets();
        this.panel.webview.html = this.getWebviewContent(snippets);
    }
    
    private async handleCreateSnippet(title: string, content: string, tags: string[]): Promise<void> {
        try {
            await this.snippetManager.createSnippetFromContent(title, content, tags);
            vscode.window.showInformationMessage(`Snippet "${title}" created successfully`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create snippet: ${error.message}`);
        }
    }
    
    private async handleUpdateSnippet(id: string, updates: Partial<ConversationSnippet>): Promise<void> {
        try {
            const updated = await this.snippetManager.updateSnippet(id, updates);
            if (updated) {
                vscode.window.showInformationMessage(`Snippet "${updated.title}" updated successfully`);
            } else {
                vscode.window.showErrorMessage('Snippet not found');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to update snippet: ${error.message}`);
        }
    }
    
    private async handleDeleteSnippet(id: string): Promise<void> {
        try {
            const deleted = await this.snippetManager.deleteSnippet(id);
            if (deleted) {
                vscode.window.showInformationMessage('Snippet deleted successfully');
            } else {
                vscode.window.showErrorMessage('Snippet not found');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to delete snippet: ${error.message}`);
        }
    }
    
    private async handleCopySnippet(id: string): Promise<void> {
        const snippet = this.snippetManager.getSnippet(id);
        if (snippet) {
            await vscode.env.clipboard.writeText(snippet.content);
            vscode.window.showInformationMessage('Snippet copied to clipboard');
        } else {
            vscode.window.showErrorMessage('Snippet not found');
        }
    }
    
    private async handleOpenSource(id: string): Promise<void> {
        const snippet = this.snippetManager.getSnippet(id);
        if (snippet && snippet.sourceConversationId) {
            await vscode.commands.executeCommand(
                'copilotPPA.openConversation', 
                snippet.sourceConversationId
            );
        } else {
            vscode.window.showErrorMessage('Source conversation not found');
        }
    }
    
    private getWebviewContent(snippets: ConversationSnippet[]): string {
        // Get all unique tags
        const allTags = new Set<string>();
        snippets.forEach(snippet => {
            snippet.tags.forEach(tag => allTags.add(tag));
        });
        
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Conversation Snippets</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 20px;
                }
                .snippets-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .snippet-card {
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    padding: 12px;
                    background-color: var(--vscode-editor-background);
                }
                .snippet-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .snippet-title {
                    font-weight: bold;
                    font-size: 16px;
                    margin: 0;
                }
                .snippet-actions {
                    display: flex;
                    gap: 8px;
                }
                .snippet-content {
                    padding: 8px;
                    background-color: var(--vscode-textBlockQuote-background);
                    border-left: 4px solid var(--vscode-textBlockQuote-border);
                    margin-bottom: 8px;
                    white-space: pre-wrap;
                    max-height: 200px;
                    overflow-y: auto;
                }
                .snippet-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    margin-top: 8px;
                }
                .snippet-tag {
                    background-color: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                .snippet-meta {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    margin-top: 4px;
                }
                .create-snippet-form {
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    padding: 16px;
                    margin-bottom: 20px;
                }
                .form-group {
                    margin-bottom: 12px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 4px;
                }
                .form-group input, .form-group textarea {
                    width: 100%;
                    padding: 6px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                }
                .form-group textarea {
                    min-height: 100px;
                    font-family: var(--vscode-editor-font-family);
                }
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 12px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .tag-filter {
                    margin-bottom: 16px;
                }
                .action-button {
                    background-color: transparent;
                    border: none;
                    cursor: pointer;
                    color: var(--vscode-editor-foreground);
                    padding: 2px 4px;
                }
                .action-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .empty-state {
                    text-align: center;
                    padding: 40px;
                    color: var(--vscode-descriptionForeground);
                }
                .filters {
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .filters input {
                    flex-grow: 1;
                    padding: 6px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                }
                .tag-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    margin-bottom: 16px;
                }
                .tag-pill {
                    background-color: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 4px 8px;
                    border-radius: 16px;
                    font-size: 12px;
                    cursor: pointer;
                }
                .tag-pill.active {
                    background-color: var(--vscode-button-background);
                }
            </style>
        </head>
        <body>
            <h1>Conversation Snippets</h1>
            
            <div class="create-snippet-form">
                <h2>Create New Snippet</h2>
                <div class="form-group">
                    <label for="snippet-title">Title</label>
                    <input type="text" id="snippet-title" placeholder="Enter snippet title">
                </div>
                <div class="form-group">
                    <label for="snippet-content">Content</label>
                    <textarea id="snippet-content" placeholder="Enter snippet content"></textarea>
                </div>
                <div class="form-group">
                    <label for="snippet-tags">Tags (comma-separated)</label>
                    <input type="text" id="snippet-tags" placeholder="tag1, tag2, tag3">
                </div>
                <button id="create-snippet-btn">Create Snippet</button>
            </div>
            
            <div class="filters">
                <input type="text" id="snippet-search" placeholder="Search snippets...">
            </div>
            
            <div class="tag-pills">
                <div class="tag-pill active" data-tag="all">All</div>
                ${Array.from(allTags).map(tag => 
                    `<div class="tag-pill" data-tag="${tag}">${tag}</div>`
                ).join('')}
            </div>
            
            <div class="snippets-container">
                ${snippets.length === 0 ? 
                    `<div class="empty-state">
                        <p>No snippets created yet.</p>
                        <p>Create your first snippet using the form above or by selecting messages in a conversation.</p>
                    </div>` : 
                    snippets.map(snippet => this.renderSnippetCard(snippet)).join('')}
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                // Store snippets for filtering
                const snippets = ${JSON.stringify(snippets)};
                
                document.addEventListener('DOMContentLoaded', () => {
                    setupEventListeners();
                });
                
                function setupEventListeners() {
                    // Create snippet button
                    document.getElementById('create-snippet-btn').addEventListener('click', () => {
                        const title = document.getElementById('snippet-title').value.trim();
                        const content = document.getElementById('snippet-content').value.trim();
                        const tagsInput = document.getElementById('snippet-tags').value.trim();
                        
                        if (!title) {
                            alert('Please enter a title for the snippet');
                            return;
                        }
                        
                        if (!content) {
                            alert('Please enter content for the snippet');
                            return;
                        }
                        
                        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(Boolean) : [];
                        
                        vscode.postMessage({
                            command: 'createSnippet',
                            title,
                            content,
                            tags
                        });
                        
                        // Clear form
                        document.getElementById('snippet-title').value = '';
                        document.getElementById('snippet-content').value = '';
                        document.getElementById('snippet-tags').value = '';
                    });
                    
                    // Search input
                    document.getElementById('snippet-search').addEventListener('input', filterSnippets);
                    
                    // Tag filtering
                    document.querySelectorAll('.tag-pill').forEach(pill => {
                        pill.addEventListener('click', (e) => {
                            // Toggle active class
                            document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
                            e.target.classList.add('active');
                            
                            filterSnippets();
                        });
                    });
                    
                    // Snippet action buttons
                    document.querySelectorAll('.action-button').forEach(button => {
                        button.addEventListener('click', (e) => {
                            const action = e.target.closest('button').dataset.action;
                            const snippetId = e.target.closest('.snippet-card').dataset.id;
                            
                            switch (action) {
                                case 'copy':
                                    vscode.postMessage({
                                        command: 'copySnippet',
                                        id: snippetId
                                    });
                                    break;
                                case 'insert':
                                    vscode.postMessage({
                                        command: 'insertSnippet',
                                        id: snippetId
                                    });
                                    break;
                                case 'delete':
                                    if (confirm('Are you sure you want to delete this snippet?')) {
                                        vscode.postMessage({
                                            command: 'deleteSnippet',
                                            id: snippetId
                                        });
                                    }
                                    break;
                                case 'source':
                                    vscode.postMessage({
                                        command: 'openSource',
                                        id: snippetId
                                    });
                                    break;
                            }
                        });
                    });
                }
                
                function filterSnippets() {
                    const searchQuery = document.getElementById('snippet-search').value.toLowerCase();
                    const activeTag = document.querySelector('.tag-pill.active').dataset.tag;
                    
                    const filteredSnippets = snippets.filter(snippet => {
                        // Filter by search query
                        const matchesSearch = 
                            searchQuery === '' || 
                            snippet.title.toLowerCase().includes(searchQuery) ||
                            snippet.content.toLowerCase().includes(searchQuery);
                        
                        // Filter by tag
                        const matchesTag = 
                            activeTag === 'all' || 
                            snippet.tags.includes(activeTag);
                        
                        return matchesSearch && matchesTag;
                    });
                    
                    // Update UI
                    const container = document.querySelector('.snippets-container');
                    if (filteredSnippets.length === 0) {
                        container.innerHTML = \`
                            <div class="empty-state">
                                <p>No snippets match your search.</p>
                            </div>
                        \`;
                    } else {
                        container.innerHTML = filteredSnippets.map(snippet => {
                            // This is a simplified version - in reality, you'd want to use a template function
                            return \`
                                <div class="snippet-card" data-id="\${snippet.id}">
                                    <div class="snippet-header">
                                        <h3 class="snippet-title">\${snippet.title}</h3>
                                        <div class="snippet-actions">
                                            <button class="action-button" data-action="copy" title="Copy to Clipboard">📋</button>
                                            <button class="action-button" data-action="insert" title="Insert into Editor">📝</button>
                                            <button class="action-button" data-action="delete" title="Delete Snippet">🗑️</button>
                                            \${snippet.sourceConversationId ? 
                                                \`<button class="action-button" data-action="source" title="Open Source Conversation">🔍</button>\` : ''}
                                        </div>
                                    </div>
                                    <div class="snippet-content">\${snippet.content}</div>
                                    <div class="snippet-tags">
                                        \${snippet.tags.map(tag => \`<span class="snippet-tag">\${tag}</span>\`).join('')}
                                    </div>
                                    <div class="snippet-meta">
                                        Created: \${new Date(snippet.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            \`;
                        }).join('');
                        
                        // Reattach event listeners to new elements
                        document.querySelectorAll('.action-button').forEach(button => {
                            button.addEventListener('click', (e) => {
                                const action = e.target.closest('button').dataset.action;
                                const snippetId = e.target.closest('.snippet-card').dataset.id;
                                
                                switch (action) {
                                    case 'copy':
                                        vscode.postMessage({
                                            command: 'copySnippet',
                                            id: snippetId
                                        });
                                        break;
                                    case 'insert':
                                        vscode.postMessage({
                                            command: 'insertSnippet',
                                            id: snippetId
                                        });
                                        break;
                                    case 'delete':
                                        if (confirm('Are you sure you want to delete this snippet?')) {
                                            vscode.postMessage({
                                                command: 'deleteSnippet',
                                                id: snippetId
                                            });
                                        }
                                        break;
                                    case 'source':
                                        vscode.postMessage({
                                            command: 'openSource',
                                            id: snippetId
                                        });
                                        break;
                                }
                            });
                        });
                    }
                }
            </script>
        </body>
        </html>
        `;
    }
    
    private renderSnippetCard(snippet: ConversationSnippet): string {
        return `
        <div class="snippet-card" data-id="${snippet.id}">
            <div class="snippet-header">
                <h3 class="snippet-title">${snippet.title}</h3>
                <div class="snippet-actions">
                    <button class="action-button" data-action="copy" title="Copy to Clipboard">📋</button>
                    <button class="action-button" data-action="insert" title="Insert into Editor">📝</button>
                    <button class="action-button" data-action="delete" title="Delete Snippet">🗑️</button>
                    ${snippet.sourceConversationId ? 
                        `<button class="action-button" data-action="source" title="Open Source Conversation">🔍</button>` : ''}
                </div>
            </div>
            <div class="snippet-content">${this.escapeHtml(snippet.content)}</div>
            <div class="snippet-tags">
                ${snippet.tags.map(tag => `<span class="snippet-tag">${tag}</span>`).join('')}
            </div>
            <div class="snippet-meta">
                Created: ${new Date(snippet.createdAt).toLocaleString()}
            </div>
        </div>
        `;
    }
    
    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
