import { CoverageSummary } from '../services/testRunner/codeCoverageService';
import { CoverageThresholdService } from '../services/testRunner/services/CoverageThresholdService';

describe('CoverageThresholdService', () => {
  let service: CoverageThresholdService;

  beforeEach(() => {
    service = new CoverageThresholdService();
  });

  describe('check', () => {
    const mockCoverage: CoverageSummary = {
      overall: 85,
      statements: 87,
      branches: 80,
      functions: 90,
      lines: 85,
      totalFiles: 1,
      files: [
        {
          path: 'src/example.ts',
          statements: 87,
          branches: 80,
          functions: 90,
          lines: 85
        }
      ]
    };

    it('should pass when coverage exceeds threshold', () => {
      const result = service.check(mockCoverage, 80);
      expect(result.success).toBe(true);
      expect(result.message).toContain('passed');
    });

    it('should fail when coverage is below threshold', () => {
      const result = service.check(mockCoverage, 90);
      expect(result.success).toBe(false);
      expect(result.message).toContain('failed');
    });

    it('should pass when no threshold is specified', () => {
      const result = service.check(mockCoverage);
      expect(result.success).toBe(true);
    });

    it('should fail when coverage data is incomplete', () => {
      const incompleteCoverage = { ...mockCoverage, overall: undefined };
      const result = service.check(incompleteCoverage as any, 80);
      expect(result.success).toBe(false);
      expect(result.message).toContain('invalid');
    });

    it('should handle zero threshold', () => {
      const result = service.check(mockCoverage, 0);
      expect(result.success).toBe(true);
    });

    it('should handle threshold at exact coverage level', () => {
      const result = service.check(mockCoverage, 85);
      expect(result.success).toBe(true);
    });

    it('should handle invalid thresholds', () => {
      expect(service.check(mockCoverage, -1).success).toBe(true);
      expect(service.check(mockCoverage, 101).success).toBe(false);
    });

    it('should include detailed coverage info in message', () => {
      const result = service.check(mockCoverage, 80);
      expect(result.message).toContain('85%');
      expect(result.message).toContain('statements: 87%');
      expect(result.message).toContain('branches: 80%');
      expect(result.message).toContain('functions: 90%');
    });
  });
});
