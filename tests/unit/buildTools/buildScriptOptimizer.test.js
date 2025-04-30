const { BuildScriptOptimizer } = require('../../../src/buildTools/buildScriptOptimizer');

describe('BuildScriptOptimizer', () => {
    let optimizer;

    beforeEach(() => {
        optimizer = new BuildScriptOptimizer();
    });

    describe('optimizeScript', () => {
        it('should suggest cross-env for environment variables', async () => {
            const scriptName = 'build';
            const scriptCommand = 'NODE_ENV=production webpack';

            const optimizations = await optimizer.optimizeScript(scriptName, scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Use cross-env for Cross-Platform Environment Variables',
                before: scriptCommand,
                after: 'cross-env NODE_ENV=production webpack'
            }));
        });

        it('should suggest concurrently for parallel execution', async () => {
            const scriptName = 'build';
            const scriptCommand = 'tsc && webpack';

            const optimizations = await optimizer.optimizeScript(scriptName, scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Use concurrently for Parallel Task Execution',
                before: scriptCommand,
                after: 'concurrently "tsc" "webpack"'
            }));
        });

        it('should suggest webpack optimizations', async () => {
            const scriptName = 'build';
            const scriptCommand = 'webpack';

            const optimizations = await optimizer.optimizeScript(scriptName, scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Add Build Profiling',
                before: scriptCommand,
                after: 'webpack --profile'
            }));

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Enable Webpack Caching',
                before: scriptCommand,
                after: 'webpack --cache'
            }));
        });

        it('should suggest TypeScript optimizations', async () => {
            const scriptName = 'build';
            const scriptCommand = 'tsc';

            const optimizations = await optimizer.optimizeScript(scriptName, scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Enable Incremental TypeScript Compilation',
                before: scriptCommand,
                after: 'tsc --incremental'
            }));
        });

        it('should suggest noEmit for TypeScript type checking', async () => {
            const scriptName = 'lint';
            const scriptCommand = 'tsc --project tsconfig.json';

            const optimizations = await optimizer.optimizeScript(scriptName, scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Use --noEmit for Type Checking Only',
                before: scriptCommand,
                after: 'tsc --project tsconfig.json --noEmit'
            }));
        });

        it('should suggest clean step for build script', async () => {
            const scriptName = 'build';
            const scriptCommand = 'webpack';

            const optimizations = await optimizer.optimizeScript(scriptName, scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Add Clean Step Before Build',
                before: scriptCommand,
                after: 'rimraf dist && webpack'
            }));
        });

        it('should suggest production environment flag for build script', async () => {
            const scriptName = 'build';
            const scriptCommand = 'webpack';

            const optimizations = await optimizer.optimizeScript(scriptName, scriptCommand);

            expect(optimizations).toContainEqual(expect.objectContaining({
                title: 'Add Production Environment Flag',
                before: scriptCommand,
                after: 'cross-env NODE_ENV=production webpack'
            }));
        });

        it('should return empty array for non-build scripts', async () => {
            const scriptName = 'test';
            const scriptCommand = 'jest';

            const optimizations = await optimizer.optimizeScript(scriptName, scriptCommand);

            expect(optimizations).toHaveLength(0);
        });
    });
});
