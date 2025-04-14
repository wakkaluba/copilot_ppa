import * as vscode from 'vscode';
import { CommandManager } from './commands';

export function activate(context: vscode.ExtensionContext) {
  // Create a command manager and register commands
  const commandManager = new CommandManager(context);
  commandManager.registerCommands();
  
  // Register the welcome message command
  const welcomeMessageDisposable = vscode.commands.registerCommand(
    'copilot-ppa.showWelcomeMessage', 
    () => {
      vscode.window.showInformationMessage('Copilot Productivity and Performance Analyzer is active!');
    }
  );
  
  // Add the disposable to the subscriptions
  context.subscriptions.push(welcomeMessageDisposable);
}

export function deactivate() {
  // Nothing to do here for now
}
