import { OptimizationError } from '../OptimizationError';

describe('OptimizationError', () => {
    it('should create an error with basic message', () => {
        const error = new OptimizationError('Test error');
        expect(error.message).toBe('Test error');
        expect(error.name).toBe('OptimizationError');
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(OptimizationError);
    });

    it('should store error code when provided', () => {
        const error = new OptimizationError('Failed to optimize', 'OPTIMIZATION_FAILED');
        expect(error.code).toBe('OPTIMIZATION_FAILED');
    });

    it('should store optimization context when provided', () => {
        const context = {
            input: ['src/index.js'],
            plugins: ['rollup-plugin-terser'],
            optimizationAttempts: ['minification', 'code-splitting']
        };
        const error = new OptimizationError(
            'Optimization failed',
            'OPTIMIZATION_ERROR',
            context
        );
        expect(error.optimizationContext).toEqual(context);
    });

    it('should handle all optional parameters being undefined', () => {
        const error = new OptimizationError('Basic error');
        expect(error.code).toBeUndefined();
        expect(error.optimizationContext).toBeUndefined();
    });

    it('should preserve stack trace', () => {
        const error = new OptimizationError('Test error');
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain('OptimizationError: Test error');
    });

    it('should work correctly with instanceof checks', () => {
        const error = new OptimizationError('Test error');
        expect(error instanceof Error).toBe(true);
        expect(error instanceof OptimizationError).toBe(true);
    });

    it('should be throwable and catchable', () => {
        expect(() => {
            throw new OptimizationError('Test throwable error');
        }).toThrow(OptimizationError);
    });

    it('should handle complex optimization context', () => {
        const context = {
            originalConfig: {
                input: 'src/index.js',
                output: {
                    file: 'dist/bundle.js',
                    format: 'es'
                },
                plugins: ['@rollup/plugin-node-resolve']
            },
            suggestedOptimizations: [
                {
                    type: 'minification',
                    plugin: 'rollup-plugin-terser',
                    priority: 'high'
                },
                {
                    type: 'code-splitting',
                    configuration: {
                        chunks: ['vendor', 'app'],
                        strategy: 'dynamic'
                    }
                }
            ],
            performanceMetrics: {
                bundleSize: '1.2MB',
                buildTime: '3.5s'
            }
        };
        const error = new OptimizationError(
            'Failed to apply optimizations',
            'OPTIMIZATION_APPLICATION_FAILED',
            context
        );
        expect(error.optimizationContext).toEqual(context);
    });

    it('should create an error with message only', () => {
        const error = new OptimizationError('Test error');

        expect(error.message).toBe('Test error');
        expect(error.name).toBe('OptimizationError');
        expect(error.code).toBeUndefined();
        expect(error.configPath).toBeUndefined();
    });

    it('should create an error with message and code', () => {
        const error = new OptimizationError('Failed to optimize', 'OPTIMIZATION_FAILED');

        expect(error.message).toBe('Failed to optimize');
        expect(error.code).toBe('OPTIMIZATION_FAILED');
        expect(error.configPath).toBeUndefined();
    });

    it('should create an error with message, code and configPath', () => {
        const configPath = '/path/to/rollup.config.js';
        const error = new OptimizationError(
            'Optimization failed for plugin',
            'PLUGIN_OPTIMIZATION_FAILED',
            configPath
        );

        expect(error.message).toBe('Optimization failed for plugin');
        expect(error.code).toBe('PLUGIN_OPTIMIZATION_FAILED');
        expect(error.configPath).toBe(configPath);
    });

    it('should include details in error object', () => {
        const error = new OptimizationError('Basic error');

        expect(error instanceof Error).toBe(true);
        expect(error instanceof OptimizationError).toBe(true);
    });

    it('should include a default message if none provided', () => {
        const error = new OptimizationError();

        expect(error.message).toBe('Optimization error occurred');
        expect(error.name).toBe('OptimizationError');
    });

    it('should support optimizations array in constructor', () => {
        const optimizations = [
            { type: 'minification', plugin: 'terser' },
            { type: 'tree-shaking', plugin: 'rollup' }
        ];

        const error = new OptimizationError(
            'Failed to apply optimizations',
            'OPTIMIZATION_ERROR',
            '/path/to/config.js',
            optimizations
        );

        expect(error.message).toBe('Failed to apply optimizations');
        expect(error.optimizations).toEqual(optimizations);
    });

    it('should handle cause parameter', () => {
        const cause = new Error('Original error');
        const error = new OptimizationError(
            'Failed during optimization',
            'OPTIMIZATION_ERROR',
            '/path/to/config.js',
            null,
            cause
        );

        expect(error.message).toBe('Failed during optimization');
        expect(error.cause).toBe(cause);
    });

    it('should generate a descriptive toString representation', () => {
        const error = new OptimizationError(
            'Failed to optimize config',
            'OPTIMIZATION_ERROR',
            '/path/to/config.js',
            [{ type: 'minification', plugin: 'terser' }]
        );

        const stringRepresentation = error.toString();

        expect(stringRepresentation).toContain('OptimizationError');
        expect(stringRepresentation).toContain('Failed to optimize config');
        expect(stringRepresentation).toContain('OPTIMIZATION_ERROR');
        expect(stringRepresentation).toContain('/path/to/config.js');
        expect(stringRepresentation).toContain('minification');
    });
});
