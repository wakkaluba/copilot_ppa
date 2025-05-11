import * as vscode from 'vscode';
import { CopilotIntegrationService } from '../../copilot/copilotIntegrationService';

/**
 * Service responsible for registering Copilot-related commands in VS Code.
 */
export class CopilotCommandRegistrationService {
    private context: vscode.ExtensionContext;
    private copilotService: CopilotIntegrationService;

    /**
     * Creates a new instance of the CopilotCommandRegistrationService.
     *
     * @param context The VS Code extension context
     * @param copilotService The Copilot integration service
     */
    constructor(context: vscode.ExtensionContext, copilotService: CopilotIntegrationService) {
        this.context = context;
        this.copilotService = copilotService;
    }

    /**
     * Registers a command to open the Copilot integration webview.
     *
     * @param callback The callback to execute when the command is invoked
     * @returns A disposable that can be used to unregister the command
     */
    public registerWebviewCommand(callback: () => void): vscode.Disposable {
        const disposable = vscode.commands.registerCommand('copilot-ppa.openCopilotWebview', callback);
        this.context.subscriptions.push(disposable);
        return disposable;
    }

    /**
     * Registers a command to toggle between Copilot and other providers.
     *
     * @param callback The callback to execute when the command is invoked
     * @returns A disposable that can be used to unregister the command
     */
    public registerProviderToggleCommand(callback: () => Promise<void>): vscode.Disposable {
        const disposable = vscode.commands.registerCommand('copilot-ppa.toggleProvider', callback);
        this.context.subscriptions.push(disposable);
        return disposable;
    }

    /**
     * Registers a command to check if Copilot is available.
     *
     * @param callback The callback to execute when the command is invoked
     * @returns A disposable that can be used to unregister the command
     */
    public registerAvailabilityCheckCommand(callback: () => boolean): vscode.Disposable {
        const disposable = vscode.commands.registerCommand('copilot-ppa.checkCopilotAvailability', callback);
        this.context.subscriptions.push(disposable);
        return disposable;
    }

    /**
     * Registers a command to process the selected code with Copilot.
     *
     * @param callback The callback to execute when the command is invoked
     * @returns A disposable that can be used to unregister the command
     */
    public registerCodeSelectionCommand(callback: (editor: vscode.TextEditor) => Promise<void>): vscode.Disposable {
        const disposable = vscode.commands.registerTextEditorCommand('copilot-ppa.processSelectedCode', callback);
        this.context.subscriptions.push(disposable);
        return disposable;
    }
}
