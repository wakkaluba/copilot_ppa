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
exports.BuildToolsManager = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const webpackConfigManager_1 = require("./webpack/webpackConfigManager");
const rollupConfigManager_1 = require("./rollup/rollupConfigManager");
const viteConfigManager_1 = require("./vite/viteConfigManager");
const buildScriptOptimizer_1 = require("./buildScriptOptimizer");
const bundleAnalyzer_1 = require("./bundleAnalyzer");
class BuildToolsManager {
    constructor(context, logger) {
        this.context = context;
        this.logger = logger;
        this.webpackManager = new webpackConfigManager_1.WebpackConfigManager(logger);
        this.rollupManager = new rollupConfigManager_1.RollupConfigManager(logger);
        this.viteManager = new viteConfigManager_1.ViteConfigManager();
        this.buildScriptOptimizer = new buildScriptOptimizer_1.BuildScriptOptimizer();
        this.bundleAnalyzer = new bundleAnalyzer_1.BundleAnalyzer();
        this.registerCommands();
    }
    registerCommands() {
        // Register webpack commands
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLM.buildTools.detectWebpackConfig', this.detectWebpackConfig.bind(this)), vscode.commands.registerCommand('localLLM.buildTools.optimizeWebpackConfig', this.optimizeWebpackConfig.bind(this)), 
        // Rollup commands
        vscode.commands.registerCommand('localLLM.buildTools.detectRollupConfig', this.detectRollupConfig.bind(this)), vscode.commands.registerCommand('localLLM.buildTools.optimizeRollupConfig', this.optimizeRollupConfig.bind(this)), 
        // Vite commands
        vscode.commands.registerCommand('localLLM.buildTools.detectViteConfig', this.detectViteConfig.bind(this)), vscode.commands.registerCommand('localLLM.buildTools.optimizeViteConfig', this.optimizeViteConfig.bind(this)), 
        // Build script commands
        vscode.commands.registerCommand('localLLM.buildTools.optimizeBuildScripts', this.optimizeBuildScripts.bind(this)), 
        // Bundle analyzer commands
        vscode.commands.registerCommand('localLLM.buildTools.analyzeBundleSize', this.analyzeBundleSize.bind(this)));
    }
    // Webpack methods
    async detectWebpackConfig() {
        try {
            const workspacePath = this.getFirstWorkspaceFolder();
            const configs = await this.webpackManager.detectConfigs(workspacePath);
            if (configs.length === 0) {
                vscode.window.showInformationMessage('No webpack configuration files found in the workspace.');
                return;
            }
            vscode.window.showInformationMessage(`Found ${configs.length} webpack configuration files.`);
            const selected = await vscode.window.showQuickPick(configs.map(c => ({ label: path.basename(c), description: c })), { placeHolder: 'Select a webpack configuration file to analyze' });
            if (selected) {
                await this.analyzeWebpackConfig(selected.description);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async analyzeWebpackConfig(configPath) {
        const analysis = await this.webpackManager.analyzeConfig(configPath);
        // Show analysis in a webview
        const panel = vscode.window.createWebviewPanel('webpackAnalysis', `Webpack Analysis: ${path.basename(configPath)}`, vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = this.getWebpackAnalysisHtml(analysis, configPath);
    }
    getWebpackAnalysisHtml(analysis, configPath) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Webpack Configuration Analysis</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .section { margin-bottom: 20px; }
                    .section h2 { color: #0078d7; }
                    .entry { margin-bottom: 10px; }
                    .entry-title { font-weight: bold; }
                    .performance-issue { color: #d83b01; }
                    .optimization-suggestion { color: #107c10; }
                </style>
            </head>
            <body>
                <h1>Webpack Configuration Analysis</h1>
                <p>Configuration: ${configPath}</p>
                
                <div class="section">
                    <h2>Entry Points</h2>
                    ${this.renderEntryPoints(analysis.entryPoints)}
                </div>
                
                <div class="section">
                    <h2>Output Configuration</h2>
                    ${this.renderOutputConfig(analysis.output)}
                </div>
                
                <div class="section">
                    <h2>Loaders</h2>
                    ${this.renderLoaders(analysis.loaders)}
                </div>
                
                <div class="section">
                    <h2>Plugins</h2>
                    ${this.renderPlugins(analysis.plugins)}
                </div>
                
                <div class="section">
                    <h2>Optimization Suggestions</h2>
                    ${this.renderOptimizationSuggestions(analysis.optimizationSuggestions)}
                </div>
            </body>
            </html>
        `;
    }
    renderEntryPoints(entryPoints) {
        if (!entryPoints || entryPoints.length === 0) {
            return '<p>No entry points found.</p>';
        }
        return entryPoints.map(entry => `<div class="entry">
                <div class="entry-title">${entry.name}</div>
                <div>${entry.path}</div>
            </div>`).join('');
    }
    renderOutputConfig(output) {
        if (!output) {
            return '<p>No output configuration found.</p>';
        }
        return `
            <div class="entry">
                <div class="entry-title">Path:</div>
                <div>${output.path}</div>
            </div>
            <div class="entry">
                <div class="entry-title">Filename:</div>
                <div>${output.filename}</div>
            </div>
        `;
    }
    renderLoaders(loaders) {
        if (!loaders || loaders.length === 0) {
            return '<p>No loaders found.</p>';
        }
        return loaders.map(loader => `<div class="entry">
                <div class="entry-title">${loader.name}</div>
                <div>Test: ${loader.test}</div>
                ${loader.options ? `<div>Options: ${JSON.stringify(loader.options)}</div>` : ''}
            </div>`).join('');
    }
    renderPlugins(plugins) {
        if (!plugins || plugins.length === 0) {
            return '<p>No plugins found.</p>';
        }
        return plugins.map(plugin => `<div class="entry">
                <div class="entry-title">${plugin.name}</div>
                ${plugin.description ? `<div>${plugin.description}</div>` : ''}
            </div>`).join('');
    }
    renderOptimizationSuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) {
            return '<p>No optimization suggestions available.</p>';
        }
        return suggestions.map(suggestion => `<div class="entry optimization-suggestion">
                <div class="entry-title">${suggestion.title}</div>
                <div>${suggestion.description}</div>
            </div>`).join('');
    }
    async optimizeWebpackConfig() {
        const configs = await this.detectConfigsForOptimization('webpack');
        if (!configs.length) {
            return;
        }
        const selected = await vscode.window.showQuickPick(configs.map(c => ({ label: path.basename(c), description: c })), { placeHolder: 'Select a webpack configuration file to optimize' });
        if (selected) {
            const optimizations = await this.webpackManager.generateOptimizations(selected.description);
            await this.showOptimizationOptions(selected.description, optimizations);
        }
    }
    // Similar methods for Rollup and Vite
    async detectRollupConfig() {
        try {
            const workspacePath = this.getFirstWorkspaceFolder();
            const configs = await this.rollupManager.detectConfigs(workspacePath);
            if (configs.length === 0) {
                vscode.window.showInformationMessage('No Rollup configuration files found in the workspace.');
                return;
            }
            vscode.window.showInformationMessage(`Found ${configs.length} Rollup configuration files.`);
            const selected = await vscode.window.showQuickPick(configs.map(c => ({ label: path.basename(c), description: c })), { placeHolder: 'Select a Rollup configuration file to analyze' });
            if (selected) {
                await this.analyzeRollupConfig(selected.description);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async optimizeRollupConfig() {
        const configs = await this.detectConfigsForOptimization('rollup');
        if (!configs.length) {
            return;
        }
        const selected = await vscode.window.showQuickPick(configs.map(c => ({ label: path.basename(c), description: c })), { placeHolder: 'Select a Rollup configuration file to optimize' });
        if (selected) {
            const optimizations = await this.rollupManager.generateOptimizations(selected.description);
            await this.showOptimizationOptions(selected.description, optimizations);
        }
    }
    async detectViteConfig() {
        // Implementation similar to detectWebpackConfig
        vscode.window.showInformationMessage('Detecting Vite configuration files...');
    }
    async optimizeViteConfig() {
        // Implementation similar to optimizeWebpackConfig
        vscode.window.showInformationMessage('Optimizing Vite configuration...');
    }
    // Build script optimization
    async optimizeBuildScripts() {
        const packageJsonPath = await this.findPackageJson();
        if (!packageJsonPath) {
            vscode.window.showErrorMessage('No package.json found in the workspace.');
            return;
        }
        try {
            const content = fs.readFileSync(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(content);
            if (!packageJson.scripts) {
                vscode.window.showInformationMessage('No scripts found in package.json.');
                return;
            }
            const buildScripts = Object.entries(packageJson.scripts)
                .filter(([name, script]) => name.includes('build') ||
                String(script).includes('build') ||
                String(script).includes('webpack') ||
                String(script).includes('rollup') ||
                String(script).includes('vite'))
                .map(([name, script]) => ({ name, script: String(script) }));
            if (buildScripts.length === 0) {
                vscode.window.showInformationMessage('No build scripts found in package.json.');
                return;
            }
            const scriptToOptimize = await vscode.window.showQuickPick(buildScripts.map(s => ({
                label: s.name,
                description: s.script,
                detail: 'Build script'
            })), { placeHolder: 'Select a build script to optimize' });
            if (scriptToOptimize) {
                const optimizations = await this.buildScriptOptimizer.optimizeScript(scriptToOptimize.label, scriptToOptimize.description || '');
                this.showBuildScriptOptimizations(packageJsonPath, scriptToOptimize.label, optimizations);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error reading package.json: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async showBuildScriptOptimizations(packageJsonPath, scriptName, optimizations) {
        const panel = vscode.window.createWebviewPanel('buildScriptOptimizations', `Build Script Optimizations: ${scriptName}`, vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = this.getBuildScriptOptimizationHtml(optimizations, scriptName);
        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'applyOptimization') {
                await this.applyBuildScriptOptimization(packageJsonPath, scriptName, message.optimization);
                vscode.window.showInformationMessage(`Applied optimization to script '${scriptName}'.`);
            }
        }, undefined, this.context.subscriptions);
    }
    getBuildScriptOptimizationHtml(optimizations, scriptName) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Build Script Optimizations</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .optimization { 
                        margin-bottom: 20px; 
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }
                    .optimization-title { font-weight: bold; margin-bottom: 10px; }
                    .optimization-description { margin-bottom: 10px; }
                    .optimization-before, .optimization-after { 
                        font-family: monospace; 
                        padding: 10px;
                        background-color: #f5f5f5;
                        border-radius: 4px;
                        margin-bottom: 10px;
                    }
                    .optimization-benefit {
                        color: #107c10;
                        margin-bottom: 10px;
                    }
                    button {
                        background-color: #0078d7;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 2px;
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: #005a9e;
                    }
                </style>
            </head>
            <body>
                <h1>Build Script Optimizations for '${scriptName}'</h1>
                
                <div id="optimizations">
                    ${this.renderBuildScriptOptimizations(optimizations)}
                </div>
                
                <script>
                    const vscode = acquireVsCodeApi();
                    
                    function applyOptimization(optimizationId) {
                        vscode.postMessage({
                            command: 'applyOptimization',
                            optimization: optimizationId
                        });
                    }
                </script>
            </body>
            </html>
        `;
    }
    renderBuildScriptOptimizations(optimizations) {
        if (!optimizations || optimizations.length === 0) {
            return '<p>No optimization suggestions available.</p>';
        }
        return optimizations.map((opt, index) => `<div class="optimization">
                <div class="optimization-title">${opt.title}</div>
                <div class="optimization-description">${opt.description}</div>
                <div class="optimization-benefit">${opt.benefit}</div>
                <div>
                    <div>Before:</div>
                    <div class="optimization-before">${opt.before}</div>
                </div>
                <div>
                    <div>After:</div>
                    <div class="optimization-after">${opt.after}</div>
                </div>
                <button onclick="applyOptimization(${index})">Apply This Optimization</button>
            </div>`).join('');
    }
    async applyBuildScriptOptimization(packageJsonPath, scriptName, optimizationIndex) {
        try {
            const content = fs.readFileSync(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(content);
            const optimizations = await this.buildScriptOptimizer.optimizeScript(scriptName, packageJson.scripts[scriptName]);
            const optimization = optimizations[optimizationIndex];
            if (optimization) {
                packageJson.scripts[scriptName] = optimization.after;
                fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error applying optimization: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Bundle analysis
    async analyzeBundleSize() {
        try {
            const workspacePath = this.getFirstWorkspaceFolder();
            // Try to find build output directories
            const possibleOutputDirs = [
                'dist',
                'build',
                'out',
                'public',
                'output'
            ];
            let outputDirs = [];
            for (const dir of possibleOutputDirs) {
                const fullPath = path.join(workspacePath, dir);
                if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
                    outputDirs.push(fullPath);
                }
            }
            if (outputDirs.length === 0) {
                vscode.window.showInformationMessage('No standard build output directories found. Please select a directory to analyze.');
                const selectedDir = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: 'Select Build Output Directory'
                });
                if (!selectedDir?.[0]?.fsPath) {
                    return;
                }
                outputDirs = [selectedDir[0].fsPath];
            }
            let dirToAnalyze;
            if (outputDirs.length === 1) {
                dirToAnalyze = outputDirs[0];
            }
            else {
                const selected = await vscode.window.showQuickPick(outputDirs.map(dir => ({ label: path.basename(dir), description: dir })), { placeHolder: 'Select a build directory to analyze' });
                if (!selected) {
                    return;
                }
                dirToAnalyze = selected.description;
            }
            if (!dirToAnalyze) {
                return;
            }
            const analysisResult = await this.bundleAnalyzer.analyzeDirectory(dirToAnalyze);
            this.showBundleAnalysis(analysisResult);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error analyzing bundle: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    showBundleAnalysis(analysis) {
        const panel = vscode.window.createWebviewPanel('bundleAnalysis', 'Bundle Size Analysis', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = this.getBundleAnalysisHtml(analysis);
    }
    getBundleAnalysisHtml(analysis) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bundle Size Analysis</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1, h2 { color: #333; }
                    .summary { margin-bottom: 20px; }
                    .file-size-bar {
                        height: 20px;
                        background-color: #0078d7;
                        margin-bottom: 5px;
                    }
                    .file-entry {
                        margin-bottom: 15px;
                    }
                    .file-name {
                        font-weight: bold;
                    }
                    .file-size {
                        color: #666;
                    }
                    .file-type {
                        display: inline-block;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 12px;
                        margin-left: 8px;
                    }
                    .file-type-js { background-color: #F0DB4F; color: black; }
                    .file-type-css { background-color: #264de4; color: white; }
                    .file-type-image { background-color: #41B883; color: white; }
                    .file-type-other { background-color: #999; color: white; }
                    .recommendations {
                        margin-top: 30px;
                        border-top: 1px solid #ddd;
                        padding-top: 20px;
                    }
                    .recommendation {
                        margin-bottom: 15px;
                        padding: 10px;
                        background-color: #f8f8f8;
                        border-left: 4px solid #0078d7;
                    }
                </style>
            </head>
            <body>
                <h1>Bundle Size Analysis</h1>
                
                <div class="summary">
                    <h2>Summary</h2>
                    <p>Total size: ${this.formatFileSize(analysis.totalSize)}</p>
                    <p>Number of files: ${analysis.files.length}</p>
                    <p>JavaScript size: ${this.formatFileSize(analysis.jsSize)} (${Math.round(analysis.jsSize / analysis.totalSize * 100)}%)</p>
                    <p>CSS size: ${this.formatFileSize(analysis.cssSize)} (${Math.round(analysis.cssSize / analysis.totalSize * 100)}%)</p>
                    <p>Images size: ${this.formatFileSize(analysis.imageSize)} (${Math.round(analysis.imageSize / analysis.totalSize * 100)}%)</p>
                    <p>Other assets: ${this.formatFileSize(analysis.otherSize)} (${Math.round(analysis.otherSize / analysis.totalSize * 100)}%)</p>
                </div>
                
                <h2>Files by Size</h2>
                <div id="files">
                    ${this.renderBundleFiles(analysis.files)}
                </div>
                
                <div class="recommendations">
                    <h2>Recommendations</h2>
                    ${this.renderBundleRecommendations(analysis.recommendations)}
                </div>
            </body>
            </html>
        `;
    }
    formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        }
        else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        }
        else {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
    }
    renderBundleFiles(files) {
        if (!files || files.length === 0) {
            return '<p>No files found.</p>';
        }
        // Sort files by size, largest first
        const sortedFiles = [...files].sort((a, b) => b.size - a.size);
        const maxSize = sortedFiles[0].size;
        return sortedFiles.map(file => {
            const percentWidth = (file.size / maxSize * 100).toFixed(2);
            let fileTypeClass = 'file-type-other';
            let fileType = 'Other';
            if (file.path.endsWith('.js') || file.path.endsWith('.mjs')) {
                fileTypeClass = 'file-type-js';
                fileType = 'JavaScript';
            }
            else if (file.path.endsWith('.css')) {
                fileTypeClass = 'file-type-css';
                fileType = 'CSS';
            }
            else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].some(ext => file.path.endsWith(ext))) {
                fileTypeClass = 'file-type-image';
                fileType = 'Image';
            }
            return `
                <div class="file-entry">
                    <div class="file-name">
                        ${path.basename(file.path)}
                        <span class="file-type ${fileTypeClass}">${fileType}</span>
                    </div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                    <div class="file-size-bar" style="width: ${percentWidth}%"></div>
                </div>
            `;
        }).join('');
    }
    renderBundleRecommendations(recommendations) {
        if (!recommendations || recommendations.length === 0) {
            return '<p>No recommendations available.</p>';
        }
        return recommendations.map(rec => `<div class="recommendation">
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
                ${rec.potentialSavings ? `<p>Potential savings: ${this.formatFileSize(rec.potentialSavings)}</p>` : ''}
            </div>`).join('');
    }
    // Helper methods
    async detectConfigsForOptimization(type) {
        try {
            const workspacePath = this.getFirstWorkspaceFolder();
            let configs = [];
            switch (type) {
                case 'webpack':
                    configs = await this.webpackManager.detectConfigs(workspacePath);
                    break;
                case 'rollup':
                    configs = await this.rollupManager.detectConfigs(workspacePath);
                    break;
                case 'vite':
                    configs = await this.viteManager.detectConfigs(workspacePath);
                    break;
            }
            if (configs.length === 0) {
                vscode.window.showInformationMessage(`No ${type} configuration files found in the workspace.`);
            }
            return configs;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    async showOptimizationOptions(configPath, optimizations) {
        // Show optimization suggestions in a webview panel
        const panel = vscode.window.createWebviewPanel('optimizationSuggestions', `Optimization Suggestions: ${path.basename(configPath)}`, vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = this.getOptimizationSuggestionsHtml(optimizations, configPath);
    }
    async findPackageJson() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders?.length) {
            return undefined;
        }
        const packageJsonPath = path.join(workspaceFolders[0].uri.fsPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            return packageJsonPath;
        }
        return undefined;
    }
    getOptimizationSuggestionsHtml(optimizations, configPath) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Optimization Suggestions</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .suggestion {
                        margin-bottom: 20px;
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }
                    .suggestion-title { font-weight: bold; margin-bottom: 10px; }
                    .suggestion-description { margin-bottom: 10px; }
                    pre {
                        background-color: #f5f5f5;
                        padding: 10px;
                        border-radius: 4px;
                        overflow-x: auto;
                    }
                    code { font-family: monospace; }
                </style>
            </head>
            <body>
                <h1>Optimization Suggestions</h1>
                <p>Configuration: ${configPath}</p>
                
                ${this.renderSharedSuggestions(optimizations)}
            </body>
            </html>
        `;
    }
    renderSharedSuggestions(suggestions) {
        if (!suggestions?.length) {
            return '<p>No optimization suggestions available.</p>';
        }
        return suggestions.map(suggestion => `
            <div class="suggestion">
                <div class="suggestion-title">${suggestion.title}</div>
                <div class="suggestion-description">${suggestion.description}</div>
                <pre><code>${suggestion.code}</code></pre>
            </div>
        `).join('');
    }
    getRollupAnalysisHtml(analysis, configPath) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Rollup Configuration Analysis</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .section { margin-bottom: 20px; }
                    .section h2 { color: #0078d7; }
                    .entry { margin-bottom: 10px; }
                    .entry-title { font-weight: bold; }
                    .performance-issue { color: #d83b01; }
                    .optimization-suggestion { color: #107c10; }
                </style>
            </head>
            <body>
                <h1>Rollup Configuration Analysis</h1>
                <p>Configuration: ${configPath}</p>
                
                <div class="section">
                    <h2>Entry Points</h2>
                    ${this.renderRollupInput(analysis.input)}
                </div>
                
                <div class="section">
                    <h2>Output Configuration</h2>
                    ${this.renderRollupOutput(analysis.output)}
                </div>
                
                <div class="section">
                    <h2>Plugins</h2>
                    ${this.renderRollupPlugins(analysis.plugins)}
                </div>

                <div class="section">
                    <h2>External Dependencies</h2>
                    ${this.renderRollupExternals(analysis.external)}
                </div>
                
                <div class="section">
                    <h2>Optimization Suggestions</h2>
                    ${this.renderRollupOptimizationSuggestions(analysis.optimizationSuggestions)}
                </div>
            </body>
            </html>
        `;
    }
    renderRollupInput(input) {
        if (!input || input.length === 0) {
            return '<p>No entry points defined</p>';
        }
        return `
            <ul>
                ${input.map(entry => `<li>${entry}</li>`).join('\n')}
            </ul>
        `;
    }
    renderRollupOutput(output) {
        if (!output || output.length === 0) {
            return '<p>No output configuration defined</p>';
        }
        return `
            <ul>
                ${output.map(out => `
                    <li>
                        <div class="entry">
                            <div class="entry-title">Format: ${out.format}</div>
                            <div>File: ${out.file}</div>
                            ${out.name ? `<div>Name: ${out.name}</div>` : ''}
                        </div>
                    </li>
                `).join('\n')}
            </ul>
        `;
    }
    renderRollupPlugins(plugins) {
        if (!plugins || plugins.length === 0) {
            return '<p>No plugins configured</p>';
        }
        return `
            <ul>
                ${plugins.map(plugin => `
                    <li>
                        <div class="entry">
                            <div class="entry-title">${plugin.name}</div>
                            <div>${plugin.description}</div>
                        </div>
                    </li>
                `).join('\n')}
            </ul>
        `;
    }
    renderRollupExternals(externals) {
        if (!externals || externals.length === 0) {
            return '<p>No external dependencies defined</p>';
        }
        return `
            <ul>
                ${externals.map(ext => `<li>${ext}</li>`).join('\n')}
            </ul>
        `;
    }
    renderRollupOptimizationSuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) {
            return '<p>No optimization suggestions available</p>';
        }
        return `
            <ul>
                ${suggestions.map(suggestion => `
                    <li>
                        <div class="entry optimization-suggestion">
                            <div class="entry-title">${suggestion.title}</div>
                            <div>${suggestion.description}</div>
                            <pre><code>${suggestion.code}</code></pre>
                        </div>
                    </li>
                `).join('\n')}
            </ul>
        `;
    }
    async analyzeRollupConfig(configPath) {
        const analysis = await this.rollupManager.analyzeConfig(configPath);
        // Show analysis in a webview
        const panel = vscode.window.createWebviewPanel('rollupAnalysis', `Rollup Analysis: ${path.basename(configPath)}`, vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = this.getRollupAnalysisHtml(analysis, configPath);
    }
    getFirstWorkspaceFolder() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders?.[0]?.uri.fsPath) {
            throw new Error('No workspace folder open.');
        }
        return workspaceFolders[0].uri.fsPath;
    }
}
exports.BuildToolsManager = BuildToolsManager;
//# sourceMappingURL=buildToolsManager.js.map