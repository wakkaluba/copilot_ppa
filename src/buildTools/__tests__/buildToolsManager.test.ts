import * as vscode from 'vscode';
import { ILogger } from '../../logging/ILogger';
import { BuildScriptOptimizer } from '../buildScriptOptimizer';
import { BuildToolsManager } from '../buildToolsManager';
import { BundleAnalyzer } from '../bundleAnalyzer';
import { RollupConfigManager } from '../rollup/rollupConfigManager';
import { ViteConfigManager } from '../vite/viteConfigManager';
import { WebpackConfigManager } from '../webpack/webpackConfigManager';

// Mock dependencies
jest.mock('../webpack/webpackConfigManager');
jest.mock('../rollup/rollupConfigManager');
jest.mock('../vite/viteConfigManager');
jest.mock('../buildScriptOptimizer');
jest.mock('../bundleAnalyzer');
jest.mock('vscode');

describe('BuildToolsManager', () => {
    let buildToolsManager: BuildToolsManager;
    let mockContext: vscode.ExtensionContext;
    let mockLogger: ILogger;
    let mockWebpackManager: jest.Mocked<WebpackConfigManager>;
    let mockRollupManager: jest.Mocked<RollupConfigManager>;
    let mockViteManager: jest.Mocked<ViteConfigManager>;
    let mockBuildScriptOptimizer: jest.Mocked<BuildScriptOptimizer>;
    let mockBundleAnalyzer: jest.Mocked<BundleAnalyzer>;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create mock context
        mockContext = {
            subscriptions: [],
            extensionPath: 'test/path'
        } as unknown as vscode.ExtensionContext;

        // Create mock logger
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        // Create the manager instance
        buildToolsManager = new BuildToolsManager(mockContext, mockLogger);

        // Get mock instances
        mockWebpackManager = WebpackConfigManager as unknown as jest.Mocked<WebpackConfigManager>;
        mockRollupManager = RollupConfigManager as unknown as jest.Mocked<RollupConfigManager>;
        mockViteManager = ViteConfigManager as unknown as jest.Mocked<ViteConfigManager>;
        mockBuildScriptOptimizer = BuildScriptOptimizer as unknown as jest.Mocked<BuildScriptOptimizer>;
        mockBundleAnalyzer = BundleAnalyzer as unknown as jest.Mocked<BundleAnalyzer>;
    });

    afterEach(() => {
        buildToolsManager.dispose();
    });

    describe('Webpack functionality', () => {
        test('should detect webpack configs', async () => {
            // Mock workspace folders
            (vscode.workspace.workspaceFolders as unknown) = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            const mockConfigs = ['/test/workspace/webpack.config.js'];
            mockWebpackManager.detectConfigs.mockResolvedValue(mockConfigs);

            // Mock QuickPick
            const mockQuickPick = { label: 'webpack.config.js', description: mockConfigs[0] };
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(mockQuickPick);

            await buildToolsManager.detectWebpackConfig();

            expect(mockWebpackManager.detectConfigs).toHaveBeenCalledWith('/test/workspace');
            expect(vscode.window.showQuickPick).toHaveBeenCalled();
            expect(mockWebpackManager.analyzeConfig).toHaveBeenCalledWith(mockConfigs[0]);
        });

        test('should handle no webpack configs found', async () => {
            // Mock workspace folders
            (vscode.workspace.workspaceFolders as unknown) = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            mockWebpackManager.detectConfigs.mockResolvedValue([]);

            await buildToolsManager.detectWebpackConfig();

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'No webpack configuration files found in the workspace.'
            );
        });
    });

    describe('Rollup functionality', () => {
        test('should detect rollup configs', async () => {
            // Mock workspace folders
            (vscode.workspace.workspaceFolders as unknown) = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            const mockConfigs = ['/test/workspace/rollup.config.js'];
            mockRollupManager.detectConfigs.mockResolvedValue(mockConfigs);

            // Mock QuickPick
            const mockQuickPick = { label: 'rollup.config.js', description: mockConfigs[0] };
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(mockQuickPick);

            await buildToolsManager.detectRollupConfig();

            expect(mockRollupManager.detectConfigs).toHaveBeenCalledWith('/test/workspace');
            expect(vscode.window.showQuickPick).toHaveBeenCalled();
            expect(mockRollupManager.analyzeConfig).toHaveBeenCalledWith(mockConfigs[0]);
        });
    });

    describe('Vite functionality', () => {
        test('should detect vite configs', async () => {
            (vscode.workspace.workspaceFolders as unknown) = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            const mockConfigs = ['/test/workspace/vite.config.js'];
            mockViteManager.detectConfigs.mockResolvedValue(mockConfigs);

            const mockQuickPick = { label: 'vite.config.js', description: mockConfigs[0] };
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(mockQuickPick);

            await buildToolsManager.detectViteConfig();

            expect(mockViteManager.detectConfigs).toHaveBeenCalledWith('/test/workspace');
            expect(vscode.window.showQuickPick).toHaveBeenCalled();
            expect(mockViteManager.analyzeConfig).toHaveBeenCalledWith(mockConfigs[0]);
        });

        test('should handle no vite configs found', async () => {
            (vscode.workspace.workspaceFolders as unknown) = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            mockViteManager.detectConfigs.mockResolvedValue([]);

            await buildToolsManager.detectViteConfig();

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'No Vite configuration files found in the workspace.'
            );
        });

        test('should handle optimization of vite config', async () => {
            const mockConfigs = ['/test/workspace/vite.config.js'];
            const mockOptimizations = [
                { id: 'opt1', title: 'Enable build cache', description: 'Speed up builds' }
            ];

            mockViteManager.detectConfigs.mockResolvedValue(mockConfigs);
            mockViteManager.generateOptimizations.mockResolvedValue(mockOptimizations);

            const mockQuickPick = { label: 'vite.config.js', description: mockConfigs[0] };
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(mockQuickPick);

            await buildToolsManager.optimizeViteConfig();

            expect(mockViteManager.generateOptimizations).toHaveBeenCalledWith(mockConfigs[0]);
            expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
        });
    });

    describe('Build script optimization', () => {
        test('should optimize build scripts', async () => {
            const mockPackageJsonPath = '/test/workspace/package.json';
            const mockScript = 'webpack --mode production';
            const mockOptimizations = [
                { title: 'Add cross-env', description: 'Use cross-env for environment variables' }
            ];

            // Mock file system operations
            jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
            jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(JSON.stringify({
                scripts: {
                    build: mockScript
                }
            }));

            // Mock optimization generation
            mockBuildScriptOptimizer.optimizeScript.mockResolvedValue(mockOptimizations);

            // Mock QuickPick selection
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({
                label: 'build',
                description: mockScript
            });

            await buildToolsManager.optimizeBuildScripts();

            expect(mockBuildScriptOptimizer.optimizeScript).toHaveBeenCalledWith(
                'build',
                mockScript
            );
        });
    });

    describe('Bundle analysis', () => {
        test('should analyze bundle size', async () => {
            const mockDir = '/test/workspace/dist';
            const mockAnalysis = {
                totalSize: 1000000,
                files: [
                    { path: 'main.js', size: 500000, extension: '.js' }
                ],
                jsSize: 500000,
                cssSize: 0,
                imageSize: 0,
                otherSize: 0,
                recommendations: [
                    { title: 'Minimize JavaScript', description: 'Consider using terser for JS minification', potentialSavings: 200000 }
                ]
            };

            // Mock file system
            jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
            jest.spyOn(require('fs'), 'statSync').mockReturnValue({ isDirectory: () => true });

            // Mock analysis
            mockBundleAnalyzer.analyzeDirectory.mockResolvedValue(mockAnalysis);

            await buildToolsManager.analyzeBundleSize();

            expect(mockBundleAnalyzer.analyzeDirectory).toHaveBeenCalled();
            expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
        });
    });

    describe('Cleanup', () => {
        test('should dispose resources properly', () => {
            const disposeSpy = jest.spyOn(buildToolsManager, 'dispose');

            buildToolsManager.dispose();

            expect(disposeSpy).toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        test('should handle errors in webpack config detection', async () => {
            (vscode.workspace.workspaceFolders as unknown) = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            const error = new Error('Failed to parse config');
            mockWebpackManager.detectConfigs.mockRejectedValue(error);

            await buildToolsManager.detectWebpackConfig();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(`Error: ${error.message}`);
        });

        test('should handle missing workspace folder', async () => {
            (vscode.workspace.workspaceFolders as unknown) = undefined;

            await expect(buildToolsManager.detectWebpackConfig()).rejects.toThrow('No workspace folder open.');
        });

        test('should handle bundle analysis errors', async () => {
            const error = new Error('Failed to analyze bundle');
            mockBundleAnalyzer.analyzeDirectory.mockRejectedValue(error);

            await buildToolsManager.analyzeBundleSize();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                `Error analyzing bundle: ${error.message}`
            );
        });
    });

    describe('HTML rendering', () => {
        test('should format file sizes correctly', () => {
            const buildTools = buildToolsManager as any; // Access private methods

            expect(buildTools.formatFileSize(1023)).toBe('1023 B');
            expect(buildTools.formatFileSize(1024)).toBe('1.0 KB');
            expect(buildTools.formatFileSize(1024 * 1024)).toBe('1.0 MB');
            expect(buildTools.formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
        });

        test('should render bundle files list', () => {
            const buildTools = buildToolsManager as any;
            const files = [
                { path: 'main.js', size: 1024 * 50 }, // 50KB
                { path: 'styles.css', size: 1024 * 10 } // 10KB
            ];

            const html = buildTools.renderBundleFiles(files);

            expect(html).toContain('main.js');
            expect(html).toContain('50.0 KB');
            expect(html).toContain('styles.css');
            expect(html).toContain('10.0 KB');
            expect(html).toContain('file-type-js');
            expect(html).toContain('file-type-css');
        });

        test('should render bundle recommendations', () => {
            const buildTools = buildToolsManager as any;
            const recommendations = [
                {
                    title: 'Split chunks',
                    description: 'Use code splitting',
                    potentialSavings: 1024 * 100 // 100KB
                }
            ];

            const html = buildTools.renderBundleRecommendations(recommendations);

            expect(html).toContain('Split chunks');
            expect(html).toContain('Use code splitting');
            expect(html).toContain('100.0 KB');
        });

        test('should handle empty build script optimizations', () => {
            const buildTools = buildToolsManager as any;
            const html = buildTools.renderBuildScriptOptimizations([]);

            expect(html).toContain('No optimizations available');
        });
    });

    describe('Configuration validation', () => {
        test('should validate webpack configuration', async () => {
            const mockConfigs = ['/test/workspace/webpack.config.js'];
            const mockValidation = {
                isValid: true,
                errors: [],
                warnings: []
            };

            mockWebpackManager.detectConfigs.mockResolvedValue(mockConfigs);
            mockWebpackManager.validateConfig.mockResolvedValue(mockValidation);

            const mockQuickPick = { label: 'webpack.config.js', description: mockConfigs[0] };
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(mockQuickPick);

            await buildToolsManager.validateWebpackConfig();

            expect(mockWebpackManager.validateConfig).toHaveBeenCalledWith(mockConfigs[0]);
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Configuration is valid');
        });

        test('should handle invalid webpack configuration', async () => {
            const mockConfigs = ['/test/workspace/webpack.config.js'];
            const mockValidation = {
                isValid: false,
                errors: ['Invalid entry point'],
                warnings: ['Deprecated option used']
            };

            mockWebpackManager.detectConfigs.mockResolvedValue(mockConfigs);
            mockWebpackManager.validateConfig.mockResolvedValue(mockValidation);

            const mockQuickPick = { label: 'webpack.config.js', description: mockConfigs[0] };
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(mockQuickPick);

            await buildToolsManager.validateWebpackConfig();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Configuration validation failed: Invalid entry point');
        });
    });

    describe('Package.json handling', () => {
        test('should detect and parse package.json', async () => {
            const mockPackageJson = {
                scripts: {
                    build: 'webpack',
                    'build:prod': 'webpack --mode production'
                }
            };

            jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
            jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(JSON.stringify(mockPackageJson));

            (vscode.workspace.workspaceFolders as unknown) = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            const result = await buildToolsManager.findBuildScripts();

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('build');
            expect(result[1].name).toBe('build:prod');
        });

        test('should handle missing package.json', async () => {
            jest.spyOn(require('fs'), 'existsSync').mockReturnValue(false);

            (vscode.workspace.workspaceFolders as unknown) = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            const result = await buildToolsManager.findBuildScripts();

            expect(result).toHaveLength(0);
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No package.json found in workspace');
        });
    });

    describe('Event handling', () => {
        test('should handle configuration file changes', () => {
            const mockFileSystemWatcher = {
                onDidChange: jest.fn(),
                onDidDelete: jest.fn(),
                onDidCreate: jest.fn(),
                dispose: jest.fn()
            };

            (vscode.workspace.createFileSystemWatcher as jest.Mock).mockReturnValue(mockFileSystemWatcher);

            buildToolsManager.watchConfigFiles();

            expect(vscode.workspace.createFileSystemWatcher).toHaveBeenCalledWith('**/{webpack,rollup,vite}.config.{js,ts}');
            expect(mockFileSystemWatcher.onDidChange).toHaveBeenCalled();
            expect(mockFileSystemWatcher.onDidDelete).toHaveBeenCalled();
            expect(mockFileSystemWatcher.onDidCreate).toHaveBeenCalled();
        });
    });

    describe('Configuration analysis', () => {
        test('should analyze webpack configuration', async () => {
            const mockConfigs = ['/test/workspace/webpack.config.js'];
            const mockAnalysis = {
                configPath: mockConfigs[0],
                optimizationSuggestions: [{
                    title: 'Enable caching',
                    description: 'Add cache configuration',
                    code: 'cache: true',
                    complexity: 'low',
                    benefit: 'Faster rebuilds'
                }]
            };

            mockWebpackManager.detectConfigs.mockResolvedValue(mockConfigs);
            mockWebpackManager.analyzeConfig.mockResolvedValue(mockAnalysis);

            const mockQuickPick = { label: 'webpack.config.js', description: mockConfigs[0] };
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(mockQuickPick);

            await buildToolsManager.detectWebpackConfig();

            expect(mockWebpackManager.analyzeConfig).toHaveBeenCalledWith(mockConfigs[0]);
            expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
        });

        test('should handle analysis errors', async () => {
            const mockConfigs = ['/test/workspace/webpack.config.js'];
            const error = new Error('Analysis failed');

            mockWebpackManager.detectConfigs.mockResolvedValue(mockConfigs);
            mockWebpackManager.analyzeConfig.mockRejectedValue(error);

            const mockQuickPick = { label: 'webpack.config.js', description: mockConfigs[0] };
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(mockQuickPick);

            await buildToolsManager.detectWebpackConfig();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(`Error analyzing configuration: ${error.message}`);
        });
    });

    describe('Build script detection', () => {
        test('should detect build scripts in package.json', async () => {
            const mockPackageJson = {
                scripts: {
                    build: 'webpack',
                    'build:prod': 'webpack --mode production'
                }
            };

            jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
            jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(JSON.stringify(mockPackageJson));

            (vscode.workspace.workspaceFolders as unknown) = [{
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            }];

            await buildToolsManager.optimizeBuildScripts();

            expect(vscode.window.showQuickPick).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ label: 'build' }),
                    expect.objectContaining({ label: 'build:prod' })
                ]),
                expect.anything()
            );
        });
    });

    describe('File system monitoring', () => {
        test('should handle config file changes', async () => {
            const mockFileSystemWatcher = {
                onDidChange: jest.fn(),
                onDidDelete: jest.fn(),
                onDidCreate: jest.fn(),
                dispose: jest.fn()
            };

            (vscode.workspace.createFileSystemWatcher as jest.Mock).mockReturnValue(mockFileSystemWatcher);

            // Trigger a file change event
            const mockFile = vscode.Uri.file('/test/workspace/webpack.config.js');
            await buildToolsManager.onConfigFileChanged(mockFile);

            expect(mockWebpackManager.detectConfigs).toHaveBeenCalled();
        });
    });
});
