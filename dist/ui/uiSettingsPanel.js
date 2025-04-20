"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UISettingsPanel = void 0;
class UISettingsPanel {
    _panel;
    _disposables = [];
    constructor(panel) {
        this._panel = panel;
        // Set the webview's initial html content
        this._panel.webview.html = this._getHtmlForWebview();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'selectTab':
                    const tabToSelect = message.tab;
                    if (tabToSelect) {
                        // Handle selecting a tab
                        const tabSelector = '.tab[data-tab="' + tabToSelect + '"]';
                        const tabEl = document.querySelector(tabSelector);
                        if (tabEl) {
                            tabEl.click();
                        }
                    }
                    break;
            }
        }, null, this._disposables);
    }
    /**
     * Select a specific tab in the panel
     */
    selectTab(tabName) {
        if (!this._panel.visible) {
            return;
        }
        this._panel.webview.postMessage({
            command: 'selectTab',
            tab: tabName
        });
    }
    _getHtmlForWebview() {
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
                    }
                    .tab-content.active {
                        display: block;
                    }
                </style>
            </head>
            <body>
                <div class="tab-container">
                    <button class="tab active" data-tab="general">General</button>
                    <button class="tab" data-tab="advanced">Advanced</button>
                </div>
                <div id="general" class="tab-content active">
                    <h2>General Settings</h2>
                    <!-- Add general settings content here -->
                </div>
                <div id="advanced" class="tab-content">
                    <h2>Advanced Settings</h2>
                    <!-- Add advanced settings content here -->
                </div>

                <script>
                    (function() {
                        const vscode = acquireVsCodeApi();
                        const tabs = document.querySelectorAll('.tab');
                        const tabContents = document.querySelectorAll('.tab-content');

                        tabs.forEach(tab => {
                            tab.addEventListener('click', () => {
                                // Remove active class from all tabs and contents
                                tabs.forEach(t => t.classList.remove('active'));
                                tabContents.forEach(c => c.classList.remove('active'));

                                // Add active class to clicked tab and corresponding content
                                tab.classList.add('active');
                                const tabName = tab.getAttribute('data-tab');
                                document.getElementById(tabName).classList.add('active');
                            });
                        });

                        // Handle messages from the extension
                        window.addEventListener('message', event => {
                            const message = event.data;
                            switch (message.command) {
                                case 'selectTab':
                                    const tabToSelect = message.tab;
                                    if (tabToSelect) {
                                        // Handle selecting a tab
                                        const tabSelector = '.tab[data-tab="' + tabToSelect + '"]';
                                        const tabEl = document.querySelector(tabSelector);
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
    }
    dispose() {
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
exports.UISettingsPanel = UISettingsPanel;
//# sourceMappingURL=uiSettingsPanel.js.map