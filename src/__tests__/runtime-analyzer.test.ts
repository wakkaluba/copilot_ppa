// filepath: d:\___coding\tools\copilot_ppa\src\__tests__\runtime-analyzer.test.ts
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as vscode from 'vscode';
import { PerformanceManager } from '../performance/performanceManager';
import { RuntimeAnalyzer, runtimeAnalyzer } from '../runtime-analyzer';

// Mock VS Code namespace
jest.mock('vscode', () => ({
  window: {
    createOutputChannel: jest.fn().mockReturnValue({
      appendLine: jest.fn(),
      show: jest.fn(),
      dispose: jest.fn()
    })
  },
  Uri: {
    file: jest.fn().mockImplementation(path => ({ fsPath: path }))
  }
}));

// Mock extension context
jest.mock('../extension', () => ({
  getExtensionContext: jest.fn().mockReturnValue({
    subscriptions: []
  })
}));

// Mock PerformanceManager
jest.mock('../performance/performanceManager', () => {
  const mockProfiler = {
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    startOperation: jest.fn(),
    endOperation: jest.fn()
  };

  const mockManager = {
    getProfiler: jest.fn().mockReturnValue(mockProfiler),
    generatePerformanceReport: jest.fn(),
    analyzeCurrentFile: jest.fn().mockResolvedValue(undefined),
    analyzeWorkspace: jest.fn().mockResolvedValue(undefined)
  };

  return {
    PerformanceManager: {
      getInstance: jest.fn().mockReturnValue(mockManager)
    }
  };
});

// Mock console.warn
const originalConsoleWarn = console.warn;
console.warn = jest.fn();

