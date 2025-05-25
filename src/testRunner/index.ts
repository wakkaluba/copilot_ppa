import * as vscode from 'vscode';
import { TestResult } from './test-types';
import { TestReporter } from './testReporting';

export * from './test-types';
export * from './testReporting';

/**
 * Register commands for test reporting and trend analysis
 */
export function registerTestReportingCommands(context: vscode.ExtensionContext): TestReporter {
  // Create test reporter instance
  const testReporter = new TestReporter(context);

  // Register command to show test trends
  context.subscriptions.push(
    vscode.commands.registerCommand('localLlmAgent.showTestTrends', () => {
      testReporter.showHistoricalTrends();
    }),
  );

  // Register command to export test results
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'localLlmAgent.exportTestResults',
      (testResults: TestResult) => {
        testReporter.exportTestResults(testResults);
      },
    ),
  );

  return testReporter;
}
