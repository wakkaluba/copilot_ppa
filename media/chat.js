(() => {
    const vscode = acquireVsCodeApi();
    const chatMessages = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const clearChatButton = document.getElementById('clear-chat');
    const continuePrompt = document.querySelector('.continue-prompt');
    const btnContinueYes = document.getElementById('btn-continue-yes');
    const btnContinueNo = document.getElementById('btn-continue-no');
    
    // Message handling
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'updateMessages':
                updateMessages(message.messages);
                break;
            case 'updateStatus':
                updateStatus(message.status);
                break;
            case 'showError':
                showError(message.message);
                break;
            case 'updateConnectionStatus':
                updateConnectionStatus(message.status);
                break;
            case 'showContinuePrompt':
                showContinuePrompt(message.message);
                break;
        }
    });
    
    // Event listeners
    sendButton.addEventListener('click', () => sendMessage());
    clearChatButton.addEventListener('click', () => clearChat());
    messageInput.addEventListener('keypress', handleKeyPress);
    btnContinueYes.addEventListener('click', handleContinueYes);
    btnContinueNo.addEventListener('click', handleContinueNo);

    // Function to show continue prompt
    function showContinuePrompt(message) {
        const promptMessage = document.querySelector('.continue-message');
        promptMessage.textContent = message;
        continuePrompt.style.display = 'block';
    }

    // Handle continue prompt responses
    function handleContinueYes() {
        continuePrompt.style.display = 'none';
        messageInput.value = 'Continue';
        sendMessage();
    }

    function handleContinueNo() {
        continuePrompt.style.display = 'none';
    }

    // Rest of the existing functions...
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text) {
            vscode.postMessage({
                type: 'sendMessage',
                content: text
            });
            messageInput.value = '';
        }
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function updateMessages(messages) {
        chatMessages.innerHTML = messages.map(m => createMessageElement(m)).join('');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function updateConnectionStatus(status) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        if (status.state === 'connected') {
            statusDot.classList.add('connected');
            statusText.textContent = 'Connected';
            messageInput.disabled = false;
            sendButton.disabled = false;
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = status.message || 'Disconnected';
            messageInput.disabled = true;
            sendButton.disabled = true;
        }
    }

    function updateStatus(status) {
        const statusText = document.querySelector('.status-text');
        statusText.textContent = status || '';
    }

    function showError(message) {
        const errorContainer = document.querySelector('.error-container');
        const errorMessage = document.querySelector('.error-message');
        
        errorMessage.textContent = message;
        errorContainer.style.display = 'block';
        
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }

    function clearChat() {
        vscode.postMessage({ type: 'clearChat' });
    }

    function createMessageElement(message) {
        return `
            <div class="message ${message.role}">
                <div class="content">${formatMessageContent(message.content)}</div>
                ${message.role === 'assistant' ? createMessageActions() : ''}
            </div>
        `;
    }

    function formatMessageContent(content) {
        // Existing content formatting logic...
        return content;
    }

    function createMessageActions() {
        return `
            <div class="message-actions">
                <button class="message-action" onclick="copyToClipboard(this)">
                    Copy
                </button>
            </div>
        `;
    }

    // Initialize connection status check
    vscode.postMessage({ type: 'getConnectionStatus' });
})();
