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
exports.ComplexityAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * Analyzes code complexity using various tools
 */
class ComplexityAnalyzer {
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Code Complexity');
    }
    /**
     * Initialize the complexity analyzer
     */
    async initialize() {
        // Initialization logic
    }
    /**
     * Analyze the complexity of the current file
     */
    async analyzeFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        const document = editor.document;
        const filePath = document.uri.fsPath;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        if (!workspaceFolder) {
            vscode.window.showWarningMessage('File must be part of a workspace');
            return;
        }
        // Save document first
        await document.save();
        // Determine analyzer based on file extension
        const fileExt = path.extname(filePath);
        this.outputChannel.clear();
        this.outputChannel.show();
        this.outputChannel.appendLine(`Analyzing complexity of ${path.basename(filePath)}...`);
        switch (fileExt) {
            case '.js':
            case '.ts':
            case '.jsx':
            case '.tsx':
                await this.analyzeJSComplexity(filePath, workspaceFolder.uri.fsPath);
                break;
            case '.py':
                await this.analyzePythonComplexity(filePath, workspaceFolder.uri.fsPath);
                break;
            default:
                vscode.window.showInformationMessage(`No complexity analyzer configured for ${fileExt} files`);
                break;
        }
    }
    /**
     * Analyze JavaScript/TypeScript complexity using complexity-report
     */
    async analyzeJSComplexity(filePath, workspacePath) {
        try {
            // Check if we should use global or local installation
            let command = '';
            // Check for local installation
            const plato = path.join(workspacePath, 'node_modules', '.bin', 'plato');
            const escomplex = path.join(workspacePath, 'node_modules', '.bin', 'cr');
            if (fs.existsSync(plato)) {
                command = `"${plato}" -r -d .complexity-report "${filePath}"`;
            }
            else if (fs.existsSync(escomplex)) {
                command = `"${escomplex}" "${filePath}" --format json`;
            }
            else {
                // Try using global installation
                command = `npx complexity-report "${filePath}" --format json`;
            }
            const result = cp.execSync(command, { cwd: workspacePath }).toString();
            this.outputChannel.appendLine('Analysis completed');
            try {
                const report = JSON.parse(result);
                this.displayComplexityReport(report);
            }
            catch {
                // If not JSON, just display the raw output
                this.outputChannel.appendLine('\nAnalysis Results:');
                this.outputChannel.appendLine(result);
            }
            // Create report panel
            const panel = vscode.window.createWebviewPanel('complexityReport', `Complexity Report: ${path.basename(filePath)}`, vscode.ViewColumn.Beside, { enableScripts: true });
            panel.webview.html = this.getComplexityReportHtml(filePath, result);
        }
        catch (error) {
            this.outputChannel.appendLine(`Error analyzing complexity: ${error}`);
            vscode.window.showErrorMessage(`Failed to analyze complexity: ${error}`);
        }
    }
    /**
     * Analyze Python code complexity using radon
     */
    async analyzePythonComplexity(filePath, workspacePath) {
        try {
            // Check if radon is installed
            try {
                cp.execSync('radon --version');
            }
            catch {
                this.outputChannel.appendLine('Radon not found. Attempting to install...');
                cp.execSync('pip install radon');
            }
            const ccResult = cp.execSync(`radon cc "${filePath}" -j`, { cwd: workspacePath }).toString();
            const miResult = cp.execSync(`radon mi "${filePath}" -j`, { cwd: workspacePath }).toString();
            const halResult = cp.execSync(`radon hal "${filePath}" -j`, { cwd: workspacePath }).toString();
            this.outputChannel.appendLine('Analysis completed');
            const ccReport = JSON.parse(ccResult);
            const miReport = JSON.parse(miResult);
            const halReport = JSON.parse(halResult);
            this.outputChannel.appendLine('\nCyclomatic Complexity:');
            this.displayPythonComplexityReport(ccReport);
            this.outputChannel.appendLine('\nMaintainability Index:');
            this.displayPythonMaintainabilityReport(miReport);
            this.outputChannel.appendLine('\nHalstead Metrics:');
            this.displayPythonHalsteadReport(halReport);
            // Create report panel
            const panel = vscode.window.createWebviewPanel('complexityReport', `Complexity Report: ${path.basename(filePath)}`, vscode.ViewColumn.Beside, { enableScripts: true });
            panel.webview.html = this.getPythonComplexityReportHtml(filePath, ccReport, miReport, halReport);
        }
        catch (error) {
            this.outputChannel.appendLine(`Error analyzing complexity: ${error}`);
            vscode.window.showErrorMessage(`Failed to analyze complexity: ${error}`);
        }
    }
    /**
     * Display complexity report in output channel
     */
    displayComplexityReport(report) {
        this.outputChannel.appendLine('\nComplexity Report:');
        if (Array.isArray(report)) {
            report.forEach(module => {
                this.outputChannel.appendLine(`\nModule: ${module.path || 'Unknown'}`);
                this.outputChannel.appendLine(`  Maintainability: ${module.maintainability.toFixed(2)}`);
                if (module.functions) {
                    this.outputChannel.appendLine('  Functions:');
                    module.functions.forEach((func) => {
                        this.outputChannel.appendLine(`    ${func.name}`);
                        this.outputChannel.appendLine(`      Cyclomatic Complexity: ${func.cyclomatic}`);
                        this.outputChannel.appendLine(`      Halstead Difficulty: ${func.halstead.difficulty.toFixed(2)}`);
                    });
                }
            });
        }
        else {
            this.outputChannel.appendLine(JSON.stringify(report, null, 2));
        }
    }
    /**
     * Display Python complexity report
     */
    displayPythonComplexityReport(report) {
        for (const [file, functions] of Object.entries(report)) {
            this.outputChannel.appendLine(`\nFile: ${file}`);
            if (Array.isArray(functions)) {
                functions.forEach((func) => {
                    const complexity = func.complexity;
                    const letter = this.getComplexityGrade(complexity);
                    this.outputChannel.appendLine(`  ${func.name} - Complexity: ${complexity} (${letter})`);
                    this.outputChannel.appendLine(`    Line: ${func.lineno}, End line: ${func.endline}`);
                });
            }
        }
    }
    /**
     * Display Python maintainability report
     */
    displayPythonMaintainabilityReport(report) {
        for (const [file, mi] of Object.entries(report)) {
            this.outputChannel.appendLine(`\nFile: ${file}`);
            this.outputChannel.appendLine(`  Maintainability Index: ${mi}`);
            const rating = this.getMaintainabilityRating(Number(mi));
            this.outputChannel.appendLine(`  Rating: ${rating}`);
        }
    }
    /**
     * Display Python Halstead metrics
     */
    displayPythonHalsteadReport(report) {
        for (const [file, metrics] of Object.entries(report)) {
            this.outputChannel.appendLine(`\nFile: ${file}`);
            if (typeof metrics === 'object') {
                const hal = metrics;
                this.outputChannel.appendLine(`  h1 (Unique Operators): ${hal.h1}`);
                this.outputChannel.appendLine(`  h2 (Unique Operands): ${hal.h2}`);
                this.outputChannel.appendLine(`  N1 (Total Operators): ${hal.N1}`);
                this.outputChannel.appendLine(`  N2 (Total Operands): ${hal.N2}`);
                this.outputChannel.appendLine(`  Vocabulary: ${hal.vocabulary}`);
                this.outputChannel.appendLine(`  Length: ${hal.length}`);
                this.outputChannel.appendLine(`  Volume: ${hal.volume}`);
                this.outputChannel.appendLine(`  Difficulty: ${hal.difficulty}`);
                this.outputChannel.appendLine(`  Effort: ${hal.effort}`);
                this.outputChannel.appendLine(`  Time: ${hal.time} seconds`);
                this.outputChannel.appendLine(`  Bugs: ${hal.bugs}`);
            }
        }
    }
    /**
     * Get complexity grade based on score
     */
    getComplexityGrade(complexity) {
        if (complexity <= 5)
            return 'A (low)';
        if (complexity <= 10)
            return 'B (moderate)';
        if (complexity <= 20)
            return 'C (high)';
        if (complexity <= 30)
            return 'D (very high)';
        return 'E (extremely high)';
    }
    /**
     * Get maintainability rating
     */
    getMaintainabilityRating(mi) {
        if (mi >= 20)
            return 'A (high)';
        if (mi >= 10)
            return 'B (moderate)';
        return 'C (low)';
    }
    /**
     * Create HTML for complexity report
     */
    getComplexityReportHtml(filePath, reportData) {
        let report;
        try {
            report = JSON.parse(reportData);
        }
        catch {
            report = { raw: reportData };
        }
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Complexity Report: ${path.basename(filePath)}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    h1 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .metric { margin-bottom: 20px; }
                    .metric-name { font-weight: bold; }
                    .function { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
                    .complexity-a { background: #CCFFCC; }
                    .complexity-b { background: #FFFFCC; }
                    .complexity-c { background: #FFDDCC; }
                    .complexity-d { background: #FFCCCC; }
                    .complexity-e { background: #FF5555; color: white; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Complexity Report: ${path.basename(filePath)}</h1>
                    
                    <div id="report-content">
                        ${this.renderComplexityReportHtml(report)}
                    </div>
                </div>
            </body>
            </html>
        `;
    }
    /**
     * Render complexity report as HTML
     */
    renderComplexityReportHtml(report) {
        if (report.raw) {
            return `<pre>${report.raw}</pre>`;
        }
        if (!Array.isArray(report)) {
            return `<pre>${JSON.stringify(report, null, 2)}</pre>`;
        }
        let html = '';
        report.forEach(module => {
            html += `<h2>Module: ${module.path || 'Unknown'}</h2>`;
            html += `<div class="metric">
                <span class="metric-name">Maintainability:</span> ${module.maintainability ? module.maintainability.toFixed(2) : 'N/A'}
            </div>`;
            if (module.functions && module.functions.length > 0) {
                html += `<h3>Functions</h3>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Cyclomatic Complexity</th>
                        <th>Halstead Difficulty</th>
                    </tr>`;
                module.functions.forEach((func) => {
                    const complexity = func.cyclomatic;
                    let complexityClass = 'complexity-a';
                    if (complexity > 5)
                        complexityClass = 'complexity-b';
                    if (complexity > 10)
                        complexityClass = 'complexity-c';
                    if (complexity > 20)
                        complexityClass = 'complexity-d';
                    if (complexity > 30)
                        complexityClass = 'complexity-e';
                    html += `<tr>
                        <td>${func.name}</td>
                        <td class="${complexityClass}">${complexity}</td>
                        <td>${func.halstead && func.halstead.difficulty ? func.halstead.difficulty.toFixed(2) : 'N/A'}</td>
                    </tr>`;
                });
                html += `</table>`;
            }
        });
        return html;
    }
    /**
     * Create HTML for Python complexity report
     */
    getPythonComplexityReportHtml(filePath, ccReport, miReport, halReport) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Complexity Report: ${path.basename(filePath)}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    h1 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .tab { overflow: hidden; border: 1px solid #ccc; background-color: #f1f1f1; }
                    .tab button { background-color: inherit; float: left; border: none; outline: none; cursor: pointer; padding: 10px 16px; }
                    .tab button:hover { background-color: #ddd; }
                    .tab button.active { background-color: #ccc; }
                    .tabcontent { display: none; padding: 20px; border: 1px solid #ccc; border-top: none; }
                    .complexity-a { background: #CCFFCC; }
                    .complexity-b { background: #FFFFCC; }
                    .complexity-c { background: #FFDDCC; }
                    .complexity-d { background: #FFCCCC; }
                    .complexity-e { background: #FF5555; color: white; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Complexity Report: ${path.basename(filePath)}</h1>
                    
                    <div class="tab">
                        <button class="tablinks active" onclick="openTab(event, 'Cyclomatic')">Cyclomatic Complexity</button>
                        <button class="tablinks" onclick="openTab(event, 'Maintainability')">Maintainability Index</button>
                        <button class="tablinks" onclick="openTab(event, 'Halstead')">Halstead Metrics</button>
                    </div>
                    
                    <div id="Cyclomatic" class="tabcontent" style="display: block;">
                        <h2>Cyclomatic Complexity</h2>
                        ${this.renderPythonCyclomaticComplexity(ccReport)}
                    </div>
                    
                    <div id="Maintainability" class="tabcontent">
                        <h2>Maintainability Index</h2>
                        ${this.renderPythonMaintainability(miReport)}
                    </div>
                    
                    <div id="Halstead" class="tabcontent">
                        <h2>Halstead Metrics</h2>
                        ${this.renderPythonHalstead(halReport)}
                    </div>
                </div>
                
                <script>
                function openTab(evt, tabName) {
                    var i, tabcontent, tablinks;
                    tabcontent = document.getElementsByClassName("tabcontent");
                    for (i = 0; i < tabcontent.length; i++) {
                        tabcontent[i].style.display = "none";
                    }
                    tablinks = document.getElementsByClassName("tablinks");
                    for (i = 0; i < tablinks.length; i++) {
                        tablinks[i].className = tablinks[i].className.replace(" active", "");
                    }
                    document.getElementById(tabName).style.display = "block";
                    evt.currentTarget.className += " active";
                }
                </script>
            </body>
            </html>
        `;
    }
    /**
     * Render Python cyclomatic complexity as HTML
     */
    renderPythonCyclomaticComplexity(report) {
        let html = '';
        for (const [file, functions] of Object.entries(report)) {
            html += `<h3>${file}</h3>`;
            if (Array.isArray(functions)) {
                html += `<table>
                    <tr>
                        <th>Function</th>
                        <th>Complexity</th>
                        <th>Rating</th>
                        <th>Line Number</th>
                    </tr>`;
                functions.forEach((func) => {
                    const complexity = func.complexity;
                    const letter = this.getComplexityGrade(complexity);
                    let complexityClass = 'complexity-a';
                    if (complexity > 5)
                        complexityClass = 'complexity-b';
                    if (complexity > 10)
                        complexityClass = 'complexity-c';
                    if (complexity > 20)
                        complexityClass = 'complexity-d';
                    if (complexity > 30)
                        complexityClass = 'complexity-e';
                    html += `<tr>
                        <td>${func.name}</td>
                        <td class="${complexityClass}">${complexity}</td>
                        <td>${letter}</td>
                        <td>${func.lineno} - ${func.endline}</td>
                    </tr>`;
                });
                html += `</table>`;
            }
        }
        return html;
    }
    /**
     * Render Python maintainability as HTML
     */
    renderPythonMaintainability(report) {
        let html = `<table>
            <tr>
                <th>File</th>
                <th>Maintainability Index</th>
                <th>Rating</th>
            </tr>`;
        for (const [file, mi] of Object.entries(report)) {
            const miValue = Number(mi);
            const rating = this.getMaintainabilityRating(miValue);
            let miClass = 'complexity-a';
            if (miValue < 20)
                miClass = 'complexity-b';
            if (miValue < 10)
                miClass = 'complexity-c';
            html += `<tr>
                <td>${file}</td>
                <td class="${miClass}">${mi}</td>
                <td>${rating}</td>
            </tr>`;
        }
        html += `</table>`;
        return html;
    }
    /**
     * Render Python Halstead metrics as HTML
     */
    renderPythonHalstead(report) {
        let html = `<table>
            <tr>
                <th>File</th>
                <th>Vocabulary</th>
                <th>Length</th>
                <th>Volume</th>
                <th>Difficulty</th>
                <th>Effort</th>
                <th>Time (sec)</th>
                <th>Bugs</th>
            </tr>`;
        for (const [file, metrics] of Object.entries(report)) {
            if (typeof metrics === 'object') {
                const hal = metrics;
                html += `<tr>
                    <td>${file}</td>
                    <td>${hal.vocabulary}</td>
                    <td>${hal.length}</td>
                    <td>${hal.volume}</td>
                    <td>${hal.difficulty}</td>
                    <td>${hal.effort}</td>
                    <td>${hal.time}</td>
                    <td>${hal.bugs}</td>
                </tr>`;
            }
        }
        html += `</table>`;
        return html;
    }
    /**
     * Dispose resources
     */
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.ComplexityAnalyzer = ComplexityAnalyzer;
//# sourceMappingURL=complexityAnalyzer.js.map