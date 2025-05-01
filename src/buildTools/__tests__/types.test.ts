import {
    BuildResultStatus,
    BuildToolType,
    IBuildAnalysisResult,
    IBuildConfiguration,
    IBuildTool,
    IBuildToolsManager,
    IOptimization,
    IValidationResult,
    OptimizationType
} from '../types';

describe('BuildTools Types', () => {
    describe('IBuildTool', () => {
        it('should create valid build tool object', () => {
            const buildTool: IBuildTool = {
                name: 'Webpack',
                type: BuildToolType.Webpack,
                configFiles: ['webpack.config.js'],
                version: '5.0.0',
                isDetected: true
            };

            expect(buildTool.name).toBe('Webpack');
            expect(buildTool.type).toBe(BuildToolType.Webpack);
            expect(buildTool.configFiles).toContain('webpack.config.js');
            expect(buildTool.version).toBe('5.0.0');
            expect(buildTool.isDetected).toBe(true);
        });

        it('should support optional fields', () => {
            const buildTool: IBuildTool = {
                name: 'Rollup',
                type: BuildToolType.Rollup,
                configFiles: ['rollup.config.js'],
                isDetected: true
            };

            expect(buildTool.name).toBe('Rollup');
            expect(buildTool.version).toBeUndefined();
        });
    });

    describe('IBuildToolsManager', () => {
        it('should define required methods', () => {
            // Create a mock implementation of IBuildToolsManager
            const manager: IBuildToolsManager = {
                detectBuildTools: jest.fn(),
                analyzeBuildConfig: jest.fn(),
                validateBuildConfig: jest.fn(),
                generateOptimizations: jest.fn(),
                applyOptimization: jest.fn()
            };

            // Verify the interface shape
            expect(typeof manager.detectBuildTools).toBe('function');
            expect(typeof manager.analyzeBuildConfig).toBe('function');
            expect(typeof manager.validateBuildConfig).toBe('function');
            expect(typeof manager.generateOptimizations).toBe('function');
            expect(typeof manager.applyOptimization).toBe('function');
        });
    });

    describe('IBuildConfiguration', () => {
        it('should create valid build configuration', () => {
            const config: IBuildConfiguration = {
                tool: BuildToolType.Webpack,
                configPath: '/project/webpack.config.js',
                content: 'module.exports = { /* webpack config */ }',
                isValid: true,
                dependencies: ['webpack', 'webpack-cli'],
                devDependencies: ['webpack-dev-server']
            };

            expect(config.tool).toBe(BuildToolType.Webpack);
            expect(config.configPath).toBe('/project/webpack.config.js');
            expect(config.content).toContain('webpack config');
            expect(config.isValid).toBe(true);
            expect(config.dependencies).toContain('webpack');
            expect(config.devDependencies).toContain('webpack-dev-server');
        });
    });

    describe('IBuildAnalysisResult', () => {
        it('should create valid analysis result', () => {
            const result: IBuildAnalysisResult = {
                configPath: '/project/webpack.config.js',
                tool: BuildToolType.Webpack,
                entry: ['src/index.js'],
                output: { path: 'dist', filename: 'bundle.js' },
                plugins: ['HtmlWebpackPlugin'],
                loaders: ['babel-loader', 'css-loader'],
                optimizations: ['minimize', 'splitChunks'],
                warnings: ['Consider adding source maps'],
                errors: []
            };

            expect(result.configPath).toBe('/project/webpack.config.js');
            expect(result.tool).toBe(BuildToolType.Webpack);
            expect(result.entry).toContain('src/index.js');
            expect(result.output.path).toBe('dist');
            expect(result.plugins).toContain('HtmlWebpackPlugin');
            expect(result.loaders).toContain('babel-loader');
            expect(result.optimizations).toContain('minimize');
            expect(result.warnings).toHaveLength(1);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('IValidationResult', () => {
        it('should create valid validation result', () => {
            const result: IValidationResult = {
                isValid: true,
                warnings: ['Consider enabling source maps'],
                errors: []
            };

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.errors).toHaveLength(0);
        });

        it('should create invalid validation result', () => {
            const result: IValidationResult = {
                isValid: false,
                warnings: [],
                errors: ['Missing entry configuration']
            };

            expect(result.isValid).toBe(false);
            expect(result.warnings).toHaveLength(0);
            expect(result.errors).toHaveLength(1);
        });
    });

    describe('IOptimization', () => {
        it('should create plugin optimization', () => {
            const optimization: IOptimization = {
                type: OptimizationType.Plugin,
                name: 'TerserPlugin',
                description: 'Minimizes JavaScript bundles',
                priority: 'high',
                configChange: {
                    path: 'optimization.minimizer',
                    value: 'new TerserPlugin()'
                }
            };

            expect(optimization.type).toBe(OptimizationType.Plugin);
            expect(optimization.name).toBe('TerserPlugin');
            expect(optimization.description).toBe('Minimizes JavaScript bundles');
            expect(optimization.priority).toBe('high');
            expect(optimization.configChange.path).toBe('optimization.minimizer');
        });

        it('should create config optimization', () => {
            const optimization: IOptimization = {
                type: OptimizationType.Config,
                name: 'Enable source maps',
                description: 'Improves debugging experience',
                priority: 'medium',
                configChange: {
                    path: 'devtool',
                    value: 'source-map'
                }
            };

            expect(optimization.type).toBe(OptimizationType.Config);
            expect(optimization.name).toBe('Enable source maps');
            expect(optimization.priority).toBe('medium');
            expect(optimization.configChange.path).toBe('devtool');
            expect(optimization.configChange.value).toBe('source-map');
        });
    });

    describe('Enums', () => {
        it('should define all build tool types', () => {
            expect(BuildToolType.Webpack).toBeDefined();
            expect(BuildToolType.Rollup).toBeDefined();
            expect(BuildToolType.Vite).toBeDefined();
            expect(BuildToolType.Parcel).toBeDefined();
            expect(BuildToolType.ESBuild).toBeDefined();
            expect(BuildToolType.SWC).toBeDefined();
        });

        it('should define all optimization types', () => {
            expect(OptimizationType.Plugin).toBeDefined();
            expect(OptimizationType.Config).toBeDefined();
            expect(OptimizationType.Dependency).toBeDefined();
            expect(OptimizationType.Structure).toBeDefined();
        });

        it('should define all build result statuses', () => {
            expect(BuildResultStatus.Success).toBeDefined();
            expect(BuildResultStatus.Warning).toBeDefined();
            expect(BuildResultStatus.Error).toBeDefined();
            expect(BuildResultStatus.Unknown).toBeDefined();
        });
    });
});
