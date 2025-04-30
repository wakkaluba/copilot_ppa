import * as vscode from 'vscode';
import { TestResult } from '../services/testRunner/testRunnerTypes';
/**
 * Tree data provider for the test explorer view
 */
export declare class TestExplorerProvider implements vscode.TreeDataProvider<TestItem> {
    private _onDidChangeTreeData?;
    readonly onDidChangeTreeData?: vscode.Event<TestItem>;
    private service;
    constructor();
    /**
     * Update the results for a specific test type
     */
    updateResults(testType: string, result: TestResult): void;
    /**
     * Get the tree item for a given element
     */
    getTreeItem(element: TestItem): vscode.TreeItem;
    /**
     * Get the children of a given element
     */
    getChildren(element?: TestItem): Thenable<TestItem[]>;
}
/**
 * Tree item representing a test or test result
 */
export declare class TestItem extends vscode.TreeItem {
    readonly label: string;
    readonly testType: string;
    readonly collapsibleState: vscode.TreeItemCollapsibleState;
    constructor(label: string, testType: string, collapsibleState: vscode.TreeItemCollapsibleState);
}
/**
 * Register the test explorer view
 */
export declare function registerTestExplorerView(context: vscode.ExtensionContext): TestExplorerProvider;
