/**
 * Tests for interfaces
 * Source: src\models\interfaces.ts
 */
import * as assert from 'assert';
import * as sinon from 'sinon';
import { IChatErrorEvent, IChatMessage, IChatSession, IConnectionStatus } from '../../src/models/interfaces';

describe('Models Interfaces Tests (TS)', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('IChatMessage Interface', () => {
        it('should allow creation of valid chat messages', () => {
            const timestamp = Date.now();
            const message: IChatMessage = {
                id: 'msg-123',
                role: 'user',
                content: 'Test message content',
                timestamp: timestamp
            };

            assert.strictEqual(message.id, 'msg-123', 'Message ID should match');
            assert.strictEqual(message.role, 'user', 'Message role should match');
            assert.strictEqual(message.content, 'Test message content', 'Message content should match');
            assert.strictEqual(message.timestamp, timestamp, 'Message timestamp should match');
        });

        it('should support all role types', () => {
            // Test user role
            const userMessage: IChatMessage = {
                id: 'user-msg',
                role: 'user',
                content: 'User message',
                timestamp: 123456789
            };
            assert.strictEqual(userMessage.role, 'user');

            // Test assistant role
            const assistantMessage: IChatMessage = {
                id: 'assistant-msg',
                role: 'assistant',
                content: 'Assistant message',
                timestamp: 123456789
            };
            assert.strictEqual(assistantMessage.role, 'assistant');

            // Test system role
            const systemMessage: IChatMessage = {
                id: 'system-msg',
                role: 'system',
                content: 'System message',
                timestamp: 123456789
            };
            assert.strictEqual(systemMessage.role, 'system');
        });
    });

    describe('IChatSession Interface', () => {
        it('should allow creation of valid chat sessions', () => {
            const message: IChatMessage = {
                id: 'msg-1',
                role: 'user',
                content: 'Hello',
                timestamp: Date.now()
            };

            const session: IChatSession = {
                id: 'session-123',
                messages: [message]
            };

            assert.strictEqual(session.id, 'session-123', 'Session ID should match');
            assert.strictEqual(session.messages.length, 1, 'Session should have one message');
            assert.deepStrictEqual(session.messages[0], message, 'Message in session should match');
        });

        it('should support empty message arrays', () => {
            const session: IChatSession = {
                id: 'empty-session',
                messages: []
            };

            assert.strictEqual(session.id, 'empty-session');
            assert.strictEqual(session.messages.length, 0);
        });
    });

    describe('IChatErrorEvent Interface', () => {
        it('should support Error objects', () => {
            const error = new Error('Test error');
            const errorEvent: IChatErrorEvent = {
                error: error
            };

            assert.strictEqual(errorEvent.error, error);
        });

        it('should support string errors', () => {
            const errorEvent: IChatErrorEvent = {
                error: 'Error message'
            };

            assert.strictEqual(errorEvent.error, 'Error message');
        });

        it('should support unknown errors', () => {
            const unknownError = { code: 500, message: 'Unknown error' };
            const errorEvent: IChatErrorEvent = {
                error: unknownError
            };

            assert.deepStrictEqual(errorEvent.error, unknownError);
        });
    });

    describe('IConnectionStatus Interface', () => {
        it('should support connected state', () => {
            const status: IConnectionStatus = {
                state: 'connected',
                message: 'Connected to service',
                isInputDisabled: false
            };

            assert.strictEqual(status.state, 'connected');
            assert.strictEqual(status.message, 'Connected to service');
            assert.strictEqual(status.isInputDisabled, false);
        });

        it('should support disconnected state', () => {
            const status: IConnectionStatus = {
                state: 'disconnected',
                message: 'Not connected',
                isInputDisabled: true
            };

            assert.strictEqual(status.state, 'disconnected');
            assert.strictEqual(status.message, 'Not connected');
            assert.strictEqual(status.isInputDisabled, true);
        });

        it('should work with optional fields omitted', () => {
            const status: IConnectionStatus = {
                state: 'connected'
            };

            assert.strictEqual(status.state, 'connected');
            assert.strictEqual(status.message, undefined);
            assert.strictEqual(status.isInputDisabled, undefined);
        });
    });
});
