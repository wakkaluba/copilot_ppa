"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryPanelStateService = void 0;
const events_1 = require("events");
class RepositoryPanelStateService {
    constructor() {
        this.state = {
            isAccessEnabled: false,
            errorMessage: undefined
        };
        this.eventEmitter = new events_1.EventEmitter();
    }
    getAccessState() {
        return this.state.isAccessEnabled;
    }
    setAccessEnabled(enabled) {
        this.state.isAccessEnabled = enabled;
        this.eventEmitter.emit('stateChanged', this.state);
    }
    setLastProvider(provider) {
        this.state.lastProvider = provider;
        this.eventEmitter.emit('stateChanged', this.state);
    }
    setLastCreatedRepo(repoUrl) {
        this.state.lastCreatedRepo = repoUrl;
        this.eventEmitter.emit('stateChanged', this.state);
    }
    setErrorMessage(message) {
        this.state.errorMessage = message;
        this.eventEmitter.emit('stateChanged', this.state);
    }
    getState() {
        return { ...this.state };
    }
    onStateChanged(listener) {
        this.eventEmitter.on('stateChanged', listener);
    }
    clearState() {
        this.state = {
            isAccessEnabled: false,
            errorMessage: undefined
        };
        this.eventEmitter.emit('stateChanged', this.state);
    }
}
exports.RepositoryPanelStateService = RepositoryPanelStateService;
//# sourceMappingURL=RepositoryPanelStateService.js.map