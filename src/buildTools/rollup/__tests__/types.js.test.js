const {
    RollupOptimizationType,
    RollupPluginType,
    RollupOutputFormat
} = require('../types');

describe('Rollup Types JavaScript Implementation', () => {
    describe('IRollupConfig', () => {
        it('should work with valid config objects', () => {
            const config = {
                input: 'src/index.js',
                output: {
                    file: 'dist/bundle.js',
                    format: 'esm'
                },
                plugins: ['@rollup/plugin-node-resolve', '@rollup/plugin-commonjs']
            };

            expect(config.input).toBe('src/index.js');
            expect(config.output.file).toBe('dist/bundle.js');
            expect(config.output.format).toBe('esm');
            expect(config.plugins).toHaveLength(2);
        });

        it('should support multiple inputs', () => {
            const config = {
                input: ['src/index.js', 'src/other.js'],
                output: {
                    dir: 'dist',
                    format: 'cjs'
                }
            };

            expect(Array.isArray(config.input)).toBe(true);
            expect(config.output.dir).toBe('dist');
        });

        it('should support output array', () => {
            const config = {
                input: 'src/index.js',
                output: [
                    { file: 'dist/bundle.cjs.js', format: 'cjs' },
                    { file: 'dist/bundle.esm.js', format: 'esm' }
                ]
            };

            expect(Array.isArray(config.output)).toBe(true);
            expect(config.output).toHaveLength(2);
            expect(config.output[0].format).toBe('cjs');
            expect(config.output[1].format).toBe('esm');
        });
    });

    describe('IRollupConfigManager', () => {
        it('should work with valid manager implementation', () => {
            // Create a mock implementation of IRollupConfigManager
            const manager = {
                detectConfigs: jest.fn(),
                analyzeConfig: jest.fn(),
                validateConfig: jest.fn(),
                generateOptimizations: jest.fn()
            };

            // Verify the interface shape
            expect(typeof manager.detectConfigs).toBe('function');
            expect(typeof manager.analyzeConfig).toBe('function');
            expect(typeof manager.validateConfig).toBe('function');
            expect(typeof manager.generateOptimizations).toBe('function');
        });
    });

    describe('IRollupAnalysisResult', () => {
        it('should work with valid analysis result', () => {
            const result = {
                input: ['src/index.js'],
                output: [{ file: 'dist/bundle.js', format: 'esm' }],
                plugins: ['@rollup/plugin-node-resolve'],
                external: ['lodash'],
                warnings: ['Circular dependency detected'],
                errors: [],
                sourcemap: true,
                treeshake: true
            };

            expect(result.input).toHaveLength(1);
            expect(result.output).toHaveLength(1);
            expect(result.plugins).toHaveLength(1);
            expect(result.external).toHaveLength(1);
            expect(result.warnings).toHaveLength(1);
            expect(result.errors).toHaveLength(0);
            expect(result.sourcemap).toBe(true);
            expect(result.treeshake).toBe(true);
        });
    });

    describe('IRollupValidationResult', () => {
        it('should work with valid validation result', () => {
            const result = {
                isValid: true,
                warnings: ['Consider enabling sourcemaps'],
                errors: []
            };

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.errors).toHaveLength(0);
        });

        it('should work with invalid validation result', () => {
            const result = {
                isValid: false,
                warnings: [],
                errors: ['Missing input option']
            };

            expect(result.isValid).toBe(false);
            expect(result.warnings).toHaveLength(0);
            expect(result.errors).toHaveLength(1);
        });
    });

    describe('IRollupOptimization', () => {
        it('should work with plugin optimization', () => {
            const optimization = {
                type: RollupOptimizationType.Plugin,
                name: '@rollup/plugin-terser',
                reason: 'Minimizes the bundle size',
                priority: 'high'
            };

            expect(optimization.type).toBe(RollupOptimizationType.Plugin);
            expect(optimization.name).toBe('@rollup/plugin-terser');
            expect(optimization.reason).toBe('Minimizes the bundle size');
            expect(optimization.priority).toBe('high');
        });

        it('should work with config optimization', () => {
            const optimization = {
                type: RollupOptimizationType.Config,
                property: 'output.sourcemap',
                value: true,
                reason: 'Enables debugging',
                priority: 'medium'
            };

            expect(optimization.type).toBe(RollupOptimizationType.Config);
            expect(optimization.property).toBe('output.sourcemap');
            expect(optimization.value).toBe(true);
            expect(optimization.reason).toBe('Enables debugging');
            expect(optimization.priority).toBe('medium');
        });
    });

    describe('Enums', () => {
        it('should define all optimization types', () => {
            expect(RollupOptimizationType.Plugin).toBeDefined();
            expect(RollupOptimizationType.Config).toBeDefined();
            expect(RollupOptimizationType.Structure).toBeDefined();
            expect(RollupOptimizationType.Dependencies).toBeDefined();
        });

        it('should define all plugin types', () => {
            expect(RollupPluginType.Resolve).toBeDefined();
            expect(RollupPluginType.CommonJS).toBeDefined();
            expect(RollupPluginType.Babel).toBeDefined();
            expect(RollupPluginType.TypeScript).toBeDefined();
            expect(RollupPluginType.Terser).toBeDefined();
            expect(RollupPluginType.Replace).toBeDefined();
            expect(RollupPluginType.JSON).toBeDefined();
            expect(RollupPluginType.Other).toBeDefined();
        });

        it('should define all output formats', () => {
            expect(RollupOutputFormat.ESM).toBeDefined();
            expect(RollupOutputFormat.CJS).toBeDefined();
            expect(RollupOutputFormat.UMD).toBeDefined();
            expect(RollupOutputFormat.IIFE).toBeDefined();
            expect(RollupOutputFormat.System).toBeDefined();
        });
    });
});
