import * as fs from 'fs';
import * as vscode from 'vscode';
import { TestResult } from './test-types';
import { TestReporter } from './testReporting';

jest.mock('vscode', () => ({
  window: {
    createOutputChannel: jest.fn(() => ({
      clear: jest.fn(),
      appendLine: jest.fn(),
      show: jest.fn(),
    })),
    showQuickPick: jest.fn(),
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
  },
  workspace: {
    workspaceFolders: [{ uri: { fsPath: '/mock/workspace' } }],
  },
  commands: {
    executeCommand: jest.fn(),
  },
  Uri: {
    file: jest.fn((filePath: string) => ({ fsPath: filePath })),
  },
  ViewColumn: { One: 1 },
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.requireActual('path').join,
  basename: jest.requireActual('path').basename,
}));

const mockContext = {
  globalState: {
    get: jest.fn(),
    update: jest.fn(),
  },
} as unknown as vscode.ExtensionContext;

// Fix test data shape for suites
const sampleTestResult: TestResult = {
  totalTests: 3,
  passed: 2,
  failed: 1,
  skipped: 0,
  duration: 100,
  suites: [
    { name: 'Suite 1', tests: [] },
    { name: 'Suite 2', tests: [] },
  ],
};

describe('TestReporter', () => {
  let reporter: TestReporter;

  beforeEach(() => {
    jest.clearAllMocks();
    (vscode.window.createOutputChannel as jest.Mock).mockReturnValue({
      clear: jest.fn(),
      appendLine: jest.fn(),
      show: jest.fn(),
    });
    reporter = new TestReporter(mockContext);
  });

  it('should format and display results', () => {
    reporter.formatAndDisplayResults(sampleTestResult);
    // For test-only access to private members, use type assertion to 'any' with a linter suppression comment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-only access to private member
    const channel = (reporter as any).outputChannel;
    expect(channel.clear).toHaveBeenCalled();
    expect(channel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Test Results'));
    expect(channel.show).toHaveBeenCalled();
    expect(mockContext.globalState.update).toHaveBeenCalled();
  });

  it('should export test results as JSON', async () => {
    (vscode.window.showQuickPick as jest.Mock).mockResolvedValue('JSON');
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue(undefined);
    await reporter.exportTestResults(sampleTestResult);
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('test-report_'),
      expect.stringContaining('"totalTests": 3'),
    );
  });

  it('should export test results as HTML', async () => {
    (vscode.window.showQuickPick as jest.Mock).mockResolvedValue('HTML');
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Open File');
    await reporter.exportTestResults(sampleTestResult);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('.html'),
      expect.stringContaining('<!DOCTYPE html>'),
    );
    expect(vscode.commands.executeCommand).toHaveBeenCalled();
  });

  it('should export test results as Markdown', async () => {
    (vscode.window.showQuickPick as jest.Mock).mockResolvedValue('Markdown');
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue(undefined);
    await reporter.exportTestResults(sampleTestResult);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('.md'),
      expect.stringContaining('# Test Report'),
    );
  });

  it('should export test results as CSV', async () => {
    (vscode.window.showQuickPick as jest.Mock).mockResolvedValue('CSV');
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue(undefined);
    await reporter.exportTestResults(sampleTestResult);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('.csv'),
      expect.stringContaining('"Suite","Test","Status","Duration (ms)","Error"'),
    );
  });

  it('should handle export cancellation', async () => {
    (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
    await reporter.exportTestResults(sampleTestResult);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('should show error if no workspace folder', async () => {
    (vscode.window.showQuickPick as jest.Mock).mockResolvedValue('JSON');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-only override for workspaceFolders
    (vscode.workspace as any).workspaceFolders = undefined;
    await reporter.exportTestResults(sampleTestResult);
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      expect.stringContaining('No workspace folder is open'),
    );
    // restore for other tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-only override for workspaceFolders
    (vscode.workspace as any).workspaceFolders = [{ uri: { fsPath: '/mock/workspace' } }];
  });

  it('should show historical trends with no data', async () => {
    (mockContext.globalState.get as jest.Mock).mockReturnValue(undefined);
    const reporter2 = new TestReporter(mockContext);
    await reporter2.showHistoricalTrends();
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining('No historical test data'),
    );
  });

  it('should show historical trends with data', async () => {
    (mockContext.globalState.get as jest.Mock).mockReturnValue({
      'mock-workspace': [
        {
          timestamp: new Date().toISOString(),
          totalTests: 2,
          passed: 2,
          failed: 0,
          skipped: 0,
          duration: 10,
          passRate: 1,
        },
      ],
    });
    const reporter2 = new TestReporter(mockContext);
    // @ts-expect-error: Accessing private property for test coverage
    vscode.window.createWebviewPanel = jest.fn(() => ({ webview: { html: '' } }));
    await reporter2.showHistoricalTrends();
    expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
  });

  it('should generate correct HTML/Markdown/CSV content', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-only access to private method
    const html = (reporter as any).generateHtmlReport(sampleTestResult);
    expect(html).toContain('<!DOCTYPE html>');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-only access to private method
    const md = (reporter as any).generateMarkdownReport(sampleTestResult);
    expect(md).toContain('# Test Report');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-only access to private method
    const csv = (reporter as any).generateCsvReport(sampleTestResult);
    expect(csv).toContain('"Suite","Test","Status","Duration (ms)","Error"');
  });
});
