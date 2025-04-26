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
    const vscode = getVSCodeMock();
    
    return {
        subscriptions: [],
        extensionPath: '/test/path',
        extensionUri: { fsPath: '/test/path' } as any,
        storagePath: '/test/storage/path',
        storageUri: { fsPath: '/test/storage/path' } as any,
        globalStoragePath: '/test/global/storage/path',
        globalStorageUri: { fsPath: '/test/global/storage/path' } as any,
        logPath: '/test/log/path',
        logUri: { fsPath: '/test/log/path' } as any,
        extensionMode: 2, // Test mode
        globalState: {
            get: jest.fn(),
            update: jest.fn(),
            setKeysForSync: jest.fn(),
            keys: jest.fn().mockReturnValue([])
        } as any,
        workspaceState: {
            get: jest.fn(),
            update: jest.fn(),
            keys: jest.fn().mockReturnValue([])
        } as any,
        secrets: {
            get: jest.fn(),
            store: jest.fn(),
            delete: jest.fn(),
            onDidChange: jest.fn()
        } as any,
        environmentVariableCollection: {} as any,
        asAbsolutePath: jest.fn(p => `/test/path/${p}`),
    };
}
