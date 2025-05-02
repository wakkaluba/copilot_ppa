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
        enforce: 'pre',
        apply: 'build'
      };

      expect(plugin).to.be.an('object');
      expect(plugin.name).to.equal('test-plugin');
    });

    it('should export ViteConfigOptimization interface', () => {
      const optimization: viteTypes.ViteConfigOptimization = {
        minify: 'terser',
        target: 'es2015',
        modulePreload: true
      };

      expect(optimization).to.be.an('object');
      expect(optimization.minify).to.equal('terser');
    });

    it('should export ViteOptimizationSuggestion interface', () => {
      const suggestion: viteTypes.ViteOptimizationSuggestion = {
        id: 'enable-minification',
        description: 'Enable minification for smaller bundle sizes',
        impact: 'high',
        configuration: {
          build: {
            minify: 'terser'
          }
        }
      };

      expect(suggestion).to.be.an('object');
      expect(suggestion.id).to.equal('enable-minification');
      expect(suggestion.impact).to.equal('high');
    });
  });

  describe('Utility Functions', () => {
    it('should export createDefaultViteConfig function', () => {
      expect(viteTypes.createDefaultViteConfig).to.be.a('function');

      const config = viteTypes.createDefaultViteConfig();
      expect(config).to.be.an('object');
      expect(config.plugins).to.be.an('array');
    });

    it('should export isViteConfig type guard function', () => {
      expect(viteTypes.isViteConfig).to.be.a('function');

      const validConfig = viteTypes.createDefaultViteConfig();
      expect(viteTypes.isViteConfig(validConfig)).to.be.true;
      expect(viteTypes.isViteConfig({})).to.be.false;
      expect(viteTypes.isViteConfig(undefined)).to.be.false;
    });

    it('should export mergeViteConfigs function', () => {
      expect(viteTypes.mergeViteConfigs).to.be.a('function');

      const baseConfig = viteTypes.createDefaultViteConfig();
      const overrideConfig: Partial<viteTypes.ViteConfig> = {
        build: {
          outDir: 'custom-dist'
        }
      };

      const mergedConfig = viteTypes.mergeViteConfigs(baseConfig, overrideConfig);
      expect(mergedConfig.build?.outDir).to.equal('custom-dist');
    });
  });
});
