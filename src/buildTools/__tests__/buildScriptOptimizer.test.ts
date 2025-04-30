import { BuildScriptOptimizer } from '../buildScriptOptimizer';

jest.mock('vscode');

describe('BuildScriptOptimizer', () => {
    let optimizer: BuildScriptOptimizer;

    beforeEach(() => {
        optimizer = new BuildScriptOptimizer();
    });

    describe('script analysis', () => {
        test('should analyze npm scripts for optimization opportunities', async () => {
            const packageJson = {
                scripts: {
                    build: 'tsc',
                    test: 'jest',
                    lint: 'eslint'
                }
            };

            const analysis = await optimizer.analyzeScripts(packageJson);
            expect(analysis).toBeDefined();
            expect(analysis.scripts).toHaveLength(3);
        });

        test('should detect parallel execution opportunities', async () => {
            const packageJson = {
                scripts: {
                    lint: 'eslint .',
                    'type-check': 'tsc --noEmit',
                    validate: 'npm run lint && npm run type-check'
                }
            };

            const opportunities = await optimizer.findParallelizationOpportunities(packageJson);
            expect(opportunities).toContain('validate');
        });

        test('should suggest script optimizations', async () => {
            const packageJson = {
                scripts: {
                    build: 'tsc && webpack',
                    test: 'jest --coverage',
                    start: 'node dist/index.js'
                }
            };

            const suggestions = await optimizer.getSuggestions(packageJson);
            expect(suggestions).toHaveLength(1);
            expect(suggestions[0]).toContain('build');
        });
    });

    describe('script optimization', () => {
        test('should optimize build scripts for parallel execution', async () => {
            const originalScripts = {
                build: 'tsc && webpack',
                test: 'jest'
            };

            const optimizedScripts = await optimizer.optimizeScripts(originalScripts);
            expect(optimizedScripts.build).toBe('tsc & webpack');
        });

        test('should preserve script dependencies when optimizing', async () => {
            const originalScripts = {
                clean: 'rimraf dist',
                prebuild: 'npm run clean',
                build: 'tsc && webpack'
            };

            const optimizedScripts = await optimizer.optimizeScripts(originalScripts);
            expect(optimizedScripts.prebuild).toBe('npm run clean');
            expect(optimizedScripts.build).toContain('tsc');
        });
    });

    describe('configuration management', () => {
        test('should handle custom optimization settings', async () => {
            const settings = {
                maxParallelProcesses: 4,
                preservePreScripts: true,
                autoOptimize: false
            };

            await optimizer.updateSettings(settings);
            const config = await optimizer.getConfiguration();
            expect(config.maxParallelProcesses).toBe(4);
            expect(config.preservePreScripts).toBe(true);
        });

        test('should validate optimization settings', async () => {
            const invalidSettings = {
                maxParallelProcesses: -1,
                preservePreScripts: true
            };

            await expect(optimizer.updateSettings(invalidSettings))
                .rejects.toThrow('Invalid maxParallelProcesses value');
        });
    });

    describe('performance monitoring', () => {
        test('should track script execution times', async () => {
            const script = 'build';
            const executionTime = 1500; // 1.5 seconds

            await optimizer.recordExecutionTime(script, executionTime);
            const stats = await optimizer.getScriptStatistics(script);

            expect(stats.averageExecutionTime).toBeGreaterThan(0);
            expect(stats.executionCount).toBe(1);
        });

        test('should suggest optimizations based on execution history', async () => {
            // Record some execution times
            await optimizer.recordExecutionTime('build', 2000);
            await optimizer.recordExecutionTime('build', 2200);
            await optimizer.recordExecutionTime('test', 500);

            const suggestions = await optimizer.getOptimizationSuggestions();
            expect(suggestions).toContainEqual(
                expect.objectContaining({
                    script: 'build',
                    suggestion: expect.any(String)
                })
            );
        });
    });
});
