// filepath: d:\___coding\tools\copilot_ppa\src\__tests__\runtime-analyzer.js.test.js
const { afterEach, beforeEach, describe, expect, jest, test } = require('@jest/globals');
const vscode = require('vscode');
const { RuntimeAnalyzer, runtimeAnalyzer } = require('../runtime-analyzer');

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

describe('JavaScript RuntimeAnalyzer', () => {
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
    const mockOutputChannel = vscode.window.createOutputChannel.mock.results[0].value;
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      '⚠️ RuntimeAnalyzer is deprecated. Use PerformanceManager instead.'
    );
  });

  test('startRecording should forward to PerformanceManager and set isRecording flag', () => {
    // Get mocked services
    const { PerformanceManager } = require('../performance/performanceManager');
    const mockManager = PerformanceManager.getInstance();
    const mockProfiler = mockManager.getProfiler();

    // Test startRecording
    runtimeAnalyzer.startRecording();

    // Verify method forwarded to PerformanceManager
    expect(mockProfiler.startRecording).toHaveBeenCalled();

    // Clear mocks for next test
    jest.clearAllMocks();

    // Test markStart - should be forwarded when isRecording is true
    runtimeAnalyzer.markStart('testMarker');
    expect(mockProfiler.startOperation).toHaveBeenCalledWith('testMarker');
  });

  test('stopRecording should forward to PerformanceManager, generate report and reset isRecording flag', () => {
    // Get mocked services
    const { PerformanceManager } = require('../performance/performanceManager');
    const mockManager = PerformanceManager.getInstance();
    const mockProfiler = mockManager.getProfiler();

    // First set isRecording to true
    runtimeAnalyzer.startRecording();
    jest.clearAllMocks();

    // Test stopRecording
    runtimeAnalyzer.stopRecording();

    // Verify methods forwarded to PerformanceManager
    expect(mockProfiler.stopRecording).toHaveBeenCalled();
    expect(mockManager.generatePerformanceReport).toHaveBeenCalled();

    // Verify isRecording flag was reset
    // Test by calling markStart - should not be forwarded when isRecording is false
    jest.clearAllMocks();
    runtimeAnalyzer.markStart('testMarker');
    expect(mockProfiler.startOperation).not.toHaveBeenCalled();
  });

  test('markStart and markEnd should properly forward to PerformanceManager based on isRecording state', () => {
    // Get mocked services
    const { PerformanceManager } = require('../performance/performanceManager');
    const mockManager = PerformanceManager.getInstance();
    const mockProfiler = mockManager.getProfiler();

    // When isRecording is true, methods should be forwarded
    runtimeAnalyzer.startRecording();
    jest.clearAllMocks();

    runtimeAnalyzer.markStart('testMarker');
    expect(mockProfiler.startOperation).toHaveBeenCalledWith('testMarker');

    runtimeAnalyzer.markEnd('testMarker');
    expect(mockProfiler.endOperation).toHaveBeenCalledWith('testMarker');

    // When isRecording is false, methods should not be forwarded
    runtimeAnalyzer.stopRecording();
    jest.clearAllMocks();

    runtimeAnalyzer.markStart('testMarker');
    expect(mockProfiler.startOperation).not.toHaveBeenCalled();

    runtimeAnalyzer.markEnd('testMarker');
    expect(mockProfiler.endOperation).not.toHaveBeenCalled();
  });

  test('generatePerformanceReport should forward to PerformanceManager', () => {
    // Get mocked services
    const { PerformanceManager } = require('../performance/performanceManager');
    const mockManager = PerformanceManager.getInstance();

    // Test generatePerformanceReport
    runtimeAnalyzer.generatePerformanceReport();

    // Verify method forwarded to PerformanceManager
    expect(mockManager.generatePerformanceReport).toHaveBeenCalled();
  });

  test('analyzeResults should forward to PerformanceManager.analyzeCurrentFile', () => {
    // Get mocked services
    const { PerformanceManager } = require('../performance/performanceManager');
    const mockManager = PerformanceManager.getInstance();

    // Test analyzeResults
    runtimeAnalyzer.analyzeResults();

    // Verify method forwarded to PerformanceManager
    expect(mockManager.analyzeCurrentFile).toHaveBeenCalled();
  });

  test('generateVisualReport should forward to PerformanceManager.analyzeWorkspace', async () => {
    // Get mocked services
    const { PerformanceManager } = require('../performance/performanceManager');
    const mockManager = PerformanceManager.getInstance();

    // Test generateVisualReport
    await runtimeAnalyzer.generateVisualReport();

    // Verify method forwarded to PerformanceManager
    expect(mockManager.analyzeWorkspace).toHaveBeenCalled();
  });

  test('should handle errors in all methods', () => {
    // Get the mocked output channel
    const mockOutputChannel = vscode.window.createOutputChannel.mock.results[0].value;

    // Mock getExtensionContext to throw an error
    const mockedExtension = require('../extension');
    const originalGetContext = mockedExtension.getExtensionContext;
    mockedExtension.getExtensionContext = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });

    // Test all methods with error handling
    runtimeAnalyzer.startRecording();
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
    jest.clearAllMocks();

    runtimeAnalyzer.stopRecording();
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
    jest.clearAllMocks();

    runtimeAnalyzer.markStart('testMarker');
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
    jest.clearAllMocks();

    runtimeAnalyzer.markEnd('testMarker');
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
    jest.clearAllMocks();

    runtimeAnalyzer.generatePerformanceReport();
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
    jest.clearAllMocks();

    runtimeAnalyzer.analyzeResults();
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
    jest.clearAllMocks();

    // Restore the original function after testing
    mockedExtension.getExtensionContext = originalGetContext;
  });

  test('generateVisualReport should handle errors and return undefined', async () => {
    // Get the mocked output channel
    const mockOutputChannel = vscode.window.createOutputChannel.mock.results[0].value;

    // Mock getExtensionContext to throw an error
    const mockedExtension = require('../extension');
    const originalGetContext = mockedExtension.getExtensionContext;
    mockedExtension.getExtensionContext = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });

    // Test generateVisualReport
    const result = await runtimeAnalyzer.generateVisualReport();

    // Verify error was handled and logged
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));

    // Verify undefined is returned on error
    expect(result).toBeUndefined();

    // Restore the original function after testing
    mockedExtension.getExtensionContext = originalGetContext;
  });

  test('singleton instance should be exported', () => {
    // Verify runtimeAnalyzer is an instance of RuntimeAnalyzer
    expect(runtimeAnalyzer).toBeInstanceOf(RuntimeAnalyzer);
  });
});
