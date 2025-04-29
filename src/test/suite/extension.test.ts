import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Starting test suite');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('copilot-ppa'));
	});

	test('Commands should be registered', async () => {
		const commands = await vscode.commands.getCommands();
		assert.ok(commands.includes('copilot-ppa.start'));
		assert.ok(commands.includes('copilot-ppa.startAgent') || commands.includes('copilot-ppa.openMenu'));
	});
});
