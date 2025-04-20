import * as vscode from 'vscode';

export interface LLMPromptOptions {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    stopSequences?: string[];
}

export interface HardwareSpecs {
    gpu: {
        available: boolean;
        name?: string;
        vram?: number;
        cudaSupport?: boolean;
    };
    ram: {
        total: number;
        free: number;
    };
    cpu: {
        cores: number;
        model?: string;
    };
}

export interface ILLMModelService extends vscode.Disposable {
    initialize(): Promise<void>;
    clearConversation(): Promise<void>;
}
