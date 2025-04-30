import * as vscode from 'vscode';
import { TestReporter } from './testReporting';
export * from './testTypes';
export * from './testReporting';
/**
 * Register commands for test reporting and trend analysis
 */
export declare function registerTestReportingCommands(context: vscode.ExtensionContext): TestReporter;
