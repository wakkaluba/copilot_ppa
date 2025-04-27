import * as vscode from 'vscode';
import { describe, expect, test, beforeEach, jest, afterEach } from '@jest/globals';
import { CommandParser } from '../../../src/services/CommandParser';
import { WorkspaceManager } from '../../../src/services/WorkspaceManager';

// Mock the WorkspaceManager
jest.mock('../../../src/services/WorkspaceManager');

describe('CommandParser', () => {
  let commandParser: CommandParser;
  let mockWorkspaceManager: jest.Mocked<WorkspaceManager>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a mock WorkspaceManager
    mockWorkspaceManager = {
      getInstance: jest.fn().mockReturnValue(mockWorkspaceManager),
      createFile: jest.fn().mockResolvedValue(undefined),
      modifyFile: jest.fn().mockResolvedValue(undefined),
      deleteFile: jest.fn().mockResolvedValue(undefined),
      readFile: jest.fn().mockResolvedValue('File content'),
      fileExists: jest.fn().mockResolvedValue(true),
      // Add other methods as needed
    } as unknown as jest.Mocked<WorkspaceManager>;

    // Mock the WorkspaceManager.getInstance method
    (WorkspaceManager.getInstance as jest.Mock).mockReturnValue(mockWorkspaceManager);

    // Get the CommandParser instance
    commandParser = CommandParser.getInstance();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('getInstance should return singleton instance', () => {
    const instance1 = CommandParser.getInstance();
    const instance2 = CommandParser.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('registerCommand should add a new command handler', () => {
    const mockHandler = jest.fn();
    commandParser.registerCommand('testCommand', mockHandler);

    // Use private property access to check if command was registered
    const commands = (commandParser as any).commands;
    expect(commands.has('testCommand')).toBe(true);
    expect(commands.get('testCommand')).toBe(mockHandler);
  });

  test('parseAndExecute should execute a valid command', async () => {
    // Register a mock command handler
    const mockHandler = jest.fn().mockResolvedValue(undefined);
    commandParser.registerCommand('testCommand', mockHandler);

    // Call parseAndExecute with a valid command
    await commandParser.parseAndExecute('/testCommand path="test/file.txt"');

    // Check if the handler was called with the correct arguments
    expect(mockHandler).toHaveBeenCalledWith({ path: 'test/file.txt' });
  });

  test('parseAndExecute should handle commands without arguments', async () => {
    // Register a mock command handler
    const mockHandler = jest.fn().mockResolvedValue(undefined);
    commandParser.registerCommand('noArgs', mockHandler);

    // Call parseAndExecute with a command that has no arguments
    await commandParser.parseAndExecute('/noArgs');

    // Check if the handler was called with an empty object
    expect(mockHandler).toHaveBeenCalledWith({});
  });

  test('parseAndExecute should return null for invalid commands', async () => {
    // Call parseAndExecute with a string that doesn't start with '/'
    const result = await commandParser.parseAndExecute('not a command');

    // Check that no command was executed
    expect(result).toBeNull();
  });

  test('parseAndExecute should throw for unknown commands', async () => {
    // Call parseAndExecute with a command that isn't registered
    await expect(commandParser.parseAndExecute('/unknownCommand')).rejects.toThrow('Unknown command');
  });

  test('parseCommand should correctly parse command name and arguments', () => {
    // Call the private parseCommand method
    const commandObj = (commandParser as any).parseCommand('/testCommand arg1="value1" arg2="value2"');

    // Check that the command was parsed correctly
    expect(commandObj).toEqual({
      name: 'testCommand',
      args: {
        arg1: 'value1',
        arg2: 'value2'
      }
    });
  });

  test('parseArgs should correctly parse string arguments', () => {
    // Call the private parseArgs method
    const args = (commandParser as any).parseArgs('key1="value1" key2="value2"');

    // Check that the arguments were parsed correctly
    expect(args).toEqual({
      key1: 'value1',
      key2: 'value2'
    });
  });

  test('parseArgs should correctly parse numeric arguments', () => {
    // Call the private parseArgs method
    const args = (commandParser as any).parseArgs('num1=123 num2=456.78');

    // Check that the arguments were parsed correctly
    expect(args).toEqual({
      num1: 123,
      num2: 456.78
    });
  });

  test('parseArgs should correctly parse boolean arguments', () => {
    // Call the private parseArgs method
    const args = (commandParser as any).parseArgs('bool1=true bool2=false');

    // Check that the arguments were parsed correctly
    expect(args).toEqual({
      bool1: true,
      bool2: false
    });
  });

  test('createFile should call workspaceManager.createFile', async () => {
    // Call the private createFile method
    await (commandParser as any).createFile({ 
      path: 'test/file.txt', 
      content: 'File content' 
    });

    // Check that workspaceManager.createFile was called with the correct arguments
    expect(mockWorkspaceManager.createFile).toHaveBeenCalledWith(
      'test/file.txt',
      'File content'
    );
  });

  test('modifyFile should call workspaceManager.modifyFile', async () => {
    // Call the private modifyFile method
    await (commandParser as any).modifyFile({ 
      path: 'test/file.txt', 
      changes: 'New content' 
    });

    // Check that workspaceManager.modifyFile was called with the correct arguments
    expect(mockWorkspaceManager.modifyFile).toHaveBeenCalledWith(
      'test/file.txt',
      'New content'
    );
  });

  test('deleteFile should call workspaceManager.deleteFile', async () => {
    // Call the private deleteFile method
    await (commandParser as any).deleteFile({ 
      path: 'test/file.txt'
    });

    // Check that workspaceManager.deleteFile was called with the correct arguments
    expect(mockWorkspaceManager.deleteFile).toHaveBeenCalledWith(
      'test/file.txt'
    );
  });
});