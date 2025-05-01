import {
    IRollupConfig,
    IRollupOptimization,
    IRollupOutput,
    IRollupPlugin,
    IRollupProjectStructure,
    RollupOptimizationType,
    RollupOutputFormat,
    RollupPluginType
} from '../../types/index';

describe('Rollup Types Index', () => {
    describe('IRollupConfig', () => {
        it('should create valid config object', () => {
            const config: IRollupConfig = {
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
    });

    describe('IRollupPlugin', () => {
        it('should create valid plugin object', () => {
            const plugin: IRollupPlugin = {
                name: '@rollup/plugin-node-resolve',
                type: RollupPluginType.Resolve,
                config: { browser: true }
            };

            expect(plugin.name).toBe('@rollup/plugin-node-resolve');
            expect(plugin.type).toBe(RollupPluginType.Resolve);
            expect(plugin.config).toHaveProperty('browser', true);
        });
    });

    describe('IRollupOutput', () => {
        it('should create valid output object', () => {
            const output: IRollupOutput = {
                file: 'dist/bundle.js',
                format: RollupOutputFormat.ESM,
                sourcemap: true,
                name: 'myBundle'
            };

            expect(output.file).toBe('dist/bundle.js');
            expect(output.format).toBe(RollupOutputFormat.ESM);
            expect(output.sourcemap).toBe(true);
            expect(output.name).toBe('myBundle');
        });
    });

    describe('IRollupProjectStructure', () => {
        it('should create valid project structure object', () => {
            const structure: IRollupProjectStructure = {
                entryPoints: ['src/index.js'],
                outputDir: 'dist',
                isTypescript: true,
                hasNodeModules: true,
                dependencies: ['lodash', 'react'],
                devDependencies: ['@rollup/plugin-node-resolve', '@rollup/plugin-commonjs']
            };

            expect(structure.entryPoints).toHaveLength(1);
            expect(structure.outputDir).toBe('dist');
            expect(structure.isTypescript).toBe(true);
            expect(structure.hasNodeModules).toBe(true);
            expect(structure.dependencies).toHaveLength(2);
            expect(structure.devDependencies).toHaveLength(2);
        });
    });

    describe('RollupOptimizationType', () => {
        it('should define all optimization types', () => {
            expect(RollupOptimizationType.Plugin).toBeDefined();
            expect(RollupOptimizationType.Config).toBeDefined();
            expect(RollupOptimizationType.Structure).toBeDefined();
            expect(RollupOptimizationType.Dependencies).toBeDefined();
        });
    });

    describe('Enum usage', () => {
        it('should use enums in objects correctly', () => {
            const optimization: IRollupOptimization = {
                type: RollupOptimizationType.Plugin,
                name: '@rollup/plugin-terser',
                reason: 'Minimizes bundle size'
            };

            const output: IRollupOutput = {
                file: 'dist/bundle.js',
                format: RollupOutputFormat.UMD,
                name: 'myLib'
            };

            expect(optimization.type).toBe(RollupOptimizationType.Plugin);
            expect(output.format).toBe(RollupOutputFormat.UMD);
        });
    });
});
