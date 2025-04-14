import * as vscode from 'vscode';
import { SnippetManager, ConversationSnippet } from '../services/snippetManager';
import { ConversationManager, Message } from '../services/conversationManager';

export class SnippetCommands {
    public static readonly createSnippetCommandId = 'copilotPPA.createSnippet';
    public static readonly insertSnippetCommandId = 'copilotPPA.insertSnippet';
    public static readonly manageSnippetsCommandId = 'copilotPPA.manageSnippets';
    
    private snippetManager: SnippetManager;
    private conversationManager: ConversationManager;
    
    constructor(context: vscode.ExtensionContext) {
        this.snippetManager = SnippetManager.getInstance(context);
        this.conversationManager = ConversationManager.getInstance(context);
    }
    
    public register(): vscode.Disposable[] {
        return [
            vscode.commands.registerCommand(
                SnippetCommands.createSnippetCommandId, 
                async (conversationId?: string, messageIndices?: number[]) => {
                    await this.createSnippet(conversationId, messageIndices);
                }
            ),
            vscode.commands.registerCommand(
                SnippetCommands.insertSnippetCommandId,
                async () => {
                    await this.insertSnippet();
                }
            ),
            vscode.commands.registerCommand(
                SnippetCommands.manageSnippetsCommandId,
                async () => {
                    await this.manageSnippets();
                }
            )
        ];
    }
    
    /**
     * Command to create a snippet from selected messages
     */
    private async createSnippet(conversationId?: string, messageIndices?: number[]): Promise<void> {
        try {
            // If no conversation ID is provided, let the user select one
            if (!conversationId) {
                conversationId = await this.selectConversation();
                if (!conversationId) {
                    return; // User cancelled
                }
            }
            
            const conversation = this.conversationManager.getConversation(conversationId);
            if (!conversation) {
                vscode.window.showErrorMessage('Conversation not found');
                return;
            }
            
            // If no message indices provided, let the user select messages
            let selectedMessages: Message[] = [];
            if (!messageIndices || messageIndices.length === 0) {
                selectedMessages = await this.selectMessagesFromConversation(conversation.messages);
                if (!selectedMessages.length) {
                    return; // User cancelled or no messages selected
                }
            } else {
                selectedMessages = messageIndices.map(index => conversation.messages[index])
                    .filter(Boolean);
            }
            
            if (selectedMessages.length === 0) {
                vscode.window.showErrorMessage('No valid messages selected');
                return;
            }
            
            // Get title for the snippet
            const title = await vscode.window.showInputBox({
                prompt: 'Enter a title for this snippet',
                placeHolder: 'Snippet title',
                value: `Snippet from ${conversation.title}`,
                validateInput: value => {
                    return value.trim() ? null : 'Title cannot be empty';
                }
            });
            
            if (!title) {
                return; // User cancelled
            }
            
            // Get tags for the snippet
            const tagsInput = await vscode.window.showInputBox({
                prompt: 'Enter tags for this snippet (comma-separated)',
                placeHolder: 'tag1, tag2, tag3',
            });
            
            const tags = tagsInput ? 
                tagsInput.split(',').map(tag => tag.trim()).filter(Boolean) : 
                [];
            
            // Create the snippet
            const snippet = await this.snippetManager.createSnippet(
                title,
                selectedMessages,
                tags,
                conversation.id
            );
            
            vscode.window.showInformationMessage(`Snippet "${snippet.title}" created successfully`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create snippet: ${error.message}`);
        }
    }
    
    /**
     * Command to insert a snippet into the current editor or conversation
     */
    private async insertSnippet(): Promise<void> {
        try {
            // Let the user select a snippet
            const snippet = await this.selectSnippet();
            if (!snippet) {
                return; // User cancelled
            }
            
            // Determine insertion target: editor or conversation
            const activeEditor = vscode.window.activeTextEditor;
            const activePanel = vscode.window.activeWebviewPanel;
            
            if (activeEditor) {
                // Insert into active editor
                const position = activeEditor.selection.active;
                activeEditor.edit(editBuilder => {
                    editBuilder.insert(position, snippet.content);
                });
                vscode.window.showInformationMessage('Snippet inserted into editor');
            } else if (activePanel && activePanel.viewType === 'copilotPPA.chatView') {
                // Insert into active conversation
                // This would be handled by your chat webview's messaging
                // Here we'll just send a message that your webview should process
                activePanel.webview.postMessage({
                    command: 'insertSnippet',
                    snippet: snippet
                });
                vscode.window.showInformationMessage('Snippet inserted into conversation');
            } else {
                // Option to copy to clipboard instead
                const options = ['Copy to Clipboard', 'Cancel'];
                const selected = await vscode.window.showQuickPick(options, {
                    placeHolder: 'No active editor or conversation. What would you like to do?'
                });
                
                if (selected === 'Copy to Clipboard') {
                    await vscode.env.clipboard.writeText(snippet.content);
                    vscode.window.showInformationMessage('Snippet copied to clipboard');
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to insert snippet: ${error.message}`);
        }
    }
    
    /**
     * Command to open the snippet management panel
     */
    private async manageSnippets(): Promise<void> {
        // This will be implemented to open a webview panel for managing snippets
        await vscode.commands.executeCommand('copilotPPA.openSnippetsPanel');
    }
    
    /**
     * Helper to select a conversation
     */
    private async selectConversation(): Promise<string | undefined> {
        const conversations = this.conversationManager.getAllConversations();
        
        if (conversations.length === 0) {
            vscode.window.showInformationMessage('No conversations found');
            return undefined;
        }
        
        const items = conversations.map(conv => ({
            label: conv.title,
            description: `${conv.messages.length} messages`,
            conversationId: conv.id
        }));
        
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a conversation'
        });
        
        return selected?.conversationId;
    }
    
    /**
     * Helper to select messages from a conversation
     */
    private async selectMessagesFromConversation(messages: Message[]): Promise<Message[]> {
        // Convert messages to QuickPickItems for selection
        const items = messages.map((msg, index) => {
            const roleLabel = msg.role === 'user' ? 'User' : 
                             msg.role === 'assistant' ? 'Assistant' : 'System';
            const preview = msg.content.length > 50 ? 
                `${msg.content.substring(0, 50)}...` : 
                msg.content;
            
            return {
                label: `${roleLabel}: ${preview}`,
                description: new Date(msg.timestamp).toLocaleString(),
                picked: false,
                message: msg,
                index
            };
        });
        
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select messages to include in snippet',
            canPickMany: true
        });
        
        if (!selected) {
            return [];
        }
        
        // Sort selected by original order
        return selected
            .sort((a, b) => a.index - b.index)
            .map(item => item.message);
    }
    
    /**
     * Helper to select a snippet
     */
    private async selectSnippet(): Promise<ConversationSnippet | undefined> {
        const snippets = this.snippetManager.getAllSnippets();
        
        if (snippets.length === 0) {
            vscode.window.showInformationMessage('No snippets found');
            return undefined;
        }
        
        // Group snippets by tag first
        const tagMap = new Map<string, ConversationSnippet[]>();
        tagMap.set('All Snippets', snippets);
        
        for (const snippet of snippets) {
            for (const tag of snippet.tags) {
                if (!tagMap.has(tag)) {
                    tagMap.set(tag, []);
                }
                tagMap.get(tag)!.push(snippet);
            }
        }
        
        // Create tag selection items
        const tagItems = Array.from(tagMap.keys()).map(tag => ({
            label: tag,
            description: `${tagMap.get(tag)!.length} snippet(s)`,
            tag
        }));
        
        // Let user select a tag first
        const selectedTag = await vscode.window.showQuickPick(
            [{ label: 'All Snippets', description: `${snippets.length} snippet(s)`, tag: 'All Snippets' }, ...tagItems], 
            { placeHolder: 'Filter snippets by tag or view all' }
        );
        
        if (!selectedTag) {
            return undefined; // User cancelled
        }
        
        // Then choose from snippets in that tag
        const filteredSnippets = tagMap.get(selectedTag.tag) || [];
        const snippetItems = filteredSnippets.map(snippet => ({
            label: snippet.title,
            description: snippet.tags.join(', '),
            detail: snippet.content.length > 100 ? 
                `${snippet.content.substring(0, 100)}...` : 
                snippet.content,
            snippet
        }));
        
        const selectedSnippet = await vscode.window.showQuickPick(snippetItems, {
            placeHolder: 'Select a snippet to insert'
        });
        
        return selectedSnippet?.snippet;
    }
}
