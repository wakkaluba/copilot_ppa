const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

describe('Chat UI Tests', () => {
    let dom;
    let document;
    let window;
    let vscode;

    beforeEach(() => {
        // Mock VS Code API
        vscode = {
            postMessage: jest.fn()
        };
        global.acquireVsCodeApi = () => vscode;

        // Set up DOM environment
        const html = `
            <!DOCTYPE html>
            <html>
                <body>
                    <div id="messages"></div>
                    <div id="quick-responses"></div>
                    <div class="continue-prompt" style="display: none;">
                        <div class="continue-message"></div>
                        <button id="btn-continue-yes"></button>
                        <button id="btn-continue-no"></button>
                    </div>
                    <div class="error-container" style="display: none;">
                        <div class="error-message"></div>
                    </div>
                    <textarea id="message-input"></textarea>
                    <button id="send-button"></button>
                    <button id="clear-chat"></button>
                    <div class="status-dot"></div>
                    <div class="status-text"></div>
                </body>
            </html>
        `;

        dom = new JSDOM(html, {
            runScripts: 'dangerously',
            resources: 'usable',
            url: 'http://localhost'
        });
        document = dom.window.document;
        window = dom.window;

        // Load the chat.js script
        const chatScript = fs.readFileSync(path.join(__dirname, 'chat.js'), 'utf8');
        const scriptEl = document.createElement('script');
        scriptEl.textContent = chatScript;
        document.body.appendChild(scriptEl);
    });

    describe('Message Handling', () => {
        test('sends message when clicking send button', () => {
            const messageInput = document.getElementById('message-input');
            const sendButton = document.getElementById('send-button');

            messageInput.value = 'Test message';
            sendButton.click();

            expect(vscode.postMessage).toHaveBeenCalledWith({
                type: 'sendMessage',
                content: 'Test message'
            });
            expect(messageInput.value).toBe('');
        });

        test('updates connection status correctly', () => {
            const event = new window.MessageEvent('message', {
                data: {
                    type: 'updateConnectionStatus',
                    status: { state: 'connected' }
                }
            });
            window.dispatchEvent(event);

            const statusDot = document.querySelector('.status-dot');
            const statusText = document.querySelector('.status-text');

            expect(statusDot.classList.contains('connected')).toBe(true);
            expect(statusText.textContent).toBe('Connected');
        });

        test('shows error message', () => {
            const errorMessage = 'Test error';
            const event = new window.MessageEvent('message', {
                data: {
                    type: 'showError',
                    message: errorMessage
                }
            });
            window.dispatchEvent(event);

            const errorContainer = document.querySelector('.error-container');
            const errorMessageEl = document.querySelector('.error-message');

            expect(errorContainer.style.display).toBe('block');
            expect(errorMessageEl.textContent).toBe(errorMessage);
        });
    });

    describe('Quick Response Functionality', () => {
        test('shows quick response options', () => {
            const responses = ['Yes', 'No', 'Maybe'];
            const event = new window.MessageEvent('message', {
                data: {
                    type: 'showQuickResponses',
                    responses: responses
                }
            });
            window.dispatchEvent(event);

            const container = document.getElementById('quick-responses');
            const buttons = container.querySelectorAll('.quick-response-btn');

            expect(container.style.display).toBe('flex');
            expect(buttons.length).toBe(responses.length);
            expect(Array.from(buttons).map(b => b.textContent)).toEqual(responses);
        });

        test('detects message type correctly', () => {
            const messages = [
                { content: 'What do you think?', expectedType: 'question' },
                { content: 'An error occurred', expectedType: 'error' },
                { content: 'File created successfully', expectedType: 'confirmation' },
                { content: 'I suggest trying this', expectedType: 'suggestion' },
                { content: 'Regular message', expectedType: 'general' }
            ];

            messages.forEach(({ content, expectedType }) => {
                const event = new window.MessageEvent('message', {
                    data: {
                        type: 'updateMessages',
                        messages: [{ role: 'assistant', content }]
                    }
                });
                window.dispatchEvent(event);

                const button = document.querySelector('.suggest-responses-btn');
                expect(button.getAttribute('data-message-type')).toBe(expectedType);
            });
        });
    });
});
