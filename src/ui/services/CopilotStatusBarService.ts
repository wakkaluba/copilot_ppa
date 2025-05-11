import * as vscode from 'vscode';

/**
 * Service responsible for managing the Copilot status bar in VS Code.
 */
export class CopilotStatusBarService {
    private context: vscode.ExtensionContext;
    private statusBarItem: vscode.StatusBarItem;
    private currentProvider: string = 'copilot';

    /**
     * Creates a new instance of the CopilotStatusBarService.
     *
     * @param context The VS Code extension context
     */
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'copilot-ppa.toggleProvider';
        this.statusBarItem.tooltip = 'Toggle between Copilot and other LLM providers';
        this.updateStatusBar();
        this.statusBarItem.show();

        this.context.subscriptions.push(this.statusBarItem);
    }

    /**
     * Updates the status bar text based on the current provider.
     */
    public updateStatusBar(): void {
        switch (this.currentProvider) {
            case 'copilot':
                this.statusBarItem.text = '$(github) Copilot';
                break;
            case 'localLLM':
                this.statusBarItem.text = '$(server) Local LLM';
                break;
            case 'azureOpenAI':
                this.statusBarItem.text = '$(azure) Azure OpenAI';
                break;
            default:
                this.statusBarItem.text = '$(robot) AI Provider';
                break;
        }
    }

    /**
     * Toggles between different AI providers.
     *
     * @returns The name of the new provider
     */
    public async toggleProvider(): Promise<string> {
        // Cycle through providers: copilot -> localLLM -> azureOpenAI -> copilot
        switch (this.currentProvider) {
            case 'copilot':
                this.currentProvider = 'localLLM';
                break;
            case 'localLLM':
                this.currentProvider = 'azureOpenAI';
                break;
            case 'azureOpenAI':
                this.currentProvider = 'copilot';
                break;
            default:
                this.currentProvider = 'copilot';
                break;
        }

        this.updateStatusBar();
        return this.currentProvider;
    }

    /**
     * Gets the current provider.
     *
     * @returns The name of the current provider
     */
    public getCurrentProvider(): string {
        return this.currentProvider;
    }

    /**
     * Sets the current provider directly.
     *
     * @param provider The name of the provider to set
     */
    public setProvider(provider: string): void {
        if (['copilot', 'localLLM', 'azureOpenAI'].includes(provider)) {
            this.currentProvider = provider;
            this.updateStatusBar();
        }
    }
}
