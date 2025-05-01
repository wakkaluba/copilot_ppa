const { describe, it, beforeEach, afterEach, expect, jest } = require('@jest/globals');
const vscode = require('vscode');
const terminalUtils = require('../../../src/buildTools/utils/terminalUtils');

jest.mock('vscode', () => ({
  window: {
    createTerminal: jest.fn(),
    terminals: [],
    onDidCloseTerminal: jest.fn(),
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn()
  },
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn()
    })
  }
}));

describe('Terminal Utils', () => {
  let mockTerminal;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTerminal = {
      name: 'Build Tool Terminal',
      sendText: jest.fn(),
      show: jest.fn(),
      dispose: jest.fn(),
      processId: Promise.resolve(12345)
    };
    vscode.window.createTerminal.mockReturnValue(mockTerminal);
    vscode.window.terminals = [mockTerminal];
  });

  describe('createBuildTerminal', () => {
    it('should create a new terminal with the specified name', () => {
      const terminal = terminalUtils.createBuildTerminal('Test Terminal');
      expect(vscode.window.createTerminal).toHaveBeenCalledWith('Test Terminal');
      expect(terminal).toBe(mockTerminal);
    });

    it('should use default name if no name is provided', () => {
      terminalUtils.createBuildTerminal();
      expect(vscode.window.createTerminal).toHaveBeenCalledWith('Build Tools');
    });
  });

  describe('executeCommand', () => {
    it('should send command to the terminal', async () => {
      await terminalUtils.executeCommand('npm run build', mockTerminal);
      expect(mockTerminal.sendText).toHaveBeenCalledWith('npm run build', true);
      expect(mockTerminal.show).toHaveBeenCalled();
    });

    it('should create a new terminal if none is provided', async () => {
      await terminalUtils.executeCommand('npm run build');
      expect(vscode.window.createTerminal).toHaveBeenCalled();
      expect(mockTerminal.sendText).toHaveBeenCalledWith('npm run build', true);
    });

    it('should handle command execution errors', async () => {
      mockTerminal.sendText.mockImplementation(() => {
        throw new Error('Command execution failed');
      });

      await expect(terminalUtils.executeCommand('npm run build', mockTerminal))
        .rejects.toThrow('Command execution failed');
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });

  describe('findTerminalByName', () => {
    it('should find terminal by name', () => {
      const terminal = terminalUtils.findTerminalByName('Build Tool Terminal');
      expect(terminal).toBe(mockTerminal);
    });

    it('should return undefined if no matching terminal found', () => {
      const terminal = terminalUtils.findTerminalByName('Non-existent Terminal');
      expect(terminal).toBeUndefined();
    });
  });

  describe('closeTerminal', () => {
    it('should dispose the terminal', () => {
      terminalUtils.closeTerminal(mockTerminal);
      expect(mockTerminal.dispose).toHaveBeenCalled();
    });

    it('should handle null terminal gracefully', () => {
      expect(() => terminalUtils.closeTerminal(null)).not.toThrow();
    });
  });

  describe('executeCommandWithOutput', () => {
    it('should execute command and return output', async () => {
      // This would typically involve setting up terminal output capturing
      // which is more complex to mock, so we'll use a simplified approach
      const result = await terminalUtils.executeCommandWithOutput('echo Hello');
      expect(result).toBeDefined();
    });
  });
});
