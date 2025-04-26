/**
 * Centralized helper functions for test files
 * 
 * This provides type-safe access to the mocked vscode API
 * without requiring each test file to import the actual module
 */

// Use type-only import to avoid actual module import
import type * as vscodeTypes from 'vscode';

// Export a mock vscode API helper 
export const getVSCodeMock = (): typeof vscodeTypes => {
  // Cast the mocked API to the vscode type
  return require('vscode') as typeof vscodeTypes;
};

// Export EventEmitter mock helper
export class MockEventEmitter<T> implements vscodeTypes.EventEmitter<T> {
    private listeners = new Set<(e: T) => any>();

    public event: vscodeTypes.Event<T> = (listener: (e: T) => any) => {
        this.listeners.add(listener);
        return {
            dispose: () => {
                this.listeners.delete(listener);
            }
        };
    };

    public fire(data: T): void {
        this.listeners.forEach(listener => listener(data));
    }

    public dispose(): void {
        this.listeners.clear();
    }
}

// Utility to create mock extension context
export function createMockExtensionContext(): vscodeTypes.ExtensionContext {
  return {
    subscriptions: [],
    extensionPath: '/test/extension',
    extensionUri: { 
      scheme: 'file', 
      path: '/test/extension',
      authority: '',
      query: '',
      fragment: '',
      fsPath: '/test/extension',
      with: jest.fn(),
      toJSON: jest.fn()
    } as any,
    storagePath: '/test/storage',
    storageUri: {} as any,
    globalStoragePath: '/test/globalStorage',
    globalStorageUri: {} as any,
    logPath: '/test/log',
    logUri: {} as any,
    extensionMode: 2,
    environmentVariableCollection: {} as any,
    asAbsolutePath: jest.fn(relativePath => `/test/extension/${relativePath}`),
    workspaceState: {
      get: jest.fn(),
      update: jest.fn(),
      keys: jest.fn().mockReturnValue([])
    },
    globalState: {
      get: jest.fn(),
      update: jest.fn(),
      keys: jest.fn().mockReturnValue([]),
      setKeysForSync: jest.fn()
    },
    secrets: {
      get: jest.fn(),
      store: jest.fn(),
      delete: jest.fn(),
      onDidChange: jest.fn()
    },
    extension: {
      id: 'test.extension',
      extensionPath: '/test/extension',
      extensionUri: { 
        scheme: 'file', 
        path: '/test/extension',
        authority: '',
        query: '',
        fragment: '',
        fsPath: '/test/extension',
        with: jest.fn(),
        toJSON: jest.fn()
      },
      isActive: true,
      packageJSON: {},
      extensionKind: 1,
      exports: {},
      // Add the missing activate method
      activate: () => Promise.resolve()
    },
    languageModelAccessInformation: {
      onDidChange: jest.fn(),
      canSendRequest: jest.fn().mockReturnValue(true)
    }
  };
}
