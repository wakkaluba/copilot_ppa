// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\__tests__\buildScriptOptimizer.js.test.js

const { BuildScriptOptimizer } = require('../buildScriptOptimizer');

describe('BuildScriptOptimizer JavaScript Implementation', () => {
    let optimizer;

    beforeEach(() => {
        optimizer = new BuildScriptOptimizer();
    });

    describe('Cross-Environment Variable Handling', () => {
        test('should suggest cross-env for NODE_ENV=production', async () => {
            const scriptName = 'build';
            const scriptCommand = 'NODE_ENV=production webpack --mode production';

            const optimizations = await optimizer.optimizeScript(scriptName, scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Use cross-env for Cross-Platform Environment Variables',
                before: scriptCommand,
                after: 'cross-env NODE_ENV=production webpack --mode production'
            }));
        });

        test('should suggest cross-env for NODE_ENV=development', async () => {
            const scriptCommand = 'NODE_ENV=development webpack-dev-server';

            const optimizations = await optimizer.optimizeScript('dev', scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Use cross-env for Cross-Platform Environment Variables',
                before: scriptCommand,
                after: 'cross-env NODE_ENV=development webpack-dev-server'
            }));
        });

        test('should not suggest cross-env if already used', async () => {
            const scriptCommand = 'cross-env NODE_ENV=production webpack';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            const crossEnvSuggestion = optimizations.find(opt =>
                opt.title === 'Use cross-env for Cross-Platform Environment Variables'
            );

            expect(crossEnvSuggestion).toBeUndefined();
        });
    });

    describe('Parallel Task Execution', () => {
        test('should suggest concurrently for sequential commands', async () => {
            const scriptCommand = 'tsc && webpack && node scripts/post-build.js';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Use concurrently for Parallel Task Execution',
                before: scriptCommand,
                after: 'concurrently "tsc" "webpack" "node scripts/post-build.js"'
            }));
        });

        test('should not suggest concurrently if already used', async () => {
            const scriptCommand = 'concurrently "tsc" "webpack"';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            const concurrentlySuggestion = optimizations.find(opt =>
                opt.title === 'Use concurrently for Parallel Task Execution'
            );

            expect(concurrentlySuggestion).toBeUndefined();
        });

        test('should not suggest concurrently if npm-run-all is already used', async () => {
            const scriptCommand = 'npm-run-all --parallel lint test build';

            const optimizations = await optimizer.optimizeScript('ci', scriptCommand);

            const concurrentlySuggestion = optimizations.find(opt =>
                opt.title === 'Use concurrently for Parallel Task Execution'
            );

            expect(concurrentlySuggestion).toBeUndefined();
        });
    });

    describe('Webpack Build Optimizations', () => {
        test('should suggest profiling for webpack builds', async () => {
            const scriptCommand = 'webpack --mode production';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Add Build Profiling',
                before: scriptCommand,
                after: 'webpack --mode production --profile'
            }));
        });

        test('should not suggest profiling if already enabled', async () => {
            const scriptCommand = 'webpack --mode production --profile';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            const profilingSuggestion = optimizations.find(opt =>
                opt.title === 'Add Build Profiling'
            );

            expect(profilingSuggestion).toBeUndefined();
        });

        test('should not suggest profiling if json is enabled', async () => {
            const scriptCommand = 'webpack --mode production --json stats.json';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            const profilingSuggestion = optimizations.find(opt =>
                opt.title === 'Add Build Profiling'
            );

            expect(profilingSuggestion).toBeUndefined();
        });

        test('should suggest caching for webpack builds', async () => {
            const scriptCommand = 'webpack --mode development';

            const optimizations = await optimizer.optimizeScript('dev', scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Enable Webpack Caching',
                before: scriptCommand,
                after: 'webpack --mode development --cache'
            }));
        });

        test('should not suggest caching if already enabled', async () => {
            const scriptCommand = 'webpack --mode development --cache';

            const optimizations = await optimizer.optimizeScript('dev', scriptCommand);

            const cachingSuggestion = optimizations.find(opt =>
                opt.title === 'Enable Webpack Caching'
            );

            expect(cachingSuggestion).toBeUndefined();
        });
    });

    describe('TypeScript Build Optimizations', () => {
        test('should suggest incremental compilation for TypeScript', async () => {
            const scriptCommand = 'tsc -p tsconfig.json';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Enable Incremental TypeScript Compilation',
                before: scriptCommand,
                after: 'tsc -p tsconfig.json --incremental'
            }));
        });

        test('should not suggest incremental compilation if already enabled', async () => {
            const scriptCommand = 'tsc -p tsconfig.json --incremental';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            const incrementalSuggestion = optimizations.find(opt =>
                opt.title === 'Enable Incremental TypeScript Compilation'
            );

            expect(incrementalSuggestion).toBeUndefined();
        });

        test('should suggest --noEmit for TypeScript lint/check', async () => {
            const scriptCommand = 'tsc --project tsconfig.json lint';

            const optimizations = await optimizer.optimizeScript('lint:ts', scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Use --noEmit for Type Checking Only',
                before: scriptCommand,
                after: 'tsc --project tsconfig.json lint --noEmit'
            }));
        });

        test('should not suggest --noEmit if already present', async () => {
            const scriptCommand = 'tsc --project tsconfig.json --noEmit lint';

            const optimizations = await optimizer.optimizeScript('lint:ts', scriptCommand);

            const noEmitSuggestion = optimizations.find(opt =>
                opt.title === 'Use --noEmit for Type Checking Only'
            );

            expect(noEmitSuggestion).toBeUndefined();
        });
    });

    describe('Build Output Management', () => {
        test('should suggest clean step for build script', async () => {
            const scriptCommand = 'webpack --mode production';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Add Clean Step Before Build',
                before: scriptCommand,
                after: 'rimraf dist && webpack --mode production'
            }));
        });

        test('should not suggest clean step if rimraf is already used', async () => {
            const scriptCommand = 'rimraf dist && webpack --mode production';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            const cleanSuggestion = optimizations.find(opt =>
                opt.title === 'Add Clean Step Before Build'
            );

            expect(cleanSuggestion).toBeUndefined();
        });

        test('should not suggest clean step if rm -rf is already used', async () => {
            const scriptCommand = 'rm -rf dist && webpack --mode production';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            const cleanSuggestion = optimizations.find(opt =>
                opt.title === 'Add Clean Step Before Build'
            );

            expect(cleanSuggestion).toBeUndefined();
        });

        test('should not suggest clean step if del is already used', async () => {
            const scriptCommand = 'del /s /q dist && webpack --mode production';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            const cleanSuggestion = optimizations.find(opt =>
                opt.title === 'Add Clean Step Before Build'
            );

            expect(cleanSuggestion).toBeUndefined();
        });
    });

    describe('Environment Configuration', () => {
        test('should suggest production flag for build script', async () => {
            const scriptCommand = 'webpack --mode production';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Add Production Environment Flag',
                before: scriptCommand,
                after: 'cross-env NODE_ENV=production webpack --mode production'
            }));
        });

        test('should not suggest production flag if NODE_ENV is already set', async () => {
            const scriptCommand = 'NODE_ENV=production webpack --mode production';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            const productionFlagSuggestion = optimizations.find(opt =>
                opt.title === 'Add Production Environment Flag'
            );

            expect(productionFlagSuggestion).toBeUndefined();
        });

        test('should not suggest production flag for non-build scripts', async () => {
            const scriptCommand = 'webpack-dev-server';

            const optimizations = await optimizer.optimizeScript('dev', scriptCommand);

            const productionFlagSuggestion = optimizations.find(opt =>
                opt.title === 'Add Production Environment Flag'
            );

            expect(productionFlagSuggestion).toBeUndefined();
        });
    });

    describe('Complex Scenarios', () => {
        test('should provide multiple suggestions for complex build script', async () => {
            const scriptCommand = 'tsc && webpack --mode production';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            // Should suggest at least 4 optimizations:
            // 1. Concurrently for parallel execution
            // 2. Add Build Profiling for webpack
            // 3. Add Clean Step Before Build
            // 4. Add Production Environment Flag
            // 5. Enable Webpack Caching
            // 6. Enable Incremental TypeScript Compilation
            expect(optimizations.length).toBeGreaterThanOrEqual(4);

            const titles = optimizations.map(opt => opt.title);
            expect(titles).toContain('Use concurrently for Parallel Task Execution');
            expect(titles).toContain('Add Build Profiling');
            expect(titles).toContain('Add Clean Step Before Build');
            expect(titles).toContain('Add Production Environment Flag');
        });

        test('should not provide contradicting suggestions', async () => {
            const scriptCommand = 'cross-env NODE_ENV=production webpack --profile --cache';

            const optimizations = await optimizer.optimizeScript('build', scriptCommand);

            // Should not suggest any of these as they're already in the command:
            // - cross-env usage
            // - profiling
            // - caching
            const titles = optimizations.map(opt => opt.title);
            expect(titles).not.toContain('Use cross-env for Cross-Platform Environment Variables');
            expect(titles).not.toContain('Add Build Profiling');
            expect(titles).not.toContain('Enable Webpack Caching');
            expect(titles).not.toContain('Add Production Environment Flag');
        });
    });
});
