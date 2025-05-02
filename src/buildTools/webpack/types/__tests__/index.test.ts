import * as WebpackTypes from '../index';

describe('Webpack Types', () => {
  describe('WebpackEntry', () => {
    it('should define a valid WebpackEntry type', () => {
      const entry: WebpackTypes.WebpackEntry = {
        name: 'main',
        path: './src/index.js'
      };

      expect(entry.name).toBe('main');
      expect(entry.path).toBe('./src/index.js');
    });
  });

  describe('WebpackOutput', () => {
    it('should define a valid WebpackOutput type', () => {
      const output: WebpackTypes.WebpackOutput = {
        path: 'dist',
        filename: '[name].[contenthash].js'
      };

      expect(output.path).toBe('dist');
      expect(output.filename).toBe('[name].[contenthash].js');
    });

    it('should allow optional publicPath', () => {
      const output: WebpackTypes.WebpackOutput = {
        path: 'dist',
        filename: '[name].[contenthash].js',
        publicPath: '/assets/'
      };

      expect(output.path).toBe('dist');
      expect(output.filename).toBe('[name].[contenthash].js');
      expect(output.publicPath).toBe('/assets/');
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

  describe('WebpackOptimization', () => {
    it('should define a valid WebpackOptimization type', () => {
      const optimization: WebpackTypes.WebpackOptimization = {
        title: 'Code Splitting',
        description: 'Split code into separate chunks for better performance',
        code: 'optimization: { splitChunks: { chunks: "all" } }'
      };

      expect(optimization.title).toBe('Code Splitting');
      expect(optimization.description).toBe('Split code into separate chunks for better performance');
      expect(optimization.code).toBe('optimization: { splitChunks: { chunks: "all" } }');
    });
  });

  describe('WebpackConfigAnalysis', () => {
    it('should define a valid WebpackConfigAnalysis type', () => {
      const analysis: WebpackTypes.WebpackConfigAnalysis = {
        entryPoints: [
          { name: 'main', path: './src/index.js' }
        ],
        output: {
          path: 'dist',
          filename: '[name].[contenthash].js'
        },
        loaders: [
          { name: 'babel-loader', test: '/\\.js$/', options: {} }
        ],
        plugins: [
          { name: 'HtmlWebpackPlugin', description: 'Generates HTML files' }
        ],
        content: 'module.exports = { ... }',
        optimizationSuggestions: [
          {
            title: 'Use Production Mode',
            description: 'Enable production optimizations',
            code: 'mode: "production"'
          }
        ]
      };

      expect(analysis.entryPoints).toHaveLength(1);
      expect(analysis.entryPoints[0].name).toBe('main');
      expect(analysis.output.path).toBe('dist');
      expect(analysis.loaders).toHaveLength(1);
      expect(analysis.plugins).toHaveLength(1);
      expect(analysis.content).toBe('module.exports = { ... }');
      expect(analysis.optimizationSuggestions).toHaveLength(1);
      expect(analysis.optimizationSuggestions[0].title).toBe('Use Production Mode');
    });
  });

  describe('WebpackConfigContent', () => {
    it('should define a valid WebpackConfigContent type', () => {
      const configContent: WebpackTypes.WebpackConfigContent = {
        content: 'module.exports = { ... }',
        entryPoints: ['./src/index.js'],
        output: { path: 'dist', filename: 'bundle.js' },
        loaders: [{ test: /\.js$/, use: 'babel-loader' }],
        plugins: [{ name: 'HtmlWebpackPlugin' }]
      };

      expect(configContent.content).toBe('module.exports = { ... }');
      expect(configContent.entryPoints).toHaveLength(1);
      expect(configContent.output).toBeDefined();
      expect(configContent.loaders).toHaveLength(1);
      expect(configContent.plugins).toHaveLength(1);
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
