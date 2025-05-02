const { expect } = require('chai');
const webpackTypes = require('../../../../../src/buildTools/webpack/types/index');

describe('Webpack Types Index - JavaScript', () => {
  describe('Type Definitions', () => {
    it('should export WebpackConfig type', () => {
      expect(webpackTypes).to.have.property('WebpackConfig');
    });

    it('should export WebpackEntryPoint type', () => {
      expect(webpackTypes).to.have.property('WebpackEntryPoint');
    });

    it('should export WebpackOutput type', () => {
      expect(webpackTypes).to.have.property('WebpackOutput');
    });

    it('should export WebpackModule type', () => {
      expect(webpackTypes).to.have.property('WebpackModule');
    });

    it('should export WebpackRule type', () => {
      expect(webpackTypes).to.have.property('WebpackRule');
    });

    it('should export WebpackLoader type', () => {
      expect(webpackTypes).to.have.property('WebpackLoader');
    });

    it('should export WebpackPlugin type', () => {
      expect(webpackTypes).to.have.property('WebpackPlugin');
    });

    it('should export WebpackOptimization type', () => {
      expect(webpackTypes).to.have.property('WebpackOptimization');
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
      expect(config).to.have.property('entry');
      expect(config).to.have.property('output');
      expect(config).to.have.property('module');
      expect(config.module).to.have.property('rules');
      expect(config.module.rules).to.be.an('array');
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
    });

    it('should export mergeWebpackConfigs function', () => {
      expect(webpackTypes).to.have.property('mergeWebpackConfigs');
      expect(webpackTypes.mergeWebpackConfigs).to.be.a('function');
    });

    it('should merge webpack configs correctly', () => {
      const baseConfig = webpackTypes.createDefaultWebpackConfig();
      const overrideConfig = {
        mode: 'production',
        output: {
          filename: 'bundle.[contenthash].js'
        }
      };

      const merged = webpackTypes.mergeWebpackConfigs(baseConfig, overrideConfig);
      expect(merged.mode).to.equal('production');
      expect(merged.output.filename).to.equal('bundle.[contenthash].js');
      // Original properties should be preserved
      expect(merged.entry).to.equal(baseConfig.entry);
    });
  });
});