describe('RuntimeAnalyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    console.warn = originalConsoleWarn;
  });

  test('should create output channel and show deprecation warning on initialization', () => {
    // Create a new instance to test constructor
    const analyzer = new RuntimeAnalyzer();

    // Verify output channel was created
    expect(vscode.window.createOutputChannel).toHaveBeenCalledWith('Runtime Analysis');

    // Verify deprecation warning was logged
    expect(console.warn).toHaveBeenCalledWith('RuntimeAnalyzer is deprecated. Use PerformanceManager instead.');

    // Check the OutputChannel.appendLine was called with deprecation warning
    const mockOutputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      '⚠️ RuntimeAnalyzer is deprecated. Use PerformanceManager instead.'
    );
  });

  test('startRecording should forward to PerformanceManager and set isRecording flag', () => {
    // Test startRecording
    runtimeAnalyzer.startRecording();

    // Verify method forwarded to PerformanceManager
    const mockManager = PerformanceManager.getInstance();
    const mockProfiler = mockManager.getProfiler();

    expect(mockProfiler.startRecording).toHaveBeenCalled();

    // Verify isRecording flag was set
    // Note: We can't directly test this since it's a private field,
    // but we can test behavior that depends on it

    // Clear mocks for next test
    jest.clearAllMocks();

    // Test markStart - should be forwarded when isRecording is true
    runtimeAnalyzer.markStart('testMarker');
    expect(mockProfiler.startOperation).toHaveBeenCalledWith('testMarker');
  });

  test('stopRecording should forward to PerformanceManager, generate report and reset isRecording flag', () => {
    // First set isRecording to true
    runtimeAnalyzer.startRecording();
    jest.clearAllMocks();

    // Test stopRecording
    runtimeAnalyzer.stopRecording();

    // Verify methods forwarded to PerformanceManager
    const mockManager = PerformanceManager.getInstance();
    const mockProfiler = mockManager.getProfiler();

    expect(mockProfiler.stopRecording).toHaveBeenCalled();
    expect(mockManager.generatePerformanceReport).toHaveBeenCalled();

    // Verify isRecording flag was reset
    // Test by calling markStart - should not be forwarded when isRecording is false
    jest.clearAllMocks();
    runtimeAnalyzer.markStart('testMarker');
    expect(mockProfiler.startOperation).not.toHaveBeenCalled();
  });

  test('markStart should forward to PerformanceManager when isRecording is true', () => {
    // First set isRecording to true
    runtimeAnalyzer.startRecording();
    jest.clearAllMocks();

    // Test markStart
    runtimeAnalyzer.markStart('testMarker');

    // Verify method forwarded to PerformanceManager
    const mockManager = PerformanceManager.getInstance();
    const mockProfiler = mockManager.getProfiler();

    expect(mockProfiler.startOperation).toHaveBeenCalledWith('testMarker');
  });

  test('markStart should not forward to PerformanceManager when isRecording is false', () => {
    // Make sure isRecording is false
    runtimeAnalyzer.stopRecording();
    jest.clearAllMocks();

    // Test markStart
    runtimeAnalyzer.markStart('testMarker');

    // Verify method was not forwarded to PerformanceManager
    const mockManager = PerformanceManager.getInstance();
    const mockProfiler = mockManager.getProfiler();

    expect(mockProfiler.startOperation).not.toHaveBeenCalled();
  });

  test('markEnd should forward to PerformanceManager when isRecording is true', () => {
    // First set isRecording to true
    runtimeAnalyzer.startRecording();
    jest.clearAllMocks();

    // Test markEnd
    runtimeAnalyzer.markEnd('testMarker');

    // Verify method forwarded to PerformanceManager
    const mockManager = PerformanceManager.getInstance();
    const mockProfiler = mockManager.getProfiler();

    expect(mockProfiler.endOperation).toHaveBeenCalledWith('testMarker');
  });

  test('markEnd should not forward to PerformanceManager when isRecording is false', () => {
    // Make sure isRecording is false
    runtimeAnalyzer.stopRecording();
    jest.clearAllMocks();

    // Test markEnd
    runtimeAnalyzer.markEnd('testMarker');

    // Verify method was not forwarded to PerformanceManager
    const mockManager = PerformanceManager.getInstance();
    const mockProfiler = mockManager.getProfiler();

    expect(mockProfiler.endOperation).not.toHaveBeenCalled();
  });

  test('generatePerformanceReport should forward to PerformanceManager', () => {
    // Test generatePerformanceReport
    runtimeAnalyzer.generatePerformanceReport();

    // Verify method forwarded to PerformanceManager
    const mockManager = PerformanceManager.getInstance();

    expect(mockManager.generatePerformanceReport).toHaveBeenCalled();
  });

  test('analyzeResults should forward to PerformanceManager.analyzeCurrentFile', () => {
    // Test analyzeResults
    runtimeAnalyzer.analyzeResults();

    // Verify method forwarded to PerformanceManager
    const mockManager = PerformanceManager.getInstance();

    expect(mockManager.analyzeCurrentFile).toHaveBeenCalled();
  });

  test('generateVisualReport should forward to PerformanceManager.analyzeWorkspace', async () => {
    // Test generateVisualReport
    await runtimeAnalyzer.generateVisualReport();

    // Verify method forwarded to PerformanceManager
    const mockManager = PerformanceManager.getInstance();

    expect(mockManager.analyzeWorkspace).toHaveBeenCalled();
  });

  test('should handle errors in startRecording method', () => {
    // Mock getExtensionContext to throw an error
    jest.mocked(require('../extension').getExtensionContext).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    // Test startRecording
    runtimeAnalyzer.startRecording();

    // Verify error was handled and logged
    const mockOutputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
  });

  test('should handle errors in stopRecording method', () => {
    // Mock getExtensionContext to throw an error
    jest.mocked(require('../extension').getExtensionContext).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    // Test stopRecording
    runtimeAnalyzer.stopRecording();

    // Verify error was handled and logged
    const mockOutputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
  });

  test('should handle errors in markStart method', () => {
    // First set isRecording to true
    runtimeAnalyzer.startRecording();
    jest.clearAllMocks();

    // Mock getExtensionContext to throw an error
    jest.mocked(require('../extension').getExtensionContext).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    // Test markStart
    runtimeAnalyzer.markStart('testMarker');

    // Verify error was handled and logged
    const mockOutputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
  });

  test('should handle errors in markEnd method', () => {
    // First set isRecording to true
    runtimeAnalyzer.startRecording();
    jest.clearAllMocks();

    // Mock getExtensionContext to throw an error
    jest.mocked(require('../extension').getExtensionContext).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    // Test markEnd
    runtimeAnalyzer.markEnd('testMarker');

    // Verify error was handled and logged
    const mockOutputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
  });

  test('should handle errors in generatePerformanceReport method', () => {
    // Mock getExtensionContext to throw an error
    jest.mocked(require('../extension').getExtensionContext).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    // Test generatePerformanceReport
    runtimeAnalyzer.generatePerformanceReport();

    // Verify error was handled and logged
    const mockOutputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
  });

  test('should handle errors in analyzeResults method', () => {
    // Mock getExtensionContext to throw an error
    jest.mocked(require('../extension').getExtensionContext).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    // Test analyzeResults
    runtimeAnalyzer.analyzeResults();

    // Verify error was handled and logged
    const mockOutputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
  });

  test('should handle errors in generateVisualReport method', async () => {
    // Mock getExtensionContext to throw an error
    jest.mocked(require('../extension').getExtensionContext).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    // Test generateVisualReport
    const result = await runtimeAnalyzer.generateVisualReport();

    // Verify error was handled and logged
    const mockOutputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));

    // Verify undefined is returned on error
    expect(result).toBeUndefined();
  });

  test('singleton instance should be exported', () => {
    // Verify runtimeAnalyzer is an instance of RuntimeAnalyzer
    expect(runtimeAnalyzer).toBeInstanceOf(RuntimeAnalyzer);
  });
});
