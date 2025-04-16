/**
 * Mock interface factory utilities
 * 
 * This file contains factory functions to create mock implementations of the various
 * interfaces used throughout the Copilot PPA extension. These mocks are useful for testing
 * components that depend on these interfaces without having to rely on the actual implementations.
 */

import * as vscode from 'vscode';
import { LLMProvider } from '../../../src/llm/llmProvider';
import { HardwareSpecs } from '../interfaces/llm/HardwareSpecs.test';
import { LLMPromptOptions } from '../interfaces/llm/LLMPromptOptions.test';
import { CommandAnalysis, CommandGenerationResult, CommandHistoryEntry, CommandResult, TerminalSession } from './terminal';

/**
 * Creates a mock LLMProvider instance
 */
export function createMockLLMProvider(overrides?: Partial<LLMProvider>): LLMProvider {
  const defaultProvider: LLMProvider = {
    name: 'MockLLM',
    modelName: 'mock-model',
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    isConnected: jest.fn().mockReturnValue(true),
    getModelName: jest.fn().mockReturnValue('mock-model'),
    getProviderType: jest.fn().mockReturnValue('mockLLM'),
    generateResponse: jest.fn().mockResolvedValue('Mock response'),
    sendPrompt: jest.fn().mockResolvedValue('Mock response'),
    refreshModels: jest.fn().mockResolvedValue(['mock-model-1', 'mock-model-2']),
    getAvailableModels: jest.fn().mockReturnValue(['mock-model-1', 'mock-model-2']),
    getHardwareSpecs: jest.fn().mockResolvedValue({
      cpuInfo: 'Mock CPU',
      gpuInfo: 'Mock GPU',
      gpuMemory: '8GB',
      totalMemory: '16GB',
      availableMemory: '8GB',
      isGpuAvailable: true,
      platform: 'mock-platform'
    } as HardwareSpecs),
    setParameters: jest.fn().mockResolvedValue(undefined),
    getModelInfo: jest.fn().mockResolvedValue({
      name: 'mock-model',
      provider: 'mockLLM',
      description: 'Mock model for testing',
      parameters: {}
    })
  };

  return { ...defaultProvider, ...overrides };
}

/**
 * Creates mock configuration manager instance
 */
export function createMockConfigurationManager(overrides?: Partial<vscode.WorkspaceConfiguration>): vscode.WorkspaceConfiguration {
  const defaultConfig: vscode.WorkspaceConfiguration = {
    get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
    has: jest.fn().mockReturnValue(true),
    inspect: jest.fn().mockReturnValue({ defaultValue: null, globalValue: null, workspaceValue: null }),
    update: jest.fn().mockResolvedValue(undefined),
    toJSON: jest.fn().mockReturnValue({}),
  };

  return { ...defaultConfig, ...overrides };
}

/**
 * Creates mock StatusBarItem instance
 */
export function createMockStatusBarItem(overrides?: Partial<vscode.StatusBarItem>): vscode.StatusBarItem {
  const defaultStatusBarItem: vscode.StatusBarItem = {
    id: 'mock-statusbar-item',
    name: 'Mock Status Bar Item',
    alignment: vscode.StatusBarAlignment.Left,
    priority: 0,
    text: 'Mock',
    tooltip: 'Mock Tooltip',
    color: new vscode.ThemeColor('statusBar.foreground'),
    backgroundColor: new vscode.ThemeColor('statusBar.background'),
    command: undefined,
    accessibilityInformation: undefined,
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn(),
  };

  return { ...defaultStatusBarItem, ...overrides };
}

/**
 * Creates mock LLM prompt options
 */
export function createMockLLMPromptOptions(overrides?: Partial<LLMPromptOptions>): LLMPromptOptions {
  const defaultOptions: LLMPromptOptions = {
    temperature: 0.7,
    maxTokens: 500,
    topP: 0.9,
    topK: 40,
    stopSequences: [],
    systemPrompt: 'You are a helpful assistant',
    includeContext: true,
  };

  return { ...defaultOptions, ...overrides };
}

/**
 * Creates mock conversation manager
 */
export function createMockConversationManager(overrides?: Partial<any>): any {
  const defaultConversationManager = {
    createConversation: jest.fn().mockResolvedValue({ id: 'mock-conversation-id', title: 'Mock Conversation' }),
    getConversation: jest.fn().mockResolvedValue({
      id: 'mock-conversation-id',
      title: 'Mock Conversation',
      messages: [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there! How can I help you?' }
      ]
    }),
    addMessage: jest.fn().mockResolvedValue(undefined),
    updateConversation: jest.fn().mockResolvedValue(undefined),
    deleteConversation: jest.fn().mockResolvedValue(undefined),
    listConversations: jest.fn().mockResolvedValue([
      { id: 'mock-conversation-id-1', title: 'Mock Conversation 1', updated: Date.now() },
      { id: 'mock-conversation-id-2', title: 'Mock Conversation 2', updated: Date.now() - 1000 }
    ]),
    exportConversation: jest.fn().mockResolvedValue(JSON.stringify({
      id: 'mock-conversation-id',
      title: 'Mock Conversation',
      messages: []
    })),
    importConversation: jest.fn().mockResolvedValue({ id: 'imported-conversation', title: 'Imported Conversation' }),
  };

  return { ...defaultConversationManager, ...overrides };
}

/**
 * Creates mock terminal related objects
 */
export * from './terminal/mockFactories';