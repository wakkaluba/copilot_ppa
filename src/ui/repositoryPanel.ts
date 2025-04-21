import * as vscode from 'vscode';
import { repositoryManager } from '../services/repositoryManagement';
import { RepositoryPanelUIService } from './services/RepositoryPanelUIService';
import { RepositoryPanelMessageService } from './services/RepositoryPanelMessageService';
import { RepositoryPanelStateService, type PanelState } from './services/RepositoryPanelStateService';

export class RepositoryPanel implements vscode.Disposable {
    private static readonly viewType = 'copilotPPA.repositoryPanel';
    private static currentPanel: RepositoryPanel | undefined;

    private readonly uiService: RepositoryPanelUIService;
    private readonly messageService: RepositoryPanelMessageService;
    private readonly stateService: RepositoryPanelStateService;
    private readonly logger: Console;
    private readonly _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri): RepositoryPanel {
        const column = vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.One;

        if (RepositoryPanel.currentPanel) {
            RepositoryPanel.currentPanel.panel.reveal(column);
            return RepositoryPanel.currentPanel;
        }

        const panel = vscode.window.createWebviewPanel(
            RepositoryPanel.viewType,
            'Repository Management',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist')
                ]
            }
        );

        RepositoryPanel.currentPanel = new RepositoryPanel(panel, extensionUri);
        return RepositoryPanel.currentPanel;
    }

    private constructor(
        private readonly panel: vscode.WebviewPanel,
        private readonly extensionUri: vscode.Uri
    ) {
        this.logger = console;
        this.uiService = new RepositoryPanelUIService(panel);
        this.messageService = new RepositoryPanelMessageService(panel.webview);
        this.stateService = new RepositoryPanelStateService();

        this.setupPanel();
        this.setupEventListeners();
        this.setupStateManagement();
    }

    private setupPanel(): void {
        try {
            this.uiService.update(this.extensionUri);
        } catch (error) {
            this.handleError('Failed to setup panel', error);
        }
    }

    private setupEventListeners(): void {
        this.panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this.panel.onDidChangeViewState(
            () => {
                if (this.panel.visible) {
                    this.uiService.update(this.extensionUri);
                }
            },
            null,
            this._disposables
        );

        this.messageService.onCreateRepository(async (
            provider: string,
            name: string,
            description: string,
            isPrivate: boolean
        ) => {
            try {
                const repoUrl = await repositoryManager.createRepository(
                    provider,
                    name,
                    description,
                    isPrivate
                );

                if (repoUrl) {
                    this.stateService.setLastCreatedRepo(repoUrl);
                    this.stateService.setLastProvider(provider);
                    await this.messageService.postMessage({ command: 'repoCreated', url: repoUrl });
                    await vscode.window.showInformationMessage(`Repository created: ${repoUrl}`);
                }
            } catch (error) {
                this.handleError('Failed to create repository', error);
            }
        });

        this.messageService.onToggleAccess((enabled: boolean) => {
            try {
                repositoryManager.setEnabled(enabled);
                this.stateService.setAccessEnabled(enabled);
                vscode.window.showInformationMessage(
                    `Repository access ${enabled ? 'enabled' : 'disabled'}`
                );
            } catch (error) {
                this.handleError('Failed to toggle repository access', error);
            }
        });
    }

    private setupStateManagement(): void {
        this.stateService.onStateChanged((state: PanelState) => {
            try {
                this.messageService.postMessage({
                    command: 'stateUpdated',
                    state
                });
            } catch (error) {
                this.handleError('Failed to update state', error);
            }
        });
    }

    private handleError(context: string, error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`${context}: ${errorMessage}`);
        this.stateService.setErrorMessage(errorMessage);
        vscode.window.showErrorMessage(`${context}: ${errorMessage}`);
    }

    public dispose(): void {
        RepositoryPanel.currentPanel = undefined;

        this.uiService.dispose();
        this.messageService.dispose();
        this.panel.dispose();

        this._disposables.forEach(d => d.dispose());
    }
}
