import * as vscode from 'vscode';

/**
 * Configuration helper for accessing VS Code settings
 */
export class Config {
  /**
   * Get the Ollama API endpoint URL
   */
  static get ollamaEndpoint(): string {
    const config = vscode.workspace.getConfiguration('vscodeLocalLLMAgent');
    return config.get<string>('ollamaEndpoint', 'http://localhost:11434');
  }

  /**
   * Get the Ollama API URL (with /api suffix)
   */
  static get ollamaApiUrl(): string {
    return `${this.ollamaEndpoint}/api`;
  }

  /**
   * Get the default Ollama model name
   */
  static get ollamaModel(): string {
    const config = vscode.workspace.getConfiguration('vscodeLocalLLMAgent');
    return config.get<string>('ollamaModel', 'llama2');
  }

  /**
   * Get the LM Studio API endpoint URL
   */
  static get lmStudioEndpoint(): string {
    const config = vscode.workspace.getConfiguration('vscodeLocalLLMAgent');
    return config.get<string>('lmStudioEndpoint', 'http://localhost:1234');
  }

  /**
   * Get the LM Studio API URL (with /v1 suffix)
   */
  static get lmStudioApiUrl(): string {
    return `${this.lmStudioEndpoint}/v1`;
  }

  /**
   * Get the default provider (ollama or lmstudio)
   */
  static get defaultProvider(): string {
    const config = vscode.workspace.getConfiguration('vscodeLocalLLMAgent');
    return config.get<string>('defaultProvider', 'ollama');
  }

  /**
   * Check if caching is enabled
   */
  static get cacheResponses(): boolean {
    const config = vscode.workspace.getConfiguration('vscodeLocalLLMAgent');
    return config.get<boolean>('cacheResponses', true);
  }
}
