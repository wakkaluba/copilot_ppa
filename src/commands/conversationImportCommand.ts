import * as vscode from 'vscode';
import * as path from 'path';
import { ConversationManager, Conversation } from '../services/conversationManager';

export class ConversationImportCommand {
    public static readonly commandId = 'copilotPPA.importConversation';
    
    private conversationManager: ConversationManager;
    
    constructor(context: vscode.ExtensionContext) {
        this.conversationManager = ConversationManager.getInstance(context);
    }
    
    public register(): vscode.Disposable {
        return vscode.commands.registerCommand(ConversationImportCommand.commandId, async () => {
            await this.importConversation();
        });
    }
    
    private async importConversation(): Promise<void> {
        try {
            // Get file path to import
            const filepath = await this.getOpenFilePath();
            if (!filepath) {
                return; // User cancelled
            }
            
            // Ask if we should replace existing conversations
            const replaceExisting = await this.shouldReplaceExisting();
            
            // Import the conversations
            const importedConversations = await this.conversationManager.importConversations(filepath, replaceExisting);
            
            if (importedConversations.length > 0) {
                vscode.window.showInformationMessage(
                    `Successfully imported ${importedConversations.length} conversation(s)`
                );
            } else {
                vscode.window.showWarningMessage('No conversations were imported');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Import failed: ${error.message}`);
        }
    }
    
    private async getOpenFilePath(): Promise<string | undefined> {
        const options: vscode.OpenDialogOptions = {
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                'JSON Files': ['json'],
                'All Files': ['*']
            },
            openLabel: 'Import'
        };
        
        const fileUri = await vscode.window.showOpenDialog(options);
        if (fileUri && fileUri.length > 0) {
            return fileUri[0].fsPath;
        }
        return undefined;
    }
    
    private async shouldReplaceExisting(): Promise<boolean> {
        const options = [
            { label: 'Yes', description: 'Replace existing conversations with the same ID' },
            { label: 'No', description: 'Generate new IDs for imported conversations with duplicate IDs' }
        ];
        
        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: 'Replace existing conversations?'
        });
        
        return selection?.label === 'Yes';
    }
}
