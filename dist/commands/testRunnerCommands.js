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
exports.registerTestRunnerCommands = registerTestRunnerCommands;
const vscode = __importStar(require("vscode"));
const testRunnerService_1 = require("../services/testRunner/testRunnerService");
const path = __importStar(require("path"));
const securityVulnerabilityPanel_1 = require("../views/securityVulnerabilityPanel");
/**
 * Registers all test runner commands with VS Code
 */
function registerTestRunnerCommands(context) {
    const testRunnerService = new testRunnerService_1.TestRunnerService();
    // Register the test runner service for disposal when the extension is deactivated
    context.subscriptions.push(testRunnerService);
    // Register command to run unit tests
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runUnitTests', async () => {
        // Get workspace folder or let user select one if multiple folders are open
        const workspaceFolder = await getWorkspaceFolder();
        if (!workspaceFolder) {
            return;
        }
        // Show a loading notification
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running unit tests",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0 });
            const options = {
                path: workspaceFolder.uri.fsPath
            };
            // Run the tests
            const result = await testRunnerService.runUnitTests(options);
            progress.report({ increment: 100 });
            // Update the test explorer view
            vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'unit', result);
            // Show result notification
            if (result.success) {
                vscode.window.showInformationMessage('Unit tests completed successfully');
            }
            else {
                vscode.window.showErrorMessage(`Unit tests failed: ${result.message}`);
            }
            return result;
        });
    }));
    // Register command to run integration tests
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runIntegrationTests', async () => {
        // Get workspace folder or let user select one if multiple folders are open
        const workspaceFolder = await getWorkspaceFolder();
        if (!workspaceFolder) {
            return;
        }
        // Show a loading notification
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running integration tests",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0 });
            const options = {
                path: workspaceFolder.uri.fsPath
            };
            // Run the tests
            const result = await testRunnerService.runIntegrationTests(options);
            progress.report({ increment: 100 });
            // Update the test explorer view
            vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'integration', result);
            // Show result notification
            if (result.success) {
                vscode.window.showInformationMessage('Integration tests completed successfully');
            }
            else {
                vscode.window.showErrorMessage(`Integration tests failed: ${result.message}`);
            }
            return result;
        });
    }));
    // Register command to run E2E tests
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runE2ETests', async () => {
        // Get workspace folder or let user select one if multiple folders are open
        const workspaceFolder = await getWorkspaceFolder();
        if (!workspaceFolder) {
            return;
        }
        // Ask if user wants to configure E2E tests
        const configureOption = await vscode.window.showQuickPick(['Run with auto-detected settings', 'Configure E2E test settings'], { placeHolder: 'How do you want to run E2E tests?' });
        const configureE2E = configureOption === 'Configure E2E test settings';
        // Show a loading notification
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running E2E tests",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0 });
            const options = {
                path: workspaceFolder.uri.fsPath,
                configureE2E
            };
            // Run the tests
            const result = await testRunnerService.runE2ETests(options);
            progress.report({ increment: 100 });
            // Update the test explorer view
            vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'e2e', result);
            // Show result notification
            if (result.success) {
                vscode.window.showInformationMessage('E2E tests completed successfully');
            }
            else {
                vscode.window.showErrorMessage(`E2E tests failed: ${result.message}`);
            }
            return result;
        });
    }));
    // Register command to run performance tests
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runPerformanceTests', async () => {
        // Get workspace folder or let user select one if multiple folders are open
        const workspaceFolder = await getWorkspaceFolder();
        if (!workspaceFolder) {
            return;
        }
        // Ask how to configure performance tests
        const configOption = await vscode.window.showQuickPick([
            { label: 'Auto-detect performance testing tools', value: 'auto' },
            { label: 'Configure performance test manually', value: 'manual' }
        ], {
            placeHolder: 'How do you want to run performance tests?'
        });
        if (!configOption) {
            return; // User cancelled
        }
        // Show a loading notification
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running performance tests",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0 });
            const options = {
                path: workspaceFolder.uri.fsPath,
                configurePerformance: configOption.value === 'manual',
                askForCustomCommand: true
            };
            // Run the tests
            const result = await testRunnerService.runPerformanceTests(options);
            progress.report({ increment: 100 });
            // Update the test explorer view
            vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'performance', result);
            // Show result notification
            if (result.success) {
                vscode.window.showInformationMessage('Performance tests completed successfully');
                // If there are performance metrics, show them
                if (result.performanceMetrics && Object.keys(result.performanceMetrics).length > 0) {
                    const metricsString = Object.entries(result.performanceMetrics)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('\n');
                    vscode.window.showInformationMessage(`Performance Metrics:\n${metricsString}`);
                }
            }
            else {
                vscode.window.showErrorMessage(`Performance tests failed: ${result.message}`);
            }
            return result;
        });
    }));
    // Register command to run static code analysis
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runStaticAnalysis', async () => {
        // Get workspace folder or let user select one if multiple folders are open
        const workspaceFolder = await getWorkspaceFolder();
        if (!workspaceFolder) {
            return;
        }
        // Ask which static analysis tool to use
        const toolOption = await vscode.window.showQuickPick([
            { label: 'Auto-detect', value: 'auto' },
            { label: 'ESLint', value: 'eslint' },
            { label: 'Prettier', value: 'prettier' },
            { label: 'Stylelint', value: 'stylelint' },
            { label: 'TSLint', value: 'tslint' },
            { label: 'SonarQube', value: 'sonarqube' },
            { label: 'Custom Command', value: 'custom' }
        ], {
            placeHolder: 'Select static analysis tool'
        });
        if (!toolOption) {
            return; // User cancelled
        }
        let command;
        let tool;
        // Configure custom command if selected
        if (toolOption.value === 'custom') {
            command = await vscode.window.showInputBox({
                prompt: 'Enter static analysis command',
                placeHolder: 'e.g., npx eslint . --fix'
            });
            if (!command) {
                return; // User cancelled
            }
        }
        else if (toolOption.value !== 'auto') {
            tool = toolOption.value;
        }
        // Ask if issues should be auto-fixed
        const autoFix = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Automatically fix issues if possible?'
        });
        // Show a loading notification
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running static code analysis",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0 });
            const options = {
                path: workspaceFolder.uri.fsPath,
                tool: tool,
                command,
                autoFix: autoFix === 'Yes'
            };
            // Run the analysis
            const result = await testRunnerService.runStaticAnalysis(options);
            progress.report({ increment: 100 });
            // Update the test explorer view
            vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'static', result);
            // Show result notification
            const issueCount = result.staticAnalysis?.issueCount || 0;
            if (result.success) {
                if (issueCount > 0) {
                    vscode.window.showWarningMessage(`Static analysis found ${issueCount} issues.`);
                }
                else {
                    vscode.window.showInformationMessage('Static analysis completed successfully with no issues.');
                }
            }
            else {
                vscode.window.showErrorMessage(`Static analysis failed: ${result.message}`);
            }
            return result;
        });
    }));
    // Register command to run code coverage analysis
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runCodeCoverage', async () => {
        // Get workspace folder or let user select one if multiple folders are open
        const workspaceFolder = await getWorkspaceFolder();
        if (!workspaceFolder) {
            return;
        }
        // Ask which coverage tool to use or auto-detect
        const toolOption = await vscode.window.showQuickPick([
            { label: 'Auto-detect', value: 'auto' },
            { label: 'Jest', value: 'jest' },
            { label: 'NYC / Istanbul', value: 'nyc' },
            { label: 'C8', value: 'c8' },
            { label: 'Custom Command', value: 'custom' }
        ], {
            placeHolder: 'Select code coverage tool'
        });
        if (!toolOption) {
            return; // User cancelled
        }
        let command;
        let tool;
        // Configure custom command if selected
        if (toolOption.value === 'custom') {
            command = await vscode.window.showInputBox({
                prompt: 'Enter code coverage command',
                placeHolder: 'e.g., npm run test:coverage'
            });
            if (!command) {
                return; // User cancelled
            }
        }
        else if (toolOption.value !== 'auto') {
            tool = toolOption.value;
        }
        // Ask for coverage threshold
        const thresholdInput = await vscode.window.showInputBox({
            prompt: 'Enter minimum coverage threshold percentage (0-100)',
            placeHolder: '80',
            validateInput: input => {
                const num = Number(input);
                return (isNaN(num) || num < 0 || num > 100) ? 'Please enter a number between 0 and 100' : null;
            }
        });
        const threshold = thresholdInput ? parseInt(thresholdInput) : 80;
        // Show a loading notification
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running code coverage analysis",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0 });
            const options = {
                path: workspaceFolder.uri.fsPath,
                tool: tool,
                command,
                threshold
            };
            // Run the analysis
            const result = await testRunnerService.runCodeCoverage(options);
            progress.report({ increment: 100 });
            // Update the test explorer view
            vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'coverage', result);
            // Update coverage decorations if available
            if (result.codeCoverage) {
                vscode.commands.executeCommand('localLLMAgent.updateCoverageDecorations', result.codeCoverage);
                // Ask if user wants to enable coverage highlighting
                const enableHighlighting = await vscode.window.showInformationMessage('Enable coverage highlighting in the editor?', 'Yes', 'No');
                if (enableHighlighting === 'Yes') {
                    vscode.commands.executeCommand('localLLMAgent.toggleCoverageHighlight');
                }
            }
            // Show result notification
            if (result.success) {
                if (result.codeCoverage) {
                    const coveragePercent = result.codeCoverage.overall.toFixed(2);
                    vscode.window.showInformationMessage(`Code coverage: ${coveragePercent}%`);
                }
                else {
                    vscode.window.showInformationMessage('Code coverage analysis completed successfully');
                }
            }
            else {
                vscode.window.showErrorMessage(`Code coverage analysis failed: ${result.message}`);
            }
            return result;
        });
    }));
    // Register command to run security tests
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runSecurityTest', async () => {
        // Get workspace folder or let user select one if multiple folders are open
        const workspaceFolder = await getWorkspaceFolder();
        if (!workspaceFolder) {
            return;
        }
        // Ask which security tool to use or auto-detect
        const toolOption = await vscode.window.showQuickPick([
            { label: 'Auto-detect', value: 'auto' },
            { label: 'npm audit', value: 'npm-audit' },
            { label: 'Snyk', value: 'snyk' },
            { label: 'OWASP Dependency Check', value: 'owasp-dependency-check' },
            { label: 'Trivy', value: 'trivy' },
            { label: 'Custom Command', value: 'custom' }
        ], {
            placeHolder: 'Select security testing tool'
        });
        if (!toolOption) {
            return; // User cancelled
        }
        let command;
        let tool;
        // Configure custom command if selected
        if (toolOption.value === 'custom') {
            command = await vscode.window.showInputBox({
                prompt: 'Enter security testing command',
                placeHolder: 'e.g., npm audit --json'
            });
            if (!command) {
                return; // User cancelled
            }
        }
        else if (toolOption.value !== 'auto') {
            tool = toolOption.value;
        }
        // Ask for severity threshold
        const severityThreshold = await vscode.window.showQuickPick([
            { label: 'Info (All vulnerabilities)', value: 'info' },
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' }
        ], {
            placeHolder: 'Minimum severity level to report'
        });
        // Ask if the test should fail if vulnerabilities are found
        const failOnVulnerabilities = await vscode.window.showQuickPick([
            { label: 'Yes', value: true },
            { label: 'No', value: false }
        ], {
            placeHolder: 'Fail test if vulnerabilities are found?'
        });
        // Show a loading notification
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running security tests",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0 });
            const options = {
                path: workspaceFolder.uri.fsPath,
                tool: tool,
                command,
                severityThreshold: severityThreshold?.value,
                failOnVulnerabilities: failOnVulnerabilities?.value
            };
            // Run the analysis
            const result = await testRunnerService.runSecurityTest(options);
            progress.report({ increment: 100 });
            // Update the test explorer view
            vscode.commands.executeCommand('localLLMAgent.updateTestResults', 'security', result);
            // Show result notification and offer to open detailed report
            if (result.securityTest && result.securityTest.vulnerabilities.length > 0) {
                const summary = result.securityTest.summary;
                const criticalCount = summary.critical;
                const highCount = summary.high;
                let message;
                if (criticalCount > 0 || highCount > 0) {
                    message = `Security vulnerabilities found: ${criticalCount} critical, ${highCount} high, ${summary.medium} medium, ${summary.low} low`;
                    vscode.window.showErrorMessage(message, 'View Details').then(selection => {
                        if (selection === 'View Details') {
                            securityVulnerabilityPanel_1.SecurityVulnerabilityPanel.createOrShow(context.extensionUri, result.securityTest.vulnerabilities.map(v => ({
                                ...v,
                                name: v.package || v.id // Use package name as the vulnerability name or fallback to ID
                            })), 'Security Vulnerabilities');
                        }
                    });
                }
                else if (summary.total > 0) {
                    message = `Security vulnerabilities found: ${summary.medium} medium, ${summary.low} low, ${summary.info} info`;
                    vscode.window.showWarningMessage(message, 'View Details').then(selection => {
                        if (selection === 'View Details') {
                            securityVulnerabilityPanel_1.SecurityVulnerabilityPanel.createOrShow(context.extensionUri, result.securityTest.vulnerabilities.map(v => ({
                                ...v,
                                name: v.package || v.id // Use package name as the vulnerability name or fallback to ID
                            })), 'Security Vulnerabilities');
                        }
                    });
                }
                else {
                    vscode.window.showInformationMessage('No security vulnerabilities found');
                }
            }
            else if (result.success) {
                vscode.window.showInformationMessage('Security test completed successfully');
            }
            else {
                vscode.window.showErrorMessage(`Security test failed: ${result.message}`);
            }
            return result;
        });
    }));
    // Register command to view security vulnerabilities
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.viewSecurityVulnerabilities', (vulnerabilities) => {
        securityVulnerabilityPanel_1.SecurityVulnerabilityPanel.createOrShow(context.extensionUri, vulnerabilities, 'Security Vulnerabilities');
    }));
    // Register command to open a file at a specific location
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.openFileAtLocation', async (filePath, line, column) => {
        try {
            // If the file path is relative, resolve it against the workspace
            let absolutePath = filePath;
            if (!path.isAbsolute(filePath) && vscode.workspace.workspaceFolders) {
                absolutePath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, filePath);
            }
            // Open the document
            const document = await vscode.workspace.openTextDocument(absolutePath);
            // Show the document in an editor
            const editor = await vscode.window.showTextDocument(document);
            // Move cursor to the specified position
            if (line !== undefined) {
                // VS Code positions are zero-based
                const position = new vscode.Position(Math.max(0, line - 1), column !== undefined ? Math.max(0, column - 1) : 0);
                // Move cursor and reveal the line
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to open file: ${error}`);
        }
    }));
}
/**
 * Helper function to get the workspace folder to run tests in
 */
async function getWorkspaceFolder() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder is open');
        return undefined;
    }
    // If there's only one workspace folder, use that
    if (workspaceFolders.length === 1) {
        return workspaceFolders[0];
    }
    // If there are multiple workspace folders, let the user choose
    const selected = await vscode.window.showQuickPick(workspaceFolders.map(folder => ({
        label: folder.name,
        description: folder.uri.fsPath,
        folder
    })), { placeHolder: 'Select a workspace folder to run tests in' });
    return selected?.folder;
}
//# sourceMappingURL=testRunnerCommands.js.map