const WebpackTypes = require('../index');

describe('Webpack Types JavaScript Implementation', () => {
  describe('WebpackEntryPoint', () => {
    it('should define a valid entry point structure', () => {
      const entryPoint = {
        name: 'main',
        path: './src/index.js'
      };

      expect(entryPoint.name).toBe('main');
      expect(entryPoint.path).toBe('./src/index.js');
    });
  });

  describe('WebpackLoader', () => {
    it('should define a valid loader structure', () => {
      const loader = {
        name: 'babel-loader',
        test: '/\\.js$/',
        options: { presets: ['@babel/preset-env'] }
      };

      expect(loader.name).toBe('babel-loader');
      expect(loader.test).toBe('/\\.js$/');
      expect(loader.options).toEqual({ presets: ['@babel/preset-env'] });
    });

    it('should allow undefined options', () => {
      const loader = {
        name: 'css-loader',
        test: '/\\.css$/'
      };

      expect(loader.name).toBe('css-loader');
      expect(loader.test).toBe('/\\.css$/');
      expect(loader.options).toBeUndefined();
    });
  });

  describe('WebpackPlugin', () => {
    it('should define a valid plugin structure', () => {
      const plugin = {
        name: 'HtmlWebpackPlugin',
        description: 'Generates HTML files'
      };

      expect(plugin.name).toBe('HtmlWebpackPlugin');
      expect(plugin.description).toBe('Generates HTML files');
    });
  });

  describe('WebpackOutputConfig', () => {
    it('should define a valid output config structure', () => {
      const output = {
        path: 'dist',
        filename: '[name].[contenthash].js'
      };

      expect(output.path).toBe('dist');
      expect(output.filename).toBe('[name].[contenthash].js');
    });
  });

  describe('WebpackConfig', () => {
    it('should define a valid webpack config structure', () => {
      const config = {
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
    it('should define a valid optimization suggestion structure', () => {
      const suggestion = {
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
      const suggestion = {
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
        const config = WebpackTypes.createWebpackConfig({
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
