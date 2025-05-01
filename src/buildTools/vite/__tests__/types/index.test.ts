import {
    IViteAnalysisResult,
    IViteConfig,
    IViteConfigManager,
    IViteOptimization,
    IViteOutput,
    IVitePlugin,
    IViteProjectStructure,
    IViteValidationResult,
    ViteOptimizationType,
    ViteOutputFormat,
    VitePluginType
} from '../../types/index';

describe('Vite Types', () => {
    describe('IViteConfig', () => {
        it('should create valid config object', () => {
            const config: IViteConfig = {
                root: 'project-root',
                base: '/',
                mode: 'development',
                plugins: ['@vitejs/plugin-react'],
                resolve: {
                    alias: {
                        '@': '/src'
                    }
                },
                server: {
                    port: 3000
                },
                build: {
                    outDir: 'dist',
                    minify: true
                }
            };

            expect(config.root).toBe('project-root');
            expect(config.base).toBe('/');
            expect(config.mode).toBe('development');
            expect(config.plugins).toContain('@vitejs/plugin-react');
            expect(config.resolve.alias['@']).toBe('/src');
            expect(config.server.port).toBe(3000);
            expect(config.build.outDir).toBe('dist');
            expect(config.build.minify).toBe(true);
        });

        it('should support minimal configuration', () => {
            const config: IViteConfig = {
                plugins: ['@vitejs/plugin-react']
            };

            expect(config.plugins).toHaveLength(1);
            expect(config.root).toBeUndefined();
        });
    });

    describe('IViteConfigManager', () => {
        it('should define required methods', () => {
            // Create a mock implementation of IViteConfigManager
            const manager: IViteConfigManager = {
                detectConfigs: jest.fn(),
                analyzeConfig: jest.fn(),
                validateConfig: jest.fn(),
                generateOptimizations: jest.fn()
            };

            // Verify the interface shape
            expect(typeof manager.detectConfigs).toBe('function');
            expect(typeof manager.analyzeConfig).toBe('function');
            expect(typeof manager.validateConfig).toBe('function');
            expect(typeof manager.generateOptimizations).toBe('function');
        });
    });

    describe('IViteAnalysisResult', () => {
        it('should create valid analysis result', () => {
            const result: IViteAnalysisResult = {
                configPath: '/project/vite.config.js',
                plugins: ['@vitejs/plugin-react', '@vitejs/plugin-vue'],
                dependencies: ['vite', 'react'],
                devDependencies: ['@vitejs/plugin-react'],
                server: { port: 3000 },
                build: { outDir: 'dist', minify: true },
                resolve: { alias: { '@': '/src' } },
                warnings: ['Consider adding source maps'],
                errors: []
            };

            expect(result.configPath).toBe('/project/vite.config.js');
            expect(result.plugins).toContain('@vitejs/plugin-react');
            expect(result.plugins).toContain('@vitejs/plugin-vue');
            expect(result.dependencies).toContain('vite');
            expect(result.devDependencies).toContain('@vitejs/plugin-react');
            expect(result.server.port).toBe(3000);
            expect(result.build.outDir).toBe('dist');
            expect(result.warnings).toHaveLength(1);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('IViteValidationResult', () => {
        it('should create valid validation result', () => {
            const result: IViteValidationResult = {
                isValid: true,
                warnings: ['Consider enabling source maps'],
                errors: []
            };

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.errors).toHaveLength(0);
        });

        it('should create invalid validation result', () => {
            const result: IViteValidationResult = {
                isValid: false,
                warnings: [],
                errors: ['Invalid plugin configuration']
            };

            expect(result.isValid).toBe(false);
            expect(result.warnings).toHaveLength(0);
            expect(result.errors).toHaveLength(1);
        });
    });

    describe('IVitePlugin', () => {
        it('should create valid plugin object', () => {
            const plugin: IVitePlugin = {
                name: '@vitejs/plugin-react',
                type: VitePluginType.React,
                config: { jsxRuntime: 'automatic' }
            };

            expect(plugin.name).toBe('@vitejs/plugin-react');
            expect(plugin.type).toBe(VitePluginType.React);
            expect(plugin.config).toHaveProperty('jsxRuntime', 'automatic');
        });
    });

    describe('IViteOutput', () => {
        it('should create valid output object', () => {
            const output: IViteOutput = {
                dir: 'dist',
                format: ViteOutputFormat.ESM,
                sourcemap: true
            };

            expect(output.dir).toBe('dist');
            expect(output.format).toBe(ViteOutputFormat.ESM);
            expect(output.sourcemap).toBe(true);
        });
    });

    describe('IViteOptimization', () => {
        it('should create plugin optimization', () => {
            const optimization: IViteOptimization = {
                type: ViteOptimizationType.Plugin,
                name: '@vitejs/plugin-legacy',
                reason: 'Adds browser compatibility',
                priority: 'medium'
            };

            expect(optimization.type).toBe(ViteOptimizationType.Plugin);
            expect(optimization.name).toBe('@vitejs/plugin-legacy');
            expect(optimization.reason).toBe('Adds browser compatibility');
            expect(optimization.priority).toBe('medium');
        });

        it('should create config optimization', () => {
            const optimization: IViteOptimization = {
                type: ViteOptimizationType.Config,
                property: 'build.minify',
                value: true,
                reason: 'Reduces bundle size',
                priority: 'high'
            };

            expect(optimization.type).toBe(ViteOptimizationType.Config);
            expect(optimization.property).toBe('build.minify');
            expect(optimization.value).toBe(true);
            expect(optimization.reason).toBe('Reduces bundle size');
            expect(optimization.priority).toBe('high');
        });
    });

    describe('IViteProjectStructure', () => {
        it('should create valid project structure object', () => {
            const structure: IViteProjectStructure = {
                entryPoints: ['src/main.js'],
                outputDir: 'dist',
                isTypescript: true,
                hasNodeModules: true,
                dependencies: ['vite', 'react'],
                devDependencies: ['@vitejs/plugin-react']
            };

            expect(structure.entryPoints).toHaveLength(1);
            expect(structure.outputDir).toBe('dist');
            expect(structure.isTypescript).toBe(true);
            expect(structure.hasNodeModules).toBe(true);
            expect(structure.dependencies).toHaveLength(2);
            expect(structure.devDependencies).toHaveLength(1);
        });
    });

    describe('Enums', () => {
        it('should define all optimization types', () => {
            expect(ViteOptimizationType.Plugin).toBeDefined();
            expect(ViteOptimizationType.Config).toBeDefined();
            expect(ViteOptimizationType.Structure).toBeDefined();
            expect(ViteOptimizationType.Dependencies).toBeDefined();
        });

        it('should define all plugin types', () => {
            expect(VitePluginType.React).toBeDefined();
            expect(VitePluginType.Vue).toBeDefined();
            expect(VitePluginType.Svelte).toBeDefined();
            expect(VitePluginType.Legacy).toBeDefined();
            expect(VitePluginType.PWA).toBeDefined();
            expect(VitePluginType.Other).toBeDefined();
        });

        it('should define all output formats', () => {
            expect(ViteOutputFormat.ESM).toBeDefined();
            expect(ViteOutputFormat.CJS).toBeDefined();
            expect(ViteOutputFormat.UMD).toBeDefined();
            expect(ViteOutputFormat.IIFE).toBeDefined();
            expect(ViteOutputFormat.SystemJS).toBeDefined();
        });
    });

    describe('Enum usage', () => {
        it('should use enums in objects correctly', () => {
            const optimization: IViteOptimization = {
                type: ViteOptimizationType.Plugin,
                name: '@vitejs/plugin-legacy',
                reason: 'Adds browser compatibility'
            };

            const plugin: IVitePlugin = {
                name: '@vitejs/plugin-vue',
                type: VitePluginType.Vue
            };

            const output: IViteOutput = {
                dir: 'dist',
                format: ViteOutputFormat.ESM
            };

            expect(optimization.type).toBe(ViteOptimizationType.Plugin);
            expect(plugin.type).toBe(VitePluginType.Vue);
            expect(output.format).toBe(ViteOutputFormat.ESM);
        });
    });
});
