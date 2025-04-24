import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class RepositoryManager {
    private static instance: RepositoryManager;
    private _isEnabled: boolean;
    private _statusBarItem: vscode.StatusBarItem;
    private _onDidChangeAccess: vscode.EventEmitter<boolean>;

    private constructor() {
        this._onDidChangeAccess = new vscode.EventEmitter<boolean>();
        this._isEnabled = vscode.workspace.getConfiguration('copilot-ppa').get('repository.enabled', false);
        this._statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            99
        );
        this.updateStatusBar();
    }

    public static getInstance(): RepositoryManager {
        if (!RepositoryManager.instance) {
            RepositoryManager.instance = new RepositoryManager();
        }
        return RepositoryManager.instance;
    }

    public get onDidChangeAccess(): vscode.Event<boolean> {
        return this._onDidChangeAccess.event;
    }

    public async toggleAccess(): Promise<void> {
        this._isEnabled = !this._isEnabled;
        await vscode.workspace.getConfiguration('copilot-ppa').update(
            'repository.enabled',
            this._isEnabled,
            vscode.ConfigurationTarget.Global
        );
        this.updateStatusBar();
        this._onDidChangeAccess.fire(this._isEnabled);
        await vscode.window.showInformationMessage(
            `Repository access ${this._isEnabled ? 'enabled' : 'disabled'}`
        );
    }

    public isEnabled(): boolean {
        return this._isEnabled;
    }

    private updateStatusBar(): void {
        this._statusBarItem.text = `$(git-branch) Repository: ${
            this._isEnabled ? 'Enabled' : 'Disabled'
        }`;
        this._statusBarItem.tooltip = 'Click to toggle repository access';
        this._statusBarItem.command = 'copilot-ppa.toggleRepositoryAccess';
        this._statusBarItem.show();
    }

    public dispose(): void {
        this._statusBarItem.dispose();
        this._onDidChangeAccess.dispose();
    }

    public async createNewRepository(): Promise<void> {
        if (!this._isEnabled) {
            throw new Error('Repository access is disabled');
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder open');
        }

        const options = await this.getRepositoryOptions();
        if (!options) {
            return; // User cancelled
        }

        try {
            await this.initializeGitRepository(workspaceFolders[0].uri.fsPath, options);
            vscode.window.showInformationMessage('Repository created successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create repository: ${error}`);
        }
    }

    private async getRepositoryOptions(): Promise<{ name: string; description: string; } | undefined> {
        const name = await vscode.window.showInputBox({
            prompt: 'Enter repository name',
            placeHolder: 'my-project'
        });

        if (!name) {return undefined;}

        const description = await vscode.window.showInputBox({
            prompt: 'Enter repository description (optional)',
            placeHolder: 'A brief description of the project'
        });

        return { name, description: description || '' };
    }

    private async initializeGitRepository(path: string, options: { name: string; description: string; }): Promise<void> {
        await execAsync('git init', { cwd: path });
        await execAsync('git add .', { cwd: path });
        await execAsync('git commit -m "Initial commit"', { cwd: path });
        
        // Create README.md if it doesn't exist
        const readmePath = vscode.Uri.file(path + '/README.md');
        const readmeContent = `# ${options.name}\n\n${options.description}`;
        
        try {
            await vscode.workspace.fs.stat(readmePath);
        } catch {
            await vscode.workspace.fs.writeFile(readmePath, Buffer.from(readmeContent));
        }
    }
}
