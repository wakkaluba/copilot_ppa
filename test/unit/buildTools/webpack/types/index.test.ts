import { expect } from 'chai';
import * as webpackTypes from '../../../../../src/buildTools/webpack/types/index';

describe('Webpack Types Index - TypeScript', () => {
  describe('Type Definitions', () => {
    it('should allow creating WebpackConfig objects', () => {
      const config: webpackTypes.WebpackConfig = {
        mode: 'development',
        entry: './src/index.js',
        output: {
          path: 'dist',
          filename: 'bundle.js'
        },
        module: {
          rules: []
        },
        plugins: []
      };

      expect(config).to.be.an('object');
      expect(config.mode).to.equal('development');
      expect(config.entry).to.equal('./src/index.js');
    });

    it('should support multiple entry point formats', () => {
      // String format
      const stringEntry: webpackTypes.WebpackEntryPoint = './src/index.js';

      // Array format
      const arrayEntry: webpackTypes.WebpackEntryPoint = ['./src/index.js', './src/polyfills.js'];

      // Object format
      const objectEntry: webpackTypes.WebpackEntryPoint = {
        main: './src/index.js',
        vendor: './src/vendor.js'
      };

      expect(typeof stringEntry === 'string' || Array.isArray(stringEntry) || typeof stringEntry === 'object').to.be.true;
      expect(Array.isArray(arrayEntry)).to.be.true;
      expect(typeof objectEntry === 'object' && !Array.isArray(objectEntry)).to.be.true;
    });

    it('should support WebpackLoader definition', () => {
      const loader: webpackTypes.WebpackLoader = {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      };

      expect(loader).to.be.an('object');
      expect(loader.loader).to.equal('babel-loader');
      expect(loader.options).to.be.an('object');
    });

    it('should support WebpackPlugin definition', () => {
      const plugin: webpackTypes.WebpackPlugin = {
        apply: function() {}
      };

      expect(plugin).to.be.an('object');
      expect(plugin.apply).to.be.a('function');
    });

    it('should support WebpackOptimizationSuggestion definition', () => {
      const suggestion: webpackTypes.WebpackOptimizationSuggestion = {
        id: 'enable-production-mode',
        description: 'Enable production mode for better performance',
        impact: 'high',
        configuration: {
          mode: 'production'
        }
      };

      expect(suggestion).to.be.an('object');
      expect(suggestion.id).to.equal('enable-production-mode');
      expect(suggestion.impact).to.equal('high');
    });
  });

  describe('Utility Functions', () => {
    it('should export createDefaultWebpackConfig function', () => {
      expect(webpackTypes.createDefaultWebpackConfig).to.be.a('function');

      const config = webpackTypes.createDefaultWebpackConfig();
      expect(config).to.be.an('object');
      expect(config.mode).to.equal('development');
    });

    it('should export isWebpackConfig type guard', () => {
      expect(webpackTypes.isWebpackConfig).to.be.a('function');

      const validConfig = webpackTypes.createDefaultWebpackConfig();
      const invalidConfig = { foo: 'bar' };

      expect(webpackTypes.isWebpackConfig(validConfig)).to.be.true;
      expect(webpackTypes.isWebpackConfig(invalidConfig)).to.be.false;
    });

    it('should export mergeWebpackConfigs utility function', () => {
      expect(webpackTypes.mergeWebpackConfigs).to.be.a('function');

      const baseConfig = webpackTypes.createDefaultWebpackConfig();
      const overrideConfig: Partial<webpackTypes.WebpackConfig> = {
        mode: 'production',
        devtool: 'source-map'
      };

      const merged = webpackTypes.mergeWebpackConfigs(baseConfig, overrideConfig);
      expect(merged.mode).to.equal('production');
      expect(merged.devtool).to.equal('source-map');
      // Original entries should still be present
      expect(merged.entry).to.equal(baseConfig.entry);
    });

    it('should handle deep merging of configuration objects', () => {
      const baseConfig = webpackTypes.createDefaultWebpackConfig();
      const overrideConfig: Partial<webpackTypes.WebpackConfig> = {
        output: {
          filename: '[name].[contenthash].js',
          chunkFilename: '[id].[contenthash].js'
        },
        optimization: {
          splitChunks: {
            chunks: 'all'
          }
        }
      };

      const merged = webpackTypes.mergeWebpackConfigs(baseConfig, overrideConfig);
      expect(merged.output?.filename).to.equal('[name].[contenthash].js');
      expect(merged.output?.path).to.equal(baseConfig.output?.path);
      expect(merged.optimization?.splitChunks).to.deep.equal({ chunks: 'all' });
    });
  });
});
