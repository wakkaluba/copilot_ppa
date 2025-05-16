// Test coverage for src/services/llm/services/LLMChatHistoryService.ts error handling
import { LLMResourceError } from '../../../../src/services/llm/errors';
import { LLMChatHistoryService } from '../../../../src/services/llm/services/LLMChatHistoryService';

describe('LLMChatHistoryService error handling', () => {
  let service: LLMChatHistoryService;

  beforeEach(() => {
    service = new LLMChatHistoryService();
  });

  it('throws LLMResourceError for persistMessage', async () => {
    await expect(service['persistMessage']({}, {})).rejects.toThrow(LLMResourceError);
  });

  it('throws LLMResourceError for persistSession', async () => {
    await expect(service['persistSession']({})).rejects.toThrow(LLMResourceError);
  });

  it('throws LLMResourceError for retrieveSession', async () => {
    await expect(service['retrieveSession']('id')).rejects.toThrow(LLMResourceError);
  });

  it('throws LLMResourceError for removeSession', async () => {
    await expect(service['removeSession']('id')).rejects.toThrow(LLMResourceError);
  });

  it('throws LLMResourceError for parseHistoryFromText', () => {
    expect(() => service['parseHistoryFromText']('')).toThrow(LLMResourceError);
  });
});
