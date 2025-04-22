"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViteConfigAnalyzer_1 = require("../services/ViteConfigAnalyzer");
const jest_mock_extended_1 = require("jest-mock-extended");
describe('ViteConfigAnalyzer', () => {
    let analyzer;
    let mockLogger;
    beforeEach(() => {
        mockLogger = (0, jest_mock_extended_1.mock)();
        analyzer = new ViteConfigAnalyzer_1.ViteConfigAnalyzer(mockLogger);
    });
    describe('analyzeConfig', () => {
        it('should detect optimization settings', async () => {
            const config = `
                export default defineConfig({
                    build: {
                        minify: true,
                        target: 'esnext',
                        rollupOptions: {
                            output: {
                                manualChunks: {
                                    vendor: ['vue', 'lodash-es']
                                }
                            }
                        }
                    }
                })
            `;
            const result = await analyzer.analyzeConfig(config);
            expect(result.optimizations).toBeDefined();
            expect(result.optimizations?.length).toBeGreaterThan(0);
            expect(result.optimizations).toContainEqual(expect.objectContaining({
                type: 'build',
                description: expect.stringContaining('minification')
            }));
        });
        it('should detect missing optimizations', async () => {
            const config = `
                export default defineConfig({
                    build: {
                        minify: false
                    }
                })
            `;
            const result = await analyzer.analyzeConfig(config);
            expect(result.suggestions).toBeDefined();
            expect(result.suggestions?.length).toBeGreaterThan(0);
            expect(result.suggestions).toContainEqual(expect.objectContaining({
                type: 'optimization',
                description: expect.stringContaining('minification')
            }));
        });
        it('should detect plugin configurations', async () => {
            const config = `
                import vue from '@vitejs/plugin-vue'
                import legacy from '@vitejs/plugin-legacy'

                export default defineConfig({
                    plugins: [
                        vue(),
                        legacy({
                            targets: ['defaults', 'not IE 11']
                        })
                    ]
                })
            `;
            const result = await analyzer.analyzeConfig(config);
            expect(result.plugins).toBeDefined();
            expect(result.plugins?.length).toBe(2);
            expect(result.plugins).toContainEqual(expect.objectContaining({
                name: 'vue'
            }));
            expect(result.plugins).toContainEqual(expect.objectContaining({
                name: 'legacy'
            }));
        });
        it('should handle invalid configurations', async () => {
            const config = 'invalid config';
            await expect(analyzer.analyzeConfig(config)).rejects.toThrow();
            expect(mockLogger.error).toHaveBeenCalled();
        });
        it('should detect dependency optimizations', async () => {
            const config = `
                export default defineConfig({
                    optimizeDeps: {
                        include: ['vue', 'lodash-es'],
                        exclude: ['local-pkg']
                    }
                })
            `;
            const result = await analyzer.analyzeConfig(config);
            expect(result.dependencyOptimizations).toBeDefined();
            expect(result.dependencyOptimizations?.included).toContain('vue');
            expect(result.dependencyOptimizations?.excluded).toContain('local-pkg');
        });
        it('should detect build target configuration', async () => {
            const config = `
                export default defineConfig({
                    build: {
                        target: 'esnext',
                        polyfillDynamicImport: false
                    }
                })
            `;
            const result = await analyzer.analyzeConfig(config);
            expect(result.buildConfig).toBeDefined();
            expect(result.buildConfig?.target).toBe('esnext');
            expect(result.buildConfig?.polyfillDynamicImport).toBe(false);
        });
    });
});
//# sourceMappingURL=ViteConfigAnalyzer.test.js.map