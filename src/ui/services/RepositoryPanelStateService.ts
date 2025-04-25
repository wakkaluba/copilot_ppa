import * as vscode from 'vscode';

export interface IPanelState {
    selectedRepository?: string;
    repositories: string[];
    currentView: string;
}

export class RepositoryPanelStateService {
    private state: IPanelState = {
        repositories: [],
        currentView: 'list',
    };
    
    constructor(private context: vscode.ExtensionContext) {
        this.loadState();
    }
    
    public getState(): IPanelState {
        return { ...this.state };
    }
    
    public setState(newState: Partial<IPanelState>): void {
        this.state = { ...this.state, ...newState };
        this.saveState();
    }
    
    public setSelectedRepository(repositoryName: string): void {
        this.state.selectedRepository = repositoryName;
        this.saveState();
    }
    
    public clearSelectedRepository(): void {
        delete this.state.selectedRepository;
        this.saveState();
    }
    
    public setRepositories(repositories: string[]): void {
        this.state.repositories = repositories;
        this.saveState();
    }
    
    public setCurrentView(view: string): void {
        this.state.currentView = view;
        this.saveState();
    }
    
    private saveState(): void {
        this.context.workspaceState.update('repository-panel-state', this.state);
    }
    
    private loadState(): void {
        const savedState = this.context.workspaceState.get<IPanelState>('repository-panel-state');
        if (savedState) {
            this.state = savedState;
        }
    }
}