/**
 * Mock terminal interface factory utilities
 * 
 * This file contains factory functions to create mock implementations of terminal-related
 * interfaces used throughout the Copilot PPA extension.
 */

import * as vscode from 'vscode';
import { CommandAnalysis } from './CommandAnalysis.test';
import { CommandGenerationResult } from './CommandGenerationResult.test';
import { CommandHistoryEntry } from './CommandHistoryEntry.test';
import { CommandResult } from './CommandResult.test';
import { TerminalSession } from './TerminalSession.test';

/**
 * Creates a mock CommandResult
 */
export function createMockCommandResult(overrides?: Partial<CommandResult>): CommandResult {
  const defaultCommandResult: CommandResult = {
    command: 'ls -la',
    output: 'total 12\ndrwxr-xr-x  2 user user 4096 Apr 16 10:00 .\ndrwxr-xr-x 10 user user 4096 Apr 16 10:00 ..',
    exitCode: 0,
    executionTime: 120,
    timestamp: new Date().toISOString(),
    shellType: 'bash',
    cwd: '/home/user'
  };

  return { ...defaultCommandResult, ...overrides };
}

/**
 * Creates a mock CommandHistoryEntry
 */
export function createMockCommandHistoryEntry(overrides?: Partial<CommandHistoryEntry>): CommandHistoryEntry {
  const defaultEntry: CommandHistoryEntry = {
    command: 'npm install',
    timestamp: new Date().toISOString(),
    shellType: 'bash',
    cwd: '/home/user/project',
    favorite: false
  };

  return { ...defaultEntry, ...overrides };
}

/**
 * Creates a mock TerminalSession
 */
export function createMockTerminalSession(overrides?: Partial<TerminalSession>): TerminalSession {
  const terminal = {
    sendText: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn()
  };

  const defaultSession: TerminalSession = {
    id: 'mock-terminal-session',
    name: 'Mock Terminal',
    shellType: 'bash',
    cwd: '/home/user/project',
    terminal: terminal as unknown as vscode.Terminal,
    executeCommand: jest.fn().mockResolvedValue(createMockCommandResult()),
    getHistory: jest.fn().mockReturnValue([
      createMockCommandHistoryEntry({ command: 'cd project' }),
      createMockCommandHistoryEntry({ command: 'npm install' }),
    ]),
    clearHistory: jest.fn()
  };

  return { ...defaultSession, ...overrides };
}

/**
 * Creates a mock CommandGenerationResult
 */
export function createMockCommandGenerationResult(overrides?: Partial<CommandGenerationResult>): CommandGenerationResult {
  const defaultResult: CommandGenerationResult = {
    command: 'find . -name "*.js" | xargs grep "TODO"',
    explanation: 'Find all JavaScript files and search for TODO comments',
    shellType: 'bash',
    alternatives: [
      'grep -r "TODO" --include="*.js" .',
      'git grep "TODO" -- "*.js"'
    ],
    confidence: 0.95
  };

  return { ...defaultResult, ...overrides };
}

/**
 * Creates a mock CommandAnalysis
 */
export function createMockCommandAnalysis(overrides?: Partial<CommandAnalysis>): CommandAnalysis {
  const defaultAnalysis: CommandAnalysis = {
    command: 'ls -la',
    purpose: 'List all files in the current directory including hidden files',
    components: [
      {
        value: 'ls',
        description: 'List directory contents'
      },
      {
        value: '-la',
        description: 'Show in long format (-l) and show hidden files (-a)'
      }
    ],
    safety: {
      level: 'safe',
      concerns: []
    },
    alternatives: [
      {
        command: 'find . -maxdepth 1',
        description: 'Alternative using find'
      }
    ]
  };

  return { ...defaultAnalysis, ...overrides };
}