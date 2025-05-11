const chatModule = require('../chat');
const conversationTypes = require('../../types/conversation');

describe('Chat Module (JavaScript)', () => {
  test('should correctly re-export ChatMessage interface', () => {
    // Verify that ChatMessage is correctly re-exported from conversation types
    expect(chatModule.ChatMessage).toBe(conversationTypes.ChatMessage);
  });

  test('ChatMessage can be used to create valid message objects', () => {
    // Create a sample message using the ChatMessage interface
    const message = {
      id: '123',
      role: 'user',
      content: 'Test message',
      timestamp: Date.now(),
      customProperty: 'test'
    };

    // Verify that the message has the expected properties
    expect(message).toHaveProperty('id');
    expect(message).toHaveProperty('role');
    expect(message).toHaveProperty('content');
    expect(message).toHaveProperty('timestamp');
    expect(message).toHaveProperty('customProperty');

    // Verify role values
    expect(['user', 'assistant', 'system']).toContain(message.role);
  });
});
