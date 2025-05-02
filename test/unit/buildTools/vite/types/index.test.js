const { expect } = require('chai');
const viteTypes = require('../../../../../src/buildTools/vite/types/index');

describe('Vite Types - JavaScript', () => {
  describe('Type Definitions', () => {
    it('should export ViteConfig type', () => {
      expect(viteTypes).to.have.property('ViteConfig');
    });

    it('should export VitePlugin type', () => {
      expect(viteTypes).to.have.property('VitePlugin');
    });

    it('should export ViteBuildConfig type', () => {
      expect(viteTypes).to.have.property('ViteBuildConfig');
    });

    it('should export ViteOptimizationOptions type', () => {
      expect(viteTypes).to.have.property('ViteOptimizationOptions');
    });

    it('should export ViteOptimization type', () => {
      expect(viteTypes).to.have.property('ViteOptimization');
    });

    it('should export ViteConfigAnalysis type', () => {
      expect(viteTypes).to.have.property('ViteConfigAnalysis');
    });

    it('should export IViteConfigManager interface', () => {
      expect(viteTypes).to.have.property('IViteConfigManager');
    });
  });

  describe('Utility Functions', () => {
    it('should export createDefaultViteConfig function', () => {
      expect(viteTypes).to.have.property('createDefaultViteConfig');
      expect(viteTypes.createDefaultViteConfig).to.be.a('function');
    });

    it('should create a valid default Vite config', () => {
      const config = viteTypes.createDefaultViteConfig();
      expect(config).to.be.an('object');
      expect(config).to.have.property('root');
      expect(config).to.have.property('plugins');
      expect(config.plugins).to.be.an('array');
      expect(config).to.have.property('build');
      expect(config.build).to.be.an('object');
    });

    it('should create a config with custom options', () => {
      const config = viteTypes.createDefaultViteConfig({
        root: './custom',
        build: {
          outDir: 'custom-dist'
        }
      });

      expect(config.root).to.equal('./custom');
      expect(config.build.outDir).to.equal('custom-dist');
    });

    it('should export isViteConfig validation function', () => {
      expect(viteTypes).to.have.property('isViteConfig');
      expect(viteTypes.isViteConfig).to.be.a('function');
    });

    it('should validate a proper Vite config', () => {
      const validConfig = viteTypes.createDefaultViteConfig();
      expect(viteTypes.isViteConfig(validConfig)).to.be.true;
      expect(viteTypes.isViteConfig({})).to.be.false;
      expect(viteTypes.isViteConfig(null)).to.be.false;
      expect(viteTypes.isViteConfig(undefined)).to.be.false;
      expect(viteTypes.isViteConfig({ notValid: true })).to.be.false;
    });

    it('should export mergeViteConfigs function', () => {
      expect(viteTypes).to.have.property('mergeViteConfigs');
      expect(viteTypes.mergeViteConfigs).to.be.a('function');
    });

    it('should properly merge two Vite configs', () => {
      const baseConfig = viteTypes.createDefaultViteConfig();
      const overrideConfig = {
        build: {
          outDir: 'custom-dist',
          minify: false
        }
      };

      const mergedConfig = viteTypes.mergeViteConfigs(baseConfig, overrideConfig);
      expect(mergedConfig.build.outDir).to.equal('custom-dist');
      expect(mergedConfig.build.minify).to.be.false;
      // Base config values should be preserved if not overridden
      expect(mergedConfig.root).to.equal(baseConfig.root);
    });

    it('should handle deep merging of nested config objects', () => {
      const baseConfig = viteTypes.createDefaultViteConfig();
      baseConfig.resolve = {
        alias: {
          '@': './src',
          '#': './components'
        }
      };

      const overrideConfig = {
        resolve: {
          alias: {
            '@': './lib',
            '~': './utils'
          }
        }
      };

      const mergedConfig = viteTypes.mergeViteConfigs(baseConfig, overrideConfig);
      expect(mergedConfig.resolve.alias['@']).to.equal('./lib');     // Overridden
      expect(mergedConfig.resolve.alias['#']).to.equal('./components'); // Preserved from base
      expect(mergedConfig.resolve.alias['~']).to.equal('./utils');    // Added from override
    });

    it('should handle merging of plugin arrays', () => {
      const baseConfig = viteTypes.createDefaultViteConfig();
      baseConfig.plugins = [{ name: 'plugin1' }];

      const overrideConfig = {
        plugins: [{ name: 'plugin2' }]
      };

      const mergedConfig = viteTypes.mergeViteConfigs(baseConfig, overrideConfig);
      expect(mergedConfig.plugins).to.have.lengthOf(2);
      expect(mergedConfig.plugins[0].name).to.equal('plugin1');
      expect(mergedConfig.plugins[1].name).to.equal('plugin2');
    });
  });
});
