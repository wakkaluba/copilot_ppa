const { expect } = require('chai');
const webpackTypes = require('../../../../../src/buildTools/webpack/types/index');

describe('Webpack Types - JavaScript', () => {
  describe('Type Definitions', () => {
    it('should export WebpackConfig type', () => {
      expect(webpackTypes).to.have.property('WebpackConfig');
    });

    it('should export WebpackEntryPoint type', () => {
      expect(webpackTypes).to.have.property('WebpackEntryPoint');
    });

    it('should export WebpackPlugin type', () => {
      expect(webpackTypes).to.have.property('WebpackPlugin');
    });

    it('should export WebpackLoader type', () => {
      expect(webpackTypes).to.have.property('WebpackLoader');
    });

    it('should export WebpackRule type', () => {
      expect(webpackTypes).to.have.property('WebpackRule');
    });

    it('should export WebpackOutputConfig type', () => {
      expect(webpackTypes).to.have.property('WebpackOutputConfig');
    });

    it('should export WebpackOptimizationConfig type', () => {
      expect(webpackTypes).to.have.property('WebpackOptimizationConfig');
    });

    it('should export WebpackDevServerConfig type', () => {
      expect(webpackTypes).to.have.property('WebpackDevServerConfig');
    });

    it('should export WebpackOptimizationSuggestion type', () => {
      expect(webpackTypes).to.have.property('WebpackOptimizationSuggestion');
    });
  });

  describe('Utility Functions', () => {
    it('should export createDefaultWebpackConfig function', () => {
      expect(webpackTypes).to.have.property('createDefaultWebpackConfig');
      expect(webpackTypes.createDefaultWebpackConfig).to.be.a('function');
    });

    it('should create a valid default webpack config', () => {
      const config = webpackTypes.createDefaultWebpackConfig();
      expect(config).to.be.an('object');
      expect(config).to.have.property('mode', 'development');
      expect(config).to.have.property('entry');
      expect(config).to.have.property('output');
      expect(config).to.have.property('module');
      expect(config.module).to.have.property('rules');
      expect(config.module.rules).to.be.an('array');
    });

    it('should create a config with custom options', () => {
      const config = webpackTypes.createDefaultWebpackConfig({
        mode: 'production',
        entry: './custom/index.js'
      });

      expect(config.mode).to.equal('production');
      expect(config.entry).to.equal('./custom/index.js');
      expect(config).to.have.property('output');
      expect(config).to.have.property('module');
    });

    it('should export isWebpackConfig validation function', () => {
      expect(webpackTypes).to.have.property('isWebpackConfig');
      expect(webpackTypes.isWebpackConfig).to.be.a('function');
    });

    it('should validate a proper webpack config', () => {
      const validConfig = webpackTypes.createDefaultWebpackConfig();
      expect(webpackTypes.isWebpackConfig(validConfig)).to.be.true;
      expect(webpackTypes.isWebpackConfig({})).to.be.false;
      expect(webpackTypes.isWebpackConfig(null)).to.be.false;
      expect(webpackTypes.isWebpackConfig(undefined)).to.be.false;
      expect(webpackTypes.isWebpackConfig({ notRelated: true })).to.be.false;
    });

    it('should export mergeWebpackConfigs function', () => {
      expect(webpackTypes).to.have.property('mergeWebpackConfigs');
      expect(webpackTypes.mergeWebpackConfigs).to.be.a('function');
    });

    it('should properly merge two webpack configs', () => {
      const baseConfig = webpackTypes.createDefaultWebpackConfig();
      const overrideConfig = {
        mode: 'production',
        output: {
          filename: 'custom.js'
        }
      };

      const mergedConfig = webpackTypes.mergeWebpackConfigs(baseConfig, overrideConfig);

      expect(mergedConfig.mode).to.equal('production');
      expect(mergedConfig.output.filename).to.equal('custom.js');
      expect(mergedConfig.entry).to.equal(baseConfig.entry);
      expect(mergedConfig.module.rules).to.deep.equal(baseConfig.module.rules);
    });

    it('should handle deep merging of nested config objects', () => {
      const baseConfig = webpackTypes.createDefaultWebpackConfig();
      baseConfig.resolve = {
        alias: {
          '@': './src',
          '#': './components'
        },
        extensions: ['.js', '.jsx']
      };

      const overrideConfig = {
        resolve: {
          alias: {
            '@': './custom',
            '~': './utils'
          },
          extensions: ['.ts', '.tsx']
        }
      };

      const mergedConfig = webpackTypes.mergeWebpackConfigs(baseConfig, overrideConfig);

      expect(mergedConfig.resolve.alias['@']).to.equal('./custom');
      expect(mergedConfig.resolve.alias['#']).to.equal('./components');
      expect(mergedConfig.resolve.alias['~']).to.equal('./utils');
      expect(mergedConfig.resolve.extensions).to.deep.equal(['.ts', '.tsx']);
    });

    it('should handle merging of array properties', () => {
      const baseConfig = webpackTypes.createDefaultWebpackConfig();
      baseConfig.plugins = [{ name: 'Plugin1', description: 'First plugin' }];

      const overrideConfig = {
        plugins: [{ name: 'Plugin2', description: 'Second plugin' }]
      };

      const mergedConfig = webpackTypes.mergeWebpackConfigs(baseConfig, overrideConfig);

      expect(mergedConfig.plugins).to.have.lengthOf(2);
      expect(mergedConfig.plugins[0].name).to.equal('Plugin1');
      expect(mergedConfig.plugins[1].name).to.equal('Plugin2');
    });

    it('should export generateOptimizationSuggestions function', () => {
      expect(webpackTypes).to.have.property('generateOptimizationSuggestions');
      expect(webpackTypes.generateOptimizationSuggestions).to.be.a('function');
    });

    it('should generate appropriate optimization suggestions', () => {
      const config = webpackTypes.createDefaultWebpackConfig();
      const suggestions = webpackTypes.generateOptimizationSuggestions(config);

      expect(suggestions).to.be.an('array');
      expect(suggestions.length).to.be.greaterThan(0);

      // Check specific suggestions for a development mode config
      const productionSuggestion = suggestions.find(s => s.id === 'enable-production-mode');
      expect(productionSuggestion).to.exist;
      expect(productionSuggestion.impact).to.equal('high');
      expect(productionSuggestion.configuration.mode).to.equal('production');
    });

    it('should generate different suggestions based on config', () => {
      // Production config should have different suggestions
      const prodConfig = webpackTypes.createDefaultWebpackConfig({ mode: 'production' });
      const prodSuggestions = webpackTypes.generateOptimizationSuggestions(prodConfig);

      // No need to suggest production mode for a production config
      const prodModeSuggestion = prodSuggestions.find(s => s.id === 'enable-production-mode');
      expect(prodModeSuggestion).to.be.undefined;

      // Instead should suggest things like code splitting, etc.
      const splitChunksSuggestion = prodSuggestions.find(s => s.id === 'enable-splitchunks');
      expect(splitChunksSuggestion).to.exist;
    });
  });
});
