import * as vscode from 'vscode';
import { TestResult } from './testTypes';
/**
 * Class responsible for test reporting, trend analysis, and export functionality
 */
export declare class TestReporter {
    private context;
    private historicalData;
    private outputChannel;
    constructor(context: vscode.ExtensionContext);
    /**
     * Format and display test results in the UI
     */
    formatAndDisplayResults(testResults: TestResult): void;
    /**
     * Display a test suite and its tests with proper indentation
     */
    private displayTestSuite;
    /**
     * Save test results to historical data
     */
    private saveTestResultHistory;
    /**
     * Analyze historical test trends and display visualization
     */
    showHistoricalTrends(): Promise<void>;
    /**
     * Generate HTML for trend visualization
     */
    private generateTrendHtml;
    /**
     * Export test results to a file in different formats
     */
    exportTestResults(testResults: TestResult): Promise<void>;
    /**
     * Get file extension based on the selected format
     */
    private getFileExtension;
    /**
     * Generate report content in the selected format
     */
    private generateReportContent;
    /**
     * Generate HTML report
     */
    private generateHtmlReport;
    /**
     * Generate HTML for a test suite recursively
     */
    private generateHtmlForSuite;
    /**
     * Generate Markdown report
     */
    private generateMarkdownReport;
    /**
     * Generate Markdown for a test suite recursively
     */
    private generateMarkdownForSuite;
    /**
     * Generate CSV report
     */
    private generateCsvReport;
    /**
     * Get the name of the current workspace
     */
    private getWorkspaceName;
    /**
     * Load historical test data from storage
     */
    private loadHistoricalData;
    /**
     * Save historical test data to storage
     */
    private saveHistoricalData;
}
