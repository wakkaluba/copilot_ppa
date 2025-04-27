"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryPanelMessageService = void 0;
class RepositoryPanelMessageService {
    constructor(webview) {
        this.webview = webview;
        this._disposables = [];
        this._listeners = new Map();
        this._disposables.push(webview.onDidReceiveMessage(this.handleMessage.bind(this)));
    }
    async handleMessage(message) {
        const { command, ...data } = message;
        const listeners = this._listeners.get(command);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    await listener(data);
                }
                catch (error) {
                    console.error(`Error handling message ${command}:`, error);
                }
            }
        }
    }
    onCreateRepository(callback) {
        const listeners = this._listeners.get('createRepository') || new Set();
        listeners.add(async (data) => {
            try {
                await callback(data.provider, data.name, data.description, data.isPrivate);
            }
            catch (error) {
                console.error('Error in createRepository callback:', error);
                throw error;
            }
        });
        this._listeners.set('createRepository', listeners);
    }
    onToggleAccess(callback) {
        const listeners = this._listeners.get('toggleAccess') || new Set();
        listeners.add(async (data) => {
            try {
                callback(data.enabled);
            }
            catch (error) {
                console.error('Error in toggleAccess callback:', error);
                throw error;
            }
        });
        this._listeners.set('toggleAccess', listeners);
    }
    async postMessage(message) {
        try {
            return await this.webview.postMessage(message);
        }
        catch (error) {
            console.error('Error posting message to webview:', error);
            return false;
        }
    }
    dispose() {
        this._disposables.forEach(d => d.dispose());
        this._listeners.clear();
    }
}
exports.RepositoryPanelMessageService = RepositoryPanelMessageService;
//# sourceMappingURL=RepositoryPanelMessageService.js.map