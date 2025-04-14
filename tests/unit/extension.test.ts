import * as vscode from 'vscode';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { activate, deactivate } from '../../src/extension';
import { CommandManager } from '../../src/commands';

describe('Extension Tests', () => {
  let sandbox: sinon.SinonSandbox;
  let mockContext: vscode.ExtensionContext;
  let showInformationMessageStub: sinon.SinonStub;
  let registerCommandStub: sinon.SinonStub;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Mock vscode API methods
    registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand').returns({ dispose: sandbox.stub() });
    showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves(undefined as any);
    
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
        delete: (key: string) => Promise.resolve()
      },
      languageModelAccessInformation: {
        keyEnabled: false
      },
      extension: {} as vscode.Extension<any>,
      environmentVariableCollection: {} as vscode.GlobalEnvironmentVariableCollection
    };

    // Mock CommandManager with a proper stub that simulates adding to subscriptions
    sandbox.stub(CommandManager.prototype, 'registerCommands').callsFake(function() {
      // This simulates what CommandManager does when registering commands
      mockContext.subscriptions.push({ dispose: () => {} });
      return this;
    });
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  it('should register welcome message command on activation', () => {
    // Call activate function
    activate(mockContext);
    
    // Verify that welcome message command is registered
    assert(registerCommandStub.calledWith('copilot-ppa.showWelcomeMessage'), 
      'Welcome message command should be registered');
  });
  
  it('should show welcome message when command is triggered', () => {
    // Call activate function
    activate(mockContext);
    
    // Get the welcome message callback from the registerCommand call
    const welcomeMessageCallback = registerCommandStub.getCalls().find(
      call => call.args[0] === 'copilot-ppa.showWelcomeMessage'
    )?.args[1];
    
    // Call the callback
    welcomeMessageCallback();
    
    // Verify that welcome message is shown
    assert(showInformationMessageStub.calledWith('Copilot Productivity and Performance Analyzer is active!'), 
      'Welcome message should be shown');
  });
  
  it('should add disposable to subscriptions on activation', () => {
    // Call activate function
    activate(mockContext);
    
    // Verify that disposable is added to subscriptions
    assert(mockContext.subscriptions.length > 0, 'Disposable should be added to subscriptions');
  });
  
  it('should create CommandManager instance on activation', () => {
    // We can't easily spy on the constructor, so we'll spy on a method
    const registerCommandsSpy = sandbox.spy(CommandManager.prototype, 'registerCommands');
    
    // Call activate function
    activate(mockContext);
    
    // Verify that CommandManager's registerCommands method was called
    assert(registerCommandsSpy.called, 'CommandManager should be created and registerCommands should be called');
  });
  
  it('should not throw error on deactivation', () => {
    // Call deactivate function, should not throw error
    assert.doesNotThrow(() => deactivate(), 'deactivate should not throw error');
  });
});