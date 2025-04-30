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
            case 'showQuickResponses':
                showQuickResponseOptions(message.responses);
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

    // Quick response functions
    function showQuickResponseOptions(responses) {
        const quickResponsesContainer = document.getElementById('quick-responses');
        if (!quickResponsesContainer) return;

        // Clear existing quick responses
        quickResponsesContainer.innerHTML = '';

        // No responses to show
        if (!responses || responses.length === 0) {
            quickResponsesContainer.style.display = 'none';
            return;
        }

        // Add response buttons
        responses.forEach(response => {
            const button = document.createElement('button');
            button.className = 'quick-response-btn';
            button.textContent = response;
            button.addEventListener('click', () => {
                sendQuickResponse(response);
            });
            quickResponsesContainer.appendChild(button);
        });

        // Show the container
        quickResponsesContainer.style.display = 'flex';
    }

    function sendQuickResponse(text) {
        vscode.postMessage({
            type: 'sendMessage',
            content: text
        });

        // Hide quick responses after sending
        const quickResponsesContainer = document.getElementById('quick-responses');
        if (quickResponsesContainer) {
            quickResponsesContainer.style.display = 'none';
        }
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

            // Hide quick responses when sending a custom message
            const quickResponsesContainer = document.getElementById('quick-responses');
            if (quickResponsesContainer) {
                quickResponsesContainer.style.display = 'none';
            }
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

        // Attach event listeners to any "suggest-responses" buttons
        document.querySelectorAll('.suggest-responses-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const messageType = this.getAttribute('data-message-type');
                requestQuickResponses(messageType);
            });
        });

        // Auto-show quick responses for the last message if it's from the assistant and contains a question
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
            const content = lastMessage.content;
            if (content.includes('?')) {
                requestQuickResponses('question');
            }
        }
    }

    function requestQuickResponses(messageType) {
        vscode.postMessage({
            type: 'getQuickResponses',
            messageType: messageType
        });
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
                ${message.role === 'assistant' ? createMessageActions(message) : ''}
            </div>
        `;
    }

    function formatMessageContent(content) {
        // Existing content formatting logic...
        return content;
    }

    function createMessageActions(message) {
        // Detect what kind of message this is to provide appropriate quick responses
        const messageType = detectMessageType(message.content);

        return `
            <div class="message-actions">
                <button class="message-action" onclick="copyToClipboard(this)">
                    Copy
                </button>
                <button class="message-action suggest-responses-btn" data-message-type="${messageType}">
                    Quick Reply
                </button>
            </div>
        `;
    }

    function detectMessageType(content) {
        // Enhanced message type detection
        const lowerContent = content.toLowerCase();

        if (content.includes('?')) return 'question';
        if (lowerContent.includes('error') || lowerContent.includes('failed') ||
            lowerContent.includes('exception') || lowerContent.includes('invalid'))
            return 'error';
        if (lowerContent.includes('created') || lowerContent.includes('updated') ||
            lowerContent.includes('deleted') || lowerContent.includes('completed') ||
            lowerContent.includes('success'))
            return 'confirmation';
        if (lowerContent.includes('suggest') || lowerContent.includes('recommend') ||
            lowerContent.includes('could') || lowerContent.includes('would') ||
            lowerContent.includes('may want to') || lowerContent.includes('consider'))
            return 'suggestion';
        return 'general';
    }

    // Copy to clipboard function made global for onclick handler
    window.copyToClipboard = function(element) {
        const messageElement = element.closest('.message');
        const contentElement = messageElement.querySelector('.content');
        const text = contentElement.textContent;

        vscode.postMessage({
            type: 'copyToClipboard',
            text: text
        });
    };

    // Initialize connection status check
    vscode.postMessage({ type: 'getConnectionStatus' });
})();
