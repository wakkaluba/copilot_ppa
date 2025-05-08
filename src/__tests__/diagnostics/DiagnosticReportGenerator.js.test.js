// filepath: d:\___coding\tools\copilot_ppa\src\__tests__\diagnostics\DiagnosticReportGenerator.js.test.js
const { afterEach, beforeEach, describe, expect, jest, test } = require('@jest/globals');
const fs = require('fs');
const vscode = require('vscode');
const { DiagnosticReportGenerator } = require('../../diagnostics/diagnosticReport');
const { SystemRequirementsChecker } = require('../../diagnostics/systemRequirements');
const { Logger } = require('../../utils/logger');

// Mock VS Code namespace
jest.mock('vscode', () => ({
  window: {
    createOutputChannel: jest.fn().mockReturnValue({
      appendLine: jest.fn(),
      show: jest.fn(),
      dispose: jest.fn()
    }),
    createWebviewPanel: jest.fn().mockReturnValue({
      webview: {
        html: '',
        onDidReceiveMessage: jest.fn(),
        postMessage: jest.fn()
      },
      onDidDispose: jest.fn(),
      reveal: jest.fn(),
      dispose: jest.fn()
    }),
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn()
  },
  Uri: {
    file: jest.fn(path => ({ fsPath: path }))
  },
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn(),
      has: jest.fn()
    })
  },
  ViewColumn: {
    One: 1
  },
  extensions: {
    getExtension: jest.fn().mockReturnValue({
      packageJSON: {
        name: 'copilot-ppa',
        version: '1.0.0'
      }
    })
  },
  env: {
    appName: 'VS Code Test'
  }
}));

// Mock file system
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn()
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  dirname: jest.fn()
}));

// Mock os
jest.mock('os', () => ({
  homedir: jest.fn().mockReturnValue('/home/user'),
  platform: jest.fn().mockReturnValue('win32'),
  arch: jest.fn().mockReturnValue('x64'),
  cpus: jest.fn().mockReturnValue([{ model: 'Test CPU', speed: 2500 }]),
  totalmem: jest.fn().mockReturnValue(16 * 1024 * 1024 * 1024),
  freemem: jest.fn().mockReturnValue(8 * 1024 * 1024 * 1024)
}));

// Mock the service classes
jest.mock('../../diagnostics/services/SystemInfoService', () => {
  return {
    SystemInfoService: jest.fn().mockImplementation(() => ({
      collect: jest.fn().mockResolvedValue({
        os: 'test-os',
        arch: 'x64',
        cpuInfo: { cores: 8, model: 'Test CPU', speed: 2.5 },
        memoryInfo: { totalMemoryGB: 16, freeMemoryGB: 8 },
        diskInfo: { totalSpaceGB: 512, freeSpaceGB: 256 },
        gpuInfo: { available: true, model: 'Test GPU' }
      })
    }))
  };
});

jest.mock('../../diagnostics/services/ConfigService', () => {
  return {
    ConfigService: jest.fn().mockImplementation(() => ({
      flatten: jest.fn().mockReturnValue({
        provider: 'test-provider',
        model: 'test-model',
        endpoint: 'test-endpoint',
        cacheEnabled: true,
        otherSettings: {}
      })
    }))
  };
});

jest.mock('../../diagnostics/services/PerformanceMetricsService', () => {
  return {
    PerformanceMetricsService: jest.fn().mockImplementation(() => ({
      getMetrics: jest.fn().mockReturnValue({
        lastLatencyMs: 100,
        averageLatencyMs: 150,
        peakMemoryUsageMB: 256,
        responseTimeHistory: [100, 150, 200]
      })
    }))
  };
});

jest.mock('../../diagnostics/services/RuntimeTracker', () => {
  return {
    RuntimeTracker: jest.fn().mockImplementation(() => ({
      getInfo: jest.fn().mockReturnValue({
        uptime: 3600,
        requestCount: 100,
        errorCount: 5,
        lastError: 'test error',
        lastErrorTime: new Date().toISOString()
      })
    }))
  };
});

jest.mock('../../diagnostics/services/LogService', () => {
  return {
    LogService: jest.fn().mockImplementation(() => ({
      getRecent: jest.fn().mockReturnValue({
        recentLogs: ['log1', 'log2'],
        errorCount: 5,
        warningCount: 10
      })
    }))
  };
});

jest.mock('../../diagnostics/providers/DiagnosticReportHtmlProvider', () => {
  return {
    DiagnosticReportHtmlProvider: {
      getHtml: jest.fn().mockReturnValue('<html><body>Test Report</body></html>')
    }
  };
});

// Mock SystemRequirementsChecker
jest.mock('../../diagnostics/systemRequirements', () => {
  return {
    SystemRequirementsChecker: jest.fn().mockImplementation(() => ({
      checkRequirements: jest.fn().mockResolvedValue(true),
      getSystemInfo: jest.fn().mockResolvedValue({
        cpu: { cores: 8, model: 'Test CPU' },
        memory: { total: 16, free: 8 },
        gpu: { available: true, info: { model: 'Test GPU' } }
      })
    }))
  };
});

// Mock Logger
jest.mock('../../utils/logger', () => {
  return {
    Logger: jest.fn().mockImplementation(() => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    }))
  };
});

describe('DiagnosticReportGenerator (JavaScript)', () => {
  let diagnosticReportGenerator;
  let mockLogger;
  let mockContext;
  let mockSystemChecker;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockLogger = new Logger();
    mockSystemChecker = new SystemRequirementsChecker();
    mockContext = {
      subscriptions: [],
      extensionPath: '/test/extension/path',
      globalState: {
        get: jest.fn(),
        update: jest.fn()
      },
      workspaceState: {
        get: jest.fn(),
        update: jest.fn()
      },
      extensionUri: {},
      storageUri: {},
      globalStorageUri: {},
      logUri: {},
      asAbsolutePath: jest.fn(str => `/test/extension/path/${str}`),
      extension: {
        packageJSON: { name: 'copilot-ppa', version: '1.0.0' }
      },
      environmentVariableCollection: {},
      extensionMode: 1,
      logPath: '/test/log/path',
      globalStoragePath: '/test/storage/path',
      storagePath: '/test/workspace/path',
      secrets: {}
    };

    // Create instance of DiagnosticReportGenerator
    diagnosticReportGenerator = new DiagnosticReportGenerator(mockLogger, mockContext, mockSystemChecker);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('constructor should create output channel and initialize services', () => {
    // Verify output channel was created
    expect(vscode.window.createOutputChannel).toHaveBeenCalledWith('Copilot PPA Diagnostics');

    // Test that the private fields were initialized correctly
    expect(diagnosticReportGenerator._logger).toBe(mockLogger);
    expect(diagnosticReportGenerator._extensionContext).toBe(mockContext);
    expect(diagnosticReportGenerator._systemChecker).toBe(mockSystemChecker);

    // Test that services were initialized
    expect(diagnosticReportGenerator.systemInfoSvc).toBeDefined();
    expect(diagnosticReportGenerator.configSvc).toBeDefined();
    expect(diagnosticReportGenerator.perfSvc).toBeDefined();
    expect(diagnosticReportGenerator.runtimeTracker).toBeDefined();
    expect(diagnosticReportGenerator.logService).toBeDefined();
  });

  describe('trackRequest', () => {
    test('should track successful request', () => {
      diagnosticReportGenerator.trackRequest(200);

      // Verify the response time was added to history
      expect(diagnosticReportGenerator._responseTimeHistory).toContain(200);

      // Verify request count increased
      expect(diagnosticReportGenerator._requestCount).toBe(1);

      // Verify error count did not increase
      expect(diagnosticReportGenerator._errorCount).toBe(0);
    });

    test('should track error request', () => {
      diagnosticReportGenerator.trackRequest(300, true, 'Test error message');

      // Verify the response time was added to history
      expect(diagnosticReportGenerator._responseTimeHistory).toContain(300);

      // Verify request count increased
      expect(diagnosticReportGenerator._requestCount).toBe(1);

      // Verify error count increased
      expect(diagnosticReportGenerator._errorCount).toBe(1);

      // Verify error message was stored
      expect(diagnosticReportGenerator._lastError).toBe('Test error message');

      // Verify error time was stored
      expect(diagnosticReportGenerator._lastErrorTime).not.toBeNull();
    });

    test('should limit response time history to 100 entries', () => {
      // Fill response time history with 100 entries
      for (let i = 0; i < 110; i++) {
        diagnosticReportGenerator.trackRequest(i + 100);
      }

      // Verify the response time history is limited to 100 entries
      expect(diagnosticReportGenerator._responseTimeHistory.length).toBe(100);

      // Verify oldest entries were removed (10 entries removed, so first entry should be 110)
      expect(diagnosticReportGenerator._responseTimeHistory[0]).toBe(110);
    });
  });

  describe('generateReport', () => {
    test('should generate a valid diagnostic report', async () => {
      const report = await diagnosticReportGenerator.generateReport();

      // Verify report structure
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('extension');
      expect(report).toHaveProperty('system');
      expect(report).toHaveProperty('configuration');
      expect(report).toHaveProperty('performance');
      expect(report).toHaveProperty('runtime');
      expect(report).toHaveProperty('logs');

      // Verify service methods were called
      expect(diagnosticReportGenerator.systemInfoSvc.collect).toHaveBeenCalled();
      expect(diagnosticReportGenerator.configSvc.flatten).toHaveBeenCalled();
      expect(diagnosticReportGenerator.perfSvc.getMetrics).toHaveBeenCalled();
      expect(diagnosticReportGenerator.runtimeTracker.getInfo).toHaveBeenCalled();
      expect(diagnosticReportGenerator.logService.getRecent).toHaveBeenCalled();

      // Verify extension information
      expect(report.extension.name).toBe('copilot-ppa');
      expect(report.extension.version).toBe('1.0.0');
      expect(report.extension.environment).toBe('VS Code Test');
    });

    test('should handle errors during report generation', async () => {
      // Mock system info service to throw an error
      diagnosticReportGenerator.systemInfoSvc.collect.mockRejectedValueOnce(new Error('Test error'));

      // Assert that the error is propagated
      await expect(diagnosticReportGenerator.generateReport()).rejects.toThrow('Test error');

      // Verify that the error was logged
      expect(mockLogger.error).toHaveBeenCalledWith('Error generating diagnostic report', expect.any(Error));
    });
  });

  describe('saveReportToFile', () => {
    test('should save report to a file', async () => {
      // Create sample report
      const report = {
        timestamp: new Date().toISOString(),
        extension: {
          name: 'test-extension',
          version: '1.0.0',
          environment: 'VS Code'
        },
        system: {
          os: 'test-os',
          arch: 'x64',
          cpuInfo: {},
          memoryInfo: {},
          diskInfo: {},
          gpuInfo: {}
        },
        configuration: {
          provider: 'test-provider',
          model: 'test-model',
          endpoint: 'test-endpoint',
          cacheEnabled: true,
          otherSettings: {}
        },
        performance: {
          lastLatencyMs: 100,
          averageLatencyMs: 150,
          peakMemoryUsageMB: 256,
          responseTimeHistory: []
        },
        runtime: {
          uptime: 3600,
          requestCount: 100,
          errorCount: 5,
          lastError: 'test error',
          lastErrorTime: new Date().toISOString()
        },
        logs: {
          recentLogs: [],
          errorCount: 5,
          warningCount: 10
        }
      };

      // Save report to file
      const filePath = await diagnosticReportGenerator.saveReportToFile(report);

      // Verify file path format
      expect(filePath).toMatch('/home/user/Downloads/copilot-ppa-diagnostic-');

      // Verify that writeFileSync was called with correct arguments
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('/home/user/Downloads/copilot-ppa-diagnostic-'),
        expect.stringContaining('test-extension'),
        undefined
      );

      // Verify the content of the file
      const fileContent = fs.writeFileSync.mock.calls[0][1];
      expect(fileContent).toContain('test-extension');
      expect(fileContent).toContain('test-provider');
      expect(fileContent).toContain('test-model');

      // Verify that info was logged
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Diagnostic report saved to'));
    });

    test('should handle errors when saving report to file', async () => {
      // Mock fs.writeFileSync to throw an error
      fs.writeFileSync.mockImplementationOnce(() => {
        throw new Error('Cannot write file');
      });

      // Create sample report
      const report = {
        timestamp: new Date().toISOString(),
        extension: {
          name: 'test-extension',
          version: '1.0.0',
          environment: 'VS Code'
        },
        system: {
          os: 'test-os',
          arch: 'x64',
          cpuInfo: {},
          memoryInfo: {},
          diskInfo: {},
          gpuInfo: {}
        },
        configuration: {
          provider: 'test-provider',
          model: 'test-model',
          endpoint: 'test-endpoint',
          cacheEnabled: true,
          otherSettings: {}
        },
        performance: {
          lastLatencyMs: 100,
          averageLatencyMs: 150,
          peakMemoryUsageMB: 256,
          responseTimeHistory: []
        },
        runtime: {
          uptime: 3600,
          requestCount: 100,
          errorCount: 5,
          lastError: 'test error',
          lastErrorTime: new Date().toISOString()
        },
        logs: {
          recentLogs: [],
          errorCount: 5,
          warningCount: 10
        }
      };

      // Assert that the error is propagated
      await expect(diagnosticReportGenerator.saveReportToFile(report)).rejects.toThrow('Cannot write file');

      // Verify that the error was logged
      expect(mockLogger.error).toHaveBeenCalledWith('Error saving diagnostic report', expect.any(Error));
    });
  });

  describe('displayReportInWebview', () => {
    test('should display report in a webview panel', async () => {
      // Create sample report
      const report = {
        timestamp: new Date().toISOString(),
        extension: {
          name: 'test-extension',
          version: '1.0.0',
          environment: 'VS Code'
        },
        system: {
          os: 'test-os',
          arch: 'x64',
          cpuInfo: {},
          memoryInfo: {},
          diskInfo: {},
          gpuInfo: {}
        },
        configuration: {
          provider: 'test-provider',
          model: 'test-model',
          endpoint: 'test-endpoint',
          cacheEnabled: true,
          otherSettings: {}
        },
        performance: {
          lastLatencyMs: 100,
          averageLatencyMs: 150,
          peakMemoryUsageMB: 256,
          responseTimeHistory: []
        },
        runtime: {
          uptime: 3600,
          requestCount: 100,
          errorCount: 5,
          lastError: 'test error',
          lastErrorTime: new Date().toISOString()
        },
        logs: {
          recentLogs: [],
          errorCount: 5,
          warningCount: 10
        }
      };

      // Display report in webview
      await diagnosticReportGenerator.displayReportInWebview(report);

      // Verify webview panel was created
      expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
        'copilotPpaDiagnostics',
        'Copilot PPA Diagnostic Report',
        vscode.ViewColumn.One,
        expect.objectContaining({
          enableScripts: true,
          retainContextWhenHidden: true
        })
      );

      // Verify that HTML was generated
      const mockPanel = vscode.window.createWebviewPanel.mock.results[0].value;
      expect(mockPanel.webview.html).toBeDefined();
      expect(mockPanel.webview.html).toBe('<html><body>Test Report</body></html>');

      // Verify that the report HTML provider was called
      const { DiagnosticReportHtmlProvider } = require('../../diagnostics/providers/DiagnosticReportHtmlProvider');
      expect(DiagnosticReportHtmlProvider.getHtml).toHaveBeenCalledWith(report);

      // Verify that message handler was registered
      expect(mockPanel.webview.onDidReceiveMessage).toHaveBeenCalled();
    });

    test('should handle saveReport message from webview', async () => {
      // Create sample report
      const report = {
        timestamp: new Date().toISOString(),
        extension: {
          name: 'test-extension',
          version: '1.0.0',
          environment: 'VS Code'
        },
        system: {
          os: 'test-os',
          arch: 'x64',
          cpuInfo: {},
          memoryInfo: {},
          diskInfo: {},
          gpuInfo: {}
        },
        configuration: {
          provider: 'test-provider',
          model: 'test-model',
          endpoint: 'test-endpoint',
          cacheEnabled: true,
          otherSettings: {}
        },
        performance: {
          lastLatencyMs: 100,
          averageLatencyMs: 150,
          peakMemoryUsageMB: 256,
          responseTimeHistory: []
        },
        runtime: {
          uptime: 3600,
          requestCount: 100,
          errorCount: 5,
          lastError: 'test error',
          lastErrorTime: new Date().toISOString()
        },
        logs: {
          recentLogs: [],
          errorCount: 5,
          warningCount: 10
        }
      };

      // Mock saveReportToFile to return a specific path
      const saveReportToFileSpy = jest.spyOn(diagnosticReportGenerator, 'saveReportToFile')
        .mockResolvedValueOnce('/home/user/Downloads/test-report.json');

      // Display report in webview
      await diagnosticReportGenerator.displayReportInWebview(report);

      // Get message handler
      const mockPanel = vscode.window.createWebviewPanel.mock.results[0].value;
      const messageHandler = mockPanel.webview.onDidReceiveMessage.mock.calls[0][0];

      // Simulate message from webview
      await messageHandler({ command: 'saveReport' });

      // Verify saveReportToFile was called
      expect(saveReportToFileSpy).toHaveBeenCalledWith(report);

      // Verify information message was shown
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        'Diagnostic report saved to /home/user/Downloads/test-report.json'
      );

      // Restore original implementation
      saveReportToFileSpy.mockRestore();
    });

    test('should handle errors when saving report from webview', async () => {
      // Create sample report
      const report = {
        timestamp: new Date().toISOString(),
        extension: {
          name: 'test-extension',
          version: '1.0.0',
          environment: 'VS Code'
        },
        system: {
          os: 'test-os',
          arch: 'x64',
          cpuInfo: {},
          memoryInfo: {},
          diskInfo: {},
          gpuInfo: {}
        },
        configuration: {
          provider: 'test-provider',
          model: 'test-model',
          endpoint: 'test-endpoint',
          cacheEnabled: true,
          otherSettings: {}
        },
        performance: {
          lastLatencyMs: 100,
          averageLatencyMs: 150,
          peakMemoryUsageMB: 256,
          responseTimeHistory: []
        },
        runtime: {
          uptime: 3600,
          requestCount: 100,
          errorCount: 5,
          lastError: 'test error',
          lastErrorTime: new Date().toISOString()
        },
        logs: {
          recentLogs: [],
          errorCount: 5,
          warningCount: 10
        }
      };

      // Mock saveReportToFile to throw an error
      const saveReportToFileSpy = jest.spyOn(diagnosticReportGenerator, 'saveReportToFile')
        .mockRejectedValueOnce(new Error('Cannot save file'));

      // Display report in webview
      await diagnosticReportGenerator.displayReportInWebview(report);

      // Get message handler
      const mockPanel = vscode.window.createWebviewPanel.mock.results[0].value;
      const messageHandler = mockPanel.webview.onDidReceiveMessage.mock.calls[0][0];

      // Simulate message from webview
      await messageHandler({ command: 'saveReport' });

      // Verify saveReportToFile was called
      expect(saveReportToFileSpy).toHaveBeenCalledWith(report);

      // Verify error message was shown
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Error saving report: Error: Cannot save file');

      // Restore original implementation
      saveReportToFileSpy.mockRestore();
    });
  });
});
