import * as vscode from 'vscode';
export interface IPanelState {
    selectedRepository?: string;
    repositories: string[];
    currentView: string;
}
export declare class RepositoryPanelStateService {
    private context;
    private state;
    constructor(context: vscode.ExtensionContext);
    getState(): IPanelState;
    setState(newState: Partial<IPanelState>): void;
    setSelectedRepository(repositoryName: string): void;
    clearSelectedRepository(): void;
    setRepositories(repositories: string[]): void;
    setCurrentView(view: string): void;
    private saveState;
    private loadState;
}
