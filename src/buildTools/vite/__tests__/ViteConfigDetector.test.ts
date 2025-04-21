import { ViteConfigDetector } from '../services/ViteConfigDetector';
import { ILogger } from '../../../services/logging/ILogger';
import { mock } from 'jest-mock-extended';
import { FileSystem } from '../../../services/FileSystem';

describe('ViteConfigDetector', () => {
    let detector: ViteConfigDetector;
    let mockLogger: ILogger;
    let mockFs: FileSystem;

    beforeEach(() => {
        mockLogger = mock<ILogger>();
        mockFs = mock<FileSystem>();
        detector = new ViteConfigDetector(mockLogger, mockFs);
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