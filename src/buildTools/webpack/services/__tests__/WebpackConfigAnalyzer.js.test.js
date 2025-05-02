const { WebpackConfigAnalyzer } = require('../WebpackConfigAnalyzer');
const fs = require('fs');
const path = require('path');

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(),
  existsSync: jest.fn()
}));

describe('WebpackConfigAnalyzer JavaScript Implementation', () => {
  let analyzer;
  const mockConfigPath = '/path/to/webpack.config.js';
  const mockContent = `
    module.exports = {
      entry: {
        main: './src/index.js',
        vendor: './src/vendor.js'
      },
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js'
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            use: 'babel-loader',
            exclude: /node_modules/
          },
          {
            test: /\.css$/,
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

  beforeEach(() => {
    jest.clearAllMocks();
    const mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    analyzer = new WebpackConfigAnalyzer(mockLogger);
    fs.readFileSync.mockReturnValue(mockContent);
    fs.existsSync.mockReturnValue(true);
  });

  describe('analyze', () => {
    it('should analyze webpack config and return configuration details', () => {
      const result = analyzer.analyze(mockConfigPath);

      expect(result).toBeDefined();
      expect(result.entryPoints).toBeDefined();
      expect(result.output).toBeDefined();
      expect(result.loaders).toBeDefined();
      expect(result.plugins).toBeDefined();
    });

    it('should handle files that do not exist', () => {
      fs.existsSync.mockReturnValue(false);

      expect(() => analyzer.analyze(mockConfigPath)).toThrow();
    });

    it('should handle parse errors gracefully', () => {
      fs.readFileSync.mockReturnValue('invalid javascript code {');

      const result = analyzer.analyze(mockConfigPath);
      expect(result).toEqual({
        entryPoints: [],
        output: { path: '', filename: '' },
        loaders: [],
        plugins: []
      });
    });
  });

  describe('extractEntryPoints', () => {
    it('should extract entry points from string format', () => {
      const content = 'module.exports = { entry: "./src/index.js" }';

      const result = analyzer.extractEntryPoints(content);

      expect(result).toEqual([{ name: 'main', path: './src/index.js' }]);
    });

    it('should extract entry points from object format', () => {
      const content = 'module.exports = { entry: { main: "./src/main.js", vendor: "./src/vendor.js" } }';

      const result = analyzer.extractEntryPoints(content);

      expect(result).toEqual([
        { name: 'main', path: './src/main.js' },
        { name: 'vendor', path: './src/vendor.js' }
      ]);
    });

    it('should extract entry points from array format', () => {
      const content = 'module.exports = { entry: ["./src/main.js", "./src/polyfills.js"] }';

      const result = analyzer.extractEntryPoints(content);

      expect(result).toEqual([
        { name: 'main', path: './src/main.js' },
        { name: 'main1', path: './src/polyfills.js' }
      ]);
    });

    it('should handle missing entry points', () => {
      const content = 'module.exports = { }';

      const result = analyzer.extractEntryPoints(content);

      expect(result).toEqual([]);
    });
  });

  describe('extractOutput', () => {
    it('should extract output configuration', () => {
      const content = 'module.exports = { output: { path: path.resolve(__dirname, "dist"), filename: "[name].[hash].js" } }';

      const result = analyzer.extractOutput(content);

      expect(result).toEqual({
        path: 'dist',
        filename: '[name].[hash].js'
      });
    });

    it('should handle missing output configuration', () => {
      const content = 'module.exports = { }';

      const result = analyzer.extractOutput(content);

      expect(result).toEqual({
        path: '',
        filename: ''
      });
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
              }
            ]
          }
        };
      `;

      const result = analyzer.extractLoaders(content);

      expect(result.length).toBe(3);
      expect(result.some(l => l.name === 'babel-loader')).toBe(true);
      expect(result.some(l => l.name === 'style-loader')).toBe(true);
      expect(result.some(l => l.name === 'css-loader')).toBe(true);
    });

    it('should handle missing module rules', () => {
      const content = 'module.exports = { }';

      const result = analyzer.extractLoaders(content);

      expect(result).toEqual([]);
    });
  });

  describe('extractPlugins', () => {
    it('should extract plugins from config', () => {
      const content = `
        module.exports = {
          plugins: [
            new HtmlWebpackPlugin(),
            new MiniCssExtractPlugin()
          ]
        };
      `;

      const result = analyzer.extractPlugins(content);

      expect(result.length).toBe(2);
      expect(result.some(p => p.name === 'HtmlWebpackPlugin')).toBe(true);
      expect(result.some(p => p.name === 'MiniCssExtractPlugin')).toBe(true);
    });

    it('should handle missing plugins', () => {
      const content = 'module.exports = { }';

      const result = analyzer.extractPlugins(content);

      expect(result).toEqual([]);
    });
  });

  describe('getPluginDescription', () => {
    it('should return description for known plugins', () => {
      const description = analyzer.getPluginDescription('HtmlWebpackPlugin');

      expect(description).toContain('HTML');
    });

    it('should handle unknown plugins', () => {
      const description = analyzer.getPluginDescription('UnknownPlugin');

      expect(description).toContain('Unknown plugin');
    });
  });
});
