import * as fs from 'fs';
import * as path from 'path';
import { BuildScriptOptimizer } from '../../optimization/buildScriptOptimizer';
import { RollupConfigAnalyzer } from '../RollupConfigAnalyzer';
import { RollupConfigDetector } from '../RollupConfigDetector';
import { RollupOptimizationService } from '../RollupOptimizationService';

jest.mock('fs');
jest.mock('path');

describe('BuildScriptOptimizer Rollup Integration', () => {
    let optimizer: BuildScriptOptimizer;
    let analyzer: RollupConfigAnalyzer;
    let detector: RollupConfigDetector;
    let optimizationService: RollupOptimizationService;
    let mockLogger: any;

    beforeEach(() => {
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        analyzer = new RollupConfigAnalyzer(mockLogger);
        detector = new RollupConfigDetector(mockLogger);
        optimizationService = new RollupOptimizationService(mockLogger);
        optimizer = new BuildScriptOptimizer(mockLogger);

        (fs.existsSync as jest.Mock).mockReset();
        (fs.readFileSync as jest.Mock).mockReset();
        (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    });

    describe('optimizeRollupScripts', () => {
        it('should optimize basic Rollup build script', async () => {
            const packageJson = {
                scripts: {
                    build: 'rollup -c'
                }
            };
            const configContent = `
                export default {
                    input: 'src/index.js',
                    output: {
                        file: 'dist/bundle.js',
                        format: 'es'
                    }
                }
            `;

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock)
                .mockReturnValueOnce(JSON.stringify(packageJson))
                .mockReturnValueOnce(configContent);

            const suggestions = await optimizer.optimize('/workspace');
            expect(suggestions).toContainEqual(expect.objectContaining({
                type: 'BUILD_SCRIPT',
                description: expect.stringContaining('production')
            }));
        });

        it('should suggest environment-specific configurations', async () => {
            const packageJson = {
                scripts: {
                    build: 'rollup -c'
                }
            };
            const configContent = `
                export default {
                    input: 'src/index.js',
                    output: {
                        file: 'dist/bundle.js',
                        format: 'es'
                    }
                }
            `;

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock)
                .mockReturnValueOnce(JSON.stringify(packageJson))
                .mockReturnValueOnce(configContent);

            const suggestions = await optimizer.optimize('/workspace');
            expect(suggestions).toContainEqual(expect.objectContaining({
                type: 'BUILD_SCRIPT',
                description: expect.stringContaining('environment')
            }));
        });

        it('should handle watch mode optimization', async () => {
            const packageJson = {
                scripts: {
                    start: 'rollup -c -w'
                }
            };

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock)
                .mockReturnValueOnce(JSON.stringify(packageJson));

            const suggestions = await optimizer.optimize('/workspace');
            expect(suggestions).toContainEqual(expect.objectContaining({
                type: 'BUILD_SCRIPT',
                description: expect.stringContaining('watch')
            }));
        });

        it('should suggest parallel builds for multiple entry points', async () => {
            const packageJson = {
                scripts: {
                    build: 'rollup -c'
                }
            };
            const configContent = `
                export default {
                    input: {
                        main: 'src/index.js',
                        worker: 'src/worker.js'
                    },
                    output: {
                        dir: 'dist',
                        format: 'es'
                    }
                }
            `;

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock)
                .mockReturnValueOnce(JSON.stringify(packageJson))
                .mockReturnValueOnce(configContent);

            const suggestions = await optimizer.optimize('/workspace');
            expect(suggestions).toContainEqual(expect.objectContaining({
                type: 'BUILD_SCRIPT',
                description: expect.stringContaining('parallel')
            }));
        });

        it('should handle TypeScript integration', async () => {
            const packageJson = {
                scripts: {
                    build: 'rollup -c'
                },
                devDependencies: {
                    '@rollup/plugin-typescript': '^8.0.0'
                }
            };
            const configContent = `
                import typescript from '@rollup/plugin-typescript';
                export default {
                    input: 'src/index.ts',
                    plugins: [typescript()]
                }
            `;

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock)
                .mockReturnValueOnce(JSON.stringify(packageJson))
                .mockReturnValueOnce(configContent);

            const suggestions = await optimizer.optimize('/workspace');
            expect(suggestions).toContainEqual(expect.objectContaining({
                type: 'BUILD_SCRIPT',
                description: expect.stringContaining('TypeScript')
            }));
        });

        it('should suggest cache configuration', async () => {
            const packageJson = {
                scripts: {
                    build: 'rollup -c'
                }
            };

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock)
                .mockReturnValueOnce(JSON.stringify(packageJson));

            const suggestions = await optimizer.optimize('/workspace');
            expect(suggestions).toContainEqual(expect.objectContaining({
                type: 'BUILD_SCRIPT',
                description: expect.stringContaining('cache')
            }));
        });

        it('should handle errors in package.json', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockImplementation(() => {
                throw new Error('Failed to read package.json');
            });

            const suggestions = await optimizer.optimize('/workspace');
            expect(suggestions).toEqual([]);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle missing build script', async () => {
            const packageJson = {
                scripts: {}
            };

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock)
                .mockReturnValueOnce(JSON.stringify(packageJson));

            const suggestions = await optimizer.optimize('/workspace');
            expect(suggestions).toContainEqual(expect.objectContaining({
                type: 'BUILD_SCRIPT',
                description: expect.stringContaining('build script')
            }));
        });

        it('should suggest output cleaning', async () => {
            const packageJson = {
                scripts: {
                    build: 'rollup -c'
                }
            };

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock)
                .mockReturnValueOnce(JSON.stringify(packageJson));

            const suggestions = await optimizer.optimize('/workspace');
            expect(suggestions).toContainEqual(expect.objectContaining({
                type: 'BUILD_SCRIPT',
                description: expect.stringContaining('clean')
            }));
        });

        it('should handle complex build pipelines', async () => {
            const packageJson = {
                scripts: {
                    prebuild: 'tsc --noEmit',
                    build: 'rollup -c',
                    postbuild: 'node scripts/compress.js'
                }
            };

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock)
                .mockReturnValueOnce(JSON.stringify(packageJson));

            const suggestions = await optimizer.optimize('/workspace');
            expect(suggestions).toContainEqual(expect.objectContaining({
                type: 'BUILD_SCRIPT',
                description: expect.stringContaining('pipeline')
            }));
        });

        it('should handle error cases gracefully', async () => {
            (fs.existsSync as jest.Mock)
                .mockReturnValueOnce(true)  // workspace exists
                .mockReturnValueOnce(false); // package.json doesn't exist

            const suggestions = await optimizer.optimize('/workspace');
            expect(suggestions).toEqual([]);
            expect(mockLogger.warn).toHaveBeenCalled();
        });
    });
});
