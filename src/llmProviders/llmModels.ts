import * as vscode from 'vscode';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { LLMModelsService } from './services/LLMModelsService';

const execAsync = promisify(exec);

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

export class LLMModelsManager {
    private service: LLMModelsService;

    constructor(context: vscode.ExtensionContext) {
        this.service = new LLMModelsService(context);
    }

    public get onModelsChanged(): vscode.Event<void> {
        return this.service.onModelsChanged;
    }

    public async initialize(): Promise<void> {
        await this.service.initializeModels();
    }

    public getLocalModels(): LLMModel[] {
        return this.service.getLocalModels();
    }

    public getHuggingFaceModels(): LLMModel[] {
        return this.service.getHuggingFaceModels();
    }

    public async refreshInstalledModels(): Promise<void> {
        await this.service.refreshInstalledModels();
    }

    public async downloadOllamaModel(modelId: string): Promise<void> {
        await this.service.downloadOllamaModel(modelId);
    }

    public async downloadLmStudioModel(modelId: string): Promise<void> {
        await this.service.downloadLmStudioModel(modelId);
    }

    public async checkOllamaStatus(): Promise<{ installed: boolean; running: boolean }> {
        return this.service.checkOllamaStatus();
    }

    public async checkLmStudioStatus(): Promise<{ installed: boolean }> {
        return this.service.checkLmStudioStatus();
    }

    public getOllamaInstallInstructions(): string {
        return this.service.getOllamaInstallInstructions();
    }

    public getLmStudioInstallInstructions(): string {
        return this.service.getLmStudioInstallInstructions();
    }
}
