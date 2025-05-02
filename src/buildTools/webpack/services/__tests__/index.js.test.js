const {
  WebpackConfigDetector,
  WebpackConfigAnalyzer,
  WebpackOptimizationService
} = require('../index');

describe('Webpack Services Index JavaScript Implementation', () => {
  const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export WebpackConfigDetector class', () => {
    expect(WebpackConfigDetector).toBeDefined();
    const detector = new WebpackConfigDetector(mockLogger);
    expect(detector).toBeInstanceOf(WebpackConfigDetector);
  });

  it('should export WebpackConfigAnalyzer class', () => {
    expect(WebpackConfigAnalyzer).toBeDefined();
    const analyzer = new WebpackConfigAnalyzer(mockLogger);
    expect(analyzer).toBeInstanceOf(WebpackConfigAnalyzer);
  });

  it('should export WebpackOptimizationService class', () => {
    expect(WebpackOptimizationService).toBeDefined();
    const service = new WebpackOptimizationService(mockLogger);
    expect(service).toBeInstanceOf(WebpackOptimizationService);
  });

  it('should instantiate WebpackConfigDetector with default logger if none provided', () => {
    const detector = new WebpackConfigDetector();
    expect(detector).toBeInstanceOf(WebpackConfigDetector);
  });

  it('should instantiate WebpackConfigAnalyzer with default logger if none provided', () => {
    const analyzer = new WebpackConfigAnalyzer();
    expect(analyzer).toBeInstanceOf(WebpackConfigAnalyzer);
  });

  it('should instantiate WebpackOptimizationService with default logger if none provided', () => {
    const service = new WebpackOptimizationService();
    expect(service).toBeInstanceOf(WebpackOptimizationService);
  });
});
