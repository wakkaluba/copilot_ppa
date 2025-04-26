\
// Remove unused import: vscode
// import * as vscode from 'vscode';
import { CommandParser } from '../../../src/services/commandParser';
import { WorkspaceManager } from '../../../src/services/WorkspaceManager'; // Assuming WorkspaceManager exists
import { Logger } from '../../../src/utils/logger'; // Assuming Logger exists
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// Mocks
const mockWorkspaceManager = {
  createFile: jest.fn().mockResolvedValue(undefined as void), // Fix mock return type
  modifyFile: jest.fn().mockResolvedValue(undefined as void), // Fix mock return type
  deleteFile: jest.fn().mockResolvedValue(undefined as void), // Fix mock return type
  readFile: jest.fn().mockResolvedValue('File content' as string), // Fix mock return type
  fileExists: jest.fn().mockResolvedValue(true as boolean), // Fix mock return type
  listDirectory: jest.fn().mockResolvedValue(['file1.txt', 'subdir/']),
} as jest.Mocked<WorkspaceManager>; // Use jest.Mocked for type safety

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  setLogLevel: jest.fn(),
  getLogs: jest.fn().mockReturnValue([]),
  log: jest.fn(), // Keep if used, otherwise remove
} as jest.Mocked<Logger>; // Use jest.Mocked

describe('CommandParser', () => {
  let commandParser: CommandParser;

  beforeEach(() => {
    jest.clearAllMocks();
    // Assuming CommandParser takes WorkspaceManager and Logger
    commandParser = new CommandParser(mockWorkspaceManager, mockLogger);
  });

  test('should register and execute a command with arguments', async () => {
    const mockHandler = jest.fn().mockResolvedValue(undefined as void); // Fix mock return type
    commandParser.registerCommand('testCommand', mockHandler);

    await commandParser.parseAndExecute('/testCommand arg1 "arg 2"');

    expect(mockHandler).toHaveBeenCalledWith({ arg1: true, 'arg 2': true });
    expect(mockLogger.info).toHaveBeenCalledWith("Executing command: testCommand with args:", { arg1: true, 'arg 2': true });
  });

  test('should register and execute a command without arguments', async () => {
    const mockHandler = jest.fn().mockResolvedValue(undefined as void); // Fix mock return type
    commandParser.registerCommand('noArgs', mockHandler);

    await commandParser.parseAndExecute('/noArgs');

    expect(mockHandler).toHaveBeenCalledWith({});
    expect(mockLogger.info).toHaveBeenCalledWith("Executing command: noArgs with args:", {});
  });

  // ... other tests ...

   test('should parse and execute /create_file command', async () => {
    await commandParser.parseAndExecute('/create_file path/to/new_file.txt "Initial content"');
    // Check if the correct WorkspaceManager method was called
    expect(mockWorkspaceManager.createFile).toHaveBeenCalledWith('path/to/new_file.txt', 'Initial content');
  });

  test('should parse and execute /modify_file command', async () => {
    await commandParser.parseAndExecute('/modify_file path/to/existing_file.txt "New content"');
     // Check if the correct WorkspaceManager method was called (assuming modifyFile exists)
    expect(mockWorkspaceManager.modifyFile).toHaveBeenCalledWith('path/to/existing_file.txt', 'New content');
  });

  // ... rest of the tests ...
});
