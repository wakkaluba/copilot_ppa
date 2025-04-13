import * as vscode from 'vscode';
import { LLMHostManager } from '../services/LLMHostManager';
import { LLMConnectionManager } from '../services/LLMConnectionManager';

export class ModelSelector {
    private static instance: ModelSelector;
    private statusBarItem: vscode.StatusBarItem;
    private currentModel: string = '';

    private constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            98
        );
        this.statusBarItem.command = 'copilot-ppa.selectModel';
        this.updateStatusBarItem();
    }

    static getInstance(): ModelSelector {
        if (!this.instance) {
            this.instance = new ModelSelector();
        }
        return this.instance;
    }

    async promptModelSelection(): Promise<void> {
        const models = await this.getAvailableModels();
        const selected = await vscode.window.showQuickPick(models, {
            placeHolder: 'Select an LLM model',
            title: 'Model Selection'
        });

        if (selected) {
            await this.setModel(selected);
        }
    }

    private async getAvailableModels(): Promise<string[]> {
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            const data = await response.json();
            return data.models || [];
        } catch {
            return ['codellama', 'llama2', 'mistral']; // Fallback defaults
        }
    }

    private async setModel(modelName: string): Promise<void> {
        this.currentModel = modelName;
        await vscode.workspace.getConfiguration('copilot-ppa').update('model', modelName, true);
        this.updateStatusBarItem();
        
        // Restart connection with new model
        const connectionManager = LLMConnectionManager.getInstance();
        await connectionManager.reconnect();
    }

    private updateStatusBarItem(): void {
        this.statusBarItem.text = `$(symbol-enum) Model: ${this.currentModel || 'Not Selected'}`;
        this.statusBarItem.show();
    }

    async initialize(): Promise<void> {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        this.currentModel = config.get<string>('model', '');
        this.updateStatusBarItem();
    }
}
