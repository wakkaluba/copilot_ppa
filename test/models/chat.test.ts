import * as assert from 'assert';
import * as sinon from 'sinon';
import { Chat } from '../../src/models/chat';
import { Message } from '../../src/models/interfaces';

describe('Chat Model Tests (TS)', () => {
    let sandbox: sinon.SinonSandbox;
    let mockMessage: Message;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockMessage = {
            id: 'msg1',
            content: 'Test message',
            role: 'user',
            timestamp: new Date().toISOString()
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create a new chat with default properties', () => {
        const chat = new Chat();

        assert.ok(chat.id, 'Chat should have an ID');
        assert.strictEqual(chat.messages.length, 0, 'New chat should have empty messages');
        assert.ok(chat.createdAt, 'Chat should have creation timestamp');
        assert.strictEqual(typeof chat.title, 'string', 'Chat should have a title');
    });

    it('should create a chat with provided properties', () => {
        const id = 'test-id';
        const title = 'Test Chat';
        const messages = [mockMessage];

        const chat = new Chat({
            id,
            title,
            messages
        });

        assert.strictEqual(chat.id, id);
        assert.strictEqual(chat.title, title);
        assert.deepStrictEqual(chat.messages, messages);
    });

    it('should add a message to the chat', () => {
        const chat = new Chat();
        chat.addMessage(mockMessage);

        assert.strictEqual(chat.messages.length, 1);
        assert.deepStrictEqual(chat.messages[0], mockMessage);
    });

    it('should update chat title', () => {
        const chat = new Chat();
        const newTitle = 'Updated Title';

        chat.setTitle(newTitle);

        assert.strictEqual(chat.title, newTitle);
    });

    it('should delete a message by id', () => {
        const chat = new Chat();
        chat.addMessage(mockMessage);

        assert.strictEqual(chat.messages.length, 1);

        chat.deleteMessage(mockMessage.id);

        assert.strictEqual(chat.messages.length, 0);
    });

    it('should serialize to JSON correctly', () => {
        const chat = new Chat();
        chat.addMessage(mockMessage);

        const serialized = chat.toJSON();

        assert.ok(serialized.id);
        assert.ok(serialized.createdAt);
        assert.strictEqual(serialized.messages.length, 1);
    });

    it('should deserialize from JSON correctly', () => {
        const data = {
            id: 'chat-id',
            title: 'Chat Title',
            createdAt: new Date().toISOString(),
            messages: [mockMessage]
        };

        const chat = Chat.fromJSON(data);

        assert.strictEqual(chat.id, data.id);
        assert.strictEqual(chat.title, data.title);
        assert.strictEqual(chat.messages.length, 1);
    });

    it('should get message by id', () => {
        const chat = new Chat();
        chat.addMessage(mockMessage);

        const retrievedMessage = chat.getMessageById(mockMessage.id);

        assert.deepStrictEqual(retrievedMessage, mockMessage);
    });

    it('should handle missing message gracefully', () => {
        const chat = new Chat();

        const retrievedMessage = chat.getMessageById('non-existent');

        assert.strictEqual(retrievedMessage, null);
    });

    it('should update message content', () => {
        const chat = new Chat();
        chat.addMessage(mockMessage);

        const updatedContent = 'Updated content';
        chat.updateMessageContent(mockMessage.id, updatedContent);

        assert.strictEqual(chat.messages[0].content, updatedContent);
    });
});
