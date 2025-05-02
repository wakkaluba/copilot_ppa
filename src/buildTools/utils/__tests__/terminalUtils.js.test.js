const vscode = require('vscode');
const {
  createBuildTerminal,
  executeCommand,
  findTerminalByName,
  closeTerminal,
  executeCommandWithOutput
} = require('../terminalUtils');

jest.mock('vscode', () => ({
  window: {
    createTerminal: jest.fn(),
    terminals: [],
    onDidCloseTerminal: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    createOutputChannel: jest.fn().mockReturnValue({
      appendLine: jest.fn(),
      show: jest.fn(),
      clear: jest.fn(),
      dispose: jest.fn()
    })
  },
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn()
    })
  },
  ProgressLocation: {
    Notification: 1
  },
  EventEmitter: jest.fn().mockImplementation(() => ({
    event: jest.fn(),
    fire: jest.fn()
  }))
}));

describe('Terminal Utils JavaScript Implementation', () => {
  let mockTerminal;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTerminal = {
      name: 'Build Tool Terminal',
      sendText: jest.fn(),
      show: jest.fn(),
      dispose: jest.fn(),
      processId: Promise.resolve(12345),
      creationOptions: {}
    };
    vscode.window.createTerminal.mockReturnValue(mockTerminal);
    vscode.window.terminals = [mockTerminal];
  });

  describe('createBuildTerminal', () => {
    it('should create a new terminal with the specified name', () => {
      const terminal = createBuildTerminal('Test Terminal');
      expect(vscode.window.createTerminal).toHaveBeenCalledWith('Test Terminal');
      expect(terminal).toBe(mockTerminal);
    });

    it('should use default name if no name is provided', () => {
      const terminal = createBuildTerminal();
      expect(vscode.window.createTerminal).toHaveBeenCalledWith('Build Tools');
      expect(terminal).toBe(mockTerminal);
    });

    it('should handle terminal creation errors', () => {
      vscode.window.createTerminal.mockImplementation(() => {
        throw new Error('Terminal creation failed');
      });

      expect(() => createBuildTerminal('Test Terminal')).toThrow('Terminal creation failed');
    });
  });

  describe('executeCommand', () => {
    it('should send command to the terminal', async () => {
      await executeCommand('npm run build', mockTerminal);
      expect(mockTerminal.sendText).toHaveBeenCalledWith('npm run build', true);
      expect(mockTerminal.show).toHaveBeenCalled();
    });

    it('should create a new terminal if none is provided', async () => {
      await executeCommand('npm run build');
      expect(vscode.window.createTerminal).toHaveBeenCalled();
      expect(mockTerminal.sendText).toHaveBeenCalledWith('npm run build', true);
    });

    it('should handle command execution errors', async () => {
      mockTerminal.sendText.mockImplementation(() => {
        throw new Error('Command execution failed');
      });

      await expect(executeCommand('npm run build', mockTerminal))
        .rejects.toThrow('Command execution failed');
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });

    it('should handle multiple commands separated by &&', async () => {
      await executeCommand('npm install && npm run build', mockTerminal);
      expect(mockTerminal.sendText).toHaveBeenCalledWith('npm install && npm run build', true);
    });

    it('should handle commands with environment variables', async () => {
      await executeCommand('NODE_ENV=production npm run build', mockTerminal);
      expect(mockTerminal.sendText).toHaveBeenCalledWith('NODE_ENV=production npm run build', true);
    });
  });

  describe('findTerminalByName', () => {
    it('should find terminal by name', () => {
      const terminal = findTerminalByName('Build Tool Terminal');
      expect(terminal).toBe(mockTerminal);
    });

    it('should return undefined if no matching terminal found', () => {
      const terminal = findTerminalByName('Non-existent Terminal');
      expect(terminal).toBeUndefined();
    });

    it('should handle case sensitivity correctly', () => {
      const terminal = findTerminalByName('build tool terminal');
      expect(terminal).toBeUndefined();
    });

    it('should handle empty terminals array', () => {
      vscode.window.terminals = [];
      const terminal = findTerminalByName('Build Tool Terminal');
      expect(terminal).toBeUndefined();
    });
  });

  describe('closeTerminal', () => {
    it('should dispose the terminal', () => {
      closeTerminal(mockTerminal);
      expect(mockTerminal.dispose).toHaveBeenCalled();
    });

    it('should handle null terminal gracefully', () => {
      expect(() => closeTerminal(null)).not.toThrow();
    });

    it('should handle undefined terminal gracefully', () => {
      expect(() => closeTerminal(undefined)).not.toThrow();
    });

    it('should handle terminal disposal errors', () => {
      mockTerminal.dispose.mockImplementation(() => {
        throw new Error('Terminal disposal failed');
      });

      expect(() => closeTerminal(mockTerminal)).not.toThrow();
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });

  describe('executeCommandWithOutput', () => {
    it('should execute command and return output', async () => {
      // Mock the output channel
      const mockOutputChannel = vscode.window.createOutputChannel();

      // Set up callbacks to simulate command execution
      vscode.window.onDidCloseTerminal.mockImplementation((callback) => {
        setTimeout(() => callback(mockTerminal), 100);
        return { dispose: jest.fn() };
      });

      const result = await executeCommandWithOutput('echo Hello');

      expect(vscode.window.createTerminal).toHaveBeenCalled();
      expect(mockTerminal.sendText).toHaveBeenCalledWith('echo Hello', true);
      expect(result).toBeDefined();
    });

    it('should handle command execution errors', async () => {
      mockTerminal.sendText.mockImplementation(() => {
        throw new Error('Command execution failed');
      });

      await expect(executeCommandWithOutput('npm run invalid-command'))
        .rejects.toThrow();
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });

    it('should handle output capture errors', async () => {
      // Setup for error during output capture
      vscode.window.createOutputChannel.mockImplementation(() => {
        throw new Error('Output channel creation failed');
      });

      await expect(executeCommandWithOutput('echo Hello'))
        .rejects.toThrow();
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });
});
