import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as extension from '../../src/extension';
import { CommandManager } from '../../src/commands';

describe('Extension Activation Integration Test', () => {
  let sandbox: sinon.SinonSandbox;
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: () => {},
        update: () => Promise.resolve(),
        keys: () => []
      },
      globalState: {
        get: () => {},
        update: () => Promise.resolve(),
        keys: () => [],
        setKeysForSync: () => {}
      },
      extensionPath: '',
      extensionUri: vscode.Uri.parse(''),
      asAbsolutePath: (path) => path,
      storagePath: '',
      storageUri: vscode.Uri.parse(''),
      globalStoragePath: '',
      globalStorageUri: vscode.Uri.parse(''),
      logPath: '',
      logUri: vscode.Uri.parse(''),
      // Add missing required properties
      secrets: {
        get: (key: string) => Promise.resolve(undefined),
        store: (key: string, value: string) => Promise.resolve(),
        delete: (key: string) => Promise.resolve(),
        onDidChange: new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event
      },
      environmentVariableCollection: {
        getScoped: () => ({} as vscode.EnvironmentVariableCollection),
        append: () => {},
        clear: () => {},
        delete: () => {},
        forEach: () => {},
        get: () => {},
        prepend: () => {},
        replace: () => {},
        persistent: false,
        description: undefined,
        [Symbol.iterator]: function* () { yield* []; }
      } as vscode.GlobalEnvironmentVariableCollection,
      extensionMode: vscode.ExtensionMode.Test,
      extension: {} as vscode.Extension<any>,
      languageModelAccessInformation: {} as vscode.LanguageModelAccessInformation
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should activate and register commands', () => {
    // Spy on CommandManager constructor
    const commandManagerSpy = sandbox.spy(global, 'CommandManager' as any);

    // Activate the extension
    extension.activate(mockContext);

    // Check that the CommandManager was instantiated
    assert(commandManagerSpy.calledOnce, 'CommandManager should be instantiated');
    assert(commandManagerSpy.calledWith(mockContext), 'CommandManager should be instantiated with context');
  });

  it('should register the welcome message command', () => {
    // Spy on VS Code commands.registerCommand
    const registerCommandSpy = sandbox.spy(vscode.commands, 'registerCommand');

    // Activate the extension
    extension.activate(mockContext);

    // Check that the welcome message command was registered
    assert(registerCommandSpy.calledWith('copilot-ppa.showWelcomeMessage'), 
      'copilot-ppa.showWelcomeMessage command should be registered');
  });

  it('should add command registrations to subscriptions', () => {
    // Activate the extension
    extension.activate(mockContext);

    // Check that subscriptions were added
    assert(mockContext.subscriptions.length > 0, 'Commands should be added to subscriptions');
  });
});