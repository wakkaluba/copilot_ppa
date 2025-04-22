"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViteOptimizationService_1 = require("../services/ViteOptimizationService");
const jest_mock_extended_1 = require("jest-mock-extended");
describe('ViteOptimizationService', () => {
    let optimizer;
    let mockLogger;
    beforeEach(() => {
        mockLogger = (0, jest_mock_extended_1.mock)();
        optimizer = new ViteOptimizationService_1.ViteOptimizationService(mockLogger);
    });
    describe('analyzeOptimizations', () => {
        it('should detect suboptimal build settings', async () => {
            const config = {
                build: {
                    minify: false,
                    target: 'es2015'
                }
            };
            const result = await optimizer.analyzeOptimizations(config);
            expect(result.suggestions).toContainEqual(expect.objectContaining({
                type: 'build',
                description: expect.stringContaining('minification'),
                impact: 'high'
            }));
            expect(result.suggestions).toContainEqual(expect.objectContaining({
                type: 'build',
                description: expect.stringContaining('target'),
                impact: 'medium'
            }));
        });
        it('should suggest dependency optimizations', async () => {
            const config = {
                optimizeDeps: {
                    entries: [],
                    include: []
                }
            };
            const result = await optimizer.analyzeOptimizations(config);
            expect(result.suggestions).toContainEqual(expect.objectContaining({
                type: 'dependencies',
                description: expect.stringContaining('pre-bundling'),
                impact: 'high'
            }));
        });
        it('should suggest asset optimizations', async () => {
            const config = {
                build: {
                    assetsInlineLimit: 10000000
                }
            };
            const result = await optimizer.analyzeOptimizations(config);
            expect(result.suggestions).toContainEqual(expect.objectContaining({
                type: 'assets',
                description: expect.stringContaining('inline limit'),
                impact: 'medium'
            }));
        });
        it('should detect missing production optimizations', async () => {
            const config = {
                build: {
                    sourcemap: true,
                    minify: true
                }
            };
            const result = await optimizer.analyzeOptimizations(config, 'production');
            expect(result.suggestions).toContainEqual(expect.objectContaining({
                type: 'production',
                description: expect.stringContaining('sourcemap'),
                impact: 'medium'
            }));
        });
        it('should provide code samples for suggestions', async () => {
            const config = {
                build: {
                    minify: false
                }
            };
            const result = await optimizer.analyzeOptimizations(config);
            expect(result.suggestions[0].sampleCode).toBeDefined();
            expect(result.suggestions[0].sampleCode).toContain('minify: "esbuild"');
        });
        it('should detect missing CSS optimizations', async () => {
            const config = {
                css: {
                    postcss: false
                }
            };
            const result = await optimizer.analyzeOptimizations(config);
            expect(result.suggestions).toContainEqual(expect.objectContaining({
                type: 'css',
                description: expect.stringContaining('PostCSS'),
                impact: 'medium'
            }));
        });
        it('should handle invalid configurations gracefully', async () => {
            const config = null;
            await expect(optimizer.analyzeOptimizations(config)).rejects.toThrow();
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=ViteOptimizationService.test.js.map