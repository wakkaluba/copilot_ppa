"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestItem = exports.TestExplorerProvider = void 0;
exports.registerTestExplorerView = registerTestExplorerView;
var vscode = require("vscode");
var TestExplorerService_1 = require("./services/TestExplorerService");
/**
 * Tree data provider for the test explorer view
 */
var TestExplorerProvider = /** @class */ (function () {
    function TestExplorerProvider() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.service = new TestExplorerService_1.TestExplorerService();
    }
    /**
     * Update the results for a specific test type
     */
    TestExplorerProvider.prototype.updateResults = function (testType, result) {
        this.service.updateResults(testType, result);
        this._onDidChangeTreeData.fire(undefined);
    };
    /**
     * Get the tree item for a given element
     */
    TestExplorerProvider.prototype.getTreeItem = function (element) {
        return element;
    };
    /**
     * Get the children of a given element
     */
    TestExplorerProvider.prototype.getChildren = function (element) {
        return this.service.getChildren(element);
    };
    return TestExplorerProvider;
}());
exports.TestExplorerProvider = TestExplorerProvider;
/**
 * Tree item representing a test or test result
 */
var TestItem = /** @class */ (function (_super) {
    __extends(TestItem, _super);
    function TestItem(label, testType, collapsibleState) {
        var _this = _super.call(this, label, collapsibleState) || this;
        _this.label = label;
        _this.testType = testType;
        _this.collapsibleState = collapsibleState;
        // Set up command for running the test when clicked, if it's a main test category
        if (testType === 'unit' || testType === 'integration' || testType === 'e2e') {
            // Convert testType to proper case for command name (e.g., "e2e" to "E2E")
            var commandTestType = testType;
            if (testType === 'e2e') {
                commandTestType = 'E2E';
            }
            else {
                commandTestType = testType.charAt(0).toUpperCase() + testType.slice(1);
            }
            _this.command = {
                command: "localLLMAgent.run".concat(commandTestType, "Tests"),
                title: "Run ".concat(testType, " tests"),
                arguments: []
            };
            _this.contextValue = 'test';
            _this.iconPath = new vscode.ThemeIcon('beaker');
        }
        return _this;
    }
    return TestItem;
}(vscode.TreeItem));
exports.TestItem = TestItem;
/**
 * Register the test explorer view
 */
function registerTestExplorerView(context) {
    var testExplorerProvider = new TestExplorerProvider();
    context.subscriptions.push(vscode.window.registerTreeDataProvider('localLLMAgentTestExplorer', testExplorerProvider));
    return testExplorerProvider;
}
