// filepath: d:\___coding\tools\copilot_ppa\tests\unit\commands\debugCommands.test.ts
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as vscode from 'vscode';
import { registerDebugCommands } from '../../../src/commands/debugCommands';
import { CopilotCommunicationAnalyzer } from '../../../src/debug/copilotCommunicationAnalyzer';
import { CudaDetector } from '../../../src/debug/cudaDetector';
import { DebugConfigPanel } from '../../../src/debug/debugConfigPanel';
import { DebugDashboard } from '../../../src/debug/debugDashboard';
import { LogViewer } from '../../../src/debug/logViewer';
import { ModelCompatibilityChecker } from '../../../src/debug/modelCompatibilityChecker';
import { AdvancedLogger } from '../../../src/utils/advancedLogger';

// Mock VS Code namespace
jest.mock('vscode', () => {
  const mockCommands = {
    registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    executeCommand: jest.fn()
  };

  const mockWindow = {
    showInformationMessage: jest.fn().mockResolvedValue(null),
    showErrorMessage: jest.fn(),
    showQuickPick: jest.fn().mockResolvedValue(null),
    withProgress: jest.fn().mockImplementation((options, task) => task({
      report: jest.fn()
    }))
  };

  const mockWorkspace = {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue(false),
      update: jest.fn()
    })
  };

  return {
    commands: mockCommands,
    window: mockWindow,
    workspace: mockWorkspace,
    ProgressLocation: {
      Notification: 1
    },
    ExtensionContext: jest.fn()
  };
});

// Mock all imported classes
jest.mock('../../../src/debug/copilotCommunicationAnalyzer', () => ({
  CopilotCommunicationAnalyzer: {
    getInstance: jest.fn().mockReturnValue({
      setEnabled: jest.fn(),
      exportCommunicationHistoryToFile: jest.fn().mockResolvedValue('/path/to/export.json'),
      clearHistory: jest.fn()
    })
  }
}));

jest.mock('../../../src/debug/debugDashboard', () => ({
  DebugDashboard: {
    getInstance: jest.fn().mockReturnValue({
      show: jest.fn()
    })
  }
}));

jest.mock('../../../src/debug/debugConfigPanel', () => ({
  DebugConfigPanel: {
    getInstance: jest.fn().mockReturnValue({
      show: jest.fn()
    })
  }
}));

jest.mock('../../../src/debug/logViewer', () => ({
  LogViewer: {
    getInstance: jest.fn().mockReturnValue({
      show: jest.fn()
    })
  }
}));

jest.mock('../../../src/debug/cudaDetector', () => ({
  CudaDetector: {
    getInstance: jest.fn().mockReturnValue({
      detectCuda: jest.fn().mockResolvedValue({
        isAvailable: true,
        gpuName: 'NVIDIA GeForce RTX 3080',
        totalMemoryMB: 10240,
        details: {}
      }),
      getRecommendedModels: jest.fn().mockResolvedValue({
        recommended: ['model1', 'model2'],
        partial: ['model3'],
        notRecommended: ['model4']
      })
    })
  }
}));

jest.mock('../../../src/debug/modelCompatibilityChecker', () => ({
  ModelCompatibilityChecker: {
    getInstance: jest.fn().mockReturnValue({
      showModelCompatibilityReport: jest.fn()
    })
  }
}));

jest.mock('../../../src/utils/advancedLogger', () => ({
  AdvancedLogger: {
    getInstance: jest.fn().mockReturnValue({
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      clearLogs: jest.fn(),
      showOutputChannel: jest.fn()
    })
  }
}));

