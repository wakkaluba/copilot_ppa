import { Logger } from '../../utils/logger';

export interface IUISettingsTab {
    id: string;
    label: string;
    content: string;
}

export class UISettingsWebviewService {
    private readonly logger: Logger;

    constructor() {
        this.logger = new Logger();
    }

    public generateWebviewContent(tabs: IUISettingsTab[]): string {
        try {
            return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Settings</title>
                <style>
                    .tab-container {
                        margin-bottom: 20px;
                    }
                    .tab {
                        padding: 8px 16px;
                        cursor: pointer;
                        border: none;
                        background: none;
                        color: var(--vscode-foreground);
                    }
                    .tab.active {
                        border-bottom: 2px solid var(--vscode-focusBorder);
                    }
                    .tab-content {
                        display: none;
                        padding: 16px;
                        background-color: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 4px;
                    }
                    .tab-content.active {
                        display: block;
                    }
                    .setting-group {
                        margin-bottom: 16px;
                    }
                    .setting-group label {
                        display: block;
                        margin-bottom: 8px;
                        color: var(--vscode-foreground);
                    }
                    select, input[type="text"], input[type="number"] {
                        width: 100%;
                        padding: 8px;
                        background-color: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                        border-radius: 2px;
                    }
                    .error-message {
                        color: var(--vscode-errorForeground);
                        margin-top: 8px;
                        display: none;
                    }
                    .error-message.visible {
                        display: block;
                    }
                </style>
            </head>
            <body>
                <div class="tab-container">
                    ${tabs.map((tab, index) => `
                        <button class="tab${index === 0 ? ' active' : ''}" data-tab="${tab.id}">
                            ${tab.label}
                        </button>
                    `).join('')}
                </div>

                ${tabs.map((tab, index) => `
                    <div id="${tab.id}" class="tab-content${index === 0 ? ' active' : ''}">
                        ${tab.content}
                    </div>
                `).join('')}

                <div class="error-message" id="errorMessage"></div>

                <script>
                    (function() {
                        const vscode = acquireVsCodeApi();
                        const tabs = document.querySelectorAll('.tab');
                        const tabContents = document.querySelectorAll('.tab-content');
                        const errorMessage = document.getElementById('errorMessage');

                        function showError(message) {
                            errorMessage.textContent = message;
                            errorMessage.classList.add('visible');
                            setTimeout(() => {
                                errorMessage.classList.remove('visible');
                            }, 3000);
                        }

                        tabs.forEach(tab => {
                            tab.addEventListener('click', () => {
                                tabs.forEach(t => t.classList.remove('active'));
                                tabContents.forEach(c => c.classList.remove('active'));

                                tab.classList.add('active');
                                const tabName = tab.getAttribute('data-tab');
                                document.getElementById(tabName).classList.add('active');

                                vscode.postMessage({
                                    command: 'tabChanged',
                                    tab: tabName
                                });
                            });
                        });

                        window.addEventListener('message', event => {
                            const message = event.data;
                            switch (message.command) {
                                case 'showError':
                                    showError(message.message);
                                    break;
                                case 'selectTab':
                                    const tabToSelect = message.tab;
                                    if (tabToSelect) {
                                        const tabEl = document.querySelector(\`[data-tab="\${tabToSelect}"]\`);
                                        if (tabEl) {
                                            tabEl.click();
                                        }
                                    }
                                    break;
                            }
                        });
                    }())
                </script>
            </body>
            </html>`;
        } catch (error) {
            this.logger.error('Error generating UI settings webview content', error);
            throw error;
        }
    }
}
