import * as vscode from 'vscode';
import { CommandParser } from '../../services/CommandParser';
import { WorkspaceManager } from '../../services/WorkspaceManager';
import { Logger } from '../../utils/logger';

jest.mock('../../services/WorkspaceManager');
jest.mock('../../utils/logger');

const mockWorkspaceManager = {
  createFile: jest.fn().mockResolvedValue(undefined as void),
  modifyFile: jest.fn().mockResolvedValue(undefined as void),
  deleteFile: jest.fn().mockResolvedValue(undefined as void),
  readFile: jest.fn().mockResolvedValue('File content' as string),
  fileExists: jest.fn().mockResolvedValue(true as boolean)
} as unknown as jest.Mocked<WorkspaceManager>;

const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
} as unknown as jest.Mocked<Logger>;

describe('CommandParser Tests', () => {
  beforeAll(() => {
    // Initialize CommandParser with required dependencies
    CommandParser.initialize(mockWorkspaceManager, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getInstance should return singleton instance', () => {
    const parser = CommandParser.getInstance();
    expect(parser).toBeDefined();
  });

  test('parseAndExecute should call correct handler for valid command', async () => {
    // Create spy for createFile command
    const createFileSpy = jest.spyOn(CommandParser.getInstance() as any, 'createFile');
    
    // Execute the command
    await CommandParser.getInstance().parseAndExecute('#createFile(path="test.txt", content="Hello World")');
    
    // Verify handler was called with correct arguments
    expect(createFileSpy).toHaveBeenCalledTimes(1);
    expect(createFileSpy).toHaveBeenCalledWith({
        path: 'test.txt',
        content: 'Hello World'
    });
  });

  test('parseAndExecute should return null for invalid command format', async () => {
    const result = await CommandParser.getInstance().parseAndExecute('not a valid command');
    expect(result).toBeNull();
  });

  test('parseAndExecute should throw error for unknown command', async () => {
    await expect(CommandParser.getInstance().parseAndExecute('#unknownCommand(arg="value")')).rejects.toThrowError(/Unknown command: unknownCommand/);
  });

  test('registerCommand should add custom command handler', async () => {
    // Create a custom command handler
    const customHandler = jest.fn().mockResolvedValue(undefined as void);
    
    // Register the command
    CommandParser.getInstance().registerCommand('customCommand', customHandler);
    
    // Execute the command
    await CommandParser.getInstance().parseAndExecute('#customCommand(key="value")');
    
    // Verify handler was called with correct arguments
    expect(customHandler).toHaveBeenCalledTimes(1);
    expect(customHandler).toHaveBeenCalledWith({
        key: 'value'
    });
  });

  test('createFile command should call workspaceManager.createFile', async () => {
    await CommandParser.getInstance().parseAndExecute('#createFile(path="test.txt", content="Hello World")');
    
    expect(mockWorkspaceManager.createFile).toHaveBeenCalledTimes(1);
    expect(mockWorkspaceManager.createFile).toHaveBeenCalledWith('test.txt', 'Hello World');
  });

  test('modifyFile command should read and write file', async () => {
    await CommandParser.getInstance().parseAndExecute('#modifyFile(path="test.txt", changes="New content")');
    
    // Should read the original file
    expect(mockWorkspaceManager.readFile).toHaveBeenCalledTimes(1);
    expect(mockWorkspaceManager.readFile).toHaveBeenCalledWith('test.txt');
    
    // Should write the new content
    expect(mockWorkspaceManager.modifyFile).toHaveBeenCalledTimes(1);
    expect(mockWorkspaceManager.modifyFile).toHaveBeenCalledWith('test.txt', 'New content');
  });

  test('deleteFile command should call workspaceManager.deleteFile', async () => {
    await CommandParser.getInstance().parseAndExecute('#deleteFile(path="test.txt")');
    
    expect(mockWorkspaceManager.deleteFile).toHaveBeenCalledTimes(1);
    expect(mockWorkspaceManager.deleteFile).toHaveBeenCalledWith('test.txt');
  });

  test('parseCommand should extract command name and arguments correctly', () => {
    // Access private method using type assertion
    const parseCommand = (CommandParser.getInstance() as any).parseCommand.bind(CommandParser.getInstance());
    
    const result = parseCommand('#testCommand(arg1="value1", arg2="value2")');
    
    expect(result.name).toBe('testCommand');
    expect(result.args).toEqual({
        arg1: 'value1',
        arg2: 'value2'
    });
  });

  test('parseCommand should return null for invalid input', () => {
    // Access private method using type assertion
    const parseCommand = (CommandParser.getInstance() as any).parseCommand.bind(CommandParser.getInstance());
    
    const invalidInputs = [
        'not a command',
        '#commandWithoutArgs',
        '#command(invalid)',
        'command(arg="value")',
    ];
    
    for (const input of invalidInputs) {
        const result = parseCommand(input);
        expect(result).toBeNull();
    }
  });

  test('parseArgs should handle multiple arguments', () => {
    // Access private method using type assertion
    const parseArgs = (CommandParser.getInstance() as any).parseArgs.bind(CommandParser.getInstance());
    
    const result = parseArgs('arg1="value1", arg2="value2", arg3="complex value with spaces"');
    
    expect(result).toEqual({
        arg1: 'value1',
        arg2: 'value2',
        arg3: 'complex value with spaces'
    });
  });

  test('parseArgs should handle empty arguments list', () => {
    // Access private method using type assertion
    const parseArgs = (CommandParser.getInstance() as any).parseArgs.bind(CommandParser.getInstance());
    
    const result = parseArgs('');
    
    expect(result).toEqual({});
  });

  test('parseAndExecute should handle @agent commands', async () => {
    // Create a stub for the continueIteration method
    const continueIterationStub = jest.fn().mockResolvedValue(undefined as void);
    
    // Override the continueIteration method
    (CommandParser.getInstance() as any).continueIteration = continueIterationStub;
    
    // Execute the @agent Continue command
    await CommandParser.getInstance().parseAndExecute('@agent Continue');
    
    // Verify handler was called with the correct arguments
    expect(continueIterationStub).toHaveBeenCalledTimes(1);
    expect(continueIterationStub).toHaveBeenCalledWith({});
  });

  test('parseAndExecute should handle @agent commands with message', async () => {
    // Create a stub for the continueIteration method
    const continueIterationStub = jest.fn().mockResolvedValue(undefined as void);
    
    // Override the continueIteration method
    (CommandParser.getInstance() as any).continueIteration = continueIterationStub;
    
    // Execute the @agent Continue command with a message
    await CommandParser.getInstance().parseAndExecute('@agent Continue: "Custom message"');
    
    // Verify handler was called with the correct arguments
    expect(continueIterationStub).toHaveBeenCalledTimes(1);
    expect(continueIterationStub).toHaveBeenCalledWith({
        message: 'Custom message'
    });
  });
  
  test('parseAgentCommand should parse @agent commands correctly', () => {
    // Access private method using type assertion
    const parseAgentCommand = (CommandParser.getInstance() as any).parseAgentCommand.bind(CommandParser.getInstance());
    
    // Test simple agent command
    const result1 = parseAgentCommand('@agent Continue');
    expect(result1.name).toBe('continue');
    expect(result1.args).toEqual({});
    
    // Test agent command with message
    const result2 = parseAgentCommand('@agent Continue: "Hello world"');
    expect(result2.name).toBe('continue');
    expect(result2.args).toEqual({ message: 'Hello world' });
    
    // Test agent command with regular arguments
    const result3 = parseAgentCommand('@agent Continue(delay=true)');
    expect(result3.name).toBe('continue');
    expect(result3.args).toEqual({ delay: true });
  });
});