(function() {
    // Get access to the VS Code API
    const vscode = acquireVsCodeApi();
    
    // Elements
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const clearButton = document.getElementById('clear-button');
    const statusBar = document.getElementById('status-bar');
    
    // Chat messages
    let messages = [];
    
    // Initialize auto-resize for the textarea
    function initTextareaAutosize() {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            const maxHeight = 150; // Max height in pixels
            const newHeight = Math.min(this.scrollHeight, maxHeight);
            this.style.height = `${newHeight}px`;
            
            // Add scrollbar if content exceeds max height
            if (this.scrollHeight > maxHeight) {
                this.style.overflowY = 'auto';
            } else {
                this.style.overflowY = 'hidden';
            }
        });
    }
    
    // Handle sending messages
    function setupMessageSending() {
        // Send button click handler
        sendButton.addEventListener('click', sendMessage);
        
        // Send on Enter (but allow Shift+Enter for new lines)
        messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
        
        // Clear button click handler
        clearButton.addEventListener('click', () => {
            vscode.postMessage({ type: 'clearChat' });
        });
    }
    
    // Send a message to the extension
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            vscode.postMessage({
                type: 'sendMessage',
                message: message
            });
            messageInput.value = '';
            messageInput.style.height = 'auto';
            messageInput.focus();
        }
    }
    
    // Render messages in the chat
    function renderMessages() {
        messagesContainer.innerHTML = '';
        
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.role}`;
            
            const avatarElement = document.createElement('div');
            avatarElement.className = 'avatar';
            avatarElement.innerHTML = message.role === 'user' 
                ? '<i class="codicon codicon-account"></i>' 
                : '<i class="codicon codicon-hubot"></i>';
            
            const contentElement = document.createElement('div');
            contentElement.className = 'content';
            
            // Format message content with markdown-like syntax
            const formattedContent = formatMessageContent(message.content);
            contentElement.innerHTML = formattedContent;
            
            messageElement.appendChild(avatarElement);
            messageElement.appendChild(contentElement);
            messagesContainer.appendChild(messageElement);
        });
        
        // Scroll to the bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Simple formatter for code blocks and basic markdown
    function formatMessageContent(content) {
        // Replace code blocks
        let formatted = content.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, 
            '<pre><code class="language-$1">$2</code></pre>');
        
        // Replace inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Replace line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }
    
    // Add connection status bar
    function addConnectionStatusBar() {
        const connectionStatusBar = document.createElement('div');
        connectionStatusBar.id = 'connection-status-bar';
        connectionStatusBar.className = 'status-disconnected';
        connectionStatusBar.innerHTML = `
            <span id="connection-indicator"></span>
            <span id="connection-message">Not connected to LLM</span>
        `;
        
        // Insert before the messages container
        const sidebar = document.getElementById('chat-container');
        sidebar.insertBefore(connectionStatusBar, sidebar.firstChild);
        
        // Add connect button if disconnected
        updateConnectionStatus({
            state: 'disconnected',
            message: 'Not connected to LLM',
            isInputDisabled: true
        });
    }

    // Update connection status display
    function updateConnectionStatus(status) {
        const connectionStatusBar = document.getElementById('connection-status-bar');
        const connectionMessage = document.getElementById('connection-message');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        
        if (!connectionStatusBar || !connectionMessage) {
            return;
        }
        
        // Update status bar class
        connectionStatusBar.className = `status-${status.state}`;
        
        // Update message
        connectionMessage.textContent = status.message;
        
        // Enable/disable input based on connection
        messageInput.disabled = status.isInputDisabled;
        sendButton.disabled = status.isInputDisabled;
        
        // Add connect button if disconnected
        if (status.state === 'disconnected' || status.state === 'error') {
            if (!document.getElementById('connect-button-small')) {
                const connectButton = document.createElement('button');
                connectButton.id = 'connect-button-small';
                connectButton.innerHTML = '<i class="codicon codicon-plug"></i> Connect';
                connectButton.onclick = () => {
                    vscode.postMessage({ type: 'connectLlm' });
                };
                connectionStatusBar.appendChild(connectButton);
            }
        } else {
            const connectButton = document.getElementById('connect-button-small');
            if (connectButton) {
                connectButton.remove();
            }
        }
    }

    // Handle messages from the extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'updateMessages':
                messages = message.messages;
                renderMessages();
                break;
                
            case 'updateStatus':
                statusBar.textContent = message.status;
                statusBar.style.display = message.status ? 'block' : 'none';
                break;

            case 'updateConnectionStatus':
                updateConnectionStatus(message.status);
                break;
        }
    });
    
    // Initialize the UI
    function initialize() {
        initTextareaAutosize();
        setupMessageSending();
        messageInput.focus();
        addConnectionStatusBar();
        
        // Request initial messages
        vscode.postMessage({ type: 'getMessages' });
    }
    
    // Start the UI when the page loads
    document.addEventListener('DOMContentLoaded', initialize);
    initialize();
})();
