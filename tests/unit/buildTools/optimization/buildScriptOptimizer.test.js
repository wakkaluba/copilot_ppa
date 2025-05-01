import * as assert from 'assert';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { BuildScriptOptimizer } from '../../../../src/buildTools/optimization/buildScriptOptimizer';

suite('BuildScriptOptimizer Tests', () => {
    let optimizer;
    let sandbox;
    let fsReadFileStub;
    let fsExistsStub;

    setup(() => {
        sandbox = sinon.createSandbox();

        // Stub fs methods
        fsReadFileStub = sandbox.stub(fs.promises, 'readFile');
        fsExistsStub = sandbox.stub(fs, 'existsSync');

        // Default package.json content
        const packageJsonContent = JSON.stringify({
            scripts: {
                build: 'webpack --mode production',
                dev: 'webpack --mode development',
                start: 'node server.js',
                test: 'jest'
            }
        });

        fsReadFileStub.resolves(packageJsonContent);
        fsExistsStub.returns(true);

        // Create optimizer instance
        optimizer = new BuildScriptOptimizer();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('should suggest cross-env for platform-independent environment variables', async () => {
        const packageJsonWithEnvVars = JSON.stringify({
            scripts: {
                build: 'NODE_ENV=production webpack',
                dev: 'NODE_ENV=development webpack'
            }
        });

        fsReadFileStub.resolves(packageJsonWithEnvVars);

        const suggestions = await optimizer.analyze('/test/project/package.json');

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('cross-env')));
    });

    test('should suggest parallel execution for multiple commands', async () => {
        const packageJsonWithMultipleCommands = JSON.stringify({
            scripts: {
                build: 'webpack && tsc && eslint .',
                validate: 'eslint . && jest'
            }
        });

        fsReadFileStub.resolves(packageJsonWithMultipleCommands);

        const suggestions = await optimizer.analyze('/test/project/package.json');

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('npm-run-all') || s.includes('concurrently')));
    });

    test('should suggest webpack optimizations', async () => {
        const packageJsonWithWebpack = JSON.stringify({
            scripts: {
                build: 'webpack --mode production',
                dev: 'webpack --mode development'
            }
        });

        fsReadFileStub.resolves(packageJsonWithWebpack);

        const suggestions = await optimizer.analyze('/test/project/package.json');

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('webpack')));
    });

    test('should suggest TypeScript optimizations', async () => {
        const packageJsonWithTs = JSON.stringify({
            scripts: {
                build: 'tsc -p tsconfig.json',
                'build:watch': 'tsc -p tsconfig.json --watch'
            }
        });

        fsReadFileStub.resolves(packageJsonWithTs);

        const suggestions = await optimizer.analyze('/test/project/package.json');

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('typescript') || s.includes('tsc')));
    });

    test('should suggest build output cleaning', async () => {
        const packageJsonWithoutClean = JSON.stringify({
            scripts: {
                build: 'webpack',
                test: 'jest'
            }
        });

        fsReadFileStub.resolves(packageJsonWithoutClean);

        const suggestions = await optimizer.analyze('/test/project/package.json');

        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.includes('clean')));
    });

    test('should suggest environment-specific configurations', async () => {
        const packageJsonWithoutEnvs = JSON.stringify({
            scripts: {
                build: 'webpack',
                start: 'node server.js'
            }
        });

        fsReadFileStub.resolves(packageJsonWithoutEnvs);

        const suggestions = await optimizer.analyze('/test/project/package.json');

        assert.ok(suggestions.some(s => s.includes('development') || s.includes('production')));
    });

    test('should handle errors when package.json is not found', async () => {
        fsExistsStub.returns(false);

        try {
            await optimizer.analyze('/test/project/package.json');
            assert.fail('Expected an error to be thrown');
        } catch (error) {
            assert.ok(error.message.includes('not found'));
        }
    });

    test('should handle errors when package.json is invalid', async () => {
        fsReadFileStub.resolves('{ invalid json }');

        try {
            await optimizer.analyze('/test/project/package.json');
            assert.fail('Expected an error to be thrown');
        } catch (error) {
            assert.ok(error.message.includes('parse'));
        }
    });

    test('should handle errors when package.json has no scripts', async () => {
        fsReadFileStub.resolves('{ "name": "test-project" }');

        const suggestions = await optimizer.analyze('/test/project/package.json');

        assert.strictEqual(suggestions.length, 1);
        assert.ok(suggestions[0].includes('No scripts found'));
    });

    test('should ignore non-build scripts', async () => {
        const packageJsonWithNonBuild = JSON.stringify({
            scripts: {
                lint: 'eslint .',
                format: 'prettier --write "**/*.js"',
                docs: 'jsdoc -c jsdoc.json'
            }
        });

        fsReadFileStub.resolves(packageJsonWithNonBuild);

        const suggestions = await optimizer.analyze('/test/project/package.json');

        assert.ok(suggestions.some(s => s.includes('build script')));
    });
});
