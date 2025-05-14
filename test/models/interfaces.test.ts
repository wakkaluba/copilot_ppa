import { expect } from 'chai';
import {
    IChatErrorEvent,
    IChatMessage,
    IChatSession,
    IConnectionStatus
} from '../../src/models/interfaces';

describe('Interfaces model tests', () => {
    describe('IChatMessage interface', () => {
        it('should allow creating a valid user message', () => {
            const userMessage: IChatMessage = {
                id: '123',
                role: 'user',
                content: 'Test message',
                timestamp: Date.now()
            };

            expect(userMessage.id).to.equal('123');
            expect(userMessage.role).to.equal('user');
            expect(userMessage.content).to.equal('Test message');
            expect(userMessage.timestamp).to.be.a('number');
        });

        it('should allow creating a valid assistant message', () => {
            const assistantMessage: IChatMessage = {
                id: '456',
                role: 'assistant',
                content: 'Assistant response',
                timestamp: Date.now()
            };

            expect(assistantMessage.id).to.equal('456');
            expect(assistantMessage.role).to.equal('assistant');
            expect(assistantMessage.content).to.equal('Assistant response');
            expect(assistantMessage.timestamp).to.be.a('number');
        });

        it('should allow creating a valid system message', () => {
            const systemMessage: IChatMessage = {
                id: '789',
                role: 'system',
                content: 'System message',
                timestamp: Date.now()
            };

            expect(systemMessage.id).to.equal('789');
            expect(systemMessage.role).to.equal('system');
            expect(systemMessage.content).to.equal('System message');
            expect(systemMessage.timestamp).to.be.a('number');
        });
    });

    describe('IChatSession interface', () => {
        it('should allow creating a chat session with messages', () => {
            const chatSession: IChatSession = {
                id: 'session-123',
                messages: [
                    {
                        id: 'msg-1',
                        role: 'user',
                        content: 'Hello',
                        timestamp: 1620000000000
                    },
                    {
                        id: 'msg-2',
                        role: 'assistant',
                        content: 'Hi there',
                        timestamp: 1620000001000
                    }
                ]
            };

            expect(chatSession.id).to.equal('session-123');
            expect(chatSession.messages).to.have.lengthOf(2);
            expect(chatSession.messages[0].id).to.equal('msg-1');
            expect(chatSession.messages[1].role).to.equal('assistant');
        });

        it('should allow creating an empty chat session', () => {
            const emptyChatSession: IChatSession = {
                id: 'empty-session',
                messages: []
            };

            expect(emptyChatSession.id).to.equal('empty-session');
            expect(emptyChatSession.messages).to.be.an('array').that.is.empty;
        });
    });

    describe('IChatErrorEvent interface', () => {
        it('should allow creating an error event with Error object', () => {
            const error = new Error('Test error');
            const errorEvent: IChatErrorEvent = { error };

            expect(errorEvent.error).to.equal(error);
            expect((errorEvent.error as Error).message).to.equal('Test error');
        });

        it('should allow creating an error event with string', () => {
            const errorEvent: IChatErrorEvent = { error: 'String error message' };

            expect(errorEvent.error).to.equal('String error message');
        });

        it('should allow creating an error event with unknown error', () => {
            const unknownError = { custom: 'error' };
            const errorEvent: IChatErrorEvent = { error: unknownError };

            expect(errorEvent.error).to.equal(unknownError);
        });
    });

    describe('IConnectionStatus interface', () => {
        it('should allow creating a connected status', () => {
            const connectedStatus: IConnectionStatus = {
                state: 'connected'
            };

            expect(connectedStatus.state).to.equal('connected');
            expect(connectedStatus.message).to.be.undefined;
            expect(connectedStatus.isInputDisabled).to.be.undefined;
        });

        it('should allow creating a disconnected status with message', () => {
            const disconnectedStatus: IConnectionStatus = {
                state: 'disconnected',
                message: 'Connection lost'
            };

            expect(disconnectedStatus.state).to.equal('disconnected');
            expect(disconnectedStatus.message).to.equal('Connection lost');
            expect(disconnectedStatus.isInputDisabled).to.be.undefined;
        });

        it('should allow creating a status with input disabled flag', () => {
            const statusWithDisabledInput: IConnectionStatus = {
                state: 'disconnected',
                message: 'Reconnecting...',
                isInputDisabled: true
            };

            expect(statusWithDisabledInput.state).to.equal('disconnected');
            expect(statusWithDisabledInput.message).to.equal('Reconnecting...');
            expect(statusWithDisabledInput.isInputDisabled).to.be.true;
        });
    });
});
