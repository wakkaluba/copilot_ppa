import * as vscode from 'vscode';
import { IExtensionContext } from '../../src/types';

/**
 * Creates a mock extension context for testing
 */
export function createMockExtensionContext(): IExtensionContext {
  return {
    subscriptions: [],
    extensionPath: '/mock/extension/path',
    storagePath: '/mock/storage/path',
    globalStoragePath: '/mock/global/storage/path',
    logPath: '/mock/log/path',
    asAbsolutePath: (relativePath: string) => `/mock/extension/path/${relativePath}`,
    workspaceState: {
      get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
      update: jest.fn().mockResolvedValue(undefined)
    },
    globalState: {
      get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
      update: jest.fn().mockResolvedValue(undefined)
    }
  };
}

/**
 * Creates a mock workspace folder for testing
 */
export function createMockWorkspaceFolder(name: string = 'test', path: string = '/test/workspace'): vscode.WorkspaceFolder {
  return {
    uri: { 
      fsPath: path,
      toString: () => path,
      scheme: 'file',
      path,
      authority: '',
      query: '',
      fragment: '',
      with: jest.fn().mockReturnThis()
    } as any as vscode.Uri,
    name,
    index: 0
  };
}

/**
 * Creates a mock document for testing
 */
export function createMockDocument(content: string = '', language: string = 'typescript'): vscode.TextDocument {
  return {
    uri: {
      fsPath: '/test/document.ts',
      scheme: 'file'
    } as any as vscode.Uri,
    fileName: '/test/document.ts',
    isUntitled: false,
    languageId: language,
    version: 1,
    isDirty: false,
    isClosed: false,
    save: jest.fn().mockResolvedValue(true),
    eol: vscode.EndOfLine.LF,
    lineCount: content.split('\n').length,
    lineAt: jest.fn().mockImplementation((line) => {
      const lines = content.split('\n');
      return {
        lineNumber: typeof line === 'number' ? line : line.line,
        text: lines[typeof line === 'number' ? line : line.line] || '',
        range: new vscode.Range(0, 0, 0, 0),
        rangeIncludingLineBreak: new vscode.Range(0, 0, 0, 0),
        firstNonWhitespaceCharacterIndex: 0,
        isEmptyOrWhitespace: false
      };
    }),
    offsetAt: jest.fn().mockReturnValue(0),
    positionAt: jest.fn().mockReturnValue(new vscode.Position(0, 0)),
    getText: jest.fn().mockReturnValue(content),
    getWordRangeAtPosition: jest.fn().mockReturnValue(new vscode.Range(0, 0, 0, 0)),
    validateRange: jest.fn().mockImplementation(range => range),
    validatePosition: jest.fn().mockImplementation(position => position)
  };
}

/**
 * Creates a mock output channel for testing
 */
export function createMockOutputChannel(name: string = 'Test Channel'): vscode.OutputChannel {
  return {
    name,
    append: jest.fn(),
    appendLine: jest.fn(),
    clear: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn()
  };
}

/**
 * Creates a mock conversation history
 */
export function createMockConversationHistory() {
  return {
    id: 'test-conversation',
    getName: jest.fn().mockReturnValue('Test Conversation'),
    getMessages: jest.fn().mockReturnValue([]),
    addMessage: jest.fn(),
    setName: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
    load: jest.fn().mockResolvedValue(undefined)
  };
}