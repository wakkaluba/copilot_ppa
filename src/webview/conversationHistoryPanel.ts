import * as vscode from 'vscode';
import { ConversationHistory } from '../services/ConversationHistory';
import { ChatMessage, Conversation, Chapter } from '../services/types';

export class ConversationHistoryPanel {
    public static currentPanel: ConversationHistoryPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _conversationHistory: ConversationHistory;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, conversationHistory: ConversationHistory) {
        this._panel = panel;
        this._conversationHistory = conversationHistory;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'forgetMessage':
                        await this._conversationHistory.forgetMessage(message.conversationId, message.messageId);
                        this._update();
                        break;
                    case 'createChapter':
                        await this._conversationHistory.createChapter(message.title, message.description);
                        this._update();
                        break;
                    case 'addToChapter':
                        await this._conversationHistory.addConversationToChapter(message.conversationId, message.chapterId);
                        this._update();
                        break;
                    case 'deleteChapter':
                        await this._conversationHistory.deleteChapter(message.chapterId);
                        this._update();
                        break;
                    case 'addReference':
                        await this._conversationHistory.addMessageReference(message.messageId, message.referenceMessageId);
                        this._update();
                        break;
                    case 'updateObjectives':
                        await this._conversationHistory.updateProjectObjectives(message.objectives);
                        this._update();
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    public static render(extensionUri: vscode.Uri, conversationHistory: ConversationHistory) {
        if (ConversationHistoryPanel.currentPanel) {
            ConversationHistoryPanel.currentPanel._panel.reveal();
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'conversationHistory',
            'Conversation History',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        ConversationHistoryPanel.currentPanel = new ConversationHistoryPanel(panel, conversationHistory);
    }

    private async _update() {
        const conversations = this._conversationHistory.getAllConversations();
        const chapters = this._conversationHistory.getAllChapters();
        const objectives = await this._conversationHistory.getProjectObjectives();

        this._panel.webview.html = this._getHtmlForWebview(conversations, chapters, objectives);
    }

    private _getHtmlForWebview(conversations: Conversation[], chapters: Chapter[], objectives: string[]): string {
        return `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                .conversation { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; }
                .message { margin: 5px 0; padding: 5px; }
                .forget-button { float: right; }
                .chapter { margin: 10px 0; padding: 10px; background: #f0f0f0; }
                .objectives { margin: 20px 0; }
                .reference { color: #0066cc; text-decoration: underline; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="objectives">
                <h2>Project Objectives</h2>
                <ul>
                    ${objectives.map(obj => `<li>${obj}</li>`).join('')}
                </ul>
                <button onclick="addObjective()">Add Objective</button>
            </div>

            <div class="chapters">
                <h2>Chapters</h2>
                ${chapters.map(chapter => `
                    <div class="chapter">
                        <h3>${chapter.title}</h3>
                        <p>${chapter.description || ''}</p>
                        <button onclick="deleteChapter('${chapter.id}')">Delete Chapter</button>
                    </div>
                `).join('')}
                <button onclick="createChapter()">Create Chapter</button>
            </div>

            <div class="conversations">
                <h2>Conversations</h2>
                ${conversations.map(conv => `
                    <div class="conversation">
                        <h3>${conv.title}</h3>
                        ${conv.messages.map(msg => `
                            <div class="message">
                                <button class="forget-button" onclick="forgetMessage('${conv.id}', '${msg.id}')">Forget</button>
                                <strong>${msg.role}:</strong> ${msg.content}
                                ${msg.references ? `
                                    <div class="references">
                                        References: ${msg.references.map(ref => `
                                            <span class="reference" onclick="showReference('${ref}')">${ref}</span>
                                        `).join(', ')}
                                    </div>
                                ` : ''}
                                <button onclick="addReference('${msg.id}')">Add Reference</button>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function forgetMessage(conversationId, messageId) {
                    vscode.postMessage({
                        command: 'forgetMessage',
                        conversationId,
                        messageId
                    });
                }

                function createChapter() {
                    const title = prompt('Enter chapter title:');
                    const description = prompt('Enter chapter description (optional):');
                    if (title) {
                        vscode.postMessage({
                            command: 'createChapter',
                            title,
                            description
                        });
                    }
                }

                function deleteChapter(chapterId) {
                    if (confirm('Delete this chapter?')) {
                        vscode.postMessage({
                            command: 'deleteChapter',
                            chapterId
                        });
                    }
                }

                function addReference(messageId) {
                    const referenceId = prompt('Enter reference message ID:');
                    if (referenceId) {
                        vscode.postMessage({
                            command: 'addReference',
                            messageId,
                            referenceMessageId: referenceId
                        });
                    }
                }

                function showReference(referenceId) {
                    // Scroll to referenced message
                    const element = document.querySelector(\`[data-message-id="\${referenceId}"]\`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }

                function addObjective() {
                    const objective = prompt('Enter new project objective:');
                    if (objective) {
                        const objectives = Array.from(document.querySelectorAll('.objectives li'))
                            .map(li => li.textContent);
                        objectives.push(objective);
                        vscode.postMessage({
                            command: 'updateObjectives',
                            objectives
                        });
                    }
                }
            </script>
        </body>
        </html>`;
    }

    public dispose() {
        ConversationHistoryPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}