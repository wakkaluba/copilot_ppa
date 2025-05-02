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

describe('Webpack Types - TypeScript', () => {
  describe('Type Definitions', () => {
    it('should export WebpackConfig interface', () => {
      // We can't directly check TypeScript interfaces at runtime
      // Instead, verify that we can create objects that conform to the interface
      const config: webpackTypes.WebpackConfig = {
        mode: 'production',
        entry: './src/index.js',
        output: {
          path: '/dist',
          filename: 'bundle.js'
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              use: 'babel-loader',
              exclude: /node_modules/
            }
          ]
        },
        plugins: [
          { name: 'HtmlWebpackPlugin', description: 'Generates HTML files' }
        ]
      };

      expect(config).to.be.an('object');
      expect(config.mode).to.equal('production');
      expect(config.entry).to.equal('./src/index.js');
      expect(config.output.path).to.equal('/dist');
    });

    it('should export WebpackEntryPoint type variants', () => {
      // Test string entry point
      const stringEntry: webpackTypes.WebpackEntryPoint = './src/index.js';
      expect(stringEntry).to.be.a('string');

      // Test array entry point
      const arrayEntry: webpackTypes.WebpackEntryPoint = ['./src/index.js', './src/polyfills.js'];
      expect(arrayEntry).to.be.an('array');

      // Test object entry point
      const objectEntry: webpackTypes.WebpackEntryPoint = {
        main: './src/index.js',
        vendor: './src/vendor.js'
      };
      expect(objectEntry).to.be.an('object');
      expect(objectEntry.main).to.equal('./src/index.js');
    });

    it('should export WebpackPlugin interface', () => {
      const plugin: webpackTypes.WebpackPlugin = {
        name: 'TestPlugin',
        description: 'A test plugin',
        options: {
          template: 'index.html'
        }
      };

      expect(plugin).to.be.an('object');
      expect(plugin.name).to.equal('TestPlugin');
      expect(plugin.description).to.equal('A test plugin');
      expect(plugin.options).to.have.property('template');
    });

    it('should export WebpackLoader interface', () => {
      // Simple string loader
      const stringLoader: webpackTypes.WebpackLoader = 'style-loader';
      expect(stringLoader).to.equal('style-loader');

      // Object loader with options
      const objectLoader: webpackTypes.WebpackLoader = {
        loader: 'css-loader',
        options: {
          modules: true
        }
      };
      expect(objectLoader).to.be.an('object');
      expect(objectLoader.loader).to.equal('css-loader');
      expect(objectLoader.options.modules).to.be.true;
    });

    it('should export WebpackRule interface', () => {
      const rule: webpackTypes.WebpackRule = {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/
      };

      expect(rule).to.be.an('object');
      expect(rule.test).to.be.instanceOf(RegExp);
      expect(rule.use).to.be.an('array');
      expect(rule.use).to have.lengthOf(2);
    });

    it('should export WebpackOutputConfig interface', () => {
      const output: webpackTypes.WebpackOutputConfig = {
        path: '/dist',
        filename: 'bundle.[hash].js',
        publicPath: '/',
        chunkFilename: '[id].[chunkhash].js'
      };

      expect(output).to.be.an('object');
      expect(output.path).to.equal('/dist');
      expect(output.filename).to.equal('bundle.[hash].js');
      expect(output.publicPath).to.equal('/');
    });

    it('should export WebpackOptimizationConfig interface', () => {
      const optimization: webpackTypes.WebpackOptimizationConfig = {
        minimize: true,
        splitChunks: {
          chunks: 'all',
          name: true
        },
        runtimeChunk: 'single'
      };

      expect(optimization).to.be.an('object');
      expect(optimization.minimize).to.be.true;
      expect(optimization.splitChunks).to be.an('object');
      expect(optimization.runtimeChunk).to.equal('single');
    });

    it('should export WebpackDevServerConfig interface', () => {
      const devServer: webpackTypes.WebpackDevServerConfig = {
        port: 3000,
        hot: true,
        historyApiFallback: true,
        contentBase: './public'
      };

      expect(devServer).to.be.an('object');
      expect(devServer.port).to.equal(3000);
      expect(devServer.hot).to.be.true;
      expect(devServer.historyApiFallback).to be.true;
    });

    it('should export WebpackOptimizationSuggestion interface', () => {
      const suggestion: webpackTypes.WebpackOptimizationSuggestion = {
        id: 'enable-production-mode',
        description: 'Enable production mode for better performance',
        impact: 'high',
        configuration: {
          mode: 'production'
        }
      };

      expect(suggestion).to be.an('object');
      expect(suggestion.id).to.equal('enable-production-mode');
      expect(suggestion.impact).to equal('high');
      expect(suggestion.configuration).to be.an('object');
      expect(suggestion.configuration.mode).to equal('production');
    });
  });

  describe('Utility Functions', () => {
    it('should export createDefaultWebpackConfig function', () => {
      expect(webpackTypes.createDefaultWebpackConfig).to be.a('function');

      const config = webpackTypes.createDefaultWebpackConfig();
      expect(config).to be.an('object');
      expect(config.mode).to equal('development');
      expect(config.entry).to be.a('string');
      expect(config.output).to be.an('object');
      expect(config.module).to be.an('object');
      expect(config.module.rules).to be.an('array');
    });

    it('should create default config with custom options', () => {
      const config = webpackTypes.createDefaultWebpackConfig({
        mode: 'production',
        entry: './custom/index.js'
      });

      expect(config.mode).to equal('production');
      expect(config.entry).to equal('./custom/index.js');
      // Base config values should still be present
      expect(config.output).to be.an('object');
      expect(config.module).to be.an('object');
    });

    it('should export isWebpackConfig type guard function', () => {
      expect(webpackTypes.isWebpackConfig).to be.a('function');

      // Should validate proper configs
      const validConfig = webpackTypes.createDefaultWebpackConfig();
      expect(webpackTypes.isWebpackConfig(validConfig)).to be.true;

      // Should reject invalid configs
      expect(webpackTypes.isWebpackConfig({})).to be.false;
      expect(webpackTypes.isWebpackConfig(null)).to be.false;
      expect(webpackTypes.isWebpackConfig(undefined)).to be.false;
      expect(webpackTypes.isWebpackConfig({ notRelated: true })).to be.false;
    });

    it('should export mergeWebpackConfigs function', () => {
      expect(webpackTypes.mergeWebpackConfigs).to be.a('function');

      const baseConfig = webpackTypes.createDefaultWebpackConfig();
      const overrideConfig: Partial<webpackTypes.WebpackConfig> = {
        mode: 'production',
        output: {
          filename: 'custom.js'
        }
      };

      const mergedConfig = webpackTypes.mergeWebpackConfigs(baseConfig, overrideConfig);

      // Override values should be applied
      expect(mergedConfig.mode).to equal('production');
      expect(mergedConfig.output.filename).to equal('custom.js');

      // Base values should be preserved if not overridden
      expect(mergedConfig.entry).to equal(baseConfig.entry);
      expect(mergedConfig.module.rules).to deep.equal(baseConfig.module.rules);
    });

    it('should handle deep merging of nested objects', () => {
      const baseConfig = webpackTypes.createDefaultWebpackConfig();
      baseConfig.resolve = {
        alias: {
          '@': './src',
          '#': './components'
        },
        extensions: ['.js', '.jsx']
      };

      const overrideConfig: Partial<webpackTypes.WebpackConfig> = {
        resolve: {
          alias: {
            '@': './custom',
            '~': './utils'
          },
          extensions: ['.ts', '.tsx']
        }
      };

      const mergedConfig = webpackTypes.mergeWebpackConfigs(baseConfig, overrideConfig);

      // Check merged resolve.alias
      expect(mergedConfig.resolve?.alias).to have.property('@', './custom');
      expect(mergedConfig.resolve?.alias).to have.property('#', './components');
      expect(mergedConfig.resolve?.alias). to have.property('~', './utils');

      // Check merged resolve.extensions
      expect(mergedConfig.resolve?.extensions). to deep.equal(['.ts', '.tsx']);
    });

    it('should handle merging of arrays by concatenation', () => {
      const baseConfig = webpackTypes.createDefaultWebpackConfig();
      baseConfig.plugins = [{ name: 'Plugin1', description: 'First plugin' }];

      const overrideConfig: Partial<webpackTypes.WebpackConfig> = {
        plugins: [{ name: 'Plugin2', description: 'Second plugin' }]
      };

      const mergedConfig = webpackTypes.mergeWebpackConfigs(baseConfig, overrideConfig);

      expect(mergedConfig.plugins).to have.lengthOf(2);
      expect(mergedConfig.plugins?.[0].name).to equal('Plugin1');
      expect(mergedConfig.plugins?.[1].name).to equal('Plugin2');
    });

    it('should export generateOptimizationSuggestions function', () => {
      expect(webpackTypes.generateOptimizationSuggestions).to be.a('function');

      const config = webpackTypes.createDefaultWebpackConfig();
      const suggestions = webpackTypes.generateOptimizationSuggestions(config);

      expect(suggestions).to be.an('array');

      // Development mode config should suggest production mode
      const productionSuggestion = suggestions.find(s => s.id === 'enable-production-mode');
      expect(productionSuggestion).to exist;
      expect(productionSuggestion?.configuration.mode).to equal('production');
    });
  });
});
