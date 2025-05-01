// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\__tests__\bundleAnalyzer.js.test.js

const fs = require('fs');
const path = require('path');
const { BundleAnalyzer } = require('../bundleAnalyzer');

jest.mock('fs');
jest.mock('path');

describe('BundleAnalyzer JavaScript Implementation', () => {
    let bundleAnalyzer;

    beforeEach(() => {
        bundleAnalyzer = new BundleAnalyzer();
        jest.resetAllMocks();
    });

    describe('analyzeDirectory', () => {
        test('should analyze bundle files with different file types', async () => {
            // Mock file entries with withFileTypes property
            const mockEntries = [
                {
                    name: 'main.js',
                    isDirectory: () => false,
                    isFile: () => true
                },
                {
                    name: 'styles.css',
                    isDirectory: () => false,
                    isFile: () => true
                },
                {
                    name: 'logo.png',
                    isDirectory: () => false,
                    isFile: () => true
                },
                {
                    name: 'assets',
                    isDirectory: () => true,
                    isFile: () => false
                }
            ];

            // Mock asset entries
            const mockAssetEntries = [
                {
                    name: 'background.jpg',
                    isDirectory: () => false,
                    isFile: () => true
                }
            ];

            // Setup mock implementations
            fs.readdirSync = jest.fn()
                .mockImplementationOnce(() => mockEntries)
                .mockImplementationOnce(() => mockAssetEntries);

            fs.statSync = jest.fn().mockImplementation((filePath) => ({
                size: filePath.endsWith('.js') ? 120000 :
                      filePath.endsWith('.css') ? 45000 :
                      filePath.endsWith('.png') ? 80000 :
                      filePath.endsWith('.jpg') ? 150000 :
                      10000 // default for unknown files
            }));

            path.extname = jest.fn().mockImplementation((fileName) => {
                if (fileName.endsWith('.js')) return '.js';
                if (fileName.endsWith('.css')) return '.css';
                if (fileName.endsWith('.png')) return '.png';
                if (fileName.endsWith('.jpg')) return '.jpg';
                return '';
            });

            path.join = jest.fn().mockImplementation((...parts) => parts.join('/'));
            path.basename = jest.fn().mockImplementation((filePath) => filePath.split('/').pop());

            // Call the method
            const result = await bundleAnalyzer.analyzeDirectory('/test/build');

            // Verify results
            expect(result.totalSize).toBe(395000); // 120K + 45K + 80K + 150K
            expect(result.jsSize).toBe(120000);
            expect(result.cssSize).toBe(45000);
            expect(result.imageSize).toBe(230000); // 80K + 150K
            expect(result.otherSize).toBe(0);
            expect(result.files).toHaveLength(4);
            expect(result.recommendations).toBeInstanceOf(Array);
        });

        test('should handle empty directories correctly', async () => {
            fs.readdirSync = jest.fn().mockReturnValue([]);

            const result = await bundleAnalyzer.analyzeDirectory('/test/empty');

            expect(result.totalSize).toBe(0);
            expect(result.jsSize).toBe(0);
            expect(result.cssSize).toBe(0);
            expect(result.imageSize).toBe(0);
            expect(result.otherSize).toBe(0);
            expect(result.files).toHaveLength(0);
            expect(result.recommendations).toBeInstanceOf(Array);
        });

        test('should work with nested directories', async () => {
            const mockRootEntries = [
                {
                    name: 'main.js',
                    isDirectory: () => false,
                    isFile: () => true
                },
                {
                    name: 'nested',
                    isDirectory: () => true,
                    isFile: () => false
                }
            ];

            const mockNestedEntries = [
                {
                    name: 'helpers.js',
                    isDirectory: () => false,
                    isFile: () => true
                },
                {
                    name: 'data.json',
                    isDirectory: () => false,
                    isFile: () => true
                }
            ];

            fs.readdirSync = jest.fn()
                .mockImplementationOnce(() => mockRootEntries)
                .mockImplementationOnce(() => mockNestedEntries);

            fs.statSync = jest.fn().mockImplementation((filePath) => ({
                size: filePath.includes('main.js') ? 50000 :
                      filePath.includes('helpers.js') ? 30000 :
                      filePath.includes('data.json') ? 15000 :
                      10000
            }));

            path.extname = jest.fn().mockImplementation((fileName) => {
                if (fileName.endsWith('.js')) return '.js';
                if (fileName.endsWith('.json')) return '.json';
                return '';
            });

            path.join = jest.fn().mockImplementation((...parts) => parts.join('/'));
            path.basename = jest.fn().mockImplementation((filePath) => filePath.split('/').pop());

            const result = await bundleAnalyzer.analyzeDirectory('/test/nested');

            expect(result.totalSize).toBe(95000); // 50K + 30K + 15K
            expect(result.jsSize).toBe(80000); // 50K + 30K
            expect(result.files).toHaveLength(3);
        });
    });

    describe('Recommendations', () => {
        test('should recommend code splitting for large JS files', async () => {
            const mockEntries = [
                {
                    name: 'large-bundle.js',
                    isDirectory: () => false,
                    isFile: () => true
                }
            ];

            fs.readdirSync = jest.fn().mockReturnValue(mockEntries);
            fs.statSync = jest.fn().mockReturnValue({ size: 1024 * 1024 }); // 1MB
            path.extname = jest.fn().mockReturnValue('.js');
            path.join = jest.fn().mockImplementation((...parts) => parts.join('/'));
            path.basename = jest.fn().mockImplementation((filePath) => filePath.split('/').pop());

            const result = await bundleAnalyzer.analyzeDirectory('/test/js');

            const splitRecommendation = result.recommendations.find(
                rec => rec.title === 'Consider Code Splitting for Large JavaScript Bundles'
            );

            expect(splitRecommendation).toBeDefined();
            expect(splitRecommendation.potentialSavings).toBe(Math.floor(1024 * 1024 * 0.3)); // 30% savings
        });

        test('should recommend CSS optimization for large CSS files', async () => {
            const mockEntries = [
                {
                    name: 'styles.css',
                    isDirectory: () => false,
                    isFile: () => true
                }
            ];

            fs.readdirSync = jest.fn().mockReturnValue(mockEntries);
            fs.statSync = jest.fn().mockReturnValue({ size: 200 * 1024 }); // 200KB
            path.extname = jest.fn().mockReturnValue('.css');
            path.join = jest.fn().mockImplementation((...parts) => parts.join('/'));
            path.basename = jest.fn().mockImplementation((filePath) => filePath.split('/').pop());

            const result = await bundleAnalyzer.analyzeDirectory('/test/css');

            const cssRecommendation = result.recommendations.find(
                rec => rec.title === 'Optimize CSS'
            );

            expect(cssRecommendation).toBeDefined();
            expect(cssRecommendation.potentialSavings).toBe(Math.floor(200 * 1024 * 0.4)); // 40% savings
        });

        test('should recommend image optimization for large images', async () => {
            const mockEntries = [
                {
                    name: 'background.jpg',
                    isDirectory: () => false,
                    isFile: () => true
                }
            ];

            fs.readdirSync = jest.fn().mockReturnValue(mockEntries);
            fs.statSync = jest.fn().mockReturnValue({ size: 2 * 1024 * 1024 }); // 2MB
            path.extname = jest.fn().mockReturnValue('.jpg');
            path.join = jest.fn().mockImplementation((...parts) => parts.join('/'));
            path.basename = jest.fn().mockImplementation((filePath) => filePath.split('/').pop());

            const result = await bundleAnalyzer.analyzeDirectory('/test/images');

            const imageRecommendation = result.recommendations.find(
                rec => rec.title === 'Optimize Images'
            );

            expect(imageRecommendation).toBeDefined();
            expect(imageRecommendation.potentialSavings).toBe(Math.floor(2 * 1024 * 1024 * 0.5)); // 50% savings
        });

        test('should recommend removing source maps in production', async () => {
            const mockEntries = [
                {
                    name: 'bundle.js',
                    isDirectory: () => false,
                    isFile: () => true
                },
                {
                    name: 'bundle.js.map',
                    isDirectory: () => false,
                    isFile: () => true
                }
            ];

            fs.readdirSync = jest.fn().mockReturnValue(mockEntries);
            fs.statSync = jest.fn().mockReturnValue({ size: 50 * 1024 }); // 50KB
            path.extname = jest.fn().mockImplementation((fileName) => {
                if (fileName.endsWith('.map')) return '.map';
                if (fileName.endsWith('.js')) return '.js';
                return '';
            });
            path.join = jest.fn().mockImplementation((...parts) => parts.join('/'));
            path.basename = jest.fn().mockImplementation((filePath) => filePath.split('/').pop());

            const result = await bundleAnalyzer.analyzeDirectory('/test/maps');

            const mapRecommendation = result.recommendations.find(
                rec => rec.title === 'Remove Source Maps in Production'
            );

            expect(mapRecommendation).toBeDefined();
        });

        test('should detect duplicate resources', async () => {
            const mockEntries = [
                {
                    name: 'logo.png',
                    isDirectory: () => false,
                    isFile: () => true
                },
                {
                    name: 'images',
                    isDirectory: () => true,
                    isFile: () => false
                }
            ];

            const mockNestedEntries = [
                {
                    name: 'logo.png',
                    isDirectory: () => false,
                    isFile: () => true
                }
            ];

            fs.readdirSync = jest.fn()
                .mockImplementationOnce(() => mockEntries)
                .mockImplementationOnce(() => mockNestedEntries);

            fs.statSync = jest.fn().mockReturnValue({ size: 30 * 1024 }); // 30KB
            path.extname = jest.fn().mockReturnValue('.png');
            path.join = jest.fn().mockImplementation((...parts) => parts.join('/'));
            path.basename = jest.fn().mockImplementation((filePath) => filePath.split('/').pop());

            const result = await bundleAnalyzer.analyzeDirectory('/test/duplicates');

            const duplicateRecommendation = result.recommendations.find(
                rec => rec.title === 'Check for Duplicate Resources'
            );

            expect(duplicateRecommendation).toBeDefined();
            expect(duplicateRecommendation.description).toContain('logo.png');
        });
    });

    describe('Utility Methods', () => {
        test('should format file sizes correctly', () => {
            expect(bundleAnalyzer.formatSize(500)).toBe('500 B');
            expect(bundleAnalyzer.formatSize(1500)).toBe('1.46 KB');
            expect(bundleAnalyzer.formatSize(1.5 * 1024 * 1024)).toBe('1.50 MB');
        });
    });
});
