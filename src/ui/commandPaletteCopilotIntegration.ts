import * as vscode from 'vscode';
import { CopilotIntegrationWebview } from '../copilot/copilotIntegrationWebview';
import { CopilotIntegrationProvider } from '../copilot/copilotIntegrationProvider';
import { CopilotIntegrationService } from '../copilot/copilotIntegrationService';
import { CopilotCommandRegistrationService } from './services/CopilotCommandRegistrationService';
import { CopilotStatusBarService } from './services/CopilotStatusBarService';
import { CopilotCodeProcessingService } from './services/CopilotCodeProcessingService';

export function registerCopilotIntegrationCommands(
    context: vscode.ExtensionContext,
    copilotProvider: CopilotIntegrationProvider,
    copilotService: CopilotIntegrationService
): void {
    const commandRegistrationService = new CopilotCommandRegistrationService(context, copilotService);
    const statusBarService = new CopilotStatusBarService(context);
    const codeProcessingService = new CopilotCodeProcessingService(copilotProvider);
    
    registerCommands(
        context,
        commandRegistrationService,
        statusBarService,
        codeProcessingService,
        copilotService
    );
    
    setupStatusBarUpdates(context, statusBarService);
}

function registerCommands(
    context: vscode.ExtensionContext,
    commandService: CopilotCommandRegistrationService,
    statusBarService: CopilotStatusBarService,
    codeProcessingService: CopilotCodeProcessingService,
    copilotService: CopilotIntegrationService
): void {
    // Register webview command
    commandService.registerWebviewCommand(() => {
        const webview = new CopilotIntegrationWebview(context, copilotService);
        webview.show();
    });

    // Register provider toggle command
    commandService.registerProviderToggleCommand(async () => {
        const newProvider = await statusBarService.toggleProvider();
        vscode.window.showInformationMessage(
            `Switched to ${newProvider === 'copilot' ? 'GitHub Copilot' : 'Local LLM'} as the provider.`
        );
    });

    // Register availability check command
    commandService.registerAvailabilityCheckCommand(() => {
        const isAvailable = copilotService.isAvailable();
        showAvailabilityMessage(isAvailable);
        return isAvailable;
    });

    // Register code selection command
    commandService.registerCodeSelectionCommand(async (editor) => {
        await handleCodeSelection(editor, codeProcessingService);
    });
}

function setupStatusBarUpdates(
    context: vscode.ExtensionContext,
    statusBarService: CopilotStatusBarService
): void {
    // Update status bar when settings change
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copilot-ppa.selectedProvider')) {
                statusBarService.updateStatusBar();
            }
        })
    );

    // Initial status bar update
    statusBarService.updateStatusBar();
}

async function handleCodeSelection(
    editor: vscode.TextEditor,
    codeProcessingService: CopilotCodeProcessingService
): Promise<void> {
    const selection = editor.selection;
    if (selection.isEmpty) {
        vscode.window.showErrorMessage('No text selected to send to Copilot.');
        return;
    }

    const text = editor.document.getText(selection);
    const userPrompt = await promptForUserInput();
    if (!userPrompt) {return;}

    await processCodeWithProgress(text, userPrompt, codeProcessingService);
}

async function promptForUserInput(): Promise<string | undefined> {
    return vscode.window.showInputBox({
        prompt: 'What would you like Copilot to do with this code?',
        placeHolder: 'E.g., Explain this code, Refactor this code, Optimize this code'
    });
}

async function processCodeWithProgress(
    text: string,
    userPrompt: string,
    codeProcessingService: CopilotCodeProcessingService
): Promise<void> {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Processing with Copilot...',
        cancellable: false
    }, async () => {
        try {
            const response = await codeProcessingService.processCode(text, userPrompt);
            if (response) {
                await showResponseInEditor(response);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error processing with Copilot: ${error}`);
        }
    });
}

async function showResponseInEditor(response: { completion: string }): Promise<void> {
    const document = await vscode.workspace.openTextDocument({
        content: `# Copilot Response\n\n${response.completion}`,
        language: 'markdown'
    });
    await vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.Beside });
}

function showAvailabilityMessage(isAvailable: boolean): void {
    if (isAvailable) {
        vscode.window.showInformationMessage('GitHub Copilot is available and connected.');
    } else {
        vscode.window.showErrorMessage(
            'GitHub Copilot is not available. Please make sure the extension is installed and authenticated.'
        );
    }
}
