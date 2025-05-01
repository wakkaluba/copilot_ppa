import * as assert from 'assert';
import * as sinon from 'sinon';
import { OptimizationGeneratorService } from '../../../../../src/buildTools/optimization/services/OptimizationGeneratorService';

suite('OptimizationGeneratorService Tests', () => {
    let optimizationGenerator;
    let sandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        optimizationGenerator = new OptimizationGeneratorService();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('should generate cross-env suggestions for environment variables', () => {
        const analysis = {
            hasEnvironmentVariables: true,
            scriptsWithEnvVars: ['build', 'dev'],
            hasCrossPlatformIssues: true
        };

        const suggestions = optimizationGenerator.generateOptimizations(analysis);

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('cross-env')));
    });

    test('should generate parallel execution suggestions', () => {
        const analysis = {
            hasSequentialCommands: true,
            scriptsWithSequentialCmds: ['build', 'test']
        };

        const suggestions = optimizationGenerator.generateOptimizations(analysis);

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('npm-run-all') || s.includes('concurrently')));
    });

    test('should generate webpack optimization suggestions', () => {
        const analysis = {
            hasWebpack: true,
            webpackScripts: ['build', 'dev']
        };

        const suggestions = optimizationGenerator.generateOptimizations(analysis);

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('webpack')));
    });

    test('should generate TypeScript optimization suggestions', () => {
        const analysis = {
            hasTypeScript: true,
            typeScriptScripts: ['build', 'watch']
        };

        const suggestions = optimizationGenerator.generateOptimizations(analysis);

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('tsc') || s.includes('TypeScript')));
    });

    test('should generate build cleaning suggestions', () => {
        const analysis = {
            hasCleaning: false,
            hasWebpack: true
        };

        const suggestions = optimizationGenerator.generateOptimizations(analysis);

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('clean') || s.includes('rimraf')));
    });

    test('should generate environment-specific configuration suggestions', () => {
        const analysis = {
            hasWebpack: true,
            hasEnvironmentSpecificConfigs: false
        };

        const suggestions = optimizationGenerator.generateOptimizations(analysis);

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('development') || s.includes('production')));
    });

    test('should generate memory optimization suggestions', () => {
        const analysis = {
            hasWebpack: true,
            hasMemorySettings: false,
            hasLargeBuilds: true
        };

        const suggestions = optimizationGenerator.generateOptimizations(analysis);

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('memory') || s.includes('--max-old-space-size')));
    });

    test('should generate cache optimization suggestions', () => {
        const analysis = {
            hasWebpack: true,
            hasCaching: false
        };

        const suggestions = optimizationGenerator.generateOptimizations(analysis);

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('cache')));
    });

    test('should generate bundling optimization suggestions', () => {
        const analysis = {
            hasWebpack: true,
            hasBundleAnalyzer: false
        };

        const suggestions = optimizationGenerator.generateOptimizations(analysis);

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('bundle-analyzer') || s.includes('analyze')));
    });

    test('should handle empty analysis object', () => {
        const analysis = {};

        const suggestions = optimizationGenerator.generateOptimizations(analysis);

        assert.ok(Array.isArray(suggestions));
        assert.strictEqual(suggestions.length, 0);
    });

    test('should prioritize suggestions based on impact', () => {
        const analysis = {
            hasEnvironmentVariables: true,
            hasCrossPlatformIssues: true,
            hasSequentialCommands: true,
            hasWebpack: true,
            hasCleaning: false
        };

        const suggestions = optimizationGenerator.generateOptimizations(analysis);

        // Verify cross-platform issues come before less critical suggestions
        const crossPlatformIndex = suggestions.findIndex(s => s.includes('cross-env'));
        const cleaningIndex = suggestions.findIndex(s => s.includes('clean'));

        assert.ok(crossPlatformIndex < cleaningIndex, 'Cross-platform suggestions should be prioritized');
    });

    test('should not duplicate suggestions', () => {
        const analysis = {
            hasWebpack: true,
            webpackScripts: ['build', 'build:prod']
        };

        const suggestions = optimizationGenerator.generateOptimizations(analysis);

        // Check for duplicated webpack suggestions
        const webpackSuggestions = suggestions.filter(s => s.includes('webpack'));
        const uniqueSuggestions = new Set(webpackSuggestions);

        assert.strictEqual(webpackSuggestions.length, uniqueSuggestions.size,
            'There should be no duplicate suggestions');
    });
});
