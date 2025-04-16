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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestItem = exports.TestExplorerProvider = void 0;
exports.registerTestExplorerView = registerTestExplorerView;
const vscode = __importStar(require("vscode"));
/**
 * Tree data provider for the test explorer view
 */
class TestExplorerProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.testResults = new Map();
        this.testItems = [];
        // Initialize with default test types
        this.testItems = [
            new TestItem('Unit Tests', 'unit', vscode.TreeItemCollapsibleState.Expanded),
            new TestItem('Integration Tests', 'integration', vscode.TreeItemCollapsibleState.Expanded),
            new TestItem('E2E Tests', 'e2e', vscode.TreeItemCollapsibleState.Expanded),
            new TestItem('Performance Tests', 'performance', vscode.TreeItemCollapsibleState.Expanded),
            new TestItem('Static Analysis', 'static', vscode.TreeItemCollapsibleState.Expanded),
            new TestItem('Code Coverage', 'coverage', vscode.TreeItemCollapsibleState.Expanded),
            new TestItem('Security Tests', 'security', vscode.TreeItemCollapsibleState.Expanded)
        ];
    }
    /**
     * Update the results for a specific test type
     */
    updateResults(testType, result) {
        this.testResults.set(testType, result);
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
        if (!element) {
            return Promise.resolve(this.testItems);
        }
        // If we have results for this test type, display them
        const result = this.testResults.get(element.testType);
        if (result) {
            const items = [];
            // Add status item
            const statusItem = new TestItem(`Status: ${result.success ? 'Passed' : 'Failed'}`, `${element.testType}-status`, vscode.TreeItemCollapsibleState.None);
            statusItem.iconPath = result.success
                ? new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'))
                : new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
            items.push(statusItem);
            // Add message item
            const messageItem = new TestItem(`Message: ${result.message}`, `${element.testType}-message`, vscode.TreeItemCollapsibleState.None);
            items.push(messageItem);
            // For performance tests, add metrics
            if (element.testType === 'performance' && result.performanceMetrics) {
                const metricsItem = new TestItem('Performance Metrics', `${element.testType}-metrics`, vscode.TreeItemCollapsibleState.Expanded);
                items.push(metricsItem);
                // Add individual metrics as children of the metrics item
                metricsItem.children = Object.entries(result.performanceMetrics).map(([key, value]) => {
                    const metricItem = new TestItem(`${this.formatMetricName(key)}: ${value}`, `${element.testType}-metric-${key}`, vscode.TreeItemCollapsibleState.None);
                    return metricItem;
                });
            }
            // For static analysis, add issues
            if (element.testType === 'static' && result.staticAnalysis) {
                const issueCount = result.staticAnalysis.issueCount || 0;
                const issuesItem = new TestItem(`Issues: ${issueCount}`, `${element.testType}-issues`, issueCount > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None);
                if (issueCount > 0) {
                    issuesItem.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('testing.iconFailed'));
                }
                else {
                    issuesItem.iconPath = new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
                }
                items.push(issuesItem);
                // Add individual issues if available
                if (result.staticAnalysis.issues && result.staticAnalysis.issues.length > 0) {
                    issuesItem.children = result.staticAnalysis.issues.map((issue, index) => {
                        const location = issue.file ?
                            `${issue.file}${issue.line ? `:${issue.line}` : ''}` :
                            'Unknown Location';
                        const severity = issue.severity ?
                            `[${issue.severity.toUpperCase()}]` :
                            '';
                        const issueItem = new TestItem(`${severity} ${location}: ${issue.message}`, `${element.testType}-issue-${index}`, vscode.TreeItemCollapsibleState.None);
                        // Set icon based on severity
                        if (issue.severity?.toLowerCase().includes('error')) {
                            issueItem.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
                        }
                        else if (issue.severity?.toLowerCase().includes('warn')) {
                            issueItem.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('testing.iconSkipped'));
                        }
                        else {
                            issueItem.iconPath = new vscode.ThemeIcon('info', new vscode.ThemeColor('testing.iconQueued'));
                        }
                        // Add command to jump to the file location if available
                        if (issue.file && issue.line) {
                            issueItem.command = {
                                command: 'localLLMAgent.openFileAtLocation',
                                title: 'Open File',
                                arguments: [issue.file, issue.line, issue.col]
                            };
                        }
                        return issueItem;
                    });
                }
            }
            // For code coverage, add coverage information
            if (element.testType === 'coverage' && result.codeCoverage) {
                const coverage = result.codeCoverage;
                // Add overall coverage
                const overallItem = new TestItem(`Overall: ${coverage.overall.toFixed(2)}%`, `${element.testType}-overall`, vscode.TreeItemCollapsibleState.None);
                this.setCoverageIcon(overallItem, coverage.overall);
                items.push(overallItem);
                // Add breakdown by type
                const statementsItem = new TestItem(`Statements: ${coverage.statements.toFixed(2)}%`, `${element.testType}-statements`, vscode.TreeItemCollapsibleState.None);
                this.setCoverageIcon(statementsItem, coverage.statements);
                items.push(statementsItem);
                const branchesItem = new TestItem(`Branches: ${coverage.branches.toFixed(2)}%`, `${element.testType}-branches`, vscode.TreeItemCollapsibleState.None);
                this.setCoverageIcon(branchesItem, coverage.branches);
                items.push(branchesItem);
                const functionsItem = new TestItem(`Functions: ${coverage.functions.toFixed(2)}%`, `${element.testType}-functions`, vscode.TreeItemCollapsibleState.None);
                this.setCoverageIcon(functionsItem, coverage.functions);
                items.push(functionsItem);
                const linesItem = new TestItem(`Lines: ${coverage.lines.toFixed(2)}%`, `${element.testType}-lines`, vscode.TreeItemCollapsibleState.None);
                this.setCoverageIcon(linesItem, coverage.lines);
                items.push(linesItem);
                // Add files section if available
                if (coverage.files && coverage.files.length > 0) {
                    const filesItem = new TestItem(`Files (${coverage.totalFiles})`, `${element.testType}-files`, vscode.TreeItemCollapsibleState.Collapsed);
                    items.push(filesItem);
                    // Add file items as children
                    filesItem.children = coverage.files.map((file, index) => {
                        const fileItem = new TestItem(`${file.path}: ${file.overall.toFixed(2)}%`, `${element.testType}-file-${index}`, vscode.TreeItemCollapsibleState.None);
                        this.setCoverageIcon(fileItem, file.overall);
                        // Add command to open the file
                        fileItem.command = {
                            command: 'localLLMAgent.openFileAtLocation',
                            title: 'Open File',
                            arguments: [file.path, 1, 1]
                        };
                        return fileItem;
                    });
                }
            }
            // For security tests, add vulnerability information
            if (element.testType === 'security' && result.securityTest) {
                const securityTest = result.securityTest;
                const summary = securityTest.summary;
                // Add summary item
                const summaryItem = new TestItem(`Vulnerabilities: ${summary.total}`, `${element.testType}-summary`, vscode.TreeItemCollapsibleState.Expanded);
                items.push(summaryItem);
                // Add breakdown by severity
                const criticalItem = new TestItem(`Critical: ${summary.critical}`, `${element.testType}-critical`, summary.critical > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
                criticalItem.iconPath = summary.critical > 0
                    ? new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'))
                    : new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
                const highItem = new TestItem(`High: ${summary.high}`, `${element.testType}-high`, summary.high > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
                highItem.iconPath = summary.high > 0
                    ? new vscode.ThemeIcon('warning', new vscode.ThemeColor('testing.iconFailed'))
                    : new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
                const mediumItem = new TestItem(`Medium: ${summary.medium}`, `${element.testType}-medium`, summary.medium > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
                mediumItem.iconPath = summary.medium > 0
                    ? new vscode.ThemeIcon('warning', new vscode.ThemeColor('testing.iconSkipped'))
                    : new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
                const lowItem = new TestItem(`Low: ${summary.low}`, `${element.testType}-low`, summary.low > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
                lowItem.iconPath = summary.low > 0
                    ? new vscode.ThemeIcon('info', new vscode.ThemeColor('testing.iconQueued'))
                    : new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
                const infoItem = new TestItem(`Info: ${summary.info}`, `${element.testType}-info`, summary.info > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
                infoItem.iconPath = summary.info > 0
                    ? new vscode.ThemeIcon('info', new vscode.ThemeColor('testing.iconQueued'))
                    : new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
                // Add vulnerabilities as children to each severity category
                if (summary.critical > 0) {
                    criticalItem.children = securityTest.vulnerabilities
                        .filter(v => v.severity === 'critical')
                        .map((vuln, i) => this.createVulnerabilityItem(vuln, `${element.testType}-critical-${i}`));
                }
                if (summary.high > 0) {
                    highItem.children = securityTest.vulnerabilities
                        .filter(v => v.severity === 'high')
                        .map((vuln, i) => this.createVulnerabilityItem(vuln, `${element.testType}-high-${i}`));
                }
                if (summary.medium > 0) {
                    mediumItem.children = securityTest.vulnerabilities
                        .filter(v => v.severity === 'medium')
                        .map((vuln, i) => this.createVulnerabilityItem(vuln, `${element.testType}-medium-${i}`));
                }
                if (summary.low > 0) {
                    lowItem.children = securityTest.vulnerabilities
                        .filter(v => v.severity === 'low')
                        .map((vuln, i) => this.createVulnerabilityItem(vuln, `${element.testType}-low-${i}`));
                }
                if (summary.info > 0) {
                    infoItem.children = securityTest.vulnerabilities
                        .filter(v => v.severity === 'info')
                        .map((vuln, i) => this.createVulnerabilityItem(vuln, `${element.testType}-info-${i}`));
                }
                items.push(criticalItem, highItem, mediumItem, lowItem, infoItem);
            }
            return Promise.resolve(items);
        }
        return Promise.resolve([]);
    }
    /**
     * Format a metric name for display
     */
    formatMetricName(key) {
        // Convert camelCase to Title Case With Spaces
        const formatted = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
        // Handle common metrics with special formatting
        if (key === 'executionTimeMs') {
            return 'Execution Time (ms)';
        }
        else if (key === 'memoryUsageMB') {
            return 'Memory Usage (MB)';
        }
        else if (key === 'requestsPerSecond') {
            return 'Requests Per Second';
        }
        return formatted;
    }
    /**
     * Set icon for coverage items based on coverage percentage
     */
    setCoverageIcon(item, coverage) {
        if (coverage >= 80) {
            item.iconPath = new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
        }
        else if (coverage >= 60) {
            item.iconPath = new vscode.ThemeIcon('pass', new vscode.ThemeColor('testing.iconSkipped'));
        }
        else if (coverage >= 40) {
            item.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('testing.iconQueued'));
        }
        else {
            item.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
        }
    }
    /**
     * Create a tree item for a vulnerability
     */
    createVulnerabilityItem(vuln, id) {
        const packageInfo = vuln.package ? ` in ${vuln.package}${vuln.version ? ` (${vuln.version})` : ''}` : '';
        const label = `${vuln.id}: ${vuln.description}${packageInfo}`;
        const item = new TestItem(label, id, vscode.TreeItemCollapsibleState.None);
        // Set icon based on severity
        switch (vuln.severity) {
            case 'critical':
                item.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
                break;
            case 'high':
                item.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('testing.iconFailed'));
                break;
            case 'medium':
                item.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('testing.iconSkipped'));
                break;
            default:
                item.iconPath = new vscode.ThemeIcon('info', new vscode.ThemeColor('testing.iconQueued'));
                break;
        }
        // Add command to open the URL if available
        if (vuln.url) {
            item.command = {
                command: 'vscode.open',
                title: 'Open URL',
                arguments: [vscode.Uri.parse(vuln.url)]
            };
        }
        return item;
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
//# sourceMappingURL=testExplorerView.js.map