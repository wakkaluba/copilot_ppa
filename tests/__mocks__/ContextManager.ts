import * as vscode from 'vscode';

export class ContextManager implements vscode.Disposable {
    private static instance: ContextManager;
    private contexts: Map<string, any> = new Map();
    private userPreferences: Map<string, any> = new Map();

    public static getInstance(context: vscode.ExtensionContext): ContextManager {
        if (!ContextManager.instance) {
            ContextManager.instance = new ContextManager();
        }
        return ContextManager.instance;
    }

    public async initialize(): Promise<void> {
        return Promise.resolve();
    }

    public async createContext(conversationId: string): Promise<void> {
        this.contexts.set(conversationId, {
            activeFile: undefined,
            selectedCode: undefined,
            codeLanguage: undefined,
            lastCommand: undefined
        });
    }

    public async updateContext(conversationId: string, context: any): Promise<void> {
        const existing = this.contexts.get(conversationId) || {};
        this.contexts.set(conversationId, { ...existing, ...context });
    }

    public getContext(conversationId: string): any {
        return this.contexts.get(conversationId);
    }

    public async buildPrompt(conversationId: string, userPrompt: string): Promise<string> {
        const context = this.contexts.get(conversationId);
        if (!context) {
            return userPrompt;
        }

        let prompt = '';
        if (context.codeLanguage) {
            prompt += `Context: ${context.codeLanguage}\n`;
        }
        if (context.selectedCode) {
            prompt += `Code: ${context.selectedCode}\n`;
        }
        prompt += `\nUser: ${userPrompt}`;
        return prompt;
    }

    public dispose(): void {
        this.contexts.clear();
        this.userPreferences.clear();
    }
}