"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMessage = renderMessage;
exports.getConversationPanelHtml = getConversationPanelHtml;
exports.getConversationPanelScript = getConversationPanelScript;
exports.getConversationPanelStyles = getConversationPanelStyles;
var htmlEscaper_1 = require("../../utils/htmlEscaper");
// Import renderer function
var messageRenderer_1 = require("./messageRenderer");
/**
 * Renders a single message as HTML
 * @param message The chat message to render
 * @param index Index of the message in the conversation
 * @returns HTML string representation of the message
 */
function renderMessage(message, index) {
    var role = message.role === 'user' ? 'user' :
        message.role === 'assistant' ? 'assistant' : 'system';
    var timestamp = new Date(message.timestamp).toLocaleString();
    return "\n    <div class=\"message message-".concat(role, "\" data-index=\"").concat(index, "\">\n        <div class=\"message-header\">\n            <div class=\"message-role\">").concat(role, "</div>\n            <div class=\"message-actions\">\n                <button class=\"message-action copy-message\" title=\"Copy message\">\n                    <i class=\"codicon codicon-copy\"></i>\n                </button>\n                <button class=\"message-action create-snippet\" title=\"Create snippet from this message\">\n                    <i class=\"codicon codicon-save\"></i>\n                </button>\n            </div>\n        </div>\n        <div class=\"message-content\">").concat(formatMessageContent(message.content), "</div>\n        <div class=\"message-timestamp\">").concat(timestamp, "</div>\n    </div>\n    ");
}
/**
 * Generates the HTML for the conversation panel
 * @param conversation The conversation data to render
 * @returns HTML string for the conversation panel
 */
function getConversationPanelHtml(conversation) {
    return "\n    <div class=\"conversation-panel\">\n        <div class=\"conversation-header\">\n            <h2>".concat((0, htmlEscaper_1.escapeHtml)(conversation.title), "</h2>\n            <div class=\"conversation-actions\">\n                <button class=\"action-button\" title=\"Export Conversation\" id=\"export-conversation\">\n                    <i class=\"codicon codicon-save\"></i>\n                </button>\n                <!-- ...existing buttons... -->\n            </div>\n        </div>\n        \n        <div class=\"conversation-messages\">\n            ").concat((0, messageRenderer_1.renderMessages)(conversation.messages), "\n        </div>\n        \n        <!-- ...existing code... -->\n    </div>\n    ");
}
/**
 * Gets the JavaScript code for the conversation panel
 * @returns JavaScript as a string
 */
