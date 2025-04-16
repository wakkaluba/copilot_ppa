import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { strict as assert } from 'assert';
import { CommandManager } from '../../src/commands';

describe('CommandManager Tests', () => {
  let sandbox: sinon.SinonSandbox;
  let mockContext: vscode.ExtensionContext;
  let showInformationMessageStub: sinon.SinonStub;
  let registerCommandStub: sinon.SinonStub;
  let commandManager: CommandManager;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Mock vscode API methods
    showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves(undefined as any);
    registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand').returns({ dispose: sandbox.stub() });
    
    // Mock extension context
    mockContext = {
      subscriptions: [],
      extensionPath: '/test/path',
      extensionUri: vscode.Uri.parse('file:///test/path'),
      storageUri: vscode.Uri.parse('file:///test/storage'),
      globalStorageUri: vscode.Uri.parse('file:///test/globalStorage'),
      logUri: vscode.Uri.parse('file:///test/log'),
      asAbsolutePath: (p: string) => `/test/path/${p}`,
      storagePath: '/test/storagePath',
      globalStoragePath: '/test/globalStoragePath',
      logPath: '/test/logPath',
      extensionMode: vscode.ExtensionMode.Development,
      globalState: {
        keys: () => [],
        get: (key: string) => undefined,
        update: (key: string, value: any) => Promise.resolve(),
        setKeysForSync: (keys: string[]) => {}
      },
      workspaceState: {
        keys: () => [],
        get: (key: string) => undefined,
        update: (key: string, value: any) => Promise.resolve()
      },
      secrets: {
        get: (key: string) => Promise.resolve(undefined),
        store: (key: string, value: string) => Promise.resolve(),
        delete: (key: string) => Promise.resolve(),
        onDidChange: new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event
      },
      environmentVariableCollection: {
        persistent: true,
        replace: (variable: string, value: string) => {},
        append: (variable: string, value: string) => {},
        prepend: (variable: string, value: string) => {},
        get: (variable: string) => undefined,
        forEach: (callback: (variable: string, mutator: vscode.EnvironmentVariableMutator, collection: vscode.EnvironmentVariableCollection) => any, thisArg?: any) => {},
        delete: (variable: string) => {},
        clear: () => {},
        getScoped: (scope: vscode.EnvironmentVariableScope) => ({} as vscode.EnvironmentVariableCollection),
        description: undefined,
        [Symbol.iterator]: function*() { yield* []; }
      },
      extension: {
        id: 'test-extension',
        extensionUri: vscode.Uri.parse('file:///test/path'),
        extensionPath: '/test/path',
        isActive: true,
        packageJSON: {},
        exports: undefined,
        activate: () => Promise.resolve(),
        extensionKind: vscode.ExtensionKind.UI
      },
      languageModelAccessInformation: {
        onDidChange: new vscode.EventEmitter<void>().event,
        canSendRequest: () => true
      }
    };
    
    // Create CommandManager instance
    commandManager = new CommandManager(mockContext);
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  it('should register commands on initialization', () => {
    // Verify that all required commands are registered
    assert(registerCommandStub.calledWith('copilot-ppa.startAgent'), 'startAgent command should be registered');
    assert(registerCommandStub.calledWith('copilot-ppa.stopAgent'), 'stopAgent command should be registered');
    assert(registerCommandStub.calledWith('copilot-ppa.restartAgent'), 'restartAgent command should be registered');
    assert(registerCommandStub.calledWith('copilot-ppa.configureModel'), 'configureModel command should be registered');
    assert(registerCommandStub.calledWith('copilot-ppa.clearConversation'), 'clearConversation command should be registered');
  });
  
  it('should show information message when startAgent is called', async () => {
    // Get the startAgent callback from the registerCommand call
    const startAgentCallback = registerCommandStub.getCalls().find(
      call => call.args[0] === 'copilot-ppa.startAgent'
    )?.args[1];
    
    // Call the callback
    await startAgentCallback();
    
    assert(showInformationMessageStub.calledWith('Starting Copilot PPA agent...'), 
      'Should show information message when startAgent is called');
  });
  
  it('should show information message when stopAgent is called', async () => {
    // Get the stopAgent callback from the registerCommand call
    const stopAgentCallback = registerCommandStub.getCalls().find(
      call => call.args[0] === 'copilot-ppa.stopAgent'
    )?.args[1];
    
    // Call the callback
    await stopAgentCallback();
    
    assert(showInformationMessageStub.calledWith('Stopping Copilot PPA agent...'), 
      'Should show information message when stopAgent is called');
  });
  
  it('should call both stopAgent and startAgent when restartAgent is called', async () => {
    // Get the restartAgent callback from the registerCommand call
    const restartAgentCallback = registerCommandStub.getCalls().find(
      call => call.args[0] === 'copilot-ppa.restartAgent'
    )?.args[1];
    
    // Call the callback
    await restartAgentCallback();
    
    // Should call both stop and start
    assert(showInformationMessageStub.calledWith('Stopping Copilot PPA agent...'), 
      'Should call stopAgent when restartAgent is called');
    assert(showInformationMessageStub.calledWith('Starting Copilot PPA agent...'), 
      'Should call startAgent when restartAgent is called');
    
    // Verify the order of calls
    assert(showInformationMessageStub.firstCall.calledWith('Stopping Copilot PPA agent...'),
      'Should call stopAgent first');
    assert(showInformationMessageStub.secondCall.calledWith('Starting Copilot PPA agent...'),
      'Should call startAgent second');
  });
  
  it('should show information message when configureModel is called', async () => {
    // Get the configureModel callback from the registerCommand call
    const configureModelCallback = registerCommandStub.getCalls().find(
      call => call.args[0] === 'copilot-ppa.configureModel'
    )?.args[1];
    
    // Call the callback
    await configureModelCallback();
    
    assert(showInformationMessageStub.calledWith('Opening model configuration...'), 
      'Should show information message when configureModel is called');
  });
  
  it('should show information message when clearConversation is called', async () => {
    // Get the clearConversation callback from the registerCommand call
    const clearConversationCallback = registerCommandStub.getCalls().find(
      call => call.args[0] === 'copilot-ppa.clearConversation'
    )?.args[1];
    
    // Call the callback
    await clearConversationCallback();
    
    assert(showInformationMessageStub.calledWith('Conversation history cleared'), 
      'Should show information message when clearConversation is called');
  });
});
