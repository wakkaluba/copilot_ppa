describe('Chat UI Tests', () => {
    let mockVscode;
    let chatMessages;
    let promptInput;
    let sendButton;
    let clearButton;

    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = `
            <div id="chat-messages"></div>
            <input id="prompt-input" />
            <button id="send-button">Send</button>
            <button id="clear-button">Clear</button>
        `;

        chatMessages = document.getElementById('chat-messages');
        promptInput = document.getElementById('prompt-input');
        sendButton = document.getElementById('send-button');
        clearButton = document.getElementById('clear-button');

        // Mock VS Code API
        mockVscode = {
            postMessage: jest.fn(),
            getState: jest.fn().mockReturnValue(null),
            setState: jest.fn()
        };
        global.acquireVsCodeApi = jest.fn().mockReturnValue(mockVscode);

        // Load main.js to initialize handlers
        require('./main.js');
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('Message Handling', () => {
        test('sends message when clicking send button', () => {
            const testMessage = 'Test message';
            promptInput.value = testMessage;
            sendButton.click();

            expect(mockVscode.postMessage).toHaveBeenCalledWith({
                command: 'sendPrompt',
                text: testMessage
            });
            expect(promptInput.value).toBe('');
            expect(chatMessages.children.length).toBe(1);
        });

        test('sends message when pressing Enter', () => {
            const testMessage = 'Test message';
            promptInput.value = testMessage;
            promptInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

            expect(mockVscode.postMessage).toHaveBeenCalledWith({
                command: 'sendPrompt',
                text: testMessage
            });
        });

        test('does not send empty messages', () => {
            promptInput.value = '   ';
            sendButton.click();
            expect(mockVscode.postMessage).not.toHaveBeenCalled();
        });
    });

    describe('Chat History', () => {
        test('restores previous messages from state', () => {
            const previousMessages = [
                { type: 'user', text: 'Hello' },
                { type: 'agent', text: 'Hi there' }
            ];
            mockVscode.getState.mockReturnValue({ messages: previousMessages });

            // Reload main.js to trigger state restoration
            require('./main.js');

            expect(chatMessages.children.length).toBe(2);
            expect(chatMessages.children[0].classList.contains('user')).toBe(true);
            expect(chatMessages.children[1].classList.contains('agent')).toBe(true);
        });

        test('saves messages to state when adding new message', () => {
            const testMessage = 'Test message';
            promptInput.value = testMessage;
            sendButton.click();

            expect(mockVscode.setState).toHaveBeenCalled();
            const savedState = mockVscode.setState.mock.calls[0][0];
            expect(savedState.messages.length).toBe(1);
            expect(savedState.messages[0].text).toContain(testMessage);
        });
    });

    describe('Message Formatting', () => {
        test('formats code blocks correctly', () => {
            const messageWithCode = 'Here is some code:\n```\nconst x = 1;\n```';
            promptInput.value = messageWithCode;
            sendButton.click();

            const message = chatMessages.querySelector('.message-content');
            expect(message.innerHTML).toContain('<pre><code>');
        });

        test('formats inline code correctly', () => {
            const messageWithInlineCode = 'Use the `console.log()` function';
            promptInput.value = messageWithInlineCode;
            sendButton.click();

            const message = chatMessages.querySelector('.message-content');
            expect(message.innerHTML).toContain('<code>console.log()</code>');
        });
    });

    describe('Clear Chat', () => {
        test('clears chat history when clicking clear button', () => {
            // Add some messages first
            promptInput.value = 'Message 1';
            sendButton.click();
            promptInput.value = 'Message 2';
            sendButton.click();

            clearButton.click();

            expect(mockVscode.postMessage).toHaveBeenCalledWith({
                command: 'clearChat'
            });
        });

        test('handles clear chat message from extension', () => {
            // Add some messages
            promptInput.value = 'Test message';
            sendButton.click();

            // Simulate clear chat message from extension
            window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'clearChat' }
            }));

            expect(chatMessages.innerHTML).toBe('');
            const systemMessage = chatMessages.querySelector('.system');
            expect(systemMessage).toBeTruthy();
            expect(systemMessage.textContent).toContain('Chat history has been cleared');
        });
    });

    describe('Connection Status', () => {
        test('updates connection status indicator', () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'connectionStatus',
                    status: 'connected'
                }
            }));

            const statusIndicator = document.querySelector('.status-indicator');
            expect(statusIndicator.classList.contains('connected')).toBe(true);
        });
    });
});
