import { OptimizationError } from '../../errors/OptimizationError';
import { RollupConfigAnalysis } from '../../types';
import { RollupOptimizationService } from '../RollupOptimizationService';
import { RollupInput, RollupOutput, RollupPlugin } from '../types';

describe('RollupOptimizationService', () => {
    let service: RollupOptimizationService;
    let mockLogger: any;

    beforeEach(() => {
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
        service = new RollupOptimizationService(mockLogger);
    });

    describe('generateSuggestions', () => {
        it('should suggest code splitting when not configured', async () => {
            const content = `export default {
                input: 'src/index.js',
                output: { file: 'dist/bundle.js' }
            }`;
            const inputs: RollupInput[] = [{ name: 'main', path: 'src/index.js', external: [] }];
            const outputs: RollupOutput[] = [{ format: 'es', file: 'dist/bundle.js' }];
            const plugins: RollupPlugin[] = [];

            const suggestions = await service.generateSuggestions(content, inputs, outputs, plugins);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Enable Code Splitting',
                description: expect.stringContaining('code splitting')
            }));
        });

        it('should suggest minification when terser is not configured', async () => {
            const content = `export default {
                input: 'src/index.js',
                output: { file: 'dist/bundle.js' },
                plugins: []
            }`;
            const plugins: RollupPlugin[] = [];

            const suggestions = await service.generateSuggestions(content, [], [], plugins);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Add JavaScript Minification',
                description: expect.stringContaining('Minify JavaScript')
            }));
        });

        it('should suggest bundle analysis when visualizer is not configured', async () => {
            const content = `export default {
                input: 'src/index.js',
                output: { file: 'dist/bundle.js' },
                plugins: []
            }`;
            const plugins: RollupPlugin[] = [];

            const suggestions = await service.generateSuggestions(content, [], [], plugins);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Add Bundle Analysis',
                description: expect.stringContaining('Visualize bundle composition')
            }));
        });

        it('should suggest node resolve when not configured', async () => {
            const content = `export default {
                input: 'src/index.js',
                output: { file: 'dist/bundle.js' },
                plugins: []
            }`;
            const plugins: RollupPlugin[] = [];

            const suggestions = await service.generateSuggestions(content, [], [], plugins);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Optimize Module Resolution',
                description: expect.stringContaining('Node resolution support')
            }));
        });

        it('should suggest CommonJS support when not configured', async () => {
            const content = `export default {
                input: 'src/index.js',
                output: { file: 'dist/bundle.js' },
                plugins: []
            }`;
            const plugins: RollupPlugin[] = [];

            const suggestions = await service.generateSuggestions(content, [], [], plugins);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Add CommonJS Support',
                description: expect.stringContaining('Convert CommonJS modules')
            }));
        });

        it('should not suggest features that are already configured', async () => {
            const content = `export default {
                input: ['src/index.js', 'src/admin.js'],
                output: {
                    dir: 'dist',
                    format: 'es'
                },
                plugins: [
                    terser(),
                    visualizer(),
                    resolve(),
                    commonjs()
                ]
            }`;
            const plugins: RollupPlugin[] = [
                { name: 'TerserPlugin', description: '' },
                { name: 'VisualizePlugin', description: '' },
                { name: 'NodeResolvePlugin', description: '' },
                { name: 'CommonjsPlugin', description: '' }
            ];

            const suggestions = await service.generateSuggestions(content, [], [], plugins);

            expect(suggestions).not.toContainEqual(expect.objectContaining({ title: 'Enable Code Splitting' }));
            expect(suggestions).not.toContainEqual(expect.objectContaining({ title: 'Add JavaScript Minification' }));
            expect(suggestions).not.toContainEqual(expect.objectContaining({ title: 'Add Bundle Analysis' }));
            expect(suggestions).not.toContainEqual(expect.objectContaining({ title: 'Optimize Module Resolution' }));
            expect(suggestions).not.toContainEqual(expect.objectContaining({ title: 'Add CommonJS Support' }));
        });

        it('should handle invalid content', async () => {
            await expect(service.generateSuggestions('', [], [], [])).rejects.toThrow(OptimizationError);
        });

        it('should add default environment variables replacement', async () => {
            const content = `export default {
                input: 'src/index.js',
                output: { file: 'dist/bundle.js' },
                plugins: []
            }`;
            const plugins: RollupPlugin[] = [];

            const suggestions = await service.generateSuggestions(content, [], [], plugins);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Add Environment Variables Support',
                description: expect.stringContaining('Replace environment variables')
            }));
        });

        it('should suggest source maps when not configured', async () => {
            const content = `export default {
                input: 'src/index.js',
                output: { file: 'dist/bundle.js' }
            }`;
            const outputs: RollupOutput[] = [{ format: 'es', file: 'dist/bundle.js' }];

            const suggestions = await service.generateSuggestions(content, [], outputs, []);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Enable Source Maps',
                description: expect.stringContaining('source maps for debugging')
            }));
        });

        it('should suggest code splitting when not configured', async () => {
            const analysis: RollupConfigAnalysis = {
                content: 'export default { input: "src/index.js" }',
                input: ['src/index.js'],
                output: [{ file: 'dist/bundle.js', format: 'es' }],
                plugins: [],
                external: []
            };

            const suggestions = await service.generateSuggestions(analysis);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Enable Code Splitting',
                description: expect.any(String),
                code: expect.stringContaining('output: { dir: ')
            }));
        });

        it('should suggest minification when terser is not used', async () => {
            const analysis: RollupConfigAnalysis = {
                content: 'export default { plugins: [] }',
                input: ['src/index.js'],
                output: [{ file: 'dist/bundle.js' }],
                plugins: [],
                external: []
            };

            const suggestions = await service.generateSuggestions(analysis);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Add JavaScript Minification',
                description: expect.any(String),
                code: expect.stringContaining('terser({')
            }));
        });

        it('should suggest bundle analysis when visualizer is not used', async () => {
            const analysis: RollupConfigAnalysis = {
                content: 'export default { plugins: [] }',
                input: ['src/index.js'],
                output: [{ file: 'dist/bundle.js' }],
                plugins: [],
                external: []
            };

            const suggestions = await service.generateSuggestions(analysis);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Add Bundle Analysis',
                description: expect.any(String),
                code: expect.stringContaining('visualizer({')
            }));
        });

        it('should suggest module resolution optimization when node-resolve is not used', async () => {
            const analysis: RollupConfigAnalysis = {
                content: 'export default { plugins: [] }',
                input: ['src/index.js'],
                output: [{ file: 'dist/bundle.js' }],
                plugins: [],
                external: []
            };

            const suggestions = await service.generateSuggestions(analysis);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Optimize Module Resolution',
                description: expect.any(String),
                code: expect.stringContaining('resolve({')
            }));
        });

        it('should suggest CommonJS support when commonjs plugin is not used', async () => {
            const analysis: RollupConfigAnalysis = {
                content: 'export default { plugins: [] }',
                input: ['src/index.js'],
                output: [{ file: 'dist/bundle.js' }],
                plugins: [],
                external: []
            };

            const suggestions = await service.generateSuggestions(analysis);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Add CommonJS Support',
                description: expect.any(String),
                code: expect.stringContaining('commonjs({')
            }));
        });

        it('should suggest environment variable support when replace plugin is not used', async () => {
            const analysis: RollupConfigAnalysis = {
                content: 'export default { plugins: [] }',
                input: ['src/index.js'],
                output: [{ file: 'dist/bundle.js' }],
                plugins: [],
                external: []
            };

            const suggestions = await service.generateSuggestions(analysis);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Add Environment Variable Support',
                description: expect.any(String),
                code: expect.stringContaining('replace({')
            }));
        });

        it('should suggest source maps when not configured', async () => {
            const analysis: RollupConfigAnalysis = {
                content: 'export default {}',
                input: ['src/index.js'],
                output: [{ file: 'dist/bundle.js', format: 'es' }],
                plugins: [],
                external: []
            };

            const suggestions = await service.generateSuggestions(analysis);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Enable Source Maps',
                description: expect.any(String),
                code: expect.stringContaining('sourcemap: true')
            }));
        });

        it('should suggest dynamic imports optimization when using import() without manualChunks', async () => {
            const analysis: RollupConfigAnalysis = {
                content: 'export default { output: { format: "es" }, plugins: [] }; import("./module")',
                input: ['src/index.js'],
                output: [{ file: 'dist/bundle.js', format: 'es' }],
                plugins: [],
                external: []
            };

            const suggestions = await service.generateSuggestions(analysis);

            expect(suggestions).toContainEqual(expect.objectContaining({
                title: 'Optimize Dynamic Imports',
                description: expect.any(String),
                code: expect.stringContaining('manualChunks')
            }));
        });

        it('should handle errors gracefully', async () => {
            const analysis = null;

            const suggestions = await service.generateSuggestions(analysis);

            expect(suggestions).toEqual([]);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should not suggest optimizations that are already configured', async () => {
            const analysis: RollupConfigAnalysis = {
                content: 'export default { output: { sourcemap: true }, plugins: [terser(), visualizer()] }',
                input: ['src/index.js'],
                output: [{ file: 'dist/bundle.js', sourcemap: true }],
                plugins: [
                    { name: 'TerserPlugin', description: 'Minify generated bundle' },
                    { name: 'VisualizePlugin', description: 'Visualize bundle composition' }
                ],
                external: []
            };

            const suggestions = await service.generateSuggestions(analysis);

            expect(suggestions).not.toContainEqual(expect.objectContaining({
                title: 'Add JavaScript Minification'
            }));
            expect(suggestions).not.toContainEqual(expect.objectContaining({
                title: 'Add Bundle Analysis'
            }));
            expect(suggestions).not.toContainEqual(expect.objectContaining({
                title: 'Enable Source Maps'
            }));
        });
    });
});
