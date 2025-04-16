import * as vscode from 'vscode';
import { CommandManager } from '../../src/commands/commandManager';
import { AgentService } from '../../src/agents/agentService';

jest.mock('../../src/agents/agentService');

describe('Command Manager', () => {
  let commandManager: CommandManager;
  let mockContext: vscode.ExtensionContext;
  let mockAgentService: jest.Mocked<AgentService>;

  beforeEach(() => {
    mockAgentService = new AgentService() as jest.Mocked<AgentService>;
    
    mockContext = {
      subscriptions: [],
      extensionPath: '/test/path',
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
        setKeysForSync: jest.fn(),
        keys: () => []
      },
      workspaceState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: () => []
      },
      secrets: {
        get: jest.fn(),
        store: jest.fn(),
        delete: jest.fn(),
        onDidChange: new vscode.EventEmitter().event
      },
      extensionUri: vscode.Uri.file('/test/path'),
      environmentVariableCollection: {
        persistent: true,
        replace: jest.fn(),
        append: jest.fn(),
        prepend: jest.fn(),
        get: jest.fn(),
        forEach: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
        getScoped: jest.fn(),
        [Symbol.iterator]: jest.fn(),
        description: undefined
      },
      storageUri: vscode.Uri.file('/test/storage'),
      globalStorageUri: vscode.Uri.file('/test/global-storage'),
      logUri: vscode.Uri.file('/test/log'),
      extensionMode: vscode.ExtensionMode.Test
    } as vscode.ExtensionContext;

    commandManager = new CommandManager(mockContext, mockAgentService);
  });

  describe('Command Registration', () => {
    it('should register all commands', () => {
      const registerCommandSpy = jest.spyOn(vscode.commands, 'registerCommand');
      
      commandManager.registerCommands();
      
      expect(registerCommandSpy).toHaveBeenCalledTimes(expect.any(Number));
      expect(mockContext.subscriptions.length).toBeGreaterThan(0);
    });
  });

  describe('Agent Commands', () => {
    it('should start agent', async () => {
      const startSpy = jest.spyOn(mockAgentService, 'start');
      
      await (commandManager as any).startAgent();
      
      expect(startSpy).toHaveBeenCalled();
    });

    it('should stop agent', async () => {
      const stopSpy = jest.spyOn(mockAgentService, 'stop');
      
      await (commandManager as any).stopAgent();
      
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should restart agent', async () => {
      const stopSpy = jest.spyOn(mockAgentService, 'stop');
      const startSpy = jest.spyOn(mockAgentService, 'start');
      
      await (commandManager as any).restartAgent();
      
      expect(stopSpy).toHaveBeenCalled();
      expect(startSpy).toHaveBeenCalled();
    });
  });

  describe('Model Configuration', () => {
    it('should configure model', async () => {
      const showQuickPickSpy = jest.spyOn(vscode.window, 'showQuickPick').mockResolvedValue('llama2');
      const configureSpy = jest.spyOn(mockAgentService, 'configureModel');
      
      await (commandManager as any).configureModel();
      
      expect(showQuickPickSpy).toHaveBeenCalled();
      expect(configureSpy).toHaveBeenCalledWith('llama2');
    });

    it('should handle model configuration cancellation', async () => {
      jest.spyOn(vscode.window, 'showQuickPick').mockResolvedValue(undefined);
      const configureSpy = jest.spyOn(mockAgentService, 'configureModel');
      
      await (commandManager as any).configureModel();
      
      expect(configureSpy).not.toHaveBeenCalled();
    });
  });

  describe('Conversation Management', () => {
    it('should clear conversation', async () => {
      const clearSpy = jest.spyOn(mockAgentService, 'clearConversation');
      
      await (commandManager as any).clearConversation();
      
      expect(clearSpy).toHaveBeenCalled();
    });

    it('should show confirmation before clearing', async () => {
      const showWarningMessageSpy = jest.spyOn(vscode.window, 'showWarningMessage')
        .mockResolvedValue('Yes');
      const clearSpy = jest.spyOn(mockAgentService, 'clearConversation');
      
      await (commandManager as any).clearConversation();
      
      expect(showWarningMessageSpy).toHaveBeenCalled();
      expect(clearSpy).toHaveBeenCalled();
    });

    it('should not clear when confirmation is cancelled', async () => {
      jest.spyOn(vscode.window, 'showWarningMessage').mockResolvedValue(undefined);
      const clearSpy = jest.spyOn(mockAgentService, 'clearConversation');
      
      await (commandManager as any).clearConversation();
      
      expect(clearSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle agent start errors', async () => {
      const error = new Error('Failed to start agent');
      jest.spyOn(mockAgentService, 'start').mockRejectedValue(error);
      const showErrorSpy = jest.spyOn(vscode.window, 'showErrorMessage');
      
      await (commandManager as any).startAgent();
      
      expect(showErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to start agent'));
    });

    it('should handle agent stop errors', async () => {
      const error = new Error('Failed to stop agent');
      jest.spyOn(mockAgentService, 'stop').mockRejectedValue(error);
      const showErrorSpy = jest.spyOn(vscode.window, 'showErrorMessage');
      
      await (commandManager as any).stopAgent();
      
      expect(showErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to stop agent'));
    });
  });

  describe('Cleanup', () => {
    it('should dispose all commands on deactivation', () => {
      const disposeSpy = jest.fn();
      mockContext.subscriptions.push({ dispose: disposeSpy });
      
      commandManager.dispose();
      
      expect(disposeSpy).toHaveBeenCalled();
    });
  });
});
