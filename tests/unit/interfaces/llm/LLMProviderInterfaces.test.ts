/**
 * Tests for LLM provider interfaces
 */
import { LLMRequestOptions, LLMResponse, LLMMessage, LLMStreamEvent } from '../../../../src/llm/llm-provider';

describe('LLMRequestOptions interface', () => {
  it('should create a valid options object with temperature', () => {
    const options: LLMRequestOptions = {
      temperature: 0.7
    };

    expect(options).toBeDefined();
    expect(options.temperature).toBe(0.7);
  });

  it('should create a valid options object with maxTokens', () => {
    const options: LLMRequestOptions = {
      maxTokens: 2000
    };

    expect(options).toBeDefined();
    expect(options.maxTokens).toBe(2000);
  });

  it('should create a valid options object with stream flag', () => {
    const options: LLMRequestOptions = {
      stream: true
    };

    expect(options).toBeDefined();
    expect(options.stream).toBe(true);
  });

  it('should create a valid options object with all properties', () => {
    const options: LLMRequestOptions = {
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

describe('LLMResponse interface', () => {
  it('should create a valid response object with content', () => {
    const response: LLMResponse = {
      content: 'This is a response from the LLM'
    };

    expect(response).toBeDefined();
    expect(response.content).toBe('This is a response from the LLM');
  });

  it('should create a valid response object with usage information', () => {
    const response: LLMResponse = {
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
    expect(response.usage?.promptTokens).toBe(10);
    expect(response.usage?.completionTokens).toBe(20);
    expect(response.usage?.totalTokens).toBe(30);
  });

  it('should create a valid response object with partial usage information', () => {
    const response: LLMResponse = {
      content: 'This is a response with partial usage stats',
      usage: {
        totalTokens: 50
      }
    };

    expect(response).toBeDefined();
    expect(response.content).toBe('This is a response with partial usage stats');
    expect(response.usage).toBeDefined();
    expect(response.usage?.totalTokens).toBe(50);
    expect(response.usage?.promptTokens).toBeUndefined();
    expect(response.usage?.completionTokens).toBeUndefined();
  });
});

describe('LLMMessage interface', () => {
  it('should create a valid system message', () => {
    const message: LLMMessage = {
      role: 'system',
      content: 'You are a helpful assistant'
    };

    expect(message).toBeDefined();
    expect(message.role).toBe('system');
    expect(message.content).toBe('You are a helpful assistant');
  });

  it('should create a valid user message', () => {
    const message: LLMMessage = {
      role: 'user',
      content: 'Hello, can you help me?'
    };

    expect(message).toBeDefined();
    expect(message.role).toBe('user');
    expect(message.content).toBe('Hello, can you help me?');
  });

  it('should create a valid assistant message', () => {
    const message: LLMMessage = {
      role: 'assistant',
      content: 'Yes, I can help you. What do you need?'
    };

    expect(message).toBeDefined();
    expect(message.role).toBe('assistant');
    expect(message.content).toBe('Yes, I can help you. What do you need?');
  });
});

describe('LLMStreamEvent interface', () => {
  it('should create a valid stream event for in-progress chunk', () => {
    const event: LLMStreamEvent = {
      content: 'partial response',
      done: false
    };

    expect(event).toBeDefined();
    expect(event.content).toBe('partial response');
    expect(event.done).toBe(false);
  });

  it('should create a valid stream event for final chunk', () => {
    const event: LLMStreamEvent = {
      content: 'final chunk',
      done: true
    };

    expect(event).toBeDefined();
    expect(event.content).toBe('final chunk');
    expect(event.done).toBe(true);
  });
});

// Helper function to create message arrays for testing
export function createTestMessages(): LLMMessage[] {
  return [
    { role: 'system', content: 'You are a helpful AI assistant' },
    { role: 'user', content: 'What is TypeScript?' },
    { role: 'assistant', content: 'TypeScript is a superset of JavaScript that adds static typing.' },
    { role: 'user', content: 'Can you show an example?' }
  ];
}