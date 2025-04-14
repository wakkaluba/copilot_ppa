import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

// This is an E2E test that tests actual command execution in VS Code
describe('Extension Commands E2E Tests', () => {
  const sandbox = sinon.createSandbox();
  let showInformationMessageSpy: sinon.SinonSpy;
  
  beforeEach(() => {
    showInformationMessageSpy = sandbox.spy(vscode.window, 'showInformationMessage');
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  it('should show welcome message when command is executed', async () => {
    // Execute the actual VS Code command
    await vscode.commands.executeCommand('copilot-ppa.showWelcomeMessage');
    
    // Verify that the information message was shown
    assert(showInformationMessageSpy.calledOnce, 'Should show information message');
    assert(showInformationMessageSpy.calledWith('Copilot Productivity and Performance Analyzer is active!'),
      'Should show correct welcome message');
  });
  
  // Add more E2E tests for other commands
  it('should execute startAgent command', async () => {
    await vscode.commands.executeCommand('copilot-ppa.startAgent');
    
    assert(showInformationMessageSpy.calledOnce, 'Should show information message');
    assert(showInformationMessageSpy.calledWith('Starting Copilot PPA agent...'),
      'Should show correct message');
  });
  
  it('should execute stopAgent command', async () => {
    await vscode.commands.executeCommand('copilot-ppa.stopAgent');
    
    assert(showInformationMessageSpy.calledOnce, 'Should show information message');
    assert(showInformationMessageSpy.calledWith('Stopping Copilot PPA agent...'),
      'Should show correct message');
  });
  
  it('should execute restartAgent command', async () => {
    await vscode.commands.executeCommand('copilot-ppa.restartAgent');
    
    assert(showInformationMessageSpy.calledTwice, 'Should show two information messages');
    assert(showInformationMessageSpy.firstCall.calledWith('Stopping Copilot PPA agent...'),
      'First message should be about stopping agent');
    assert(showInformationMessageSpy.secondCall.calledWith('Starting Copilot PPA agent...'),
      'Second message should be about starting agent');
  });
});