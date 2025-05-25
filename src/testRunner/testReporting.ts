import * as vscode from 'vscode';
import { ITestCase, ITestSuite, TestResult } from './test-types';

/**
 * Class responsible for test reporting, trend analysis, and export functionality
 */
export class TestReporter {
  private context: vscode.ExtensionContext;
  private historicalData: Map<string, ITestHistoryEntry[]>;
  private outputChannel: vscode.OutputChannel;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.historicalData = new Map<string, ITestHistoryEntry[]>();
    this.outputChannel = vscode.window.createOutputChannel('Test Reports');
    // TODO: Implement loadHistoricalData
    // this.loadHistoricalData();
  }

  /**
   * Format and display test results in the UI
   */
  public formatAndDisplayResults(testResults: TestResult): void {
    this.outputChannel.clear();
    this.outputChannel.appendLine(`# Test Results - ${new Date().toLocaleString()}`);
    this.outputChannel.appendLine('');

    this.outputChannel.appendLine(`Total tests: ${testResults.totalTests}`);
    this.outputChannel.appendLine(
      `Passed: ${testResults.passed} (${Math.round((testResults.passed / testResults.totalTests) * 100)}%)`,
    );
    this.outputChannel.appendLine(`Failed: ${testResults.failed}`);
    this.outputChannel.appendLine(`Skipped: ${testResults.skipped}`);
    this.outputChannel.appendLine(`Duration: ${testResults.duration}ms`);
    this.outputChannel.appendLine('');

    testResults.suites.forEach(() => {
      // TODO: Implement displayTestSuite
      // this.displayTestSuite(suite, 0);
    });

    // Persist to globalState for test history (for test coverage)
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      const folder = workspaceFolders[0].uri.fsPath;
      const key = 'testHistory';
      const prev = this.context.globalState.get<Record<string, ITestHistoryEntry[]>>(key) || {};
      const entry: ITestHistoryEntry = {
        date: new Date().toISOString(),
        passed: testResults.passed,
        failed: testResults.failed,
        skipped: testResults.skipped,
        duration: testResults.duration,
      };
      const arr = prev[folder] || [];
      arr.push(entry);
      prev[folder] = arr;
      this.context.globalState.update(key, prev);
    }

    this.outputChannel.show();
  }

  /**
   * Export test results in various formats (JSON, HTML, Markdown, CSV)
   */
  public async exportTestResults(testResults: TestResult): Promise<void> {
    const format = await vscode.window.showQuickPick(['JSON', 'HTML', 'Markdown', 'CSV'], {
      placeHolder: 'Select export format',
    });
    if (!format) return;
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder is open for export.');
      return;
    }
    const folder = workspaceFolders[0].uri.fsPath;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let filePath = '';
    let content = '';
    switch (format) {
      case 'JSON':
        filePath = `${folder}/test-report_${timestamp}.json`;
        content = JSON.stringify(testResults, null, 2);
        break;
      case 'HTML':
        filePath = `${folder}/test-report_${timestamp}.html`;
        content = this.generateHtmlReport(testResults);
        break;
      case 'Markdown':
        filePath = `${folder}/test-report_${timestamp}.md`;
        content = this.generateMarkdownReport(testResults);
        break;
      case 'CSV':
        filePath = `${folder}/test-report_${timestamp}.csv`;
        content = this.generateCsvReport(testResults);
        break;
      default:
        return;
    }
    const fs = await import('fs');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(filePath, content);
    const open = await vscode.window.showInformationMessage(
      `Test report exported: ${filePath}`,
      'Open File',
    );
    if (open === 'Open File') {
      await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(filePath));
    }
  }

  /**
   * Show historical test trends in a webview or message
   */
  public async showHistoricalTrends(): Promise<void> {
    const data = this.context.globalState.get<Record<string, unknown>>('testHistory');
    if (!data) {
      vscode.window.showInformationMessage('No historical test data available.');
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'testTrends',
      'Test Trends',
      vscode.ViewColumn.One,
      {},
    );
    panel.webview.html = `<html><body><h1>Test Trends</h1><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`;
  }

  // Private report generators for test output
  private generateHtmlReport(testResults: TestResult): string {
    return `<!DOCTYPE html><html><head><title>Test Report</title></head><body><h1>Test Report</h1><pre>${JSON.stringify(testResults, null, 2)}</pre></body></html>`;
  }
  private generateMarkdownReport(testResults: TestResult): string {
    return `# Test Report\n\n\`\`\`json\n${JSON.stringify(testResults, null, 2)}\n\`\`\``;
  }
  private generateCsvReport(testResults: TestResult): string {
    let csv = '"Suite","Test","Status","Duration (ms)","Error"\n';
    const walk = (suite: ITestSuite): void => {
      (suite.tests || []).forEach((test: ITestCase) => {
        csv += `"${suite.name}","${test.name}","${test.status || ''}","${test.duration || ''}","${test.error || ''}"\n`;
      });
      (suite.suites || []).forEach(walk);
    };
    (testResults.suites || []).forEach(walk);
    return csv;
  }
}

// Define ITestHistoryEntry if not already defined elsewhere
export interface ITestHistoryEntry {
  date: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}
