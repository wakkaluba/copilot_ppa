import * as vscode from 'vscode';
import { ConversationMemory } from '../../../../src/services/conversation/ConversationMemory';
import { ConversationMessage } from '../../../../src/services/conversation/types';

describe('ConversationMemory', () => {
    let mockContext: vscode.ExtensionContext;
    let conversationMemory: ConversationMemory;
    let storedMessages: ConversationMessage[];

    beforeEach(() => {
        storedMessages = [];
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            globalState: {
                get: jest.fn().mockImplementation(() => storedMessages),
                update: jest.fn().mockImplementation((key, value) => {
                    storedMessages = value;
                    return Promise.resolve();
                }),
            },
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
            },
        } as unknown as vscode.ExtensionContext;

        conversationMemory = new ConversationMemory(mockContext);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with empty state when no stored data', async () => {
            (mockContext.globalState.get as jest.Mock).mockReturnValue(null);
            await conversationMemory.initialize();
            expect(conversationMemory.getAllMessages()).toHaveLength(0);
        });

        it('should load stored messages on initialization', async () => {
            const testMessages: ConversationMessage[] = [
                {
                    id: '1',
                    role: 'user',
                    content: 'Test message 1',
                    timestamp: Date.now()
                }
            ];
            (mockContext.globalState.get as jest.Mock).mockReturnValue(testMessages);

            await conversationMemory.initialize();
            expect(conversationMemory.getAllMessages()).toEqual(testMessages);
        });

        it('should handle initialization errors', async () => {
            (mockContext.globalState.get as jest.Mock).mockImplementation(() => {
                throw new Error('Storage error');
            });

            await expect(conversationMemory.initialize()).rejects.toThrow('Failed to initialize conversation memory: Storage error');
        });
    });

    describe('message management', () => {
        const testMessage: ConversationMessage = {
            id: '1',
            role: 'user',
            content: 'Test message',
            timestamp: Date.now()
        };

        beforeEach(async () => {
            await conversationMemory.initialize();
        });

        it('should add message to memory', () => {
            conversationMemory.addMessage(testMessage);
            const messages = conversationMemory.getAllMessages();
            expect(messages).toContain(testMessage);
        });

        it('should maintain message order', () => {
            const message1 = { ...testMessage, id: '1', content: 'First' };
            const message2 = { ...testMessage, id: '2', content: 'Second' };
            
            conversationMemory.addMessage(message1);
            conversationMemory.addMessage(message2);
            
            const messages = conversationMemory.getAllMessages();
            expect(messages[0]).toEqual(message1);
            expect(messages[1]).toEqual(message2);
        });

        it('should limit history size', () => {
            // Add more messages than the maximum size
            for (let i = 0; i < 205; i++) {
                conversationMemory.addMessage({
                    ...testMessage,
                    id: String(i),
                    content: `Message ${i}`
                });
            }

            const messages = conversationMemory.getAllMessages();
            expect(messages).toHaveLength(200); // Max size is 200
            expect(messages[messages.length - 1].content).toBe('Message 204');
        });
    });

    describe('message retrieval', () => {
        const testMessages: ConversationMessage[] = Array.from({ length: 5 }, (_, i) => ({
            id: String(i),
            role: 'user',
            content: `Message ${i}`,
            timestamp: Date.now() + i
        }));

        beforeEach(async () => {
            await conversationMemory.initialize();
            testMessages.forEach(msg => conversationMemory.addMessage(msg));
        });

        it('should get recent messages with limit', () => {
            const recentMessages = conversationMemory.getRecentMessages(3);
            expect(recentMessages).toHaveLength(3);
            expect(recentMessages[2].content).toBe('Message 4');
        });

        it('should search messages by content', () => {
            const searchResults = conversationMemory.searchMessages('Message 2');
            expect(searchResults).toHaveLength(1);
            expect(searchResults[0].content).toBe('Message 2');
        });

        it('should get messages by date range', () => {
            const midTime = testMessages[2].timestamp;
            const messages = conversationMemory.getMessagesByDateRange(
                midTime - 1,
                midTime + 1
            );
            expect(messages).toHaveLength(1);
            expect(messages[0].content).toBe('Message 2');
        });
    });

    describe('history clearing', () => {
        beforeEach(async () => {
            await conversationMemory.initialize();
            conversationMemory.addMessage({
                id: '1',
                role: 'user',
                content: 'Test message',
                timestamp: Date.now()
            });
        });

        it('should clear conversation history', async () => {
            await conversationMemory.clearHistory();
            expect(conversationMemory.getAllMessages()).toHaveLength(0);
            expect(mockContext.globalState.update).toHaveBeenCalledWith(
                'conversationMemory',
                []
            );
        });

        it('should handle errors during clearing', async () => {
            (mockContext.globalState.update as jest.Mock).mockRejectedValue(new Error('Clear error'));
            await expect(conversationMemory.clearHistory()).rejects.toThrow('Failed to clear conversation history: Clear error');
        });
    });
});