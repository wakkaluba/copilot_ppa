
/**
 * Interface for confirmation settings displayed in UI
 */
export interface ConfirmationSettings {
    disableContinuePrompts: boolean;
    showNotificationsForLongOperations: boolean;
    longOperationThresholdSeconds: number;
}

/**
 * Generate HTML for confirmation settings panel
 */
export function getConfirmationSettingsPanel(settings: ConfirmationSettings): string {
    return `
    <div class="settings-container">
        <h2>Confirmation Settings</h2>

        <div class="setting-group">
            <label for="disableContinuePrompts">Disable "Continue?" prompts</label>
            <div class="setting-control">
                <input type="checkbox" id="disableContinuePrompts" ${settings.disableContinuePrompts ? 'checked' : ''} />
                <span class="setting-description">Skip confirmation dialogs and automatically proceed with operations</span>
            </div>
        </div>

        <div class="setting-group">
            <label for="showNotificationsForLongOperations">Show notifications for long-running operations</label>
            <div class="setting-control">
                <input type="checkbox" id="showNotificationsForLongOperations" ${settings.showNotificationsForLongOperations ? 'checked' : ''} />
                <span class="setting-description">Display notifications when operations take longer than expected</span>
            </div>
        </div>

        <div class="setting-group">
            <label for="longOperationThresholdSeconds">Long operation threshold (seconds)</label>
            <div class="setting-control">
                <input type="number" id="longOperationThresholdSeconds" value="${settings.longOperationThresholdSeconds}" min="1" max="60" />
                <span class="setting-description">Time before an operation is considered "long-running"</span>
            </div>
        </div>

        <div class="setting-group">
            <h3>Disabled Prompt Types</h3>
            <p class="setting-description">You can disable specific types of prompts using the "Don't Ask Again" button when they appear.</p>
            <button id="resetPromptTypes" class="secondary-button">Reset All Prompts</button>
        </div>

        <div class="button-group">
            <button id="saveConfirmationSettings" class="primary-button">Save Settings</button>
            <button id="resetConfirmationSettings" class="secondary-button">Reset to Defaults</button>
        </div>
    </div>
    `;
}

/**
 * Generate CSS styles for confirmation settings panel
 */
export function getConfirmationSettingsStyles(): string {
    return `
    .settings-container {
        padding: 16px;
        max-width: 800px;
        margin: 0 auto;
    }

    .setting-group {
        margin-bottom: 24px;
    }

    .setting-group label {
        display: block;
        font-weight: 600;
        margin-bottom: 8px;
    }

    .setting-description {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        opacity: 0.8;
    }

    .setting-control {
        margin-top: 8px;
    }

    input[type="checkbox"] {
        margin-right: 8px;
    }

    input[type="number"] {
        width: 60px;
        padding: 4px;
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border);
    }

    .button-group {
        display: flex;
        gap: 8px;
        margin-top: 24px;
    }

    .primary-button {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 8px 16px;
        cursor: pointer;
    }

    .primary-button:hover {
        background-color: var(--vscode-button-hoverBackground);
    }

    .secondary-button {
        background-color: transparent;
        color: var(--vscode-button-secondaryForeground);
        border: 1px solid var(--vscode-button-border);
        padding: 8px 16px;
        cursor: pointer;
    }

    .secondary-button:hover {
        background-color: var(--vscode-button-secondaryHoverBackground);
    }
    `;
}

/**
 * Generate JavaScript for confirmation settings panel
 */
export function getConfirmationSettingsScript(): string {
    return `
    (function() {
        const vscode = acquireVsCodeApi();

        // Elements
        const disableContinuePromptsCheckbox = document.getElementById('disableContinuePrompts');
        const showNotificationsCheckbox = document.getElementById('showNotificationsForLongOperations');
        const thresholdInput = document.getElementById('longOperationThresholdSeconds');
        const saveButton = document.getElementById('saveConfirmationSettings');
        const resetButton = document.getElementById('resetConfirmationSettings');
        const resetPromptTypesButton = document.getElementById('resetPromptTypes');

        // Event listeners
        saveButton.addEventListener('click', () => {
            const settings = {
                disableContinuePrompts: disableContinuePromptsCheckbox.checked,
                showNotificationsForLongOperations: showNotificationsCheckbox.checked,
                longOperationThresholdSeconds: parseInt(thresholdInput.value, 10) || 5
            };

            vscode.postMessage({
                command: 'saveConfirmationSettings',
                settings
            });
        });

        resetButton.addEventListener('click', () => {
            vscode.postMessage({
                command: 'resetConfirmationSettings'
            });
        });

        resetPromptTypesButton.addEventListener('click', () => {
            vscode.postMessage({
                command: 'resetPromptTypes'
            });
        });

        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateSettings':
                    updateUI(message.settings);
                    break;
                case 'showNotification':
                    showNotification(message.message, message.type);
                    break;
            }
        });

        function updateUI(settings) {
            disableContinuePromptsCheckbox.checked = settings.disableContinuePrompts;
            showNotificationsCheckbox.checked = settings.showNotificationsForLongOperations;
            thresholdInput.value = settings.longOperationThresholdSeconds;
        }

        function showNotification(message, type = 'info') {
            // Implementation for showing notifications in the webview
            const notificationArea = document.createElement('div');
            notificationArea.className = \`notification \${type}\`;
            notificationArea.textContent = message;

            document.body.appendChild(notificationArea);

            setTimeout(() => {
                notificationArea.classList.add('show');

                setTimeout(() => {
                    notificationArea.classList.remove('show');
                    setTimeout(() => {
                        document.body.removeChild(notificationArea);
                    }, 300);
                }, 3000);
            }, 10);
        }
    })();
    `;
}
