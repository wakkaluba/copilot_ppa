import * as vscode from 'vscode';
import * as path from 'path';
import { ConversationManager } from '../services/conversationManager';

export class ConversationExportCommand {
    public static readonly commandId = 'copilotPPA.exportConversation';
    public static readonly exportAllCommandId = 'copilotPPA.exportAllConversations';
    
    private conversationManager: ConversationManager;
    
    constructor(context: vscode.ExtensionContext) {
        this.conversationManager = ConversationManager.getInstance(context);
    }
    
    public register(): vscode.Disposable[] {
        return [
            vscode.commands.registerCommand(ConversationExportCommand.commandId, async (conversationId?: string) => {
                await this.exportConversation(conversationId);
            }),
            vscode.commands.registerCommand(ConversationExportCommand.exportAllCommandId, async () => {
                await this.exportAllConversations();
            })
        ];
    }
    
    private async exportConversation(conversationId?: string): Promise<void> {
        try {
            // If no conversation ID is provided, let the user select one
            if (!conversationId) {
                conversationId = await this.selectConversation();
                if (!conversationId) {
                    return; // User cancelled
                }
            }
            
            // Get save location from user
            const filepath = await this.getSaveFilePath('conversation.json');
            if (!filepath) {
                return; // User cancelled
            }
            
            // Export the conversation
            const success = await this.conversationManager.exportConversation(conversationId, filepath);
            
            if (success) {
                vscode.window.showInformationMessage(`Conversation exported to ${path.basename(filepath)}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error.message}`);
        }
    }
    
    private async exportAllConversations(): Promise<void> {
        try {
            // Get save location from user
            const filepath = await this.getSaveFilePath('all_conversations.json');
            if (!filepath) {
                return; // User cancelled
            }
            
            // Export all conversations
            const success = await this.conversationManager.exportAllConversations(filepath);
            
            if (success) {
                vscode.window.showInformationMessage(`All conversations exported to ${path.basename(filepath)}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error.message}`);
        }
    }
    
    private async selectConversation(): Promise<string | undefined> {
        // Get all conversations
        const conversations = this.conversationManager.getAllConversations();
        
        if (conversations.length === 0) {
            vscode.window.showInformationMessage('No conversations to export');
            return undefined;
        }
        
        // Create quick pick items
        const items = conversations.map(conv => ({
            label: conv.title,
            description: `${conv.messages.length} messages · ${new Date(conv.updatedAt).toLocaleString()}`,
            conversationId: conv.id
        }));
        
        // Show quick pick
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a conversation to export',
            matchOnDescription: true
        });
        
        return selected?.conversationId;
    }
    
    private async getSaveFilePath(defaultName: string): Promise<string | undefined> {
        const options: vscode.SaveDialogOptions = {
            defaultUri: vscode.Uri.file(path.join(this.getDefaultSaveLocation(), defaultName)),
            filters: {
                'JSON Files': ['json'],
                'All Files': ['*']
            },
            saveLabel: 'Export'
        };
        
        const uri = await vscode.window.showSaveDialog(options);
        return uri?.fsPath;
    }
    
    private getDefaultSaveLocation(): string {
        // Try to get the first workspace folder, fall back to home directory
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return workspaceFolders[0].uri.fsPath;
        }
        
        return process.env.HOME || process.env.USERPROFILE || '';
    }
}
