import * as vscode from 'vscode';
import { DependencyGraph } from '../tools/dependencyAnalyzer';
import { DependencyGraphService } from './services/DependencyGraphService';

export class DependencyGraphViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'localLlmAgent.dependencyGraphView';
    private _view?: vscode.WebviewView;
    private service: DependencyGraphService;

    constructor(private readonly _extensionUri: vscode.Uri) {
        this.service = new DependencyGraphService();
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this.service.getWebviewHtml(webviewView.webview, this._extensionUri);
        this.setupMessageHandling(webviewView.webview);
    }

    public updateGraph(graph: DependencyGraph): void {
        if (this._view) {
            this._view.webview.postMessage({ command: 'updateGraph', graph });
        }
    }

    private setupMessageHandling(webview: vscode.Webview) {
        webview.onDidReceiveMessage(message => {
            const response = this.service.handleWebviewMessage(message);
            if (response) {
                this._view?.webview.postMessage(response);
            }
        });
    }
}
