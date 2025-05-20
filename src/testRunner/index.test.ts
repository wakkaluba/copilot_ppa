import * as vscode from 'vscode';
import { registerTestReportingCommands } from './index';
import { TestReporter } from './testReporting';

jest.mock('vscode', () => ({
  commands: {
    registerCommand: jest.fn((_cmd, cb) => cb)
  }
}));

describe('registerTestReportingCommands', () => {
  it('registers commands and returns TestReporter', () => {
    const context = { subscriptions: [] } as unknown as vscode.ExtensionContext;
    const reporter = registerTestReportingCommands(context);
    expect(reporter).toBeInstanceOf(TestReporter);
    expect(context.subscriptions.length).toBeGreaterThanOrEqual(2);
  });
});
