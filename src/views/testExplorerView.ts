import * as vscode from 'vscode';
import { TestResult } from '../services/testRunner/testRunnerTypes';
import { TestExplorerService } from './services/TestExplorerService';

/**
 * Tree data provider for the test explorer view
 */
export class TestExplorerProvider implements vscode.TreeDataProvider<TestItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TestItem | undefined> = new vscode.EventEmitter<TestItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TestItem | undefined> = this._onDidChangeTreeData.event;

    private service: TestExplorerService;

    constructor() {
        this.service = new TestExplorerService();
    }

    /**
     * Update the results for a specific test type
     */
    public updateResults(testType: string, result: TestResult): void {
        this.service.updateResults(testType, result);
        this._onDidChangeTreeData.fire(undefined);
    }

    /**
     * Get the tree item for a given element
     */
    getTreeItem(element: TestItem): vscode.TreeItem {
        return element;
    }

    /**
     * Get the children of a given element
     */
    getChildren(element?: TestItem): Thenable<TestItem[]> {
        return this.service.getChildren(element);
    }
}

/**
 * Tree item representing a test or test result
 */
export class TestItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly testType: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        
        // Set up command for running the test when clicked, if it's a main test category
        if (testType === 'unit' || testType === 'integration' || testType === 'e2e') {
            // Convert testType to proper case for command name (e.g., "e2e" to "E2E")
            let commandTestType = testType;
            if (testType === 'e2e') {
                commandTestType = 'E2E';
            } else {
                commandTestType = testType.charAt(0).toUpperCase() + testType.slice(1);
            }

            this.command = {
                command: `localLLMAgent.run${commandTestType}Tests`,
                title: `Run ${testType} tests`,
                arguments: []
            };
            this.contextValue = 'test';
            this.iconPath = new vscode.ThemeIcon('beaker');
        }
    }
}

/**
 * Register the test explorer view
 */
export function registerTestExplorerView(context: vscode.ExtensionContext): TestExplorerProvider {
    const testExplorerProvider = new TestExplorerProvider();
    
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider(
            'localLLMAgentTestExplorer',
            testExplorerProvider
        )
    );
    
    return testExplorerProvider;
}
