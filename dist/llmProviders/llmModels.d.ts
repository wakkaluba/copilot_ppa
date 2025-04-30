import * as vscode from 'vscode';
export interface LLMModel {
    id: string;
    name: string;
    provider: 'ollama' | 'lmstudio' | 'huggingface';
    description: string;
    parameters?: Record<string, any>;
    size?: string;
    license?: string;
    tags?: string[];
    installed?: boolean;
}
export declare class LLMModelsManager {
    private service;
    constructor(context: vscode.ExtensionContext);
    get onModelsChanged(): vscode.Event<void>;
    initialize(): Promise<void>;
    getLocalModels(): LLMModel[];
    getHuggingFaceModels(): LLMModel[];
    refreshInstalledModels(): Promise<void>;
    downloadOllamaModel(modelId: string): Promise<void>;
    downloadLmStudioModel(modelId: string): Promise<void>;
    checkOllamaStatus(): Promise<{
        installed: boolean;
        running: boolean;
    }>;
    checkLmStudioStatus(): Promise<{
        installed: boolean;
    }>;
    getOllamaInstallInstructions(): string;
    getLmStudioInstallInstructions(): string;
}
