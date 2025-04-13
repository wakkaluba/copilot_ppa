import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Starting test suite');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('vscode-local-llm-agent'));
	});

	test('Command should be registered', async () => {
		const commands = await vscode.commands.getCommands();
		assert.ok(commands.includes('vscode-local-llm-agent.askAgent'));
	});
});
