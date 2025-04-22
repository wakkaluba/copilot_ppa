"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViteConfigDetector_1 = require("../services/ViteConfigDetector");
const jest_mock_extended_1 = require("jest-mock-extended");
describe('ViteConfigDetector', () => {
    let detector;
    let mockLogger;
    let mockFs;
    beforeEach(() => {
        mockLogger = (0, jest_mock_extended_1.mock)();
        mockFs = (0, jest_mock_extended_1.mock)();
        detector = new ViteConfigDetector_1.ViteConfigDetector(mockLogger, mockFs);
    });
    describe('detectConfig', () => {
        it('should detect TypeScript config file', async () => {
            mockFs.exists.mockResolvedValueOnce(true);
            mockFs.readFile.mockResolvedValueOnce(`
                import { defineConfig } from 'vite'
                export default defineConfig({})
            `);
            const result = await detector.detectConfig('/project/vite.config.ts');
            expect(result.configType).toBe('typescript');
            expect(result.path).toBe('/project/vite.config.ts');
            expect(result.isValid).toBe(true);
        });
        it('should detect JavaScript config file', async () => {
            mockFs.exists.mockResolvedValueOnce(true);
            mockFs.readFile.mockResolvedValueOnce(`
                export default {
                    plugins: []
                }
            `);
            const result = await detector.detectConfig('/project/vite.config.js');
            expect(result.configType).toBe('javascript');
            expect(result.path).toBe('/project/vite.config.js');
            expect(result.isValid).toBe(true);
        });
        it('should detect ESM config file', async () => {
            mockFs.exists.mockResolvedValueOnce(true);
            mockFs.readFile.mockResolvedValueOnce(`
                import { defineConfig } from 'vite'
                export default defineConfig({})
            `);
            const result = await detector.detectConfig('/project/vite.config.mjs');
            expect(result.configType).toBe('esm');
            expect(result.path).toBe('/project/vite.config.mjs');
            expect(result.isValid).toBe(true);
        });
        it('should handle missing config file', async () => {
            mockFs.exists.mockResolvedValueOnce(false);
            const result = await detector.detectConfig('/project/vite.config.ts');
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
            expect(mockLogger.warn).toHaveBeenCalled();
        });
        it('should validate dependencies in package.json', async () => {
            mockFs.exists.mockResolvedValueOnce(true);
            mockFs.readFile.mockResolvedValueOnce(`
                import vue from '@vitejs/plugin-vue'
                export default {
                    plugins: [vue()]
                }
            `);
            mockFs.readFile.mockResolvedValueOnce(`{
                "dependencies": {
                    "@vitejs/plugin-vue": "^2.0.0"
                }
            }`);
            const result = await detector.detectConfig('/project/vite.config.ts');
            expect(result.isValid).toBe(true);
            expect(result.dependencies).toContainEqual({
                name: '@vitejs/plugin-vue',
                version: '^2.0.0'
            });
        });
        it('should detect missing required dependencies', async () => {
            mockFs.exists.mockResolvedValueOnce(true);
            mockFs.readFile.mockResolvedValueOnce(`
                import vue from '@vitejs/plugin-vue'
                export default {
                    plugins: [vue()]
                }
            `);
            mockFs.readFile.mockResolvedValueOnce(`{
                "dependencies": {}
            }`);
            const result = await detector.detectConfig('/project/vite.config.ts');
            expect(result.isValid).toBe(false);
            expect(result.missingDependencies).toContain('@vitejs/plugin-vue');
            expect(mockLogger.error).toHaveBeenCalled();
        });
        it('should handle invalid config syntax', async () => {
            mockFs.exists.mockResolvedValueOnce(true);
            mockFs.readFile.mockResolvedValueOnce('invalid { config');
            const result = await detector.detectConfig('/project/vite.config.ts');
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error?.message).toContain('syntax');
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=ViteConfigDetector.test.js.map