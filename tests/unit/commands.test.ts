import * as vscode from 'vscode';
import { CommandManager } from '../../src/commands/commandManager';

describe('Command Manager', () => {
  let commandManager: CommandManager;
  
  beforeEach(() => {
    // Reset command registration mock
    (vscode.commands.registerCommand as jest.Mock).mockReset();
    
    // Create a new command manager instance
    commandManager = new CommandManager();
  });
  
  test('registers all commands correctly', () => {
    // Call the register method (implementation depends on your actual code)
    commandManager.registerAll();
    
    // Verify commands were registered
    expect(vscode.commands.registerCommand).toHaveBeenCalled();
    // Check specific commands registration based on your implementation
    // For example:
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilot-ppa.sendSelectionToCopilot',
      expect.any(Function)
    );
  });
  
  test('command execution with proper context', async () => {
    // Mock an editor selection
    const mockTextEditor = {
      document: {
        getText: jest.fn().mockReturnValue('Selected code'),
        fileName: 'test.js',
        languageId: 'javascript'
      },
      selection: {
        isEmpty: false
      }
    };
    
    (vscode.window.activeTextEditor as any) = mockTextEditor;
    
    // Prepare a command handler for testing
    const handler = jest.fn().mockResolvedValue('Success');
    commandManager.registerCommand('test.command', handler);
    
    // Execute the command
    await vscode.commands.executeCommand('test.command');
    
    // Verify handler was called
    expect(handler).toHaveBeenCalled();
  });
  
  test('handles command errors gracefully', async () => {
    // Prepare a command handler that throws an error
    const errorHandler = jest.fn().mockImplementation(() => {
      throw new Error('Command failed');
    });
    
    commandManager.registerCommand('test.errorCommand', errorHandler);
    
    // Execute the command
    await vscode.commands.executeCommand('test.errorCommand');
    
    // Verify error message was shown
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      expect.stringContaining('Command failed')
    );
  });
});
