import { expect } from 'chai';
import * as conversationTypes from '../../types/conversation';
import { ChatMessage } from '../chat';

describe('Chat Model', () => {
    it('should export ChatMessage interface from conversation types', () => {
        // Check if ChatMessage is properly exported
        expect(ChatMessage).to.equal(conversationTypes.ChatMessage);
    });

    it('should allow creating valid chat messages', () => {
        // Create a message following the ChatMessage interface
        const message: ChatMessage = {
            id: '123',
            role: 'user',
            content: 'Hello world',
            timestamp: Date.now()
        };

        // Verify the message has the expected properties
        expect(message).to.have.property('id', '123');
        expect(message).to.have.property('role', 'user');
        expect(message).to.have.property('content', 'Hello world');
        expect(message).to.have.property('timestamp').that.is.a('number');
    });

    it('should support all role types', () => {
        // Test user role
        const userMessage: ChatMessage = {
            role: 'user',
            content: 'Hello',
            timestamp: Date.now()
        };
        expect(userMessage.role).to.equal('user');

        // Test assistant role
        const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: 'How can I help?',
            timestamp: Date.now()
        };
        expect(assistantMessage.role).to.equal('assistant');

        // Test system role
        const systemMessage: ChatMessage = {
            role: 'system',
            content: 'System initialization',
            timestamp: Date.now()
        };
        expect(systemMessage.role).to.equal('system');
    });

    it('should allow additional properties', () => {
        // Create a message with additional properties
        const message: ChatMessage = {
            role: 'user',
            content: 'Hello',
            timestamp: Date.now(),
            customField: 'test',
            metadata: { important: true }
        };

        // Verify additional properties are preserved
        expect(message).to.have.property('customField', 'test');
        expect(message).to.have.property('metadata').that.deep.equals({ important: true });
    });
});
