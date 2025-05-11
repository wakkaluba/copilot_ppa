// filepath: d:\___coding\tools\copilot_ppa\src\webview\components\__tests__\messageRenderer.test.ts
import { escapeHtml } from '../../../utils/htmlEscaper';
import { IChatMessage } from '../conversationPanel';
import { renderMessages } from '../messageRenderer';

// Mock the htmlEscaper module
jest.mock('../../../utils/htmlEscaper', () => ({
    escapeHtml: jest.fn(text => text.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;'))
}));

describe('messageRenderer', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('renderMessages', () => {
        it('should return a no messages div when messages array is empty', () => {
            // Act
            const result = renderMessages([]);

            // Assert
            expect(result).toBe('<div class="no-messages">No messages in this conversation yet.</div>');
        });

        it('should return a no messages div when messages array is null or undefined', () => {
            // Act
            const result = renderMessages(undefined as unknown as IChatMessage[]);

            // Assert
            expect(result).toBe('<div class="no-messages">No messages in this conversation yet.</div>');
        });

        it('should render multiple messages', () => {
            // Arrange
            const messages: IChatMessage[] = [
                {
                    role: 'user',
                    content: 'Hello',
                    timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
                },
                {
                    role: 'assistant',
                    content: 'Hi there',
                    timestamp: new Date(2023, 0, 1, 12, 1, 0).getTime()
                }
            ];

            // Act
            const result = renderMessages(messages);

            // Assert
            expect(result).toContain('message-user');
            expect(result).toContain('message-assistant');
            expect(result).toContain('<div class="message-content"><p>Hello</p></div>');
            expect(result).toContain('<div class="message-content"><p>Hi there</p></div>');
        });
    });

    describe('renderSingleMessage', () => {
        it('should render a user message correctly', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'user',
                content: 'Hello',
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(result).toContain('message-user');
            expect(result).toContain('<div class="message-role">user</div>');
            expect(result).toContain('<div class="message-content"><p>Hello</p></div>');
            expect(result).toContain('1/1/2023'); // Part of the timestamp
        });

        it('should render an assistant message correctly', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'assistant',
                content: 'Hello',
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(result).toContain('message-assistant');
            expect(result).toContain('<div class="message-role">assistant</div>');
        });

        it('should render a system message correctly', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'system',
                content: 'System message',
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(result).toContain('message-system');
            expect(result).toContain('<div class="message-role">system</div>');
        });

        it('should handle unknown role types as system messages', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'unknown' as any,
                content: 'Unknown role message',
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(result).toContain('message-system');
        });

        it('should handle empty content correctly', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'user',
                content: '',
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(result).toContain('<div class="message-content"><p></p></div>');
        });

        it('should include message index in the data attribute', () => {
            // Arrange
            const messages: IChatMessage[] = [
                {
                    role: 'user',
                    content: 'Message 1',
                    timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
                },
                {
                    role: 'assistant',
                    content: 'Message 2',
                    timestamp: new Date(2023, 0, 1, 12, 1, 0).getTime()
                }
            ];

            // Act
            const result = renderMessages(messages);

            // Assert
            expect(result).toContain('data-index="0"');
            expect(result).toContain('data-index="1"');
        });
    });

    describe('formatMessageContent', () => {
        it('should format code blocks correctly', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'assistant',
                content: 'Here is a code example:\n```javascript\nconst x = 10;\nconsole.log(x);\n```',
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(result).toContain('<pre class="code-block language-javascript"><code>const x = 10;\nconsole.log(x);</code></pre>');
        });

        it('should format code blocks without language specification', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'assistant',
                content: 'Here is a code example:\n```\nconst x = 10;\nconsole.log(x);\n```',
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(result).toContain('<pre class="code-block"><code>const x = 10;\nconsole.log(x);</code></pre>');
        });

        it('should format inline code correctly', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'assistant',
                content: 'Use the `console.log()` function to log to the console.',
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(result).toContain('Use the <code>console.log()</code> function to log to the console.');
        });

        it('should handle multiple inline code blocks', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'assistant',
                content: 'Use `const` or `let` for variable declarations.',
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(result).toContain('Use <code>const</code> or <code>let</code> for variable declarations.');
        });

        it('should handle paragraphs by splitting on double newlines', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'assistant',
                content: 'First paragraph.\n\nSecond paragraph.',
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(result).toContain('<p>First paragraph.</p><p>Second paragraph.</p>');
        });

        it('should handle single newlines by converting to <br> tags', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'assistant',
                content: 'First line.\nSecond line.',
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(result).toContain('First line.<br>Second line.');
        });

        it('should handle complex content with multiple formatting types', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'assistant',
                content: 'First paragraph with `inline code`.\n\nSecond paragraph.\n```javascript\nconst x = 10;\n```',
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(result).toContain('First paragraph with <code>inline code</code>.');
            expect(result).toContain('<p>Second paragraph.</p>');
            expect(result).toContain('<pre class="code-block language-javascript"><code>const x = 10;</code></pre>');
        });

        it('should handle HTML characters in code blocks and escape them properly', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'assistant',
                content: '```html\n<div class="example">Test</div>\n```',
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(escapeHtml).toHaveBeenCalled();
            expect(result).toContain('&lt;div class=&quot;example&quot;&gt;Test&lt;/div&gt;');
        });

        it('should handle null or undefined content', () => {
            // Arrange
            const message: IChatMessage = {
                role: 'assistant',
                content: undefined as unknown as string,
                timestamp: new Date(2023, 0, 1, 12, 0, 0).getTime()
            };

            // Act
            const result = renderMessages([message]);

            // Assert
            expect(result).toContain('<div class="message-content"><p></p></div>');
        });
    });
});
