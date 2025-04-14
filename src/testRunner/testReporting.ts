import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { TestResult, TestSuite, TestCase } from './testTypes';

/**
 * Class responsible for test reporting, trend analysis, and export functionality
 */
export class TestReporter {
    private context: vscode.ExtensionContext;
    private historicalData: Map<string, TestHistoryEntry[]>;
    private outputChannel: vscode.OutputChannel;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.historicalData = new Map<string, TestHistoryEntry[]>();
        this.outputChannel = vscode.window.createOutputChannel('Test Reports');
        this.loadHistoricalData();
    }

    /**
     * Format and display test results in the UI
     */
    public formatAndDisplayResults(testResults: TestResult): void {
        this.outputChannel.clear();
        this.outputChannel.appendLine(`# Test Results - ${new Date().toLocaleString()}`);
        this.outputChannel.appendLine('');
        
        this.outputChannel.appendLine(`Total tests: ${testResults.totalTests}`);
        this.outputChannel.appendLine(`Passed: ${testResults.passed} (${Math.round(testResults.passed / testResults.totalTests * 100)}%)`);
        this.outputChannel.appendLine(`Failed: ${testResults.failed}`);
        this.outputChannel.appendLine(`Skipped: ${testResults.skipped}`);
        this.outputChannel.appendLine(`Duration: ${testResults.duration}ms`);
        this.outputChannel.appendLine('');
        
        testResults.suites.forEach(suite => {
            this.displayTestSuite(suite, 0);
        });
        
        this.outputChannel.show();
        
        // Save historical data
        this.saveTestResultHistory(testResults);
    }

    /**
     * Display a test suite and its tests with proper indentation
     */
    private displayTestSuite(suite: TestSuite, indentLevel: number): void {
        const indent = '  '.repeat(indentLevel);
        this.outputChannel.appendLine(`${indent}## ${suite.name}`);
        
        suite.tests.forEach(test => {
            const status = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏩';
            this.outputChannel.appendLine(`${indent}  ${status} ${test.name} (${test.duration}ms)`);
            
            if (test.status === 'failed' && test.error) {
                this.outputChannel.appendLine(`${indent}    Error: ${test.error}`);
                if (test.stackTrace) {
                    this.outputChannel.appendLine(`${indent}    Stack: ${test.stackTrace}`);
                }
            }
        });
        
        suite.suites.forEach(childSuite => {
            this.displayTestSuite(childSuite, indentLevel + 1);
        });
    }

    /**
     * Save test results to historical data
     */
    private saveTestResultHistory(testResults: TestResult): void {
        const historyEntry: TestHistoryEntry = {
            timestamp: new Date(),
            totalTests: testResults.totalTests,
            passed: testResults.passed,
            failed: testResults.failed,
            skipped: testResults.skipped,
            duration: testResults.duration,
            passRate: testResults.passed / testResults.totalTests
        };

        const workspaceName = this.getWorkspaceName();
        
        if (!this.historicalData.has(workspaceName)) {
            this.historicalData.set(workspaceName, []);
        }
        
        const history = this.historicalData.get(workspaceName)!;
        history.push(historyEntry);
        
        // Keep only the last 100 entries to avoid excessive storage
        if (history.length > 100) {
            history.shift();
        }
        
        this.saveHistoricalData();
    }

    /**
     * Analyze historical test trends and display visualization
     */
    public async showHistoricalTrends(): Promise<void> {
        const workspaceName = this.getWorkspaceName();
        
        if (!this.historicalData.has(workspaceName) || this.historicalData.get(workspaceName)!.length === 0) {
            vscode.window.showInformationMessage('No historical test data available for trend analysis.');
            return;
        }
        
        const history = this.historicalData.get(workspaceName)!;
        
        // Create webview to display trends
        const panel = vscode.window.createWebviewPanel(
            'testTrends',
            'Test Trends Analysis',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        
        // Create HTML content with chart.js for visualization
        panel.webview.html = this.generateTrendHtml(history);
    }

    /**
     * Generate HTML for trend visualization
     */
    private generateTrendHtml(history: TestHistoryEntry[]): string {
        const passRateData = history.map(entry => ({
            x: entry.timestamp.getTime(),
            y: entry.passRate * 100
        }));
        
        const durationData = history.map(entry => ({
            x: entry.timestamp.getTime(),
            y: entry.duration
        }));
        
        const totalTestsData = history.map(entry => ({
            x: entry.timestamp.getTime(),
            y: entry.totalTests
        }));
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .chart-container { width: 100%; height: 300px; margin-bottom: 30px; }
                    h1, h2 { color: #333; }
                </style>
            </head>
            <body>
                <h1>Test Trend Analysis</h1>
                
                <h2>Pass Rate Trend</h2>
                <div class="chart-container">
                    <canvas id="passRateChart"></canvas>
                </div>
                
                <h2>Test Duration Trend</h2>
                <div class="chart-container">
                    <canvas id="durationChart"></canvas>
                </div>
                
                <h2>Total Tests Trend</h2>
                <div class="chart-container">
                    <canvas id="totalTestsChart"></canvas>
                </div>
                
                <script>
                    const passRateData = ${JSON.stringify(passRateData)};
                    const durationData = ${JSON.stringify(durationData)};
                    const totalTestsData = ${JSON.stringify(totalTestsData)};
                    
                    function createChart(elementId, label, data, color, yAxisLabel) {
                        const ctx = document.getElementById(elementId).getContext('2d');
                        return new Chart(ctx, {
                            type: 'line',
                            data: {
                                datasets: [{
                                    label: label,
                                    data: data,
                                    borderColor: color,
                                    backgroundColor: color + '33',
                                    fill: true,
                                    tension: 0.4
                                }]
                            },
                            options: {
                                scales: {
                                    x: {
                                        type: 'time',
                                        time: {
                                            unit: 'day'
                                        },
                                        title: {
                                            display: true,
                                            text: 'Date'
                                        }
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: yAxisLabel
                                        }
                                    }
                                }
                            }
                        });
                    }
                    
                    // Create charts when page loads
                    window.addEventListener('load', () => {
                        createChart('passRateChart', 'Pass Rate', passRateData, '#4CAF50', 'Pass Rate (%)');
                        createChart('durationChart', 'Test Duration', durationData, '#2196F3', 'Duration (ms)');
                        createChart('totalTestsChart', 'Total Tests', totalTestsData, '#FFC107', 'Number of Tests');
                    });
                </script>
            </body>
            </html>
        `;
    }

    /**
     * Export test results to a file in different formats
     */
    public async exportTestResults(testResults: TestResult): Promise<void> {
        const format = await vscode.window.showQuickPick(['JSON', 'HTML', 'Markdown', 'CSV'], {
            placeHolder: 'Select export format'
        });
        
        if (!format) {
            return;
        }
        
        try {
            // Get workspace folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error('No workspace folder is open');
            }
            
            // Create test-reports directory if it doesn't exist
            const reportDir = path.join(workspaceFolder.uri.fsPath, 'test-reports');
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            
            // Generate file name based on current date/time
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
            const fileName = `test-report_${timestamp}.${this.getFileExtension(format)}`;
            const filePath = path.join(reportDir, fileName);
            
            // Generate and save the report
            const content = this.generateReportContent(testResults, format);
            fs.writeFileSync(filePath, content);
            
            // Show success message and offer to open the file
            const openFile = await vscode.window.showInformationMessage(
                `Test report exported to ${fileName}`,
                'Open File'
            );
            
            if (openFile === 'Open File') {
                const fileUri = vscode.Uri.file(filePath);
                vscode.commands.executeCommand('vscode.open', fileUri);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to export test results: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Get file extension based on the selected format
     */
    private getFileExtension(format: string): string {
        switch (format) {
            case 'JSON': return 'json';
            case 'HTML': return 'html';
            case 'Markdown': return 'md';
            case 'CSV': return 'csv';
            default: return 'txt';
        }
    }
    
    /**
     * Generate report content in the selected format
     */
    private generateReportContent(testResults: TestResult, format: string): string {
        switch (format) {
            case 'JSON':
                return JSON.stringify(testResults, null, 2);
                
            case 'HTML':
                return this.generateHtmlReport(testResults);
                
            case 'Markdown':
                return this.generateMarkdownReport(testResults);
                
            case 'CSV':
                return this.generateCsvReport(testResults);
                
            default:
                return JSON.stringify(testResults, null, 2);
        }
    }
    
    /**
     * Generate HTML report
     */
    private generateHtmlReport(testResults: TestResult): string {
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Test Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                    .pass { color: #4CAF50; }
                    .fail { color: #F44336; }
                    .skip { color: #FF9800; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f2f2f2; }
                    .error { background-color: #FFEBEE; padding: 10px; border-radius: 3px; margin-top: 5px; }
                </style>
            </head>
            <body>
                <h1>Test Report</h1>
                <div class="summary">
                    <h2>Summary</h2>
                    <p>Date: ${new Date().toLocaleString()}</p>
                    <p>Total tests: ${testResults.totalTests}</p>
                    <p>Passed: <span class="pass">${testResults.passed} (${Math.round(testResults.passed / testResults.totalTests * 100)}%)</span></p>
                    <p>Failed: <span class="fail">${testResults.failed}</span></p>
                    <p>Skipped: <span class="skip">${testResults.skipped}</span></p>
                    <p>Duration: ${testResults.duration}ms</p>
                </div>
        `;
        
        // Add test suites
        testResults.suites.forEach(suite => {
            html += this.generateHtmlForSuite(suite, 0);
        });
        
        html += `
            </body>
            </html>
        `;
        
        return html;
    }
    
    /**
     * Generate HTML for a test suite recursively
     */
    private generateHtmlForSuite(suite: TestSuite, depth: number): string {
        let html = `<h${Math.min(depth + 2, 6)}>${suite.name}</h${Math.min(depth + 2, 6)}>`;
        
        if (suite.tests.length > 0) {
            html += `
                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Test</th>
                            <th>Duration</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            suite.tests.forEach(test => {
                const statusClass = test.status === 'passed' ? 'pass' : test.status === 'failed' ? 'fail' : 'skip';
                const statusText = test.status === 'passed' ? '✅ Passed' : test.status === 'failed' ? '❌ Failed' : '⏩ Skipped';
                
                html += `
                    <tr>
                        <td class="${statusClass}">${statusText}</td>
                        <td>${test.name}</td>
                        <td>${test.duration}ms</td>
                        <td>
                `;
                
                if (test.status === 'failed' && test.error) {
                    html += `<div class="error">Error: ${test.error}`;
                    if (test.stackTrace) {
                        html += `<pre>${test.stackTrace}</pre>`;
                    }
                    html += `</div>`;
                }
                
                html += `</td></tr>`;
            });
            
            html += `
                    </tbody>
                </table>
            `;
        }
        
        // Process child suites
        suite.suites.forEach(childSuite => {
            html += this.generateHtmlForSuite(childSuite, depth + 1);
        });
        
        return html;
    }
    
    /**
     * Generate Markdown report
     */
    private generateMarkdownReport(testResults: TestResult): string {
        let markdown = `# Test Report\n\n`;
        markdown += `## Summary\n\n`;
        markdown += `- Date: ${new Date().toLocaleString()}\n`;
        markdown += `- Total tests: ${testResults.totalTests}\n`;
        markdown += `- Passed: ${testResults.passed} (${Math.round(testResults.passed / testResults.totalTests * 100)}%)\n`;
        markdown += `- Failed: ${testResults.failed}\n`;
        markdown += `- Skipped: ${testResults.skipped}\n`;
        markdown += `- Duration: ${testResults.duration}ms\n\n`;
        
        // Add test suites
        testResults.suites.forEach(suite => {
            markdown += this.generateMarkdownForSuite(suite, 2);
        });
        
        return markdown;
    }
    
    /**
     * Generate Markdown for a test suite recursively
     */
    private generateMarkdownForSuite(suite: TestSuite, depth: number): string {
        let markdown = `${'#'.repeat(depth)} ${suite.name}\n\n`;
        
        if (suite.tests.length > 0) {
            markdown += `| Status | Test | Duration | Details |\n`;
            markdown += `| ------ | ---- | -------- | ------- |\n`;
            
            suite.tests.forEach(test => {
                const status = test.status === 'passed' ? '✅ Pass' : test.status === 'failed' ? '❌ Fail' : '⏩ Skip';
                let details = '';
                
                if (test.status === 'failed' && test.error) {
                    details = `Error: ${test.error}`;
                    if (test.stackTrace) {
                        // Limit stack trace to one line for markdown table
                        const firstLine = test.stackTrace.split('\n')[0];
                        details += ` (${firstLine})`;
                    }
                }
                
                markdown += `| ${status} | ${test.name} | ${test.duration}ms | ${details} |\n`;
            });
            
            markdown += '\n';
        }
        
        // Process child suites
        suite.suites.forEach(childSuite => {
            markdown += this.generateMarkdownForSuite(childSuite, depth + 1);
        });
        
        return markdown;
    }
    
    /**
     * Generate CSV report
     */
    private generateCsvReport(testResults: TestResult): string {
        let csv = `"Suite","Test","Status","Duration (ms)","Error"\n`;
        
        const addTestsToCsv = (suite: TestSuite, suitePath: string) => {
            const currentPath = suitePath ? `${suitePath} > ${suite.name}` : suite.name;
            
            suite.tests.forEach(test => {
                const status = test.status;
                const error = test.error || '';
                
                // CSV escaping - double quotes in fields are escaped with double quotes
                const escapedTest = test.name.replace(/"/g, '""');
                const escapedPath = currentPath.replace(/"/g, '""');
                const escapedError = error.replace(/"/g, '""');
                
                csv += `"${escapedPath}","${escapedTest}","${status}","${test.duration}","${escapedError}"\n`;
            });
            
            // Process child suites
            suite.suites.forEach(childSuite => {
                addTestsToCsv(childSuite, currentPath);
            });
        };
        
        // Start with top-level suites
        testResults.suites.forEach(suite => {
            addTestsToCsv(suite, '');
        });
        
        return csv;
    }
    
    /**
     * Get the name of the current workspace
     */
    private getWorkspaceName(): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        return workspaceFolder ? path.basename(workspaceFolder.uri.fsPath) : 'unknown-workspace';
    }
    
    /**
     * Load historical test data from storage
     */
    private loadHistoricalData(): void {
        const data = this.context.globalState.get<SerializedHistoricalData>('testHistoricalData');
        
        if (data) {
            this.historicalData = new Map<string, TestHistoryEntry[]>();
            
            Object.entries(data).forEach(([workspace, entries]) => {
                this.historicalData.set(workspace, entries.map(entry => ({
                    ...entry,
                    timestamp: new Date(entry.timestamp)
                })));
            });
        }
    }
    
    /**
     * Save historical test data to storage
     */
    private saveHistoricalData(): void {
        const serializedData: SerializedHistoricalData = {};
        
        this.historicalData.forEach((entries, workspace) => {
            serializedData[workspace] = entries;
        });
        
        this.context.globalState.update('testHistoricalData', serializedData);
    }
}

/**
 * Entry in test history
 */
interface TestHistoryEntry {
    timestamp: Date;
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    passRate: number;
}

/**
 * Serialized format for storage
 */
interface SerializedHistoricalData {
    [workspace: string]: TestHistoryEntry[];
}
