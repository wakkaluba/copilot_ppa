import * as fs from 'fs';
import { mock } from 'jest-mock-extended';
import { ILogger } from '../../../services/logging/ILogger';
import { ViteConfigAnalyzer } from '../services/ViteConfigAnalyzer';

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn()
    }
}));

describe('ViteConfigAnalyzer', () => {
    let analyzer: ViteConfigAnalyzer;
    let mockLogger: ILogger;

    beforeEach(() => {
        mockLogger = mock<ILogger>();
        analyzer = new ViteConfigAnalyzer(mockLogger);
        jest.resetAllMocks();
    });

    describe('analyze', () => {
        it('should analyze a valid configuration file', async () => {
            const mockConfig = `
                import { defineConfig } from 'vite'
                import vue from '@vitejs/plugin-vue'
                import legacy from '@vitejs/plugin-legacy'

                export default defineConfig({
                    build: {
                        target: 'esnext',
                        minify: 'terser',
                        sourcemap: true
                    },
                    plugins: [
                        vue(),
                        legacy({
                            targets: ['defaults', 'not IE 11']
                        })
                    ],
                    optimizeDeps: {
                        include: ['vue', 'lodash-es']
                    }
                })
            `;

            (fs.promises.readFile as jest.Mock).mockResolvedValue(mockConfig);

            const result = await analyzer.analyze('mock/vite.config.ts');

            expect(fs.promises.readFile).toHaveBeenCalledWith('mock/vite.config.ts', 'utf-8');
            expect(result.build.target).toBe('esnext');
            expect(result.build.minify).toBe('terser');
            expect(result.plugins).toHaveLength(2);
            expect(result.optimizationOptions.deps?.include).toContain('vue');
        });

        it('should detect invalid build target', async () => {
            const mockConfig = `
                export default defineConfig({
                    build: {
                        target: 'invalid-target'
                    }
                })
            `;

            (fs.promises.readFile as jest.Mock).mockResolvedValue(mockConfig);

            const result = await analyzer.analyze('mock/vite.config.ts');

            expect(result.build.target).toBe('invalid-target');
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid build target'));
        });

        it('should validate optimization settings', async () => {
            const mockConfig = `
                export default defineConfig({
                    optimizeDeps: {
                        include: 'not-an-array' // Invalid type
                    }
                })
            `;

            (fs.promises.readFile as jest.Mock).mockResolvedValue(mockConfig);

            const result = await analyzer.analyze('mock/vite.config.ts');

            expect(result.optimizationOptions.deps?.include).toBeUndefined();
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Invalid optimization settings'));
        });

        it('should analyze performance implications', async () => {
            const mockConfig = `
                export default defineConfig({
                    build: {
                        minify: false,
                        sourcemap: true
                    }
                })
            `;

            (fs.promises.readFile as jest.Mock).mockResolvedValue(mockConfig);

            const result = await analyzer.analyze('mock/vite.config.ts');

            expect(result.build.minify).toBe(false);
            expect(result.build.sourcemap).toBe(true);
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('performance impact'));
        });

        it('should handle parsing errors gracefully', async () => {
            const mockConfig = 'invalid javascript';

            (fs.promises.readFile as jest.Mock).mockResolvedValue(mockConfig);

            await expect(analyzer.analyze('mock/vite.config.ts')).rejects.toThrow('Failed to analyze');
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should validate server configuration', async () => {
            const mockConfig = `
                export default defineConfig({
                    server: {
                        port: 'not-a-number',
                        https: 'not-a-boolean'
                    }
                })
            `;

            (fs.promises.readFile as jest.Mock).mockResolvedValue(mockConfig);

            const result = await analyzer.analyze('mock/vite.config.ts');

            // Server settings are not part of the analysis result, just verify the warnings
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid server configuration'));
        });

        it('should detect plugin configurations', async () => {
            const mockConfig = `
                import vue from '@vitejs/plugin-vue'
                import react from '@vitejs/plugin-react'
                import legacy from '@vitejs/plugin-legacy'

                export default defineConfig({
                    plugins: [
                        vue(),
                        react(),
                        legacy({
                            targets: ['> 0.5%', 'not IE 11']
                        })
                    ]
                })
            `;

            (fs.promises.readFile as jest.Mock).mockResolvedValue(mockConfig);

            const result = await analyzer.analyze('mock/vite.config.ts');

            expect(result.plugins).toBeDefined();
            expect(result.plugins).toHaveLength(3);
            expect(result.plugins).toContainEqual(
                expect.objectContaining({
                    name: 'VuePlugin',
                    description: expect.stringContaining('Vue support')
                })
            );
        });

        it('should extract rollup options', async () => {
            const mockConfig = `
                export default defineConfig({
                    build: {
                        rollupOptions: {
                            external: ['vue'],
                            output: {
                                format: 'es',
                                entryFileNames: 'assets/[name].[hash].js'
                            }
                        }
                    }
                })
            `;

            (fs.promises.readFile as jest.Mock).mockResolvedValue(mockConfig);

            const result = await analyzer.analyze('mock/vite.config.ts');

            expect(result.build.rollupOptions).toBeDefined();
            expect(result.build.rollupOptions?.external).toContain('vue');
            expect(result.build.rollupOptions?.output).toEqual(
                expect.objectContaining({
                    format: 'es',
                    entryFileNames: 'assets/[name].[hash].js'
                })
            );
        });

        it('should handle file read errors', async () => {
            (fs.promises.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

            await expect(analyzer.analyze('mock/vite.config.ts')).rejects.toThrow('File not found');
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });
});
