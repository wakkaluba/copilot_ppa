import * as fs from 'fs';
import { mock } from 'jest-mock-extended';
import { ILogger } from '../../../../services/logging/ILogger';
import { WebpackConfigAnalyzer } from '../WebpackConfigAnalyzer';

// Mock the fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn()
  },
  existsSync: jest.fn()
}));

describe('WebpackConfigAnalyzer', () => {
  let analyzer: WebpackConfigAnalyzer;
  let mockLogger: ILogger;
  const mockConfigPath = '/path/to/webpack.config.js';

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = mock<ILogger>();
    analyzer = new WebpackConfigAnalyzer(mockLogger);
  });

  describe('analyze method', () => {
    it('should extract entry points, output, loaders, and plugins from webpack config', async () => {
      const mockContent = `
        module.exports = {
          entry: {
            main: './src/index.js',
            vendor: './src/vendor.js'
          },
          output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].[contenthash].js',
            publicPath: '/'
          },
          module: {
            rules: [
              {
                test: /\\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
              },
              {
                test: /\\.css$/,
                use: ['style-loader', 'css-loader']
              }
            ]
          },
          plugins: [
            new HtmlWebpackPlugin({
              template: './src/index.html'
            }),
            new MiniCssExtractPlugin()
          ]
        };
      `;

      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockContent);

      const result = await analyzer.analyze(mockConfigPath);

      expect(result).toBeDefined();
      expect(result.entryPoints).toHaveLength(2);
      expect(result.entryPoints[0].name).toBe('main');
      expect(result.entryPoints[0].path).toBe('./src/index.js');
      expect(result.entryPoints[1].name).toBe('vendor');
      expect(result.entryPoints[1].path).toBe('./src/vendor.js');

      expect(result.output).toBeDefined();
      expect(result.output.path).toBe('dist');
      expect(result.output.filename).toBe('[name].[contenthash].js');
      expect(result.output.publicPath).toBe('/');

      expect(result.loaders).toHaveLength(3);
      expect(result.loaders.find(l => l.name === 'babel-loader')).toBeDefined();
      expect(result.loaders.find(l => l.name === 'style-loader')).toBeDefined();
      expect(result.loaders.find(l => l.name === 'css-loader')).toBeDefined();

      expect(result.plugins).toHaveLength(2);
      expect(result.plugins[0].name).toBe('HtmlWebpackPlugin');
      expect(result.plugins[1].name).toBe('MiniCssExtractPlugin');

      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Analyzing webpack config'));
    });

    it('should handle errors when reading config file', async () => {
      const mockError = new Error('File not found');
      (fs.promises.readFile as jest.Mock).mockRejectedValue(mockError);

      await expect(analyzer.analyze(mockConfigPath)).rejects.toThrow('Failed to analyze webpack configuration');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle complex webpack configurations with multiple features', async () => {
      const mockContent = `
        const path = require('path');
        module.exports = {
          mode: 'production',
          entry: {
            app: './src/index.js',
            admin: './src/admin.js',
            vendor: ['react', 'react-dom']
          },
          output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].[chunkhash].js',
            publicPath: '/static/'
          },
          optimization: {
            splitChunks: {
              chunks: 'all',
              cacheGroups: {
                vendors: {
                  test: /[\\\\/]node_modules[\\\\/]/,
                  name: 'vendors',
                  enforce: true
                }
              }
            }
          },
          module: {
            rules: [
              {
                test: /\\.js$/,
                use: [
                  {
                    loader: 'babel-loader',
                    options: {
                      presets: ['@babel/preset-env', '@babel/preset-react'],
                      plugins: ['@babel/plugin-proposal-class-properties']
                    }
                  },
                  'eslint-loader'
                ],
                exclude: /node_modules/
              },
              {
                test: /\\.scss$/,
                use: [
                  'style-loader',
                  {
                    loader: 'css-loader',
                    options: {
                      modules: true
                    }
                  },
                  'sass-loader'
                ]
              }
            ]
          },
          plugins: [
            new HtmlWebpackPlugin({
              template: './src/index.html',
              favicon: './src/favicon.ico',
              minify: {
                removeComments: true,
                collapseWhitespace: true
              }
            }),
            new MiniCssExtractPlugin({
              filename: '[name].[contenthash].css'
            }),
            new CleanWebpackPlugin(),
            new webpack.DefinePlugin({
              'process.env.NODE_ENV': JSON.stringify('production')
            })
          ]
        };
      `;

      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockContent);

      const result = await analyzer.analyze(mockConfigPath);

      expect(result).toBeDefined();
      // Check entry points
      expect(result.entryPoints).toHaveLength(3);
      expect(result.entryPoints).toContainEqual({ name: 'app', path: './src/index.js' });
      expect(result.entryPoints).toContainEqual({ name: 'admin', path: './src/admin.js' });

      // Check output
      expect(result.output.path).toBe('dist');
      expect(result.output.filename).toBe('[name].[chunkhash].js');
      expect(result.output.publicPath).toBe('/static/');

      // Check loaders
      expect(result.loaders).toContainEqual(expect.objectContaining({ name: 'babel-loader' }));
      expect(result.loaders).toContainEqual(expect.objectContaining({ name: 'eslint-loader' }));
      expect(result.loaders).toContainEqual(expect.objectContaining({ name: 'style-loader' }));
      expect(result.loaders).toContainEqual(expect.objectContaining({ name: 'css-loader' }));
      expect(result.loaders).toContainEqual(expect.objectContaining({ name: 'sass-loader' }));

      // Check plugins
      expect(result.plugins).toHaveLength(4);
      expect(result.plugins.map(p => p.name)).toContain('HtmlWebpackPlugin');
      expect(result.plugins.map(p => p.name)).toContain('MiniCssExtractPlugin');
      expect(result.plugins.map(p => p.name)).toContain('CleanWebpackPlugin');
      expect(result.plugins.map(p => p.name)).toContain('DefinePlugin');
    });
  });

  describe('extractEntryPoints', () => {
    it('should extract entry points from string format', () => {
      const content = 'module.exports = { entry: "./src/index.js" }';

      const result = analyzer['extractEntryPoints'](content);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'main', path: './src/index.js' });
    });

    it('should extract entry points from object format', () => {
      const content = 'module.exports = { entry: { main: "./src/main.js", vendor: "./src/vendor.js" } }';

      const result = analyzer['extractEntryPoints'](content);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ name: 'main', path: './src/main.js' });
      expect(result).toContainEqual({ name: 'vendor', path: './src/vendor.js' });
    });

    it('should extract entry points from array format', () => {
      const content = 'module.exports = { entry: ["./src/index.js", "./src/polyfills.js"] }';

      const result = analyzer['extractEntryPoints'](content);

      expect(result).toHaveLength(2);
      expect(result[0].path).toBe('./src/index.js');
      expect(result[1].path).toBe('./src/polyfills.js');
    });

    it('should return empty array when no entry points are found', () => {
      const content = 'module.exports = {}';

      const result = analyzer['extractEntryPoints'](content);

      expect(result).toEqual([]);
    });

    it('should handle complex entry point configurations', () => {
      const content = `
        module.exports = {
          entry: {
            main: './src/index.js',
            vendor: ['react', 'react-dom', 'redux'],
            utils: {
              import: './src/utils.js',
              dependOn: 'vendor'
            }
          }
        }`;

      const result = analyzer['extractEntryPoints'](content);

      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ name: 'main', path: './src/index.js' });
      expect(result).toContainEqual({ name: 'vendor', path: 'react' });
      expect(result).toContainEqual({ name: 'utils', path: './src/utils.js' });
    });
  });

  describe('extractOutput', () => {
    it('should extract output configuration', () => {
      const content = `
        module.exports = {
          output: {
            path: path.resolve(__dirname, "dist"),
            filename: "[name].[hash].js",
            publicPath: "/assets/"
          }
        }`;

      const result = analyzer['extractOutput'](content);

      expect(result).toEqual({
        path: 'dist',
        filename: '[name].[hash].js',
        publicPath: '/assets/'
      });
    });

    it('should handle path.join syntax', () => {
      const content = `
        module.exports = {
          output: {
            path: path.join(__dirname, "dist"),
            filename: "bundle.js"
          }
        }`;

      const result = analyzer['extractOutput'](content);

      expect(result.path).toBe('dist');
    });

    it('should handle direct string paths', () => {
      const content = `
        module.exports = {
          output: {
            path: "/absolute/path/dist",
            filename: "bundle.js"
          }
        }`;

      const result = analyzer['extractOutput'](content);

      expect(result.path).toBe('/absolute/path/dist');
    });

    it('should return empty values when no output configuration is found', () => {
      const content = 'module.exports = {}';

      const result = analyzer['extractOutput'](content);

      expect(result).toEqual({ path: '', filename: '' });
    });

    it('should extract output with multiple configuration options', () => {
      const content = `
        module.exports = {
          output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].[contenthash].js',
            chunkFilename: '[id].[chunkhash].js',
            publicPath: '/assets/',
            assetModuleFilename: 'images/[hash][ext][query]',
            clean: true
          }
        }`;

      const result = analyzer['extractOutput'](content);

      expect(result.path).toBe('dist');
      expect(result.filename).toBe('[name].[contenthash].js');
      expect(result.publicPath).toBe('/assets/');
    });
  });

  describe('extractLoaders', () => {
    it('should extract loaders from rules', () => {
      const content = `
        module.exports = {
          module: {
            rules: [
              {
                test: /\\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
              },
              {
                test: /\\.css$/,
                use: ['style-loader', 'css-loader']
              },
              {
                test: /\\.scss$/,
                loader: 'sass-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          }
        };
      `;

      const result = analyzer['extractLoaders'](content);

      expect(result).toHaveLength(4);
      expect(result.find(l => l.name === 'babel-loader')).toBeDefined();
      expect(result.find(l => l.name === 'style-loader')).toBeDefined();
      expect(result.find(l => l.name === 'css-loader')).toBeDefined();
      expect(result.find(l => l.name === 'sass-loader')).toBeDefined();

      const sassLoader = result.find(l => l.name === 'sass-loader');
      expect(sassLoader?.options).toEqual({ sourceMap: true });
    });

    it('should handle loader with options', () => {
      const content = `
        module.exports = {
          module: {
            rules: [
              {
                test: /\\.js$/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env']
                  }
                }
              }
            ]
          }
        };
      `;

      const result = analyzer['extractLoaders'](content);

      expect(result).toHaveLength(1);
      const babelLoader = result[0];
      expect(babelLoader.name).toBe('babel-loader');
      expect(babelLoader.test).toBe('\\\\.\\.js$');
    });

    it('should return empty array when no loaders are found', () => {
      const content = 'module.exports = {}';

      const result = analyzer['extractLoaders'](content);

      expect(result).toEqual([]);
    });

    it('should handle complex rule configurations', () => {
      const content = `
        module.exports = {
          module: {
            rules: [
              {
                test: /\\.js$/,
                exclude: /node_modules/,
                use: [
                  {
                    loader: 'babel-loader',
                    options: {
                      presets: ['@babel/preset-env', '@babel/preset-react'],
                      plugins: ['@babel/plugin-transform-runtime']
                    }
                  },
                  {
                    loader: 'eslint-loader',
                    options: {
                      fix: true,
                      emitWarning: true
                    }
                  }
                ]
              },
              {
                test: /\\.css$/,
                oneOf: [
                  {
                    resourceQuery: /modules/,
                    use: [
                      'style-loader',
                      {
                        loader: 'css-loader',
                        options: {
                          modules: true,
                          importLoaders: 1
                        }
                      },
                      'postcss-loader'
                    ]
                  },
                  {
                    use: ['style-loader', 'css-loader']
                  }
                ]
              }
            ]
          }
        }`;

      const result = analyzer['extractLoaders'](content);

      // Should identify all loaders, even in complex nested structures
      expect(result.filter(l => l.name === 'babel-loader')).toHaveLength(1);
      expect(result.filter(l => l.name === 'eslint-loader')).toHaveLength(1);
      expect(result.filter(l => l.name === 'style-loader')).toHaveLength(2);
      expect(result.filter(l => l.name === 'css-loader')).toHaveLength(2);
      expect(result.filter(l => l.name === 'postcss-loader')).toHaveLength(1);

      // Check options extraction
      const babelLoader = result.find(l => l.name === 'babel-loader');
      expect(babelLoader?.options).toBeDefined();

      const eslintLoader = result.find(l => l.name === 'eslint-loader');
      expect(eslintLoader?.options).toBeDefined();
    });
  });

  describe('extractPlugins', () => {
    it('should extract plugins from config', () => {
      const content = `
        module.exports = {
          plugins: [
            new HtmlWebpackPlugin(),
            new MiniCssExtractPlugin(),
            new CleanWebpackPlugin(),
            new webpack.DefinePlugin({
              'process.env.NODE_ENV': JSON.stringify('production')
            })
          ]
        };
      `;

      const result = analyzer['extractPlugins'](content);

      expect(result).toHaveLength(4);
      expect(result[0].name).toBe('HtmlWebpackPlugin');
      expect(result[1].name).toBe('MiniCssExtractPlugin');
      expect(result[2].name).toBe('CleanWebpackPlugin');
      expect(result[3].name).toBe('DefinePlugin');

      // Check descriptions
      expect(result[0].description).toContain('Generates HTML');
      expect(result[1].description).toContain('Extracts CSS');
    });

    it('should return empty array when no plugins are found', () => {
      const content = 'module.exports = {}';

      const result = analyzer['extractPlugins'](content);

      expect(result).toEqual([]);
    });

    it('should extract plugins with complex configurations', () => {
      const content = `
        const webpack = require('webpack');
        const HtmlWebpackPlugin = require('html-webpack-plugin');
        module.exports = {
          plugins: [
            new webpack.ProgressPlugin(),
            new webpack.DefinePlugin({
              'process.env.NODE_ENV': JSON.stringify('production'),
              'DEBUG': false,
              'VERSION': JSON.stringify(require('./package.json').version)
            }),
            new HtmlWebpackPlugin({
              template: './public/index.html',
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
              }
            }),
            new webpack.ProvidePlugin({
              React: 'react',
              $: 'jquery',
              _: 'lodash'
            })
          ]
        }`;

      const result = analyzer['extractPlugins'](content);

      expect(result).toHaveLength(4);
      expect(result.map(p => p.name)).toContain('ProgressPlugin');
      expect(result.map(p => p.name)).toContain('DefinePlugin');
      expect(result.map(p => p.name)).toContain('HtmlWebpackPlugin');
      expect(result.map(p => p.name)).toContain('ProvidePlugin');
    });
  });

  describe('getPluginDescription', () => {
    it('should return description for known plugins', () => {
      const knownPlugins = [
        'HtmlWebpackPlugin',
        'MiniCssExtractPlugin',
        'CleanWebpackPlugin',
        'CopyWebpackPlugin',
        'DefinePlugin',
        'TerserPlugin',
        'OptimizeCSSAssetsPlugin',
        'BundleAnalyzerPlugin',
        'CompressionPlugin'
      ];

      knownPlugins.forEach(plugin => {
        const description = analyzer['getPluginDescription'](plugin);
        expect(description).not.toBe('A webpack plugin');
        expect(description.length).toBeGreaterThan(10);
      });
    });

    it('should return generic description for unknown plugins', () => {
      const description = analyzer['getPluginDescription']('UnknownPlugin');

      expect(description).toBe('A webpack plugin');
    });
  });

  describe('initialization', () => {
    it('should create instance with default logger when no logger is provided', () => {
      const analyzerWithDefaultLogger = new WebpackConfigAnalyzer();

      // We can't directly test the logger, but we can verify the instance is created
      expect(analyzerWithDefaultLogger).toBeInstanceOf(WebpackConfigAnalyzer);

      // Test analyze method works with default logger
      (fs.promises.readFile as jest.Mock).mockResolvedValue('module.exports = {}');

      return expect(analyzerWithDefaultLogger.analyze(mockConfigPath)).resolves.toBeDefined();
    });
  });
});
