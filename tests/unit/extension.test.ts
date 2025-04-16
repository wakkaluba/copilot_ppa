import * as vscode from 'vscode';
import { strict as assert } from 'assert';
import * as sinon from 'sinon';
import { activate, deactivate } from '../../src/extension';
import { CommandManager } from '../../src/commands';
import { mockContext } from '../__testUtils__/mocks';

describe('Extension Tests', () => {
  let sandbox: sinon.SinonSandbox;
  let testContext: vscode.ExtensionContext;
  let showInformationMessageStub: sinon.SinonStub;
  let registerCommandStub: sinon.SinonStub;
  let registerCommandsSpy: sinon.SinonSpy;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    testContext = { ...mockContext };
    
    // Mock vscode API methods
    registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand').returns({ dispose: sandbox.stub() });
    showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves(undefined as any);
    
    // Create proper spies on CommandManager methods
    registerCommandsSpy = sandbox.spy(CommandManager.prototype, 'registerCommands');
    sandbox.stub(CommandManager.prototype, 'registerCommands').callsFake(function() {
      // This simulates what CommandManager does when registering commands
      testContext.subscriptions.push({ dispose: () => {} });
      return this;
    });
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  it('should register welcome message command on activation', () => {
    // Call activate function
    activate(testContext);
    
    // Verify that welcome message command is registered
    assert(registerCommandStub.calledWith('copilot-ppa.showWelcomeMessage'), 
      'Welcome message command should be registered');
  });
  
  it('should show welcome message when command is triggered', () => {
    // Call activate function
    activate(testContext);
    
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
    activate(testContext);
    
    // Verify that disposable is added to subscriptions
    assert(testContext.subscriptions.length > 0, 'Disposable should be added to subscriptions');
  });

  it('should create CommandManager instance on activation', () => {
    // Call activate function
    activate(testContext);
    
    // Verify that CommandManager's registerCommands method was called
    assert(registerCommandsSpy.called, 'CommandManager should be created and registerCommands should be called');
  });
  
  it('should not throw error on deactivation', () => {
    // Call deactivate function, should not throw error
    assert.doesNotThrow(() => deactivate(), 'deactivate should not throw error');
  });
});