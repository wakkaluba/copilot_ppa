/**
 * Mock implementation of the LLMModelsService for testing purposes
 */

import * as vscode from 'vscode';

export class LLMModelsService {
  private _onModelsChanged = new vscode.EventEmitter<void>();
  public readonly onModelsChanged = this._onModelsChanged.event;

  private localModels: any[] = [];
  private huggingFaceModels: any[] = [];

  constructor(private context: vscode.ExtensionContext) {}

  public async initializeModels(): Promise<void> {
    // Mock implementation
  }

  public getLocalModels(): any[] {
    return this.localModels;
  }

  public getHuggingFaceModels(): any[] {
    return this.huggingFaceModels;
  }

  public async refreshInstalledModels(): Promise<void> {
    // Mock implementation
    this._onModelsChanged.fire();
  }

  public async downloadOllamaModel(modelId: string): Promise<void> {
    // Mock implementation
  }

  public async downloadLmStudioModel(modelId: string): Promise<void> {
    // Mock implementation
  }

  public async checkOllamaStatus(): Promise<{ installed: boolean; running: boolean }> {
    return { installed: false, running: false };
  }

  public async checkLmStudioStatus(): Promise<{ installed: boolean }> {
    return { installed: false };
  }

  public getOllamaInstallInstructions(): string {
    return 'Mock Ollama installation instructions';
  }

  public getLmStudioInstallInstructions(): string {
    return 'Mock LM Studio installation instructions';
  }
}
