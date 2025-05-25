jest.mock('vscode', () => ({
  languages: {
    createDiagnosticCollection: jest.fn(() => ({
      clear: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      dispose: jest.fn(),
    })),
  },
  window: {
    createOutputChannel: jest.fn(() => ({
      appendLine: jest.fn(),
      show: jest.fn(),
      clear: jest.fn(),
      dispose: jest.fn(),
    })),
  },
  workspace: {},
}));

/**
 * Tests for index
 * Source: src\services\codeQuality\index.ts
 */
import * as vscode from 'vscode';
import { CodeQualityService } from '../../../src/services/codeQuality/index';

// Mocks for VSCode context and logger
const mockContext = {
  subscriptions: [],
};
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Mock VSCode TextDocument and Uri
const mockDocument = (text = 'function foo() { return 1; }') => ({
  getText: () => text,
  uri: { toString: () => 'file:///mock.ts' },
});
const mockUri = { toString: () => 'file:///mock.ts' };

// Mock VSCode API for test environment
beforeAll(() => {
  if (!vscode.languages) {
    (vscode as any).languages = {};
  }
  (vscode.languages as any).createDiagnosticCollection = jest.fn(() => ({
    clear: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    dispose: jest.fn(),
  }));
});

describe('CodeQualityService', () => {
  let service: CodeQualityService;

  beforeEach(() => {
    service = new CodeQualityService(mockContext as any, mockLogger as any);
  });

  it('should initialize with default config', () => {
    expect(service).toBeDefined();
    expect(typeof service.getSecurityScanner).toBe('function');
    expect(typeof service.getCodeOptimizer).toBe('function');
    expect(typeof service.getBestPracticesChecker).toBe('function');
    expect(typeof service.getCodeReviewer).toBe('function');
    expect(typeof service.getDesignImprovementSuggester).toBe('function');
  });

  it('should allow configuration update', () => {
    service.configure({ enableSecurity: false });
    // No error should be thrown
  });

  it('should calculate metrics for a document', async () => {
    const metrics = await service.calculateMetrics(mockDocument() as any);
    expect(metrics).toHaveProperty('complexity');
    expect(metrics).toHaveProperty('maintainability');
    expect(metrics).toHaveProperty('performance');
  });

  it('should update and retrieve quality history', async () => {
    await service.updateQualityHistory(mockDocument() as any);
    const trends = service.getQualityTrends(mockUri as any);
    expect(Array.isArray(trends)).toBe(true);
    expect(trends.length).toBeGreaterThan(0);
    expect(trends[0]).toHaveProperty('timestamp');
    expect(trends[0]).toHaveProperty('issues');
    expect(trends[0]).toHaveProperty('metrics');
    expect(trends[0]).toHaveProperty('score');
  });

  it('should apply severity levels and filter issues', () => {
    const issues = [
      { file: 'a', line: 1, message: 'msg', severity: 'info', type: 'security' },
      { file: 'b', line: 2, message: 'ignore this', severity: 'warning', type: 'style' },
    ];
    service.configure({ ignorePatterns: ['ignore'], excludeTypes: ['style'] });
    const filtered = (service as any).filterIssues(issues);
    expect(filtered.length).toBe(1);
    const applied = (service as any).applySeverityLevels(filtered);
    expect(applied[0].severity).toBe('error'); // security -> error by default config
  });

  it('should calculate quality score', () => {
    const issues = [
      { file: 'a', line: 1, message: 'msg', severity: 'info', type: 'security' },
    ];
    const metrics = { complexity: 2, maintainability: 80, performance: 100 };
    const score = (service as any).calculateQualityScore(issues, metrics);
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should return empty array from analyzeCode()', async () => {
    const result = await service.analyzeCode();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it('should handle edge cases for empty document', async () => {
    const metrics = await service.calculateMetrics(mockDocument('') as any);
    expect(metrics.complexity).toBe(1); // base complexity
    expect(metrics.maintainability).toBeLessThanOrEqual(100);
  });
});
