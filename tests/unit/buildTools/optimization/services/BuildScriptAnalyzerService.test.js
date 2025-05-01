import * as assert from 'assert';
import * as sinon from 'sinon';
import { BuildScriptAnalyzerService } from '../../../../../src/buildTools/optimization/services/BuildScriptAnalyzerService';

suite('BuildScriptAnalyzerService Tests', () => {
    let analyzer;
    let sandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        analyzer = new BuildScriptAnalyzerService();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('should analyze webpack scripts correctly', () => {
        const scripts = {
            build: 'webpack --mode production',
            dev: 'webpack-dev-server'
        };

        const analysis = analyzer.analyzeScripts(scripts);

        assert.ok(analysis);
        assert.ok(analysis.hasWebpack);
        assert.strictEqual(analysis.webpackScripts.length, 2);
    });

    test('should analyze TypeScript scripts correctly', () => {
        const scripts = {
            build: 'tsc -p tsconfig.json',
            watch: 'tsc -p tsconfig.json --watch'
        };

        const analysis = analyzer.analyzeScripts(scripts);

        assert.ok(analysis);
        assert.ok(analysis.hasTypeScript);
        assert.strictEqual(analysis.typeScriptScripts.length, 2);
    });

    test('should detect environment variables in scripts', () => {
        const scripts = {
            build: 'NODE_ENV=production webpack',
            dev: 'NODE_ENV=development webpack-dev-server'
        };

        const analysis = analyzer.analyzeScripts(scripts);

        assert.ok(analysis);
        assert.ok(analysis.hasEnvironmentVariables);
        assert.strictEqual(analysis.scriptsWithEnvVars.length, 2);
    });

    test('should detect sequential command execution', () => {
        const scripts = {
            build: 'webpack && tsc && eslint',
            test: 'jest && codecov'
        };

        const analysis = analyzer.analyzeScripts(scripts);

        assert.ok(analysis);
        assert.ok(analysis.hasSequentialCommands);
        assert.strictEqual(analysis.scriptsWithSequentialCmds.length, 2);
    });

    test('should detect build output cleaning scripts', () => {
        const scripts = {
            clean: 'rimraf dist',
            prebuild: 'npm run clean',
            build: 'webpack'
        };

        const analysis = analyzer.analyzeScripts(scripts);

        assert.ok(analysis);
        assert.ok(analysis.hasCleaning);
    });

    test('should detect missing build output cleaning', () => {
        const scripts = {
            build: 'webpack',
            test: 'jest'
        };

        const analysis = analyzer.analyzeScripts(scripts);

        assert.ok(analysis);
        assert.ok(!analysis.hasCleaning);
    });

    test('should detect cross-platform compatibility issues', () => {
        const scripts = {
            build: 'SET NODE_ENV=production && webpack',
            dev: 'NODE_ENV=development webpack-dev-server'
        };

        const analysis = analyzer.analyzeScripts(scripts);

        assert.ok(analysis);
        assert.ok(analysis.hasCrossPlatformIssues);
    });

    test('should detect scripts with potential memory issues', () => {
        const scripts = {
            build: 'node --max-old-space-size=4096 ./node_modules/.bin/webpack'
        };

        const analysis = analyzer.analyzeScripts(scripts);

        assert.ok(analysis);
        assert.ok(analysis.hasMemorySettings);
    });

    test('should identify build tools in use', () => {
        const scripts = {
            build: 'webpack --mode production',
            'build:rollup': 'rollup -c',
            'build:parcel': 'parcel build src/index.js'
        };

        const analysis = analyzer.analyzeScripts(scripts);

        assert.ok(analysis);
        assert.ok(analysis.buildTools.includes('webpack'));
        assert.ok(analysis.buildTools.includes('rollup'));
        assert.ok(analysis.buildTools.includes('parcel'));
    });

    test('should analyze script complexity', () => {
        const scripts = {
            simple: 'webpack',
            complex: 'rimraf dist && mkdir dist && NODE_ENV=production webpack --config webpack.config.js && cp -r public/* dist/'
        };

        const analysis = analyzer.analyzeScripts(scripts);

        assert.ok(analysis);
        assert.ok(analysis.complexScripts.includes('complex'));
        assert.ok(!analysis.complexScripts.includes('simple'));
    });

    test('should handle empty scripts object', () => {
        const scripts = {};

        const analysis = analyzer.analyzeScripts(scripts);

        assert.ok(analysis);
        assert.strictEqual(analysis.totalScripts, 0);
    });

    test('should handle null scripts parameter gracefully', () => {
        const analysis = analyzer.analyzeScripts(null);

        assert.ok(analysis);
        assert.strictEqual(analysis.totalScripts, 0);
    });

    test('should analyze lifecycle scripts correctly', () => {
        const scripts = {
            prebuild: 'rimraf dist',
            build: 'webpack',
            postbuild: 'echo "Build complete"'
        };

        const analysis = analyzer.analyzeScripts(scripts);

        assert.ok(analysis);
        assert.ok(analysis.hasLifecycleScripts);
        assert.strictEqual(analysis.lifecycleScripts.length, 2); // prebuild and postbuild
    });
});
