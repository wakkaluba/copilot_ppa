"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDisplaySettingsPanel = getDisplaySettingsPanel;
exports.getDisplaySettingsStyles = getDisplaySettingsStyles;
exports.getDisplaySettingsScript = getDisplaySettingsScript;
function getDisplaySettingsPanel(currentSettings) {
    return `
    <div class="display-settings-panel">
        <h3>Display Settings</h3>
        
        <div class="setting-group">
            <label for="fontSize">Font Size</label>
            <div class="setting-control">
                <input type="range" id="fontSize" min="10" max="24" value="${currentSettings.fontSize}" />
                <span class="setting-value">${currentSettings.fontSize}px</span>
            </div>
        </div>
        
        <div class="setting-group">
            <label for="messageSpacing">Message Spacing</label>
            <div class="setting-control">
                <input type="range" id="messageSpacing" min="4" max="24" value="${currentSettings.messageSpacing}" />
                <span class="setting-value">${currentSettings.messageSpacing}px</span>
            </div>
        </div>
        
        <div class="setting-group">
            <label for="codeBlockTheme">Code Block Theme</label>
            <div class="setting-control">
                <select id="codeBlockTheme">
                    <option value="default" ${currentSettings.codeBlockTheme === 'default' ? 'selected' : ''}>Default</option>
                    <option value="dark" ${currentSettings.codeBlockTheme === 'dark' ? 'selected' : ''}>Dark</option>
                    <option value="light" ${currentSettings.codeBlockTheme === 'light' ? 'selected' : ''}>Light</option>
                    <option value="high-contrast" ${currentSettings.codeBlockTheme === 'high-contrast' ? 'selected' : ''}>High Contrast</option>
                </select>
            </div>
        </div>
        
        <div class="setting-group">
            <label for="userMessageColor">User Message Color</label>
            <div class="setting-control">
                <input type="color" id="userMessageColor" value="${currentSettings.userMessageColor}" />
                <span class="setting-value">${currentSettings.userMessageColor}</span>
            </div>
        </div>
        
        <div class="setting-group">
            <label for="agentMessageColor">Agent Message Color</label>
            <div class="setting-control">
                <input type="color" id="agentMessageColor" value="${currentSettings.agentMessageColor}" />
                <span class="setting-value">${currentSettings.agentMessageColor}</span>
            </div>
        </div>
        
        <div class="setting-group">
            <label for="timestampDisplay">Show Timestamps</label>
            <div class="setting-control">
                <input type="checkbox" id="timestampDisplay" ${currentSettings.timestampDisplay ? 'checked' : ''} />
            </div>
        </div>
        
        <div class="setting-group">
            <label for="compactMode">Compact Mode</label>
            <div class="setting-control">
                <input type="checkbox" id="compactMode" ${currentSettings.compactMode ? 'checked' : ''} />
            </div>
        </div>
        
        <div class="button-group">
            <button class="reset-settings">Reset to Defaults</button>
            <button class="apply-settings">Apply Settings</button>
        </div>
    </div>
    `;
}
function getDisplaySettingsStyles() {
    return `
    .display-settings-panel {
        padding: 16px;
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
    }
    
    .setting-group {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 12px;
        justify-content: space-between;
    }
    
    .setting-group label {
        flex: 1;
        margin-right: 12px;
    }
    
    .setting-control {
        display: flex;
        align-items: center;
        flex: 2;
    }
    
    .setting-value {
        margin-left: 8px;
        min-width: 40px;
    }
    
    .button-group {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
    }
    
    .button-group button {
        margin-left: 8px;
        padding: 6px 12px;
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        cursor: pointer;
    }
    
    .button-group button:hover {
        background-color: var(--vscode-button-hoverBackground);
    }
    
    input[type="range"] {
        flex: 1;
    }
    
    input[type="color"] {
        height: 24px;
        width: 40px;
        border: none;
        padding: 0;
    }
    
    select {
        background-color: var(--vscode-dropdown-background);
        color: var(--vscode-dropdown-foreground);
        border: 1px solid var(--vscode-dropdown-border);
        padding: 4px 8px;
    }
    `;
}
function getDisplaySettingsScript() {
    return `
    document.addEventListener('DOMContentLoaded', () => {
        setupDisplaySettingsListeners();
    });
    
    function setupDisplaySettingsListeners() {
        const fontSizeInput = document.getElementById('fontSize');
        const messageSpacingInput = document.getElementById('messageSpacing');
        const codeBlockThemeSelect = document.getElementById('codeBlockTheme');
        const userMessageColorInput = document.getElementById('userMessageColor');
        const agentMessageColorInput = document.getElementById('agentMessageColor');
        const timestampDisplayCheckbox = document.getElementById('timestampDisplay');
        const compactModeCheckbox = document.getElementById('compactMode');
        
        if (fontSizeInput) {
            fontSizeInput.addEventListener('input', (e) => {
                const value = e.target.value;
                fontSizeInput.nextElementSibling.textContent = \`\${value}px\`;
            });
        }
        
        if (messageSpacingInput) {
            messageSpacingInput.addEventListener('input', (e) => {
                const value = e.target.value;
                messageSpacingInput.nextElementSibling.textContent = \`\${value}px\`;
            });
        }
        
        if (userMessageColorInput) {
            userMessageColorInput.addEventListener('input', (e) => {
                const value = e.target.value;
                userMessageColorInput.nextElementSibling.textContent = value;
            });
        }
        
        if (agentMessageColorInput) {
            agentMessageColorInput.addEventListener('input', (e) => {
                const value = e.target.value;
                agentMessageColorInput.nextElementSibling.textContent = value;
            });
        }
        
        const resetButton = document.querySelector('.reset-settings');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                vscode.postMessage({
                    command: 'resetDisplaySettings'
                });
            });
        }
        
        const applyButton = document.querySelector('.apply-settings');
        if (applyButton) {
            applyButton.addEventListener('click', () => {
                const settings = {
                    fontSize: parseInt(fontSizeInput.value, 10),
                    messageSpacing: parseInt(messageSpacingInput.value, 10),
                    codeBlockTheme: codeBlockThemeSelect.value,
                    userMessageColor: userMessageColorInput.value,
                    agentMessageColor: agentMessageColorInput.value,
                    timestampDisplay: timestampDisplayCheckbox.checked,
                    compactMode: compactModeCheckbox.checked
                };
                
                vscode.postMessage({
                    command: 'updateDisplaySettings',
                    settings
                });
            });
        }
    }
    `;
}
//# sourceMappingURL=displaySettings.js.map