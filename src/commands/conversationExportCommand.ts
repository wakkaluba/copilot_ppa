import * as vscode from 'vscode';
import { ConversationManager } from '../services/conversationManager';
import { ConversationExportService } from '../services/conversation/ConversationExportService';
import { FileDialogService } from '../services/dialog/FileDialogService';
import { ConversationSelectionService } from '../services/conversation/ConversationSelectionService';

export class ConversationExportCommand {
    public static readonly commandId = 'copilotPPA.exportConversation';
    public static readonly exportAllCommandId = 'copilotPPA.exportAllConversations';
    
    private readonly exportService: ConversationExportService;
    private readonly fileDialogService: FileDialogService;
    private readonly selectionService: ConversationSelectionService;
    
    constructor(context: vscode.ExtensionContext) {
        const conversationManager = ConversationManager.getInstance(context);
        this.exportService = new ConversationExportService(conversationManager);
        this.fileDialogService = new FileDialogService();
        this.selectionService = new ConversationSelectionService(conversationManager);
    }
    
    public register(): vscode.Disposable[] {
        return [
            vscode.commands.registerCommand(
                ConversationExportCommand.commandId,
                async (conversationId?: string) => {
                    await this.exportConversation(conversationId);
                }
            ),
            vscode.commands.registerCommand(
                ConversationExportCommand.exportAllCommandId,
                async () => {
                    await this.exportAllConversations();
                }
            )
        ];
    }
    
    private async exportConversation(conversationId?: string): Promise<void> {
        try {
            if (!conversationId) {
                conversationId = await this.selectionService.selectConversation('Select a conversation to export');
                if (!conversationId) {return;}
            }
            
            const filepath = await this.fileDialogService.getSaveFilePath('conversation.json', ['json']);
            if (!filepath) {return;}
            
            await this.exportService.exportConversation(conversationId, filepath);
            vscode.window.showInformationMessage(`Conversation exported successfully`);
        } catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error.message}`);
        }
    }
    
    private async exportAllConversations(): Promise<void> {
        try {
            const filepath = await this.fileDialogService.getSaveFilePath('all_conversations.json', ['json']);
            if (!filepath) {return;}
            
            await this.exportService.exportAllConversations(filepath);
            vscode.window.showInformationMessage(`All conversations exported successfully`);
        } catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error.message}`);
        }
    }
}