function getConversationPanelScript() {
    return "\n    // ...existing code...\n    \n    // Setup export button\n    document.getElementById('export-conversation')?.addEventListener('click', () => {\n        vscode.postMessage({\n            command: 'exportConversation',\n            conversationId: currentConversationId\n        });\n    });\n    \n    // Set up message action buttons\n    document.querySelectorAll('.message-action.copy-message').forEach(button => {\n        button.addEventListener('click', (e) => {\n            const messageEl = e.target.closest('.message');\n            const messageIndex = parseInt(messageEl.dataset.index);\n            const content = currentConversation.messages[messageIndex].content;\n            \n            vscode.postMessage({\n                command: 'copyToClipboard',\n                text: content\n            });\n        });\n    });\n    \n    document.querySelectorAll('.message-action.create-snippet').forEach(button => {\n        button.addEventListener('click', (e) => {\n            const messageEl = e.target.closest('.message');\n            const messageIndex = parseInt(messageEl.dataset.index);\n            \n            vscode.postMessage({\n                command: 'createSnippet',\n                conversationId: currentConversationId,\n                messageIndices: [messageIndex]\n            });\n        });\n    });\n    \n    // Add multi-select functionality for snippet creation\n    let selectedMessages = [];\n    \n    document.querySelectorAll('.message').forEach(messageEl => {\n        messageEl.addEventListener('contextmenu', (e) => {\n            e.preventDefault();\n            \n            const messageIndex = parseInt(messageEl.dataset.index);\n            \n            // Toggle selection\n            if (selectedMessages.includes(messageIndex)) {\n                selectedMessages = selectedMessages.filter(idx => idx !== messageIndex);\n                messageEl.classList.remove('selected');\n            } else {\n                selectedMessages.push(messageIndex);\n                messageEl.classList.add('selected');\n            }\n            \n            // Show floating action button if multiple messages are selected\n            if (selectedMessages.length > 0) {\n                showMultiSelectActions();\n            } else {\n                hideMultiSelectActions();\n            }\n        });\n    });\n    \n    function showMultiSelectActions() {\n        let actionBar = document.getElementById('multi-select-actions');\n        if (!actionBar) {\n            actionBar = document.createElement('div');\n            actionBar.id = 'multi-select-actions';\n            actionBar.className = 'multi-select-actions';\n            actionBar.innerHTML = `\n                <span>${selectedMessages.length} message(s) selected</span>\n                <button id=\"create-snippet-from-selection\">Create Snippet</button>\n                <button id=\"cancel-selection\">Cancel</button>\n            `;\n            document.body.appendChild(actionBar);\n            \n            document.getElementById('create-snippet-from-selection').addEventListener('click', () => {\n                vscode.postMessage({\n                    command: 'createSnippet',\n                    conversationId: currentConversationId,\n                    messageIndices: selectedMessages\n                });\n                clearMessageSelection();\n            });\n            \n            document.getElementById('cancel-selection').addEventListener('click', () => {\n                clearMessageSelection();\n            });\n        } else {\n            actionBar.querySelector('span').textContent = `${selectedMessages.length} message(s) selected`;\n        }\n    }\n    \n    function hideMultiSelectActions() {\n        const actionBar = document.getElementById('multi-select-actions');\n        if (actionBar) {\n            actionBar.remove();\n        }\n    }\n    \n    function clearMessageSelection() {\n        selectedMessages = [];\n        document.querySelectorAll('.message.selected').forEach(el => {\n            el.classList.remove('selected');\n        });\n        hideMultiSelectActions();\n    }\n    \n    // ...existing code...\n    ";
}
/**
 * Gets the CSS styles for the conversation panel
 * @returns CSS as a string
 */
function getConversationPanelStyles() {
    return "\n    // ...existing code...\n    \n    .message-actions {\n        display: flex;\n        gap: 4px;\n    }\n    \n    .message-action {\n        background: transparent;\n        border: none;\n        color: var(--vscode-editor-foreground);\n        cursor: pointer;\n        opacity: 0.5;\n        padding: 2px;\n    }\n    \n    .message:hover .message-action {\n        opacity: 1;\n    }\n    \n    .message.selected {\n        outline: 2px solid var(--vscode-focusBorder);\n    }\n    \n    .multi-select-actions {\n        position: fixed;\n        bottom: 20px;\n        left: 50%;\n        transform: translateX(-50%);\n        background-color: var(--vscode-editor-background);\n        border: 1px solid var(--vscode-panel-border);\n        border-radius: 4px;\n        padding: 8px 16px;\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);\n        z-index: 1000;\n    }\n    \n    .multi-select-actions button {\n        background-color: var(--vscode-button-background);\n        color: var(--vscode-button-foreground);\n        border: none;\n        padding: 4px 8px;\n        cursor: pointer;\n    }\n    \n    // ...existing code...\n    ";
}
/**
 * Format message content by handling code blocks and escaping HTML
 * @param content Raw message content
 * @returns Formatted HTML content
 */
function formatMessageContent(content) {
    if (!content) {
        return '';
    }
    // Replace code blocks with properly formatted HTML
    var formattedContent = content.replace(/```([\w]*)([\s\S]*?)```/g, function (_match, language, code) {
        return "<pre class=\"code-block".concat(language ? ' language-' + language : '', "\"><code>").concat((0, htmlEscaper_1.escapeHtml)(code.trim()), "</code></pre>");
    });
    // Handle inline code
    formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Handle paragraphs - replace double newlines with paragraph breaks
    formattedContent = formattedContent.replace(/\n\n/g, '</p><p>');
    // Handle single newlines
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    // Wrap in paragraphs if not already
    if (!formattedContent.startsWith('<p>')) {
        formattedContent = "<p>".concat(formattedContent, "</p>");
    }
    return formattedContent;
}
