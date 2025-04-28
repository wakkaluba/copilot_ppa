import * as assert from 'assert';
import { CommandParser } from '../../../src/services/CommandParser';
import { WorkspaceManager } from '../../../src/services/WorkspaceManager';

const mockWorkspaceManager = {
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('File content'),
  deleteFile: jest.fn().mockResolvedValue(undefined),
  fileExists: jest.fn().mockResolvedValue(true)
};

describe('CommandParser', () => {
  let commandParser: CommandParser;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton instance
    (CommandParser as any).instance = null;
    
    // Mock the getInstance method
    jest.spyOn(CommandParser, 'getInstance').mockImplementation(() => {
      if (!(CommandParser as any).instance) {
        (CommandParser as any).instance = new (CommandParser as any)(mockWorkspaceManager as unknown as WorkspaceManager);
      }
      return (CommandParser as any).instance;
    });
    
    commandParser = CommandParser.getInstance();
    
    // Add the registerCommand method spy
    jest.spyOn(commandParser, 'registerCommand');
    
    // Add the parseCommand method spy
    jest.spyOn(commandParser, 'parseCommand');
    
    // Add the parseArgs method spy
    jest.spyOn(commandParser, 'parseArgs');
    
    // Add the parseAndExecute method spy
    jest.spyOn(commandParser, 'parseAndExecute');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('registerCommand should add a new command handler', async () => {
    const mockHandler = jest.fn().mockResolvedValue(undefined);
    
    commandParser.registerCommand('testCommand', mockHandler);
    
    const cmd = commandParser.parseCommand('testCommand()');
    expect(cmd).not.toBeNull();
    expect(cmd?.name).toBe('testCommand');
  });

  test('parseAndExecute should handle commands without arguments', async () => {
    const mockHandler = jest.fn().mockResolvedValue(undefined);
    commandParser.registerCommand('testCommand', mockHandler);
    
    await commandParser.parseAndExecute('testCommand()');
    
    expect(mockHandler).toHaveBeenCalled();
  });

  test('parseAndExecute should return null for invalid commands', async () => {
    const result = await commandParser.parseAndExecute('not a command');
    expect(result).toBeNull();
  });

  test('parseCommand should correctly parse command name and arguments', () => {
    const input = 'testCommand(arg1="value1", arg2="value2")';
    const result = commandParser.parseCommand(input);
    
    expect(result).not.toBeNull();
    expect(result?.name).toBe('testCommand');
    expect(result?.args[0]).toHaveProperty('arg1', 'value1');
    expect(result?.args[0]).toHaveProperty('arg2', 'value2');
  });

  test('parseArgs should correctly parse string arguments', () => {
    const argsString = 'key1="value1", key2="value2"';
    const result = commandParser.parseArgs(argsString);
    
    expect(result[0]).toHaveProperty('key1', 'value1');
    expect(result[0]).toHaveProperty('key2', 'value2');
  });

  test('parseArgs should correctly parse numeric arguments', () => {
    const argsString = 'num1=123, num2=456.78';
    const result = commandParser.parseArgs(argsString);
    
    expect(result[0]).toHaveProperty('num1', 123);
    expect(result[0]).toHaveProperty('num2', 456.78);
  });

  test('parseArgs should correctly parse boolean arguments', () => {
    const argsString = 'bool1=true, bool2=false';
    const result = commandParser.parseArgs(argsString);
    
    expect(result[0]).toHaveProperty('bool1', true);
    expect(result[0]).toHaveProperty('bool2', false);
  });

  test('createFile should call workspaceManager.writeFile', async () => {
    await commandParser.parseAndExecute('createFile(path="test/file.txt", content="File content")');
    
    expect(mockWorkspaceManager.writeFile).toHaveBeenCalledWith("test/file.txt", "File content");
  });

  test('modifyFile should call workspaceManager.readFile and writeFile', async () => {
    mockWorkspaceManager.readFile.mockResolvedValue('Original content');
    
    await commandParser.parseAndExecute('modifyFile(path="test/file.txt", find="Original", replace="Modified")');
    
    expect(mockWorkspaceManager.readFile).toHaveBeenCalledWith("test/file.txt");
    expect(mockWorkspaceManager.writeFile).toHaveBeenCalled();
  });

  test('deleteFile should call workspaceManager.deleteFile', async () => {
    await commandParser.parseAndExecute('deleteFile(path="test/file.txt")');
    
    expect(mockWorkspaceManager.deleteFile).toHaveBeenCalledWith("test/file.txt");
  });
});