import * as vscode from 'vscode';
import { SnippetManager } from '../services/snippetManager';
import { ConversationManager } from '../services/conversationManager';
import { SnippetCreationService } from '../services/snippets/SnippetCreationService';
import { SnippetSelectionService } from '../services/snippets/SnippetSelectionService';
import { SnippetInsertionService } from '../services/snippets/SnippetInsertionService';

export class SnippetCommands {
    public static readonly createSnippetCommandId = 'copilotPPA.createSnippet';
    public static readonly insertSnippetCommandId = 'copilotPPA.insertSnippet';
    public static readonly manageSnippetsCommandId = 'copilotPPA.manageSnippets';
    
    private readonly creationService: SnippetCreationService;
    private readonly selectionService: SnippetSelectionService;
    private readonly insertionService: SnippetInsertionService;
    
    constructor(context: vscode.ExtensionContext) {
        const snippetManager = SnippetManager.getInstance(context);
        const conversationManager = ConversationManager.getInstance(context);
        
        this.creationService = new SnippetCreationService(snippetManager, conversationManager);
        this.selectionService = new SnippetSelectionService(snippetManager, conversationManager);
        this.insertionService = new SnippetInsertionService();
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
    
    private async createSnippet(conversationId?: string, messageIndices?: number[]): Promise<void> {
        try {
            await this.creationService.createSnippet(conversationId, messageIndices);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create snippet: ${error.message}`);
        }
    }
    
    private async insertSnippet(): Promise<void> {
        try {
            const snippet = await this.selectionService.selectSnippet();
            if (snippet) {
                await this.insertionService.insertSnippet(snippet);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to insert snippet: ${error.message}`);
        }
    }
    
    private async manageSnippets(): Promise<void> {
        await vscode.commands.executeCommand('copilotPPA.openSnippetsPanel');
    }
}
