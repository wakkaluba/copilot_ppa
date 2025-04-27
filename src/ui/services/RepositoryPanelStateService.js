"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryPanelStateService = void 0;
var RepositoryPanelStateService = /** @class */ (function () {
    function RepositoryPanelStateService(context) {
        this.context = context;
        this.state = {
            repositories: [],
            currentView: 'list',
        };
        this.loadState();
    }
    RepositoryPanelStateService.prototype.getState = function () {
        return __assign({}, this.state);
    };
    RepositoryPanelStateService.prototype.setState = function (newState) {
        this.state = __assign(__assign({}, this.state), newState);
        this.saveState();
    };
    RepositoryPanelStateService.prototype.setSelectedRepository = function (repositoryName) {
        this.state.selectedRepository = repositoryName;
        this.saveState();
    };
    RepositoryPanelStateService.prototype.clearSelectedRepository = function () {
        delete this.state.selectedRepository;
        this.saveState();
    };
    RepositoryPanelStateService.prototype.setRepositories = function (repositories) {
        this.state.repositories = repositories;
        this.saveState();
    };
    RepositoryPanelStateService.prototype.setCurrentView = function (view) {
        this.state.currentView = view;
        this.saveState();
    };
    RepositoryPanelStateService.prototype.saveState = function () {
        this.context.workspaceState.update('repository-panel-state', this.state);
    };
    RepositoryPanelStateService.prototype.loadState = function () {
        var savedState = this.context.workspaceState.get('repository-panel-state');
        if (savedState) {
            this.state = savedState;
        }
    };
    return RepositoryPanelStateService;
}());
exports.RepositoryPanelStateService = RepositoryPanelStateService;
