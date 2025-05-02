import * as WebpackTypes from '../index';

describe('Webpack Types', () => {
  describe('WebpackEntryPoint', () => {
    it('should define a valid WebpackEntryPoint type', () => {
      const entryPoint: WebpackTypes.WebpackEntryPoint = {
        name: 'main',
        path: './src/index.js'
      };

      expect(entryPoint.name).toBe('main');
      expect(entryPoint.path).toBe('./src/index.js');
    });
  });

  describe('WebpackLoader', () => {
    it('should define a valid WebpackLoader type', () => {
      const loader: WebpackTypes.WebpackLoader = {
        name: 'babel-loader',
        test: '/\\.js$/',
        options: { presets: ['@babel/preset-env'] }
      };

      expect(loader.name).toBe('babel-loader');
      expect(loader.test).toBe('/\\.js$/');
      expect(loader.options).toEqual({ presets: ['@babel/preset-env'] });
    });

    it('should allow undefined options', () => {
      const loader: WebpackTypes.WebpackLoader = {
        name: 'css-loader',
        test: '/\\.css$/'
      };

      expect(loader.name).toBe('css-loader');
      expect(loader.test).toBe('/\\.css$/');
      expect(loader.options).toBeUndefined();
    });
  });

  describe('WebpackPlugin', () => {
    it('should define a valid WebpackPlugin type', () => {
      const plugin: WebpackTypes.WebpackPlugin = {
        name: 'HtmlWebpackPlugin',
        description: 'Generates HTML files'
      };

      expect(plugin.name).toBe('HtmlWebpackPlugin');
      expect(plugin.description).toBe('Generates HTML files');
    });
  });

  describe('WebpackOutputConfig', () => {
    it('should define a valid WebpackOutputConfig type', () => {
      const output: WebpackTypes.WebpackOutputConfig = {
        path: 'dist',
        filename: '[name].[contenthash].js'
      };

      expect(output.path).toBe('dist');
      expect(output.filename).toBe('[name].[contenthash].js');
    });
  });

  describe('WebpackConfig', () => {
    it('should define a valid WebpackConfig type', () => {
      const config: WebpackTypes.WebpackConfig = {
        entryPoints: [
          { name: 'main', path: './src/index.js' }
        ],
        output: {
          path: 'dist',
          filename: '[name].[contenthash].js'
        },
        loaders: [
          { name: 'babel-loader', test: '/\\.js$/' }
        ],
        plugins: [
          { name: 'HtmlWebpackPlugin', description: 'Generates HTML files' }
        ]
      };

      expect(config.entryPoints).toHaveLength(1);
      expect(config.entryPoints[0].name).toBe('main');
      expect(config.output.path).toBe('dist');
      expect(config.loaders).toHaveLength(1);
      expect(config.plugins).toHaveLength(1);
    });
  });

  describe('WebpackOptimizationSuggestion', () => {
    it('should define a valid WebpackOptimizationSuggestion type', () => {
      const suggestion: WebpackTypes.WebpackOptimizationSuggestion = {
        type: 'performance',
        description: 'Use code splitting',
        code: 'optimization: { splitChunks: { chunks: "all" } }',
        impact: 'high'
      };

      expect(suggestion.type).toBe('performance');
      expect(suggestion.description).toBe('Use code splitting');
      expect(suggestion.code).toBe('optimization: { splitChunks: { chunks: "all" } }');
      expect(suggestion.impact).toBe('high');
    });

    it('should allow optional fields', () => {
      const suggestion: WebpackTypes.WebpackOptimizationSuggestion = {
        type: 'bundle-size',
        description: 'Enable tree shaking'
      };

      expect(suggestion.type).toBe('bundle-size');
      expect(suggestion.description).toBe('Enable tree shaking');
      expect(suggestion.code).toBeUndefined();
      expect(suggestion.impact).toBeUndefined();
    });
  });

  if ('createWebpackConfig' in WebpackTypes) {
    describe('createWebpackConfig', () => {
      it('should create a valid webpack config object', () => {
        const config = (WebpackTypes as any).createWebpackConfig({
          entryPoints: [{ name: 'main', path: './src/index.js' }],
          output: { path: 'dist', filename: 'bundle.js' }
        });

        expect(config).toBeDefined();
        expect(config.entryPoints).toHaveLength(1);
        expect(config.output.path).toBe('dist');
      });
    });
  }
});
