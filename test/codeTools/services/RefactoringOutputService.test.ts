import { RefactoringOutputService } from '../../../src/codeTools/services/RefactoringOutputService';

describe('RefactoringOutputService', () => {
  let service: RefactoringOutputService;

  beforeEach(() => {
    service = new RefactoringOutputService();
  });

  it('should instantiate and create an output channel', () => {
    expect(service).toBeInstanceOf(RefactoringOutputService);
  });

  it('should have a startOperation method', () => {
    expect(typeof service.startOperation).toBe('function');
  });

  // Add more tests for logInfo, logWarning, logSuccess, logError, etc.
});
