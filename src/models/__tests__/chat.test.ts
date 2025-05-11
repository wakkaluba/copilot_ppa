import * as conversationTypes from '../../types/conversation';
import { ChatMessage } from '../chat';

describe('Chat Module', () => {
  test('should correctly re-export ChatMessage interface', () => {
    // Verify that ChatMessage is correctly re-exported
    expect(ChatMessage).toBe(conversationTypes.ChatMessage);
  });

  test('ChatMessage interface structure is as expected', () => {
    // Create a sample ChatMessage to verify interface structure
    const message: ChatMessage = {
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
