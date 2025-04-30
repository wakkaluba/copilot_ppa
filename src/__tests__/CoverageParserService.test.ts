import * as fs from 'fs';
import { CoverageParserService } from '../services/testRunner/services/CoverageParserService';

describe('CoverageParserService', () => {
  let service: CoverageParserService;

  beforeEach(() => {
    service = new CoverageParserService();
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => '');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parse', () => {
    it('should parse LCOV format', async () => {
      const lcovContent = `
SF:src/example.ts
FN:1,functionName
FNDA:1,functionName
FNF:1
FNH:1
DA:1,1
DA:2,1
LF:2
LH:2
BRF:0
BRH:0
end_of_record`;
      jest.spyOn(fs, 'readFileSync').mockReturnValue(lcovContent);

      const result = await service.parse('coverage/lcov.info', 'jest', 'lcov');
      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThan(0);
      expect(result.files).toHaveLength(1);
      expect(result.files[0].path).toBe('src/example.ts');
    });

    it('should parse JSON format', async () => {
      const jsonContent = {
        total: {
          lines: { total: 100, covered: 80, skipped: 0, pct: 80 },
          statements: { total: 120, covered: 90, skipped: 0, pct: 75 },
          functions: { total: 20, covered: 15, skipped: 0, pct: 75 },
          branches: { total: 30, covered: 20, skipped: 0, pct: 66.67 }
        },
        'src/example.ts': {
          lines: { total: 50, covered: 40, skipped: 0, pct: 80 }
        }
      };
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(jsonContent));

      const result = await service.parse('coverage/coverage.json', 'jest', 'json');
      expect(result).toBeDefined();
      expect(result.overall).toBe(80);
      expect(result.files).toHaveLength(1);
    });

    it('should handle HTML format', async () => {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head><title>Coverage report</title></head>
<body>
  <div class="total">
    <span class="percentage">85%</span>
  </div>
  <div class="file">
    <span class="filename">src/example.ts</span>
    <span class="percentage">90%</span>
  </div>
</body>
</html>`;
      jest.spyOn(fs, 'readFileSync').mockReturnValue(htmlContent);

      const result = await service.parse('coverage/index.html', 'jest', 'html');
      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThan(0);
    });

    it('should handle text format', async () => {
      const textContent = `
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|--------
All files |    80.0 |    70.0  |   85.0  |   82.0
 example.ts|    85.0 |    75.0  |   90.0  |   87.0
`;
      jest.spyOn(fs, 'readFileSync').mockReturnValue(textContent);

      const result = await service.parse('coverage/coverage.txt', 'jest', 'text');
      expect(result).toBeDefined();
      expect(result.overall).toBe(82);
      expect(result.files).toHaveLength(1);
    });

    it('should handle missing file', async () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = await service.parse('nonexistent.info', 'jest', 'lcov');
      expect(result).toBeNull();
    });

    it('should handle invalid format', async () => {
      jest.spyOn(fs, 'readFileSync').mockReturnValue('invalid content');

      const result = await service.parse('coverage.dat', 'jest', 'lcov');
      expect(result).toBeNull();
    });
  });
});
