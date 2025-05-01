// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\__tests__\buildToolsManager.js.test.js

const vscode = require('vscode');
const { BuildToolsManager } = require('../buildToolsManager');
const { WebpackConfigManager } = require('../webpack/webpackConfigManager');
const { RollupConfigManager } = require('../rollup/rollupConfigManager');
const { ViteConfigManager } = require('../vite/viteConfigManager');
const { BuildScriptOptimizer } = require('../buildScriptOptimizer');
const { BundleAnalyzer } = require('../bundleAnalyzer');
const fs = require('fs');
const path = require('path');

// Mock dependencies
jest.mock('../webpack/webpackConfigManager');
jest.mock('../rollup/rollupConfigManager');
jest.mock('../vite/viteConfigManager');
jest.mock('../buildScriptOptimizer');
jest.mock('../bundleAnalyzer');
jest.mock('vscode');
jest.mock('fs');
jest.mock('path');

describe('BuildToolsManager JavaScript Implementation', () => {
    let buildToolsManager;
    let mockContext;
    let mockLogger;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create mock context
        mockContext = {
            subscriptions: [],
            extensionPath: 'test/path'
        };

        // Create mock logger
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        // Create the manager instance
        buildToolsManager = new BuildToolsManager(mockContext, mockLogger);
    });

    afterEach(() => {
        buildToolsManager.dispose();
    });

    describe('Command Registration', () => {
        test('should register all necessary commands', () => {
            // Verify that the commands are registered
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLM.buildTools.detectWebpackConfig',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLM.buildTools.optimizeWebpackConfig',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLM.buildTools.detectRollupConfig',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLM.buildTools.optimizeRollupConfig',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLM.buildTools.detectViteConfig',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLM.buildTools.optimizeViteConfig',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLM.buildTools.optimizeBuildScripts',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLM.buildTools.analyzeBundleSize',
                expect.any(Function)
            );
        });
    });

    describe('Webpack Config Detection', () => {
        test('should show message when no webpack configs found', async () => {
            // Mock workspace folders
            vscode.workspace.workspaceFolders = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            // Mock no configs found
            WebpackConfigManager.prototype.detectConfigs = jest.fn().mockResolvedValue([]);

            await buildToolsManager.detectWebpackConfig();

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'No webpack configuration files found in the workspace.'
            );
        });

        test('should detect and analyze webpack configs when found', async () => {
            // Mock workspace folders
            vscode.workspace.workspaceFolders = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            const mockConfigs = ['/test/workspace/webpack.config.js'];

            // Mock configs found
            WebpackConfigManager.prototype.detectConfigs = jest.fn().mockResolvedValue(mockConfigs);

            // Mock analysis result
            WebpackConfigManager.prototype.analyzeConfig = jest.fn().mockResolvedValue({
                entryPoints: [{ name: 'main', path: './src/index.js' }],
                output: { path: './dist', filename: 'bundle.js' },
                loaders: [],
                plugins: [],
                optimizationSuggestions: []
            });

            // Mock QuickPick
            vscode.window.showQuickPick = jest.fn().mockResolvedValue({
                label: 'webpack.config.js',
                description: mockConfigs[0]
            });

            // Mock createWebviewPanel
            vscode.window.createWebviewPanel = jest.fn().mockReturnValue({
                webview: { html: '' }
            });

            await buildToolsManager.detectWebpackConfig();

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'Found 1 webpack configuration files.'
            );
            expect(vscode.window.showQuickPick).toHaveBeenCalledWith(
                [{ label: 'webpack.config.js', description: mockConfigs[0] }],
                { placeHolder: 'Select a webpack configuration file to analyze' }
            );
            expect(WebpackConfigManager.prototype.analyzeConfig).toHaveBeenCalledWith(mockConfigs[0]);
            expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
        });

        test('should handle errors in webpack config detection', async () => {
            // Mock workspace folders
            vscode.workspace.workspaceFolders = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            // Mock error
            const error = new Error('Failed to detect webpack configs');
            WebpackConfigManager.prototype.detectConfigs = jest.fn().mockRejectedValue(error);

            await buildToolsManager.detectWebpackConfig();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                `Error: ${error.message}`
            );
        });
    });

    describe('HTML Rendering Functions', () => {
        test('should render entry points correctly', () => {
            const entryPoints = [
                { name: 'main', path: './src/index.js' },
                { name: 'vendor', path: './src/vendor.js' }
            ];

            const result = buildToolsManager.renderEntryPoints(entryPoints);

            expect(result).toContain('main');
            expect(result).toContain('./src/index.js');
            expect(result).toContain('vendor');
            expect(result).toContain('./src/vendor.js');
        });

        test('should handle empty entry points', () => {
            const result = buildToolsManager.renderEntryPoints([]);
            expect(result).toBe('<p>No entry points found.</p>');
        });

        test('should render output config correctly', () => {
            const output = { path: './dist', filename: 'bundle.js' };
            const result = buildToolsManager.renderOutputConfig(output);

            expect(result).toContain('./dist');
            expect(result).toContain('bundle.js');
        });

        test('should handle missing output config', () => {
            const result = buildToolsManager.renderOutputConfig(null);
            expect(result).toBe('<p>No output configuration found.</p>');
        });
    });

    describe('File Size Formatting', () => {
        test('should format bytes correctly', () => {
            expect(buildToolsManager.formatFileSize(500)).toBe('500 B');
            expect(buildToolsManager.formatFileSize(1500)).toBe('1.46 KB');
            expect(buildToolsManager.formatFileSize(1.5 * 1024 * 1024)).toBe('1.50 MB');
        });
    });

    describe('Bundle Size Analysis', () => {
        test('should handle bundle analysis with standard directory', async () => {
            // Mock workspace folders
            vscode.workspace.workspaceFolders = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            // Mock filesystem
            fs.existsSync = jest.fn().mockReturnValue(true);
            fs.statSync = jest.fn().mockReturnValue({ isDirectory: () => true });

            // Mock path
            path.join = jest.fn().mockImplementation((...args) => args.join('/'));
            path.basename = jest.fn().mockImplementation(p => p.split('/').pop());

            // Mock analysis result
            const mockAnalysis = {
                totalSize: 1000000,
                jsSize: 700000,
                cssSize: 200000,
                imageSize: 50000,
                otherSize: 50000,
                files: [
                    { path: 'main.js', size: 700000 }
                ],
                recommendations: [
                    { title: 'Minimize JS', description: 'Use terser', potentialSavings: 300000 }
                ]
            };

            BundleAnalyzer.prototype.analyzeDirectory = jest.fn().mockResolvedValue(mockAnalysis);

            // Mock createWebviewPanel
            vscode.window.createWebviewPanel = jest.fn().mockReturnValue({
                webview: { html: '' }
            });

            await buildToolsManager.analyzeBundleSize();

            expect(fs.existsSync).toHaveBeenCalled();
            expect(BundleAnalyzer.prototype.analyzeDirectory).toHaveBeenCalled();
            expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
        });
    });

    describe('Package.json Operations', () => {
        test('should find and return package.json path when it exists', async () => {
            // Mock workspace folders
            vscode.workspace.workspaceFolders = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            // Mock path
            path.join = jest.fn().mockReturnValue('/test/workspace/package.json');

            // Mock fs
            fs.existsSync = jest.fn().mockReturnValue(true);

            const result = await buildToolsManager.findPackageJson();
            expect(result).toBe('/test/workspace/package.json');
        });

        test('should handle missing package.json', async () => {
            // Mock workspace folders
            vscode.workspace.workspaceFolders = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            // Mock path
            path.join = jest.fn().mockReturnValue('/test/workspace/package.json');

            // Mock fs - package.json doesn't exist
            fs.existsSync = jest.fn().mockReturnValue(false);

            const result = await buildToolsManager.findPackageJson();
            expect(result).toBeUndefined();
        });
    });

    describe('Resource Cleanup', () => {
        test('should clean up resources when disposed', () => {
            // Create mock dispose methods for all managers
            const webpackDispose = jest.fn();
            const rollupDispose = jest.fn();
            const viteDispose = jest.fn();
            const optimizerDispose = jest.fn();
            const analyzerDispose = jest.fn();

            // Assign mock dispose methods
            buildToolsManager.webpackManager.dispose = webpackDispose;
            buildToolsManager.rollupManager.dispose = rollupDispose;
            buildToolsManager.viteManager.dispose = viteDispose;
            buildToolsManager.buildScriptOptimizer.dispose = optimizerDispose;
            buildToolsManager.bundleAnalyzer.dispose = analyzerDispose;

            // Call dispose
            buildToolsManager.dispose();

            // Verify all dispose methods were called
            expect(webpackDispose).toHaveBeenCalled();
            expect(rollupDispose).toHaveBeenCalled();
            expect(viteDispose).toHaveBeenCalled();
            expect(optimizerDispose).toHaveBeenCalled();
            expect(analyzerDispose).toHaveBeenCalled();
        });
    });
});
