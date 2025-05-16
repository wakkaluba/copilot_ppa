// Test coverage for src/services/llm/LLMSessionManager.ts error handling and propagation
import { LLMSessionManager } from '../../../../src/services/llm/LLMSessionManager';
import { LLMSessionError } from '../../../../src/services/llm/errors';

describe('LLMSessionManager error handling', () => {
  let manager: LLMSessionManager;
  let mockConnectionManager: any;
  let mockHostManager: any;
  let mockLogger: any;

  beforeEach(() => {
    mockConnectionManager = {
      getConnectionStatus: jest.fn().mockReturnValue('Connected'),
      getProvider: jest.fn().mockReturnValue({ completePrompt: jest.fn().mockResolvedValue({ content: 'ok' }) }),
      on: jest.fn()
    };
    mockHostManager = {};
    mockLogger = { error: jest.fn() };
    manager = new LLMSessionManager(mockConnectionManager, mockHostManager, mockLogger);
  });

  it('throws LLMSessionError if session not found', async () => {
    await expect(manager.sendPromptWithSession('missing', 'prompt')).rejects.toThrow(LLMSessionError);
    expect(mockLogger.error).toHaveBeenCalledWith('Session not found', { sessionId: 'missing' });
  });

  it('throws LLMSessionError if not connected', async () => {
    const session = manager.createSession({ model: 'm', provider: 'p', parameters: {} });
    mockConnectionManager.getConnectionStatus.mockReturnValue('Disconnected');
    await expect(manager.sendPromptWithSession(session.id, 'prompt')).rejects.toThrow(LLMSessionError);
    expect(mockLogger.error).toHaveBeenCalledWith('LLM provider is not connected', { sessionId: session.id });
  });

  it('throws LLMSessionError if no provider', async () => {
    const session = manager.createSession({ model: 'm', provider: 'p', parameters: {} });
    mockConnectionManager.getProvider.mockReturnValue(undefined);
    await expect(manager.sendPromptWithSession(session.id, 'prompt')).rejects.toThrow(LLMSessionError);
    expect(mockLogger.error).toHaveBeenCalledWith('No LLM provider available', { sessionId: session.id });
  });

  it('throws LLMSessionError if session timeout too short', () => {
    expect(() => manager.setSessionTimeout(1000)).toThrow(LLMSessionError);
    expect(mockLogger.error).toHaveBeenCalledWith('Session timeout too short', { timeoutMs: 1000 });
  });
});
