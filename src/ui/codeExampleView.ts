import * as vscode from 'vscode';
import { CodeExampleService } from '../services/codeExamples/codeExampleService';
import { CodeExampleWebviewService } from '../services/codeExamples/CodeExampleWebviewService';
import { CodeAnalysisService } from '../services/codeExamples/CodeAnalysisService';
import { WebviewHtmlService } from '../services/webview/WebviewHtmlService';

/**
 * Define interface for webview message payloads
 */
interface IWebviewMessageData {
    type: 'search' | 'insert' | 'copy';
    query?: string;
    language?: string;
    code?: string;
}

export class CodeExampleViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codeExamples.view';
    private _view?: vscode.WebviewView;
    private readonly webviewService: CodeExampleWebviewService;
    private readonly analysisService: CodeAnalysisService;
    private readonly htmlService: WebviewHtmlService;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly codeExampleService: CodeExampleService
    ) {
        this.webviewService = new CodeExampleWebviewService();
        this.analysisService = new CodeAnalysisService();
        this.htmlService = new WebviewHtmlService(_extensionUri);
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        this.webviewService.initialize(webviewView, this._extensionUri);
        this.setupWebview();
    }

    private setupWebview(): void {
        if (!this._view) {
            return;
        }

        this._view.webview.html = this.htmlService.generateCodeExampleHtml(this._view.webview);
        this._view.webview.onDidReceiveMessage(this.handleWebviewMessage.bind(this));
    }

    private async handleWebviewMessage(data: IWebviewMessageData): Promise<void> {
        switch (data.type) {
            case 'search':
                await this.searchCodeExamples(data.query, data.language);
                break;
            case 'insert':
                this.webviewService.insertCode(data.code);
                break;
            case 'copy':
                await this.webviewService.copyToClipboard(data.code);
                break;
        }
    }

    public async searchCodeExamples(query: string, language?: string): Promise<void> {
        if (!this._view) {
            return;
        }

        this.webviewService.setLoading(true);

        try {
            const editor = vscode.window.activeTextEditor;
            const searchLanguage = language || editor?.document.languageId;
            const keywords = this.analysisService.extractKeywords(editor);

            const examples = await this.codeExampleService.searchExamples(query, {
                language: searchLanguage,
                maxResults: 10
            });

            const filteredExamples = this.codeExampleService.filterExamplesByRelevance(
                examples,
                { language: searchLanguage || '', keywords }
            );

            this.webviewService.updateSearchResults(filteredExamples, query, searchLanguage);
        } catch (error) {
            this.webviewService.showError(error);
        } finally {
            this.webviewService.setLoading(false);
        }
    }
}