describe('Debug Commands', () => {
  let mockContext: vscode.ExtensionContext;
  let mockSubscriptions: { dispose: jest.Mock }[];
  let mockWorkspaceState: { get: jest.Mock; update: jest.Mock };

  let mockAnalyzer: {
    setEnabled: jest.Mock;
    exportCommunicationHistoryToFile: jest.Mock;
    clearHistory: jest.Mock
  };
  let mockDashboard: { show: jest.Mock };
  let mockConfigPanel: { show: jest.Mock };
  let mockLogViewer: { show: jest.Mock };
  let mockCudaDetector: {
    detectCuda: jest.Mock;
    getRecommendedModels: jest.Mock
  };
  let mockModelChecker: { showModelCompatibilityReport: jest.Mock };
  let mockLogger: {
    info: jest.Mock;
    clearLogs: jest.Mock;
    showOutputChannel: jest.Mock
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockSubscriptions = [];
    mockWorkspaceState = {
      get: jest.fn().mockReturnValue(false),
      update: jest.fn().mockResolvedValue(undefined)
    };

    mockContext = {
      subscriptions: mockSubscriptions,
      workspaceState: mockWorkspaceState
    } as unknown as vscode.ExtensionContext;

    // Get the mock instances
    mockAnalyzer = CopilotCommunicationAnalyzer.getInstance() as any;
    mockDashboard = DebugDashboard.getInstance() as any;
    mockConfigPanel = DebugConfigPanel.getInstance() as any;
    mockLogViewer = LogViewer.getInstance() as any;
    mockCudaDetector = CudaDetector.getInstance() as any;
    mockModelChecker = ModelCompatibilityChecker.getInstance() as any;
    mockLogger = AdvancedLogger.getInstance() as any;

    // Register the debug commands to test
    registerDebugCommands(mockContext);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should register all debug commands', () => {
    // Check that registerCommand was called for each command
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilot-ppa.showDebugDashboard',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilot-ppa.showDebugConfig',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilot-ppa.showLogViewer',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilot-ppa.toggleCommunicationAnalyzer',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilot-ppa.exportCommunicationData',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilot-ppa.clearCommunicationHistory',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilot-ppa.checkCudaSupport',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilot-ppa.checkModelCompatibility',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilot-ppa.getModelRecommendations',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilot-ppa.clearLogs',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilot-ppa.showOutputChannel',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilot-ppa.exportLogs',
      expect.any(Function)
    );
  });

  test('showDebugDashboard command should show the debug dashboard', () => {
    // Get the registered command handler
    const showDebugDashboardHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilot-ppa.showDebugDashboard'
    )[1];

    // Call the handler
    showDebugDashboardHandler();

    // Verify the dashboard show method was called
    expect(mockDashboard.show).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Opening debug dashboard',
      expect.anything(),
      'DebugCommands'
    );
  });

  test('showDebugConfig command should show the debug configuration panel', () => {
    // Get the registered command handler
    const showDebugConfigHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilot-ppa.showDebugConfig'
    )[1];

    // Call the handler
    showDebugConfigHandler();

    // Verify the config panel show method was called
    expect(mockConfigPanel.show).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Opening debug configuration',
      expect.anything(),
      'DebugCommands'
    );
  });

  test('showLogViewer command should show the log viewer', () => {
    // Get the registered command handler
    const showLogViewerHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilot-ppa.showLogViewer'
    )[1];

    // Call the handler
    showLogViewerHandler();

    // Verify the log viewer show method was called
    expect(mockLogViewer.show).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Opening log viewer',
      expect.anything(),
      'DebugCommands'
    );
  });

  test('toggleCommunicationAnalyzer command should toggle analyzer state', async () => {
    // Get the registered command handler
    const toggleCommunicationAnalyzerHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilot-ppa.toggleCommunicationAnalyzer'
    )[1];

    // Set initial state
    mockWorkspaceState.get.mockReturnValue(false);

    // Call the handler
    await toggleCommunicationAnalyzerHandler();

    // Verify the analyzer was enabled and state was updated
    expect(mockAnalyzer.setEnabled).toHaveBeenCalledWith(true);
    expect(mockWorkspaceState.update).toHaveBeenCalledWith('copilotAnalyzerEnabled', true);
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Copilot communication analyzer enabled'
    );

    // Reset and test disabling
    jest.clearAllMocks();
    mockWorkspaceState.get.mockReturnValue(true);

    // Call the handler again
    await toggleCommunicationAnalyzerHandler();

    // Verify the analyzer was disabled and state was updated
    expect(mockAnalyzer.setEnabled).toHaveBeenCalledWith(false);
    expect(mockWorkspaceState.update).toHaveBeenCalledWith('copilotAnalyzerEnabled', false);
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Copilot communication analyzer disabled'
    );
  });

  test('exportCommunicationData command should export history to file', async () => {
    // Get the registered command handler
    const exportCommunicationDataHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilot-ppa.exportCommunicationData'
    )[1];

    // Call the handler
    await exportCommunicationDataHandler();

    // Verify export method was called and user was notified
    expect(mockAnalyzer.exportCommunicationHistoryToFile).toHaveBeenCalled();
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Copilot communication data exported to /path/to/export.json'
    );

    // Test when no file path is returned (export cancelled or failed)
    mockAnalyzer.exportCommunicationHistoryToFile.mockResolvedValue(null);
    jest.clearAllMocks();

    // Call the handler again
    await exportCommunicationDataHandler();

    // Verify export was attempted but no message was shown
    expect(mockAnalyzer.exportCommunicationHistoryToFile).toHaveBeenCalled();
    expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
  });

  test('clearCommunicationHistory command should clear history', () => {
    // Get the registered command handler
    const clearCommunicationHistoryHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilot-ppa.clearCommunicationHistory'
    )[1];

    // Call the handler
    clearCommunicationHistoryHandler();

    // Verify history was cleared and user was notified
    expect(mockAnalyzer.clearHistory).toHaveBeenCalled();
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Copilot communication history cleared'
    );
  });

  test('checkCudaSupport command should detect CUDA and show results', async () => {
    // Get the registered command handler
    const checkCudaSupportHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilot-ppa.checkCudaSupport'
    )[1];

    // Mock showInformationMessage to simulate clicking "Show Details"
    (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Show Details');

    // Call the handler
    await checkCudaSupportHandler();

    // Verify CUDA detection was performed
    expect(mockCudaDetector.detectCuda).toHaveBeenCalled();
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'CUDA support detected: NVIDIA GeForce RTX 3080 (10240MB)',
      'Show Details'
    );

    // Verify dashboard is shown when "Show Details" is clicked
    expect(mockDashboard.show).toHaveBeenCalled();

    // Test case when CUDA is not available
    jest.clearAllMocks();
    mockCudaDetector.detectCuda.mockResolvedValue({ isAvailable: false });

    // Call the handler again
    await checkCudaSupportHandler();

    // Verify message for no CUDA support
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'CUDA support not detected',
      'Show Details'
    );

    // Test error handling
    jest.clearAllMocks();
    const testError = new Error('CUDA detection failed');
    mockCudaDetector.detectCuda.mockRejectedValue(testError);

    // Call the handler again
    await checkCudaSupportHandler();

    // Verify error message is shown
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      'Failed to check CUDA support: Error: CUDA detection failed'
    );
  });

  test('checkModelCompatibility command should show compatibility report', async () => {
    // Get the registered command handler
    const checkModelCompatibilityHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilot-ppa.checkModelCompatibility'
    )[1];

    // Call the handler
    await checkModelCompatibilityHandler();

    // Verify compatibility report is shown
    expect(mockModelChecker.showModelCompatibilityReport).toHaveBeenCalled();
  });

  test('getModelRecommendations command should get recommendations and show results', async () => {
    // Get the registered command handler
    const getModelRecommendationsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilot-ppa.getModelRecommendations'
    )[1];

    // Mock showInformationMessage to simulate clicking "Show Recommendations"
    (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Show Recommendations');

    // Call the handler
    await getModelRecommendationsHandler();

    // Verify recommendations were fetched
    expect(mockCudaDetector.getRecommendedModels).toHaveBeenCalled();
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Found 2 recommended models for your system',
      'Show Recommendations'
    );

    // Verify compatibility report is shown when "Show Recommendations" is clicked
    expect(mockModelChecker.showModelCompatibilityReport).toHaveBeenCalled();

    // Test case when no recommendations are found
    jest.clearAllMocks();
    mockCudaDetector.getRecommendedModels.mockResolvedValue({
      recommended: [],
      partial: [],
      notRecommended: ['model1', 'model2']
    });

    // Call the handler again
    await getModelRecommendationsHandler();

    // Verify message for no recommendations
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'No recommended models found for your system',
      'Show Recommendations'
    );

    // Test error handling
    jest.clearAllMocks();
    const testError = new Error('Recommendation failed');
    mockCudaDetector.getRecommendedModels.mockRejectedValue(testError);

    // Call the handler again
    await getModelRecommendationsHandler();

    // Verify error message is shown
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      'Failed to get model recommendations: Error: Recommendation failed'
    );
  });

  test('clearLogs command should clear logs', () => {
    // Get the registered command handler
    const clearLogsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilot-ppa.clearLogs'
    )[1];

    // Call the handler
    clearLogsHandler();

    // Verify logs were cleared and user was notified
    expect(mockLogger.clearLogs).toHaveBeenCalled();
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'All logs cleared'
    );
  });

  test('showOutputChannel command should show output channel', () => {
    // Get the registered command handler
    const showOutputChannelHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilot-ppa.showOutputChannel'
    )[1];

    // Call the handler
    showOutputChannelHandler();

    // Verify output channel is shown
    expect(mockLogger.showOutputChannel).toHaveBeenCalled();
  });

  test('exportLogs command should show export options and export logs', async () => {
    // Get the registered command handler
    const exportLogsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilot-ppa.exportLogs'
    )[1];

    // Mock quick pick to return a format selection
    (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({
      label: 'JSON',
      description: 'Export logs as JSON format'
    });

    // Call the handler
    await exportLogsHandler();

    // Verify quick pick was shown with format options
    expect(vscode.window.showQuickPick).toHaveBeenCalledWith(
      [
        { label: 'JSON', description: 'Export logs as JSON format' },
        { label: 'CSV', description: 'Export logs as CSV format' },
        { label: 'Text', description: 'Export logs as plain text' }
      ],
      { placeHolder: 'Select export format' }
    );

    // Verify log viewer is shown
    expect(mockLogViewer.show).toHaveBeenCalled();

    // Verify VS Code messaging command is executed after timeout
    jest.runAllTimers();
    expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
      'workbench:action:webview.message',
      {
        command: 'exportLogs',
        format: 'json'
      }
    );

    // Test cancellation case
    jest.clearAllMocks();
    (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(null);

    // Call the handler again
    await exportLogsHandler();

    // Verify quick pick was shown but no further action was taken
    expect(vscode.window.showQuickPick).toHaveBeenCalled();
    expect(mockLogViewer.show).not.toHaveBeenCalled();
    expect(vscode.commands.executeCommand).not.toHaveBeenCalled();
  });

  test('should initialize analyzer with workspace state', () => {
    // Verify analyzer is initialized with state from workspace
    expect(mockWorkspaceState.get).toHaveBeenCalledWith('copilotAnalyzerEnabled', false);
    expect(mockAnalyzer.setEnabled).toHaveBeenCalledWith(false);
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Copilot communication analyzer initialized (disabled)',
      expect.anything(),
      'DebugCommands'
    );

    // Test with enabled state
    jest.clearAllMocks();
    mockWorkspaceState.get.mockReturnValue(true);

    // Re-register commands with new state
    registerDebugCommands(mockContext);

    // Verify analyzer is initialized with enabled state
    expect(mockAnalyzer.setEnabled).toHaveBeenCalledWith(true);
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Copilot communication analyzer initialized (enabled)',
      expect.anything(),
      'DebugCommands'
    );
  });

  test('should auto open dashboard if configured', () => {
    // Mock configuration to enable auto open
    const mockConfig = vscode.workspace.getConfiguration();
    (mockConfig.get as jest.Mock).mockReturnValue(true);

    // Re-register commands with new config
    jest.clearAllMocks();
    registerDebugCommands(mockContext);

    // Verify dashboard auto open is scheduled
    jest.runAllTimers();
    expect(mockDashboard.show).toHaveBeenCalled();
  });
});
