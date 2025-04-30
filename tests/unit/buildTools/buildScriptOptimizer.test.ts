import * as vscode from 'vscode';
import { BuildScriptOptimizer } from '../../../src/buildTools/buildScriptOptimizer';
import { BuildToolsManager } from '../../../src/buildTools/buildToolsManager';
import { Logger } from '../../../src/utils/logger';

jest.mock('../../../src/buildTools/buildToolsManager');
jest.mock('../../../src/utils/logger');
jest.mock('vscode');

describe('BuildScriptOptimizer', () => {
    let optimizer: BuildScriptOptimizer;
    let mockBuildTools: jest.Mocked<BuildToolsManager>;
    let mockLogger: jest.Mocked<Logger>;
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        } as unknown as jest.Mocked<Logger>;

        mockContext = {
            subscriptions: []
        } as unknown as vscode.ExtensionContext;

        mockBuildTools = new BuildToolsManager(mockContext, mockLogger) as jest.Mocked<BuildToolsManager>;
        optimizer = new BuildScriptOptimizer();
    });

    describe('optimizeScript', () => {
        it('should analyze build script and generate optimizations', async () => {
            const scriptName = 'build';
            const scriptCommand = 'webpack';

            const result = await optimizer.optimizeScript(scriptName, scriptCommand);

            expect(mockLogger.info).toHaveBeenCalledWith('Analyzing build script: build');
            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toHaveProperty('title');
            expect(result[0]).toHaveProperty('description');
            expect(result[0]).toHaveProperty('benefit');
            expect(result[0]).toHaveProperty('before');
            expect(result[0]).toHaveProperty('after');
        });

        it('should handle empty or invalid script commands', async () => {
            const scriptName = 'build';
            const scriptCommand = '';

            const result = await optimizer.optimizeScript(scriptName, scriptCommand);

            expect(mockLogger.warn).toHaveBeenCalledWith('No build scripts found to optimize');
            expect(result).toEqual([]);
        });

        it('should handle error during optimization', async () => {
            const scriptName = 'build';
            const scriptCommand = 'invalid-command';
            const error = new Error('Optimization failed');

            // Mock the analyzer to throw an error
            jest.spyOn(optimizer['analyzer'], 'analyzeBuildCommand').mockImplementation(() => {
                throw error;
            });

            await expect(optimizer.optimizeScript(scriptName, scriptCommand))
                .rejects
                .toThrow('Build script optimization failed: Optimization failed');

            expect(mockLogger.error).toHaveBeenCalledWith('Error optimizing build script:', error);
        });

        it('should log generated optimization suggestions', async () => {
            const scriptName = 'build';
            const scriptCommand = 'webpack';

            const result = await optimizer.optimizeScript(scriptName, scriptCommand);

            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Generated'));
            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('optimization suggestions'));
        });

        it('should provide optimization suggestions for complex build scripts', async () => {
            const scriptName = 'build';
            const scriptCommand = 'tsc && webpack && node post-build.js';

            const result = await optimizer.optimizeScript(scriptName, scriptCommand);

            // Should suggest parallel execution
            expect(result).toContainEqual(expect.objectContaining({
                title: expect.stringContaining('Parallel'),
                before: scriptCommand
            }));

            // Should suggest TypeScript incremental builds
            expect(result).toContainEqual(expect.objectContaining({
                title: expect.stringContaining('TypeScript'),
                before: scriptCommand
            }));

            // Should suggest webpack optimizations
            expect(result).toContainEqual(expect.objectContaining({
                title: expect.stringContaining('Webpack'),
                before: scriptCommand
            }));
        });
    });

    describe('error handling', () => {
        it('should wrap non-Error objects in Error instance', () => {
            const error = 'String error';
            const wrappedError = optimizer['wrapError'](error);

            expect(wrappedError).toBeInstanceOf(Error);
            expect(wrappedError.message).toBe('Build script optimization failed: String error');
        });

        it('should preserve Error instances', () => {
            const originalError = new Error('Original error');
            const wrappedError = optimizer['wrapError'](originalError);

            expect(wrappedError).toBe(originalError);
        });
    });
});
