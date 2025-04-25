"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryPanelStateService = void 0;
class RepositoryPanelStateService {
    context;
    state = {
        repositories: [],
        currentView: 'list',
    };
    constructor(context) {
        this.context = context;
        this.loadState();
    }
    getState() {
        return { ...this.state };
    }
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.saveState();
    }
    setSelectedRepository(repositoryName) {
        this.state.selectedRepository = repositoryName;
        this.saveState();
    }
    clearSelectedRepository() {
        delete this.state.selectedRepository;
        this.saveState();
    }
    setRepositories(repositories) {
        this.state.repositories = repositories;
        this.saveState();
    }
    setCurrentView(view) {
        this.state.currentView = view;
        this.saveState();
    }
    saveState() {
        this.context.workspaceState.update('repository-panel-state', this.state);
    }
    loadState() {
        const savedState = this.context.workspaceState.get('repository-panel-state');
        if (savedState) {
            this.state = savedState;
        }
    }
}
exports.RepositoryPanelStateService = RepositoryPanelStateService;
//# sourceMappingURL=RepositoryPanelStateService.js.map