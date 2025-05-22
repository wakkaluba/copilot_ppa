// No imports needed since stub does not use vscode

// Use 'unknown' instead of 'any' for ContextManagerImpl
let ContextManagerImpl: unknown;
let loadError: Error | undefined;

try {
  // Attempt to import the real ContextManager implementation
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ContextManagerImpl = require('./conversation/ContextManager').ContextManager;
} catch (error) {
  loadError = error instanceof Error ? error : new Error(String(error));
  // Fallback stub implementation
  class ContextManagerStub {
    static instance: ContextManagerStub | undefined;
    // Remove unused 'context' parameter
    static getInstance(): ContextManagerStub {
      if (!ContextManagerStub.instance) {
        ContextManagerStub.instance = new ContextManagerStub();
      }
      return ContextManagerStub.instance;
    }
    async initialize(): Promise<void> {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    addMessage(): void {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    processUserMessage(): void {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    processAssistantMessage(): void {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    async getRecentHistory(): Promise<[]> {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    getAllHistory(): [] {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    async clearHistory(): Promise<void> {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    getUserPreferences(): never {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    async setUserPreference(): Promise<void> {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    getPreferredLanguage(): undefined {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    getPreferredFramework(): undefined {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    getPreferredFileExtensions(): [] {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    getRecentFileExtensions(): [] {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    getActiveFiles(): [] {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    getRecentDirectories(): [] {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    getFileNamingPatterns(): [] {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    buildContextString(): string {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    async clearContext(): Promise<void> {
      throw loadError || new Error('ContextManager implementation not available.');
    }
    dispose(): void {
      // no-op
    }
  }
  ContextManagerImpl = ContextManagerStub;
}

/**
 * Export the ContextManager (real or stub).
 * Consumers should always use getInstance(context) and handle thrown errors.
 */
export const ContextManager = ContextManagerImpl;
