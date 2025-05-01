import * as fs from 'fs';
import * as vscode from 'vscode';
import { IWebpackAnalysisResult } from '../../types';
import { WebpackConfigAnalyzer } from '../WebpackConfigAnalyzer';

// Mock the vscode module
jest.mock('vscode', () => ({
    window: {
        showInformationMessage: jest.fn(),
        showErrorMessage: jest.fn()
    },
    workspace: {
        workspaceFolders: [],
        getWorkspaceFolder: jest.fn()
    }
}));

// Mock the fs module
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    readFileSync: jest.fn()
}));

describe('WebpackConfigAnalyzer', () => {
    let analyzer: WebpackConfigAnalyzer;

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup test workspace
        (vscode.workspace.workspaceFolders as any) = [{
            uri: { fsPath: '/workspace' },
            name: 'workspace',
            index: 0
        }];
        (vscode.workspace.getWorkspaceFolder as jest.Mock).mockReturnValue({
            uri: { fsPath: '/workspace' }
        });

        analyzer = new WebpackConfigAnalyzer();
    });

    describe('analyzeConfig', () => {
        it('should analyze webpack.config.js file', async () => {
            const configPath = '/workspace/webpack.config.js';
            const configContent = `
                module.exports = {
                    mode: 'development',
                    entry: './src/index.js',
                    output: {
                        path: path.resolve(__dirname, 'dist'),
                        filename: 'bundle.js'
                    },
                    module: {
                        rules: [
                            {
                                test: /\\.js$/,
                                exclude: /node_modules/,
                                use: 'babel-loader'
                            }
                        ]
                    },
                    plugins: [
                        new HtmlWebpackPlugin({
                            template: './src/index.html'
                        })
                    ]
                };
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const result = await analyzer.analyzeConfig(configPath);

            expect(result).toBeDefined();
            expect(result.configPath).toBe(configPath);
            expect(result.entry).toBeDefined();
            expect(result.output).toBeDefined();
            expect(result.plugins).toBeDefined();
            expect(result.loaders).toBeDefined();
            expect(result.warnings).toBeDefined();
            expect(result.errors).toBeDefined();
        });

        it('should extract entry point information', async () => {
            const configPath = '/workspace/webpack.config.js';
            const configContent = `
                module.exports = {
                    entry: {
                        main: './src/index.js',
                        vendor: './src/vendor.js'
                    }
                };
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const result = await analyzer.analyzeConfig(configPath);

            expect(result.entry).toBeDefined();
            expect(Array.isArray(result.entry)).toBe(true);
            expect(result.entry).toContain('main');
            expect(result.entry).toContain('vendor');
        });

        it('should extract output information', async () => {
            const configPath = '/workspace/webpack.config.js';
            const configContent = `
                module.exports = {
                    output: {
                        path: path.resolve(__dirname, 'dist'),
                        filename: 'bundle.[name].js',
                        publicPath: '/'
                    }
                };
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const result = await analyzer.analyzeConfig(configPath);

            expect(result.output).toBeDefined();
            expect(result.output.path).toBe('dist');
            expect(result.output.filename).toBe('bundle.[name].js');
        });

        it('should extract plugins information', async () => {
            const configPath = '/workspace/webpack.config.js';
            const configContent = `
                module.exports = {
                    plugins: [
                        new HtmlWebpackPlugin(),
                        new MiniCssExtractPlugin(),
                        new webpack.DefinePlugin({
                            'process.env.NODE_ENV': JSON.stringify('production')
                        })
                    ]
                };
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const result = await analyzer.analyzeConfig(configPath);

            expect(result.plugins).toBeDefined();
            expect(Array.isArray(result.plugins)).toBe(true);
            expect(result.plugins).toContain('HtmlWebpackPlugin');
            expect(result.plugins).toContain('MiniCssExtractPlugin');
            expect(result.plugins).toContain('DefinePlugin');
        });

        it('should extract loaders information', async () => {
            const configPath = '/workspace/webpack.config.js';
            const configContent = `
                module.exports = {
                    module: {
                        rules: [
                            {
                                test: /\\.js$/,
                                use: 'babel-loader'
                            },
                            {
                                test: /\\.css$/,
                                use: ['style-loader', 'css-loader']
                            }
                        ]
                    }
                };
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const result = await analyzer.analyzeConfig(configPath);

            expect(result.loaders).toBeDefined();
            expect(Array.isArray(result.loaders)).toBe(true);
            expect(result.loaders).toContain('babel-loader');
            expect(result.loaders).toContain('style-loader');
            expect(result.loaders).toContain('css-loader');
        });

        it('should include warnings for potential issues', async () => {
            const configPath = '/workspace/webpack.config.js';
            const configContent = `
                module.exports = {
                    // Missing entry and output
                };
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const result = await analyzer.analyzeConfig(configPath);

            expect(result.warnings).toBeDefined();
            expect(result.warnings.length).toBeGreaterThan(0);
        });

        it('should handle errors when config file does not exist', async () => {
            const configPath = '/workspace/webpack.config.js';
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const result = await analyzer.analyzeConfig(configPath);

            expect(result.errors).toBeDefined();
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toContain('Configuration file not found');
        });

        it('should handle invalid config files', async () => {
            const configPath = '/workspace/webpack.config.js';
            const configContent = `
                // Invalid config
                module.exports = {
                    entry: {
                        // Unclosed object
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const result = await analyzer.analyzeConfig(configPath);

            expect(result.errors).toBeDefined();
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('identifyPerformanceBottlenecks', () => {
        it('should identify potential performance bottlenecks in config', async () => {
            const configContent = `
                module.exports = {
                    entry: './src/index.js',
                    mode: 'development',
                    devtool: 'eval',
                    module: {
                        rules: [
                            {
                                test: /\\.js$/,
                                use: 'babel-loader'
                            }
                        ]
                    }
                };
            `;
            const result: IWebpackAnalysisResult = {
                configPath: '/workspace/webpack.config.js',
                entry: ['./src/index.js'],
                output: {},
                plugins: [],
                loaders: ['babel-loader'],
                warnings: [],
                errors: []
            };

            const bottlenecks = analyzer.identifyPerformanceBottlenecks(result, configContent);

            expect(bottlenecks).toBeDefined();
            expect(Array.isArray(bottlenecks)).toBe(true);
            expect(bottlenecks.length).toBeGreaterThan(0);
            // Verify some common performance issues are detected
            expect(bottlenecks.some(b => b.includes('mode') && b.includes('development'))).toBe(true);
            expect(bottlenecks.some(b => b.includes('devtool') && b.includes('eval'))).toBe(true);
        });

        it('should identify missing production optimizations', async () => {
            const configContent = `
                module.exports = {
                    entry: './src/index.js',
                    mode: 'production',
                    // Missing optimization section
                    output: {
                        path: path.resolve(__dirname, 'dist'),
                        filename: 'bundle.js'
                    }
                };
            `;
            const result: IWebpackAnalysisResult = {
                configPath: '/workspace/webpack.config.js',
                entry: ['./src/index.js'],
                output: { path: 'dist', filename: 'bundle.js' },
                plugins: [],
                loaders: [],
                warnings: [],
                errors: []
            };

            const bottlenecks = analyzer.identifyPerformanceBottlenecks(result, configContent);

            expect(bottlenecks).toBeDefined();
            expect(bottlenecks.some(b => b.includes('optimization'))).toBe(true);
        });

        it('should identify missing core plugins for production', async () => {
            const configContent = `
                module.exports = {
                    entry: './src/index.js',
                    mode: 'production',
                    output: {
                        path: path.resolve(__dirname, 'dist'),
                        filename: 'bundle.js'
                    },
                    // Missing important plugins
                    plugins: []
                };
            `;
            const result: IWebpackAnalysisResult = {
                configPath: '/workspace/webpack.config.js',
                entry: ['./src/index.js'],
                output: { path: 'dist', filename: 'bundle.js' },
                plugins: [],
                loaders: [],
                warnings: [],
                errors: []
            };

            const bottlenecks = analyzer.identifyPerformanceBottlenecks(result, configContent);

            expect(bottlenecks).toBeDefined();
            expect(bottlenecks.some(b => b.includes('plugin'))).toBe(true);
        });
    });

    describe('suggestOptimizations', () => {
        it('should suggest optimizations based on analysis', async () => {
            const configPath = '/workspace/webpack.config.js';
            const configContent = `
                module.exports = {
                    mode: 'development',
                    entry: './src/index.js',
                    output: {
                        path: path.resolve(__dirname, 'dist'),
                        filename: 'bundle.js'
                    }
                };
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const optimizations = await analyzer.suggestOptimizations(configPath);

            expect(optimizations).toBeDefined();
            expect(Array.isArray(optimizations)).toBe(true);
            expect(optimizations.length).toBeGreaterThan(0);
        });

        it('should suggest production mode for non-development environments', async () => {
            const configPath = '/workspace/webpack.config.js';
            const configContent = `
                module.exports = {
                    // Missing mode
                    entry: './src/index.js',
                    output: {
                        path: path.resolve(__dirname, 'dist'),
                        filename: 'bundle.js'
                    }
                };
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const optimizations = await analyzer.suggestOptimizations(configPath);

            expect(optimizations).toBeDefined();
            expect(optimizations.some(o => o.includes('mode') && o.includes('production'))).toBe(true);
        });

        it('should suggest splitting bundles for large projects', async () => {
            const configPath = '/workspace/webpack.config.js';
            const configContent = `
                module.exports = {
                    mode: 'production',
                    entry: './src/index.js',
                    output: {
                        path: path.resolve(__dirname, 'dist'),
                        filename: 'bundle.js'
                    }
                    // Missing optimization with splitChunks
                };
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const optimizations = await analyzer.suggestOptimizations(configPath);

            expect(optimizations).toBeDefined();
            expect(optimizations.some(o => o.includes('splitChunks'))).toBe(true);
        });

        it('should handle errors during optimization suggestions', async () => {
            const configPath = '/workspace/webpack.config.js';
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const optimizations = await analyzer.suggestOptimizations(configPath);

            expect(optimizations).toEqual([]);
            expect(vscode.window.showErrorMessage).toHaveBeenCalled();
        });
    });
});
