import { mock } from 'jest-mock-extended';
import { ILogger } from '../../../../services/logging/ILogger';
import {
    WebpackConfigAnalyzer,
    WebpackConfigDetector,
    WebpackOptimizationService
} from '../index';

describe('Webpack Services Index', () => {
  let mockLogger: ILogger;

  beforeEach(() => {
    mockLogger = mock<ILogger>();
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
