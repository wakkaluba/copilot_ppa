// Acquire VS Code API
const vscode = acquireVsCodeApi();

// DOM Elements
const chatContainer = document.getElementById('chat-container');
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-chat');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');
const errorContainer = document.querySelector('.error-container');
const errorMessage = document.querySelector('.error-message');

// State
let isConnected = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Request initial data
    vscode.postMessage({ type: 'getMessages' });
    vscode.postMessage({ type: 'getConnectionStatus' });

    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Send message
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Clear chat
    clearButton.addEventListener('click', () => {
        vscode.postMessage({ type: 'clearChat' });
    });

    // Message actions
    messagesContainer.addEventListener('click', (e) => {
        const action = e.target.closest('.message-action');
        if (!action) return;

        const message = action.closest('.message');
        const text = message.querySelector('.content').textContent;

        switch (action.dataset.action) {
            case 'copy':
                vscode.postMessage({
                    type: 'copyToClipboard',
                    text: text
                });
                break;

            case 'createSnippet':
                const language = action.dataset.language || 'plaintext';
                vscode.postMessage({
                    type: 'createSnippet',
                    code: text,
                    language: language
                });
                break;
        }
    });
}

function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !isConnected) return;

    vscode.postMessage({
        type: 'sendMessage',
        content: content
    });

    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
}

function updateMessages(messages) {
    messagesContainer.innerHTML = '';

    messages.forEach(message => {
        const messageEl = createMessageElement(message);
        messagesContainer.appendChild(messageEl);
    });

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function createMessageElement(message) {
    const el = document.createElement('div');
    el.className = `message ${message.role}`;

    // Create content
    const content = document.createElement('div');
    content.className = 'content';
    content.innerHTML = formatMessageContent(message.content);
    el.appendChild(content);

    // Add actions if appropriate
    if (message.role === 'assistant') {
        const actions = document.createElement('div');
        actions.className = 'message-actions';

        // Copy action
        const copyBtn = document.createElement('button');
        copyBtn.className = 'message-action';
        copyBtn.textContent = 'Copy';
        copyBtn.dataset.action = 'copy';
        actions.appendChild(copyBtn);

        // Create snippet action if message contains code
        if (content.querySelector('code')) {
            const snippetBtn = document.createElement('button');
            snippetBtn.className = 'message-action';
            snippetBtn.textContent = 'Create Snippet';
            snippetBtn.dataset.action = 'createSnippet';
            // Try to detect language from code block
            const codeBlock = content.querySelector('code');
            if (codeBlock.className) {
                const lang = codeBlock.className.replace('language-', '');
                snippetBtn.dataset.language = lang;
            }
            actions.appendChild(snippetBtn);
        }

        el.appendChild(actions);
    }

    return el;
}

function formatMessageContent(content) {
    // Basic Markdown-like formatting
    return content
        // Code blocks with language
        .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => 
            `<pre><code class="language-${lang || 'plaintext'}">${escapeHtml(code.trim())}</code></pre>`)
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // URLs
        .replace(/https?:\/\/[^\s)]+/g, '<a href="$&" target="_blank">$&</a>')
        // Line breaks
        .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateConnectionStatus(status) {
    isConnected = status.state === 'connected';
    
    statusDot.classList.toggle('connected', isConnected);
    statusText.textContent = status.message;
    messageInput.disabled = status.isInputDisabled;
    sendButton.disabled = status.isInputDisabled;
}

function showError(message) {
    errorMessage.textContent = message;
    errorContainer.style.display = 'block';
    
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

function updateTheme(theme) {
    document.body.className = `theme-${theme}`;
}

// Handle messages from extension
window.addEventListener('message', event => {
    const message = event.data;

    switch (message.type) {
        case 'updateMessages':
            updateMessages(message.messages);
            break;

        case 'updateConnectionStatus':
            updateConnectionStatus(message.status);
            break;

        case 'showError':
            showError(message.message);
            break;

        case 'updateTheme':
            updateTheme(message.theme);
            break;
    }
});
