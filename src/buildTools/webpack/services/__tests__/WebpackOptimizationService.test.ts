import { mock } from 'jest-mock-extended';
import { ILogger } from '../../../../services/logging/ILogger';
import { WebpackOptimizationService } from '../WebpackOptimizationService';

describe('WebpackOptimizationService', () => {
  let service: WebpackOptimizationService;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockLogger = mock<ILogger>();
    service = new WebpackOptimizationService(mockLogger);
  });

  describe('generateSuggestions', () => {
    const mockConfig = `
      module.exports = {
        mode: 'development',
        entry: './src/index.js',
        output: {
          filename: 'bundle.js',
          path: path.resolve(__dirname, 'dist')
        },
        module: {
          rules: [
            {
              test: /\\.js$/,
              use: 'babel-loader',
              exclude: /node_modules/
            }
          ]
        },
        plugins: [
          new HtmlWebpackPlugin()
        ]
      };
    `;

    const mockEntryPoints = [
      { name: 'main', path: './src/index.js' }
    ];

    const mockLoaders = [
      { name: 'babel-loader', test: '/\\.js$/', options: {} }
    ];

    const mockPlugins = [
      { name: 'HtmlWebpackPlugin', description: 'Generates HTML files' }
    ];

    it('should generate optimization suggestions', () => {
      const suggestions = service.generateSuggestions(
        mockConfig,
        mockEntryPoints,
        mockLoaders,
        mockPlugins
      );

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should suggest production mode if not set', () => {
      const suggestions = service.generateSuggestions(
        mockConfig,
        mockEntryPoints,
        mockLoaders,
        mockPlugins
      );

      const modeSuggestion = suggestions.find(s =>
        s.description.includes('production mode'));
      expect(modeSuggestion).toBeDefined();
    });

    it('should suggest code splitting for multiple entry points', () => {
      const multipleEntryPoints = [
        { name: 'main', path: './src/index.js' },
        { name: 'vendor', path: './src/vendor.js' }
      ];

      const suggestions = service.generateSuggestions(
        mockConfig,
        multipleEntryPoints,
        mockLoaders,
        mockPlugins
      );

      const splitSuggestion = suggestions.find(s =>
        s.description.includes('code splitting') ||
        s.description.includes('splitChunks'));
      expect(splitSuggestion).toBeDefined();
    });

    it('should suggest adding MiniCssExtractPlugin when css loaders are present', () => {
      const cssLoaders = [
        { name: 'babel-loader', test: '/\\.js$/', options: {} },
        { name: 'css-loader', test: '/\\.css$/', options: {} },
        { name: 'style-loader', test: '/\\.css$/', options: {} }
      ];

      const suggestions = service.generateSuggestions(
        mockConfig,
        mockEntryPoints,
        cssLoaders,
        mockPlugins
      );

      const cssPluginSuggestion = suggestions.find(s =>
        s.description.includes('MiniCssExtractPlugin'));
      expect(cssPluginSuggestion).toBeDefined();
    });

    it('should suggest hash/contenthash for cache busting', () => {
      const suggestions = service.generateSuggestions(
        mockConfig,
        mockEntryPoints,
        mockLoaders,
        mockPlugins
      );

      const hashSuggestion = suggestions.find(s =>
        s.description.includes('hash') ||
        s.description.includes('contenthash'));
      expect(hashSuggestion).toBeDefined();
    });

    it('should suggest tree shaking optimizations', () => {
      const suggestions = service.generateSuggestions(
        mockConfig,
        mockEntryPoints,
        mockLoaders,
        mockPlugins
      );

      const treeSuggestion = suggestions.find(s =>
        s.description.includes('tree shaking') ||
        s.description.includes('usedExports'));
      expect(treeSuggestion).toBeDefined();
    });

    it('should handle empty inputs gracefully', () => {
      const suggestions = service.generateSuggestions('', [], [], []);
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should suggest compression plugins for production', () => {
      const suggestions = service.generateSuggestions(
        mockConfig.replace('development', 'production'),
        mockEntryPoints,
        mockLoaders,
        mockPlugins
      );

      const compressionSuggestion = suggestions.find(s =>
        s.description.includes('compression') ||
        s.description.includes('CompressionPlugin'));
      expect(compressionSuggestion).toBeDefined();
    });

    it('should use default logger if none provided', () => {
      const localService = new WebpackOptimizationService();
      const suggestions = localService.generateSuggestions(
        mockConfig,
        mockEntryPoints,
        mockLoaders,
        mockPlugins
      );

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });
});
