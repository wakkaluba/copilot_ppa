import { LLMRefactoringService } from '../../../src/codeTools/services/LLMRefactoringService';

describe('LLMRefactoringService', () => {
  let service: LLMRefactoringService;

  beforeEach(() => {
    service = new LLMRefactoringService();
  });

  it('should instantiate without errors', () => {
    expect(service).toBeInstanceOf(LLMRefactoringService);
  });

  it('should have a refactorCode method', () => {
    expect(typeof service.refactorCode).toBe('function');
  });

  it('should return original code if not implemented', async () => {
    const code = 'let a = 1;';
    const result = await service.refactorCode(code, 'javascript', 'simplify');
    expect(result).toBe(code);
  });
});
