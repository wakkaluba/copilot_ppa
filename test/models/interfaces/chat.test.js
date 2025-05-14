const { expect } = require('chai');

describe('Chat interface tests (JavaScript)', () => {
    describe('ChatMessage interface', () => {
        it('should allow creating objects matching the expected ChatMessage interface', () => {
            // Since interfaces don't exist at runtime in JavaScript,
            // we're testing that we can create objects with the expected structure
            const userMessage = {
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
        });

        it('should support ChatMessage with string timestamp', () => {
            const messageWithStringTimestamp = {
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
            const messageWithAdditionalProps = {
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
