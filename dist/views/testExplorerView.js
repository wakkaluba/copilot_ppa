"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTestExplorerView = exports.TestItem = exports.TestExplorerProvider = void 0;
const vscode = __importStar(require("vscode"));
const TestExplorerService_1 = require("./services/TestExplorerService");
/**
 * Tree data provider for the test explorer view
 */
class TestExplorerProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.service = new TestExplorerService_1.TestExplorerService();
    }
    /**
     * Update the results for a specific test type
     */
    updateResults(testType, result) {
        this.service.updateResults(testType, result);
        this._onDidChangeTreeData.fire(undefined);
    }
    /**
     * Get the tree item for a given element
     */
    getTreeItem(element) {
        return element;
    }
    /**
     * Get the children of a given element
     */
    getChildren(element) {
        return this.service.getChildren(element);
    }
}
exports.TestExplorerProvider = TestExplorerProvider;
/**
 * Tree item representing a test or test result
 */
class TestItem extends vscode.TreeItem {
    constructor(label, testType, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.testType = testType;
        this.collapsibleState = collapsibleState;
        // Set up command for running the test when clicked, if it's a main test category
        if (testType === 'unit' || testType === 'integration' || testType === 'e2e') {
            // Convert testType to proper case for command name (e.g., "e2e" to "E2E")
            let commandTestType = testType;
            if (testType === 'e2e') {
                commandTestType = 'E2E';
            }
            else {
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
exports.TestItem = TestItem;
/**
 * Register the test explorer view
 */
function registerTestExplorerView(context) {
    const testExplorerProvider = new TestExplorerProvider();
    context.subscriptions.push(vscode.window.registerTreeDataProvider('localLLMAgentTestExplorer', testExplorerProvider));
    return testExplorerProvider;
}
exports.registerTestExplorerView = registerTestExplorerView;
//# sourceMappingURL=testExplorerView.js.map