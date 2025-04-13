import * as vscode from 'vscode';
import { WorkspaceManager } from './WorkspaceManager';

export class AgentToolManager {
    private static instance: AgentToolManager;
    private workspaceManager: WorkspaceManager;

    private constructor() {
        this.workspaceManager = WorkspaceManager.getInstance();
    }

    static getInstance(): AgentToolManager {
        if (!AgentToolManager.instance) {
            AgentToolManager.instance = new AgentToolManager();
        }
        return AgentToolManager.instance;
    }

    async editFile(filePath: string, content: string, line?: number): Promise<boolean> {
        try {
            const originalContent = await this.workspaceManager.readFile(filePath);
            const newContent = line !== undefined
                ? this.replaceLineContent(originalContent, content, line)
                : content;

            const approved = await this.confirmChange(filePath, originalContent, newContent);
            if (!approved) {
                return false;
            }

            await this.workspaceManager.writeFile(filePath, newContent);
            await this.workspaceManager.formatDocumentAtPath(filePath);
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to edit file: ${error}`);
            return false;
        }
    }

    async createFile(filePath: string, content: string): Promise<boolean> {
        try {
            const approved = await this.confirmChange(filePath, '', content);
            if (!approved) {
                return false;
            }

            await this.workspaceManager.writeFile(filePath, content);
            await this.workspaceManager.formatDocumentAtPath(filePath);
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create file: ${error}`);
            return false;
        }
    }

    async deleteFile(filePath: string): Promise<boolean> {
        try {
            const content = await this.workspaceManager.readFile(filePath);
            const approved = await this.confirmDelete(filePath, content);
            if (!approved) {
                return false;
            }

            await this.workspaceManager.deleteFile(filePath);
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to delete file: ${error}`);
            return false;
        }
    }

    async explainFile(filePath: string, line?: number): Promise<string> {
        try {
            const content = await this.workspaceManager.readFile(filePath);
            if (line !== undefined) {
                const lines = content.split('\n');
                if (line > 0 && line <= lines.length) {
                    return lines[line - 1];
                }
            }
            return content;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to read file for explanation: ${error}`);
            return '';
        }
    }

    async searchWorkspace(query: string): Promise<string[]> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error('No workspace folder found');
            }

            const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**');
            const results: string[] = [];

            for (const file of files) {
                const content = await this.workspaceManager.readFile(file.fsPath);
                if (content.toLowerCase().includes(query.toLowerCase())) {
                    results.push(file.fsPath);
                }
            }

            return results;
        } catch (error) {
            vscode.window.showErrorMessage(`Search failed: ${error}`);
            return [];
        }
    }

    private async confirmChange(filePath: string, oldContent: string, newContent: string): Promise<boolean> {
        const diff = await vscode.commands.executeCommand('vscode.diff',
            vscode.Uri.parse('untitled:Original'),
            vscode.Uri.parse('untitled:Modified'),
            `Changes to ${filePath}`,
            { preview: true }
        );

        const result = await vscode.window.showWarningMessage(
            `Do you want to apply these changes to ${filePath}?`,
            { modal: true },
            'Apply',
            'Cancel'
        );

        return result === 'Apply';
    }

    private async confirmDelete(filePath: string, content: string): Promise<boolean> {
        const result = await vscode.window.showWarningMessage(
            `Are you sure you want to delete ${filePath}?`,
            { modal: true },
            'Delete',
            'Cancel'
        );

        return result === 'Delete';
    }

    private replaceLineContent(originalContent: string, newContent: string, line: number): string {
        const lines = originalContent.split('\n');
        if (line > 0 && line <= lines.length) {
            lines[line - 1] = newContent;
        }
        return lines.join('\n');
    }
}
