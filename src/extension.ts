import * as vscode from 'vscode';
import { CommandManager } from './commands';

export function activate(context: vscode.ExtensionContext) {
	console.log('Copilot PPA extension is now active');

	// Register a simple command to verify the extension works
	let disposable = vscode.commands.registerCommand('copilot-ppa.showWelcomeMessage', () => {
		vscode.window.showInformationMessage('Copilot Productivity and Performance Analyzer is active!');
	});

	context.subscriptions.push(disposable);
	
	// Initialize services - CommandManager now initializes LLMModelService internally
	new CommandManager(context);
}

export function deactivate() {}
