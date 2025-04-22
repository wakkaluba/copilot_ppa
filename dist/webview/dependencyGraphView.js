"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyGraphViewProvider = void 0;
const DependencyGraphService_1 = require("./services/DependencyGraphService");
class DependencyGraphViewProvider {
    _extensionUri;
    static viewType = 'localLlmAgent.dependencyGraphView';
    _view;
    service;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this.service = new DependencyGraphService_1.DependencyGraphService();
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this.service.getWebviewHtml(webviewView.webview, this._extensionUri);
        this.setupMessageHandling(webviewView.webview);
    }
    updateGraph(graph) {
        if (this._view) {
            this._view.webview.postMessage({ command: 'updateGraph', graph });
        }
    }
    setupMessageHandling(webview) {
        webview.onDidReceiveMessage(message => {
            const response = this.service.handleWebviewMessage(message);
            if (response) {
                this._view?.webview.postMessage(response);
            }
        });
    }
}
exports.DependencyGraphViewProvider = DependencyGraphViewProvider;
//# sourceMappingURL=dependencyGraphView.js.map