"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMessage = renderMessage;
exports.getConversationPanelHtml = getConversationPanelHtml;
exports.getConversationPanelScript = getConversationPanelScript;
exports.getConversationPanelStyles = getConversationPanelStyles;
const htmlEscaper_1 = require("../../utils/htmlEscaper");
const messageRenderer_1 = require("./messageRenderer");
// We'll add a new button to each message for creating snippets
function renderMessage(message, index) {
    const role = message.role === 'user' ? 'user' :
        message.role === 'assistant' ? 'assistant' : 'system';
    const timestamp = new Date(message.timestamp).toLocaleString();
    return `
    <div class="message message-${role}" data-index="${index}">
        <div class="message-header">
            <div class="message-role">${role}</div>
            <div class="message-actions">
                <button class="message-action copy-message" title="Copy message">
                    <i class="codicon codicon-copy"></i>
                </button>
                <button class="message-action create-snippet" title="Create snippet from this message">
                    <i class="codicon codicon-save"></i>
                </button>
            </div>
        </div>
        <div class="message-content">${formatMessageContent(message.content)}</div>
        <div class="message-timestamp">${timestamp}</div>
    </div>
    `;
}
function getConversationPanelHtml(conversation) {
    return `
    <div class="conversation-panel">
        <div class="conversation-header">
            <h2>${(0, htmlEscaper_1.escapeHtml)(conversation.title)}</h2>
            <div class="conversation-actions">
                <button class="action-button" title="Export Conversation" id="export-conversation">
                    <i class="codicon codicon-save"></i>
                </button>
                <!-- ...existing buttons... -->
            </div>
        </div>
        
        <div class="conversation-messages">
            ${(0, messageRenderer_1.renderMessages)(conversation.messages)}
        </div>
        
        <!-- ...existing code... -->
    </div>
    `;
}
function getConversationPanelScript() {
    return `
    // ...existing code...
    
    // Setup export button
    document.getElementById('export-conversation')?.addEventListener('click', () => {
        vscode.postMessage({
            command: 'exportConversation',
            conversationId: currentConversationId
        });
    });
    
    // Set up message action buttons
    document.querySelectorAll('.message-action.copy-message').forEach(button => {
        button.addEventListener('click', (e) => {
            const messageEl = e.target.closest('.message');
            const messageIndex = parseInt(messageEl.dataset.index);
            const content = currentConversation.messages[messageIndex].content;
            
            vscode.postMessage({
                command: 'copyToClipboard',
                text: content
            });
        });
    });
    
    document.querySelectorAll('.message-action.create-snippet').forEach(button => {
        button.addEventListener('click', (e) => {
            const messageEl = e.target.closest('.message');
            const messageIndex = parseInt(messageEl.dataset.index);
            
            vscode.postMessage({
                command: 'createSnippet',
                conversationId: currentConversationId,
                messageIndices: [messageIndex]
            });
        });
    });
    
    // Add multi-select functionality for snippet creation
    let selectedMessages = [];
    
    document.querySelectorAll('.message').forEach(messageEl => {
        messageEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            const messageIndex = parseInt(messageEl.dataset.index);
            
            // Toggle selection
            if (selectedMessages.includes(messageIndex)) {
                selectedMessages = selectedMessages.filter(idx => idx !== messageIndex);
                messageEl.classList.remove('selected');
            } else {
                selectedMessages.push(messageIndex);
                messageEl.classList.add('selected');
            }
            
            // Show floating action button if multiple messages are selected
            if (selectedMessages.length > 0) {
                showMultiSelectActions();
            } else {
                hideMultiSelectActions();
            }
        });
    });
    
    function showMultiSelectActions() {
        let actionBar = document.getElementById('multi-select-actions');
        if (!actionBar) {
            actionBar = document.createElement('div');
            actionBar.id = 'multi-select-actions';
            actionBar.className = 'multi-select-actions';
            actionBar.innerHTML = \`
                <span>\${selectedMessages.length} message(s) selected</span>
                <button id="create-snippet-from-selection">Create Snippet</button>
                <button id="cancel-selection">Cancel</button>
            \`;
            document.body.appendChild(actionBar);
            
            document.getElementById('create-snippet-from-selection').addEventListener('click', () => {
                vscode.postMessage({
                    command: 'createSnippet',
                    conversationId: currentConversationId,
                    messageIndices: selectedMessages
                });
                clearMessageSelection();
            });
            
            document.getElementById('cancel-selection').addEventListener('click', () => {
                clearMessageSelection();
            });
        } else {
            actionBar.querySelector('span').textContent = \`\${selectedMessages.length} message(s) selected\`;
        }
    }
    
    function hideMultiSelectActions() {
        const actionBar = document.getElementById('multi-select-actions');
        if (actionBar) {
            actionBar.remove();
        }
    }
    
    function clearMessageSelection() {
        selectedMessages = [];
        document.querySelectorAll('.message.selected').forEach(el => {
            el.classList.remove('selected');
        });
        hideMultiSelectActions();
    }
    
    // ...existing code...
    `;
}
function getConversationPanelStyles() {
    return `
    // ...existing code...
    
    .message-actions {
        display: flex;
        gap: 4px;
    }
    
    .message-action {
        background: transparent;
        border: none;
        color: var(--vscode-editor-foreground);
        cursor: pointer;
        opacity: 0.5;
        padding: 2px;
    }
    
    .message:hover .message-action {
        opacity: 1;
    }
    
    .message.selected {
        outline: 2px solid var(--vscode-focusBorder);
    }
    
    .multi-select-actions {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 4px;
        padding: 8px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        z-index: 1000;
    }
    
    .multi-select-actions button {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 4px 8px;
        cursor: pointer;
    }
    
    // ...existing code...
    `;
}
//# sourceMappingURL=conversationPanel.js.map