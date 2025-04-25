/**
 * Mock interface factory utilities
 * 
 * This file contains factory functions to create mock implementations of the various
 * interfaces used throughout the Copilot PPA extension. These mocks are useful for testing
 * components that depend on these interfaces without having to rely on the actual implementations.
 */

import * as vscode from 'vscode';
import { LLMProvider } from '../../../src/llm/llm-provider';
import { MockLLMProvider } from '../../__testUtils__/MockLLMProvider';
import { ConnectionStatusService } from '../../../src/status/connectionStatusService';

/**
 * Creates a mock LLMProvider with custom overrides
 */
export function createMockLLMProvider(overrides?: Partial<LLMProvider>): LLMProvider {
  const mockProvider = new MockLLMProvider();
  
  if (overrides) {
    // Apply all overrides to the mock provider
    Object.entries(overrides).forEach(([key, value]) => {
      if (typeof value === 'function') {
        // For function properties, replace them with the override
        (mockProvider as any)[key] = value;
      } else {
        // For non-function properties, add them or override the existing ones
        (mockProvider as any)[key] = value;
      }
    });
  }
  
  return mockProvider;
}

/**
 * Creates a mock status bar item
 */
export function createMockStatusBarItem(): vscode.StatusBarItem {
  return {
    id: 'mock-status-bar',
    name: 'Mock Status Bar',
    tooltip: '',
    text: '',
    command: undefined,
    color: undefined,
    backgroundColor: undefined,
    alignment: vscode.StatusBarAlignment.Left,
    priority: 0,
    accessibilityInformation: { label: 'Mock Status', role: 'Status' },
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn()
  };
}

/**
 * Creates a mock connection status service
 */
export function createMockConnectionStatusService(): jest.Mocked<ConnectionStatusService> {
  return {
    setState: jest.fn(),
    showNotification: jest.fn(),
    state: 0, // ConnectionState.Disconnected
    activeModelName: '',
    providerName: '',
    onDidChangeState: jest.fn() as any,
    dispose: jest.fn(),
  } as unknown as jest.Mocked<ConnectionStatusService>;
}