import * as vscode from 'vscode';
import { CodeFormatService } from '../services/codeFormatService';

export function registerCodeFormatCommands(context: vscode.ExtensionContext) {
    const codeFormatService = new CodeFormatService();

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('localLLMAgent.formatCode', async () => {
            return await codeFormatService.formatCode();
        }),

        vscode.commands.registerCommand('localLLMAgent.optimizeImports', async () => {
            return await codeFormatService.optimizeImports();
        }),

        vscode.commands.registerCommand('localLLMAgent.applyCodeStyle', async () => {
            return await codeFormatService.applyCodeStyle();
        }),

        vscode.commands.registerCommand('localLLMAgent.optimizeCode', async () => {
            return await codeFormatService.optimizeCode();
        })
    );
}
