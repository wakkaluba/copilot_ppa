import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import { ICodeExecutor } from '../types';

export class CodeExecutorService implements ICodeExecutor {
    /**
     * Executes selected code in the active editor
     */
    public async executeSelectedCode(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('No code selected');
            return;
        }

        const selectedText = editor.document.getText(selection);
        const language = editor.document.languageId;
        
        try {
            await this.executeInTerminal(selectedText, language);
            vscode.window.showInformationMessage('Code executed successfully');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to execute code: ${error}`);
        }
    }

    /**
     * Executes code in the appropriate terminal based on language
     */
    private async executeInTerminal(code: string, language: string): Promise<void> {
        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Code Execution');
        terminal.show();

        let command = '';
        
        switch (language) {
            case 'javascript':
            case 'typescript':
                const tempJsFile = await this.createTempFile(code, '.js');
                command = `node "${tempJsFile}"`;
                break;
            case 'python':
                const tempPyFile = await this.createTempFile(code, '.py');
                command = `python "${tempPyFile}"`;
                break;
            case 'shellscript':
            case 'bash':
                const tempShFile = await this.createTempFile(code, '.sh');
                command = `bash "${tempShFile}"`;
                break;
            case 'powershell':
                const tempPsFile = await this.createTempFile(code, '.ps1');
                command = `powershell -File "${tempPsFile}"`;
                break;
            default:
                throw new Error(`Unsupported language: ${language}`);
        }

        terminal.sendText(command);
    }

    /**
     * Creates a temporary file with the given code
     */
    private async createTempFile(content: string, extension: string): Promise<string> {
        const fs = vscode.workspace.fs;
        const tempDir = os.tmpdir();
        const fileName = `vscode-exec-${Date.now()}${extension}`;
        const filePath = path.join(tempDir, fileName);
        
        const uri = vscode.Uri.file(filePath);
        const uint8Array = new TextEncoder().encode(content);
        
        await fs.writeFile(uri, uint8Array);
        return filePath;
    }
}