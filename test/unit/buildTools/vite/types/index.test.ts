import { expect } from 'chai';
import * as viteTypes from '../../../../../src/buildTools/vite/types/index';

describe('Vite Types - TypeScript', () => {
  describe('Type Definitions', () => {
    it('should export ViteConfig interface', () => {
      // We can't directly check TypeScript interfaces at runtime
      // Instead, verify that we can create objects that conform to the interface
      const config: viteTypes.ViteConfig = {
        root: './src',
        plugins: [],
        resolve: {
          alias: {
            '@': './src'
          }
        },
        build: {
          outDir: 'dist',
          minify: true
        }
      };

      expect(config).to.be.an('object');
      expect(config.root).to.equal('./src');
      expect(config.plugins).to.be.an('array');
    });

    it('should export VitePlugin interface', () => {
      const plugin: viteTypes.VitePlugin = {
        name: 'test-plugin',
        description: 'A test plugin',
        enforce: 'pre',
        apply: 'build'
      };

      expect(plugin).to.be.an('object');
      expect(plugin.name).to.equal('test-plugin');
      expect(plugin.description).to.equal('A test plugin');
    });

    it('should export ViteBuildConfig interface', () => {
      const buildConfig: viteTypes.ViteBuildConfig = {
        outDir: 'dist',
        target: 'es2015',
        minify: 'terser',
        sourcemap: true,
        cssCodeSplit: true,
        assetsInlineLimit: 4096
      };

      expect(buildConfig).to.be.an('object');
      expect(buildConfig.outDir).to.equal('dist');
      expect(buildConfig.target).to.equal('es2015');
      expect(buildConfig.minify).to.equal('terser');
    });

    it('should export ViteOptimizationOptions interface', () => {
      const optimizationOptions: viteTypes.ViteOptimizationOptions = {
        deps: {
          entries: ['src/index.ts'],
          exclude: ['lodash'],
          include: ['vue']
        },
        build: {
          target: 'es2018',
          minify: true,
          cssCodeSplit: true,
          chunkSizeWarningLimit: 500
        }
      };

      expect(optimizationOptions).to.be.an('object');
      expect(optimizationOptions.deps).to.be.an('object');
      expect(optimizationOptions.deps?.entries).to.deep.equal(['src/index.ts']);
      expect(optimizationOptions.build).to.be.an('object');
      expect(optimizationOptions.build?.minify).to.be.true;
    });

    it('should export ViteOptimization interface', () => {
      const optimization: viteTypes.ViteOptimization = {
        title: 'Enable Code Splitting',
        description: 'Split code into smaller chunks for better caching',
        code: 'build: { cssCodeSplit: true }'
      };

      expect(optimization).to.be.an('object');
      expect(optimization.title).to.equal('Enable Code Splitting');
      expect(optimization.description).to include('Split code');
      expect(optimization.code).to include('cssCodeSplit');
    });

    it('should export ViteConfigAnalysis interface', () => {
      const analysis: viteTypes.ViteConfigAnalysis = {
        build: {
          outDir: 'dist',
          minify: true
        },
        plugins: [
          { name: 'vue', description: 'Vue plugin' }
        ],
        optimizationOptions: {
          build: { minify: true }
        },
        content: 'export default defineConfig({ ... })',
        optimizationSuggestions: [
          'Enable code splitting for better performance'
        ]
      };

      expect(analysis).to.be.an('object');
      expect(analysis.build).to.be.an('object');
      expect(analysis.plugins).to.be.an('array');
      expect(analysis.optimizationSuggestions).to be.an('array');
      expect(analysis.content).to.be.a('string');
    });

    it('should export IViteConfigManager interface', () => {
      // We can only verify this indirectly as it's an interface
      // Check if the interface is defined by testing if we can use it as a type
      const hasInterface = typeof viteTypes.IViteConfigManager !== 'undefined';
      expect(hasInterface).to.be.true;
    });
  });

  describe('Utility Functions', () => {
    it('should export createDefaultViteConfig function', () => {
      expect(viteTypes.createDefaultViteConfig).to.be.a('function');

      const config = viteTypes.createDefaultViteConfig();
      expect(config).to.be.an('object');
      expect(config.plugins).to.be.an('array');
      expect(config.build).to.be.an('object');
      expect(config.root).to.be.a('string');
    });

    it('should create default config with custom options', () => {
      const config = viteTypes.createDefaultViteConfig({
        root: './custom',
        build: {
          outDir: 'custom-dist'
        }
      });

      expect(config.root).to.equal('./custom');
      expect(config.build.outDir).to.equal('custom-dist');
    });

    it('should export isViteConfig type guard function', () => {
      expect(viteTypes.isViteConfig).to.be.a('function');

      const validConfig = viteTypes.createDefaultViteConfig();
      expect(viteTypes.isViteConfig(validConfig)).to.be.true;
      expect(viteTypes.isViteConfig({})).to.be.false;
      expect(viteTypes.isViteConfig(undefined)).to.be.false;
      expect(viteTypes.isViteConfig(null)).to.be.false;
      expect(viteTypes.isViteConfig({ notValid: true })).to.be.false;
    });

    it('should export mergeViteConfigs function', () => {
      expect(viteTypes.mergeViteConfigs).to.be.a('function');

      const baseConfig = viteTypes.createDefaultViteConfig();
      const overrideConfig: Partial<viteTypes.ViteConfig> = {
        build: {
          outDir: 'custom-dist',
          minify: false
        }
      };

      const mergedConfig = viteTypes.mergeViteConfigs(baseConfig, overrideConfig);
      expect(mergedConfig.build?.outDir).to.equal('custom-dist');
      expect(mergedConfig.build?.minify).to.be.false;
      // Base config values should be preserved if not overridden
      expect(mergedConfig.root).to.equal(baseConfig.root);
    });

    it('should handle deep merging of configs', () => {
      const baseConfig = viteTypes.createDefaultViteConfig();
      baseConfig.resolve = {
        alias: {
          '@': './src',
          '#': './components'
        }
      };

      const overrideConfig: Partial<viteTypes.ViteConfig> = {
        resolve: {
          alias: {
            '@': './lib',
            '~': './utils'
          }
        }
      };

      const mergedConfig = viteTypes.mergeViteConfigs(baseConfig, overrideConfig);
      expect(mergedConfig.resolve?.alias).to.deep.include({
        '@': './lib',     // Overridden
        '#': './components', // Preserved from base
        '~': './utils'    // Added from override
      });
    });

    it('should handle merging of plugins', () => {
      const baseConfig = viteTypes.createDefaultViteConfig();
      baseConfig.plugins = [{ name: 'plugin1' }];

      const overrideConfig: Partial<viteTypes.ViteConfig> = {
        plugins: [{ name: 'plugin2' }]
      };

      const mergedConfig = viteTypes.mergeViteConfigs(baseConfig, overrideConfig);
      expect(mergedConfig.plugins).to.have.lengthOf(2);
      expect(mergedConfig.plugins[0].name).to.equal('plugin1');
      expect(mergedConfig.plugins[1].name).to.equal('plugin2');
    });
  });
});
