import * as vscode from 'vscode';
import { IChatErrorEvent, IChatSession, ILLMChatManager } from '../models';
import { ThemeService } from '../services/ui/themeService';
import { Logger } from '../utils/logger';

export class UnifiedChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'copilotPPA.chatView';
    private view?: vscode.WebviewView;
    private currentSession?: IChatSession;
    private readonly logger: Logger;
    private readonly themeService: ThemeService;
    private disposables: vscode.Disposable[] = [];

    // Map of common question patterns to predefined responses
    private quickResponseTemplates: Record<string, string[]> = {
        confirmation: ['Yes', 'No', 'Maybe later'],
        opinion: ['I like it', 'I don\'t like it', 'Neutral'],
        decision: ['Proceed', 'Cancel', 'Need more info'],
        preference: ['Option 1', 'Option 2', 'None of these'],
        binary: ['Yes', 'No'],
        multiple: ['All of them', 'None of them', 'Some of them'],
        custom: [] // Will be populated dynamically
    };

    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly chatManager: ILLMChatManager
    ) {
        this.logger = Logger.getInstance();
        this.themeService = new ThemeService();
        this.setupEventListeners();
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };

        this.initializeWebview();
        this.registerMessageHandlers();

        // Clean up when view is disposed
        webviewView.onDidDispose(() => {
            this.dispose();
        });
    }

    private setupEventListeners(): void {
        this.disposables.push(
            this.chatManager.onMessageHandled(() => this.updateMessages()),
            this.chatManager.onHistoryCleared(() => this.updateMessages()),
            this.chatManager.onError((event: IChatErrorEvent) => this.handleError(event)),
            this.chatManager.onConnectionStatusChanged(() => this.updateConnectionStatus()),
            vscode.window.onDidChangeActiveColorTheme(() => this.updateTheme())
        );
    }

    private async initializeWebview(): Promise<void> {
        if (!this.view) {
            return;
        }

        if (!this.currentSession) {
            this.currentSession = await this.chatManager.createSession();
        }

        this.view.webview.html = this.getWebviewContent();
        this.updateMessages();
        this.updateConnectionStatus();
    }

    private registerMessageHandlers(): void {
        if (!this.view) {
            return;
        }

        this.view.webview.onDidReceiveMessage(async (message) => {
            try {
                switch (message.type) {
                    case 'sendMessage':
                        await this.handleMessage(message.content);
                        break;

                    case 'clearChat':
                        await this.clearChat();
                        break;

                    case 'getMessages':
                        this.updateMessages();
                        break;

                    case 'getConnectionStatus':
                        this.updateConnectionStatus();
                        break;

                    case 'copyToClipboard':
                        await this.copyToClipboard(message.text);
                        break;

                    case 'createSnippet':
                        await this.createSnippet(message.code, message.language);
                        break;

                    case 'continueIteration':
                        await this.handleContinueIteration();
                        break;

                    case 'getQuickResponses':
                        this.provideQuickResponses(message.messageType);
                        break;
                }
            } catch (error) {
                this.handleError({ error });
            }
        });
    }

    private showContinuePrompt(): void {
        if (!this.view) {
            return;
        }

        this.view.webview.postMessage({
            type: 'showContinuePrompt',
            message: 'Continue to iterate?'
        });
    }

    private async handleContinueIteration(): Promise<void> {
        if (!this.currentSession) {
            return;
        }

        await this.handleMessage('Continue');
    }

    private async handleMessage(content: string): Promise<void> {
        if (!content.trim() || !this.currentSession) {
            return;
        }

        await this.chatManager.handleUserMessage(
            this.currentSession.id,
            content
        );

        // Show continue prompt after certain messages
        if (content.toLowerCase().includes('continue') ||
            content.toLowerCase().includes('iterate')) {
            this.showContinuePrompt();
        }

        // Show Yes/No buttons after questions
        if (content.endsWith('?')) {
            this.showYesNoButtons('Quick response');
        }
    }

    private async clearChat(): Promise<void> {
        if (this.currentSession) {
            await this.chatManager.clearSessionHistory(this.currentSession.id);
        }
    }

    private async copyToClipboard(text: string): Promise<void> {
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage('Copied to clipboard');
    }

    private async createSnippet(code: string, language: string): Promise<void> {
        // TODO: Implement snippet creation
        this.logger.debug('Snippet creation requested', { code, language });
    }

    private updateMessages(): void {
        if (!this.view || !this.currentSession) {
            return;
        }

        const messages = this.chatManager.getSessionMessages(this.currentSession.id);
        this.view.webview.postMessage({
            type: 'updateMessages',
            messages
        });
    }

    private updateConnectionStatus(): void {
        if (!this.view) {
            return;
        }

        const status = this.chatManager.getConnectionStatus();
        this.view.webview.postMessage({
            type: 'updateConnectionStatus',
            status
        });
    }

    private updateTheme(): void {
        if (!this.view) {
            return;
        }

        const theme = this.themeService.currentTheme;
        this.view.webview.postMessage({
            type: 'updateTheme',
            theme
        });
    }

    private handleError(event: IChatErrorEvent): void {
        const errorMessage = event.error instanceof Error ?
            event.error.message :
            String(event.error);

        this.logger.error('Chat error occurred', { error: errorMessage });
        vscode.window.showErrorMessage(`Chat Error: ${errorMessage}`);

        if (this.view) {
            this.view.webview.postMessage({
                type: 'showError',
                message: errorMessage
            });
        }
    }

    private getWebviewContent(): string {
        const cssUri = this.getResourceUri('chat.css');
        const jsUri = this.getResourceUri('chat.js');
        const theme = this.themeService.currentTheme;

        return `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.view!.webview.cspSource}; script-src ${this.view!.webview.cspSource};">
                <title>Chat</title>
                <link rel="stylesheet" href="${cssUri}">
            </head>
            <body class="theme-${theme}">
                <div id="chat-container">
                    <div class="status-bar">
                        <div class="connection-status">
                            <span class="status-dot"></span>
                            <span class="status-text">Initializing...</span>
                        </div>
                    </div>

                    <div id="messages" class="messages"></div>

                    <div class="continue-prompt" style="display: none;">
                        <div class="continue-message">Continue to iterate?</div>
                        <div class="continue-actions">
                            <button id="btn-continue-yes" class="btn-continue">Yes</button>
                            <button id="btn-continue-no" class="btn-continue">No</button>
                        </div>
                    </div>

                    <!-- Quick response options container -->
                    <div id="quick-responses" class="quick-responses" style="display: none;"></div>

                    <div class="error-container" style="display: none;">
                        <div class="error-message"></div>
                    </div>

                    <div class="input-container">
                        <div class="toolbar">
                            <button id="clear-chat">Clear Chat</button>
                        </div>
                        <div class="message-input">
                            <textarea id="message-input" placeholder="Type your message..." rows="3"></textarea>
                            <button id="send-button">Send</button>
                        </div>
                    </div>
                </div>
                <script src="${jsUri}"></script>
            </body>
            </html>`;
    }

    private getResourceUri(fileName: string): string {
        const filePath = vscode.Uri.joinPath(this.extensionUri, 'media', fileName);
        return this.view!.webview.asWebviewUri(filePath).toString();
    }

    private provideQuickResponses(messageType: string): void {
        if (!this.view) {
            return;
        }

        // Generate appropriate responses based on the message type
        const responses = this.getQuickResponseOptions(messageType);

        // Send the responses to the webview
        this.view.webview.postMessage({
            type: 'showQuickResponses',
            responses
        });
    }

    private getQuickResponseOptions(messageType: string): string[] {
        // Determine response category based on message type and content
        let responseCategory: string;

        switch (messageType) {
            case 'question':
                responseCategory = 'binary'; // Default for questions
                break;
            case 'error':
                return ['Try again', 'Let me check something else', 'Can you help debug?'];
            case 'confirmation':
                return ['Looks good', 'Make changes', 'Undo this'];
            case 'suggestion':
                return ['Sounds good', 'Let me think about it', 'Not what I need'];
            default:
                return ['Thanks', 'Continue', 'That helps', 'Not quite'];
        }

        return this.quickResponseTemplates[responseCategory] || this.quickResponseTemplates.binary;
    }

    private showYesNoButtons(prompt: string): void {
        if (!this.view) {
            return;
        }

        // Use the binary template from response templates
        const responses = this.quickResponseTemplates.binary;

        this.view.webview.postMessage({
            type: 'showQuickResponses',
            responses
        });
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.currentSession = undefined;
    }
}
