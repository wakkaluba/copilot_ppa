import { expect } from 'chai';
import { ChatMessage } from '../../../src/models/interfaces/chat';
import { ChatMessage as OriginalChatMessage } from '../../../src/types/conversation';

describe('Chat interface tests', () => {
    describe('ChatMessage interface', () => {
        it('should re-export the ChatMessage interface correctly', () => {
            // Since interfaces don't exist at runtime, we test by creating objects that satisfy the interface
            const userMessage: ChatMessage = {
                id: '123',
                role: 'user',
                content: 'Test message',
                timestamp: Date.now()
            };

            // Verify the properties
            expect(userMessage.id).to.equal('123');
            expect(userMessage.role).to.equal('user');
            expect(userMessage.content).to.equal('Test message');
            expect(userMessage.timestamp).to.be.a('number');

            // Verify the ChatMessage interface is the same as the original
            const originalMessage: OriginalChatMessage = userMessage;
            expect(originalMessage).to.equal(userMessage,
                'Re-exported ChatMessage should be identical to the original interface');
        });

        it('should support ChatMessage with string timestamp', () => {
            const messageWithStringTimestamp: ChatMessage = {
                id: '456',
                role: 'assistant',
                content: 'Response message',
                timestamp: '2025-05-14T10:30:00Z'
            };

            expect(messageWithStringTimestamp.id).to.equal('456');
            expect(messageWithStringTimestamp.role).to.equal('assistant');
            expect(messageWithStringTimestamp.timestamp).to.be.a('string');
        });

        it('should support ChatMessage with additional properties', () => {
            const messageWithAdditionalProps: ChatMessage = {
                id: '789',
                role: 'system',
                content: 'System message',
                timestamp: Date.now(),
                isEdited: true,
                metadata: {
                    source: 'test',
                    version: '1.0'
                }
            };

            expect(messageWithAdditionalProps.id).to.equal('789');
            expect(messageWithAdditionalProps.role).to.equal('system');
            expect(messageWithAdditionalProps.isEdited).to.be.true;
            expect(messageWithAdditionalProps.metadata).to.deep.equal({
                source: 'test',
                version: '1.0'
            });
        });
    });
});
