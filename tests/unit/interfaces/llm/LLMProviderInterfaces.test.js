"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestMessages = createTestMessages;
describe('LLMRequestOptions interface', function () {
    it('should create a valid options object with temperature', function () {
        var options = {
            temperature: 0.7
        };
        expect(options).toBeDefined();
        expect(options.temperature).toBe(0.7);
    });
    it('should create a valid options object with maxTokens', function () {
        var options = {
            maxTokens: 2000
        };
        expect(options).toBeDefined();
        expect(options.maxTokens).toBe(2000);
    });
    it('should create a valid options object with stream flag', function () {
        var options = {
            stream: true
        };
        expect(options).toBeDefined();
        expect(options.stream).toBe(true);
    });
    it('should create a valid options object with all properties', function () {
        var options = {
            temperature: 0.5,
            maxTokens: 1000,
            stream: true
        };
        expect(options).toBeDefined();
        expect(options.temperature).toBe(0.5);
        expect(options.maxTokens).toBe(1000);
        expect(options.stream).toBe(true);
    });
});
describe('LLMResponse interface', function () {
    it('should create a valid response object with content', function () {
        var response = {
            content: 'This is a response from the LLM'
        };
        expect(response).toBeDefined();
        expect(response.content).toBe('This is a response from the LLM');
    });
    it('should create a valid response object with usage information', function () {
        var _a, _b, _c;
        var response = {
            content: 'This is a response with usage stats',
            usage: {
                promptTokens: 10,
                completionTokens: 20,
                totalTokens: 30
            }
        };
        expect(response).toBeDefined();
        expect(response.content).toBe('This is a response with usage stats');
        expect(response.usage).toBeDefined();
        expect((_a = response.usage) === null || _a === void 0 ? void 0 : _a.promptTokens).toBe(10);
        expect((_b = response.usage) === null || _b === void 0 ? void 0 : _b.completionTokens).toBe(20);
        expect((_c = response.usage) === null || _c === void 0 ? void 0 : _c.totalTokens).toBe(30);
    });
    it('should create a valid response object with partial usage information', function () {
        var _a, _b, _c;
        var response = {
            content: 'This is a response with partial usage stats',
            usage: {
                totalTokens: 50
            }
        };
        expect(response).toBeDefined();
        expect(response.content).toBe('This is a response with partial usage stats');
        expect(response.usage).toBeDefined();
        expect((_a = response.usage) === null || _a === void 0 ? void 0 : _a.totalTokens).toBe(50);
        expect((_b = response.usage) === null || _b === void 0 ? void 0 : _b.promptTokens).toBeUndefined();
        expect((_c = response.usage) === null || _c === void 0 ? void 0 : _c.completionTokens).toBeUndefined();
    });
});
describe('LLMMessage interface', function () {
    it('should create a valid system message', function () {
        var message = {
            role: 'system',
            content: 'You are a helpful assistant'
        };
        expect(message).toBeDefined();
        expect(message.role).toBe('system');
        expect(message.content).toBe('You are a helpful assistant');
    });
    it('should create a valid user message', function () {
        var message = {
            role: 'user',
            content: 'Hello, can you help me?'
        };
        expect(message).toBeDefined();
        expect(message.role).toBe('user');
        expect(message.content).toBe('Hello, can you help me?');
    });
    it('should create a valid assistant message', function () {
        var message = {
            role: 'assistant',
            content: 'Yes, I can help you. What do you need?'
        };
        expect(message).toBeDefined();
        expect(message.role).toBe('assistant');
        expect(message.content).toBe('Yes, I can help you. What do you need?');
    });
});
describe('LLMStreamEvent interface', function () {
    it('should create a valid stream event for in-progress chunk', function () {
        var event = {
            content: 'partial response',
            done: false
        };
        expect(event).toBeDefined();
        expect(event.content).toBe('partial response');
        expect(event.done).toBe(false);
    });
    it('should create a valid stream event for final chunk', function () {
        var event = {
            content: 'final chunk',
            done: true
        };
        expect(event).toBeDefined();
        expect(event.content).toBe('final chunk');
        expect(event.done).toBe(true);
    });
});
// Helper function to create message arrays for testing
function createTestMessages() {
    return [
        { role: 'system', content: 'You are a helpful AI assistant' },
        { role: 'user', content: 'What is TypeScript?' },
        { role: 'assistant', content: 'TypeScript is a superset of JavaScript that adds static typing.' },
        { role: 'user', content: 'Can you show an example?' }
    ];
}
