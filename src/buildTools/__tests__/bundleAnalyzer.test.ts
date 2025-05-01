import * as fs from 'fs';
import * as path from 'path';
import { BundleAnalyzer } from '../bundleAnalyzer';

jest.mock('fs');
jest.mock('path');

describe('BundleAnalyzer', () => {
    let bundleAnalyzer: BundleAnalyzer;

    beforeEach(() => {
        bundleAnalyzer = new BundleAnalyzer();
        jest.resetAllMocks();
    });

    describe('analyzeDirectory', () => {
        test('should analyze bundle files correctly', async () => {
            const mockFiles = [
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
                    name: 'assets',
                    isDirectory: () => true,
                    isFile: () => false
                }
            ];

            const mockAssetFiles = [
                {
                    name: 'image.png',
                    isDirectory: () => false,
                    isFile: () => true
                }
            ];

            (fs.readdirSync as jest.Mock)
                .mockImplementationOnce(() => mockFiles)
                .mockImplementationOnce(() => mockAssetFiles);

            (fs.statSync as jest.Mock).mockImplementation((filePath) => ({
                size: filePath.endsWith('.js') ? 100000 : // 100KB
                      filePath.endsWith('.css') ? 50000 : // 50KB
                      filePath.endsWith('.png') ? 200000 : // 200KB
                      10000 // default
            }));

            (path.extname as jest.Mock).mockImplementation((filePath) => {
                if (filePath.endsWith('.js')) return '.js';
                if (filePath.endsWith('.css')) return '.css';
                if (filePath.endsWith('.png')) return '.png';
                return '';
            });

            (path.join as jest.Mock).mockImplementation((...parts) => parts.join('/'));
            (path.basename as jest.Mock).mockImplementation((filePath) => filePath.split('/').pop());

            const result = await bundleAnalyzer.analyzeDirectory('/test/dist');

            expect(result.totalSize).toBe(350000); // 100KB + 50KB + 200KB
            expect(result.jsSize).toBe(100000);
            expect(result.cssSize).toBe(50000);
            expect(result.imageSize).toBe(200000);
            expect(result.files).toHaveLength(3);
            expect(result.recommendations).toHaveLength(expect.any(Number));
        });

        test('should handle empty directories', async () => {
            (fs.readdirSync as jest.Mock).mockReturnValue([]);

            const result = await bundleAnalyzer.analyzeDirectory('/test/empty');

            expect(result.totalSize).toBe(0);
            expect(result.files).toHaveLength(0);
        });

        test('should generate appropriate recommendations', async () => {
            const mockFiles = [
                {
                    name: 'vendor.js',
                    isDirectory: () => false,
                    isFile: () => true
                },
                {
                    name: 'main.js.map',
                    isDirectory: () => false,
                    isFile: () => true
                }
            ];

            (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);
            (fs.statSync as jest.Mock).mockReturnValue({ size: 1024 * 1024 }); // 1MB
            (path.extname as jest.Mock).mockImplementation((filePath) => {
                if (filePath.endsWith('.js')) return '.js';
                if (filePath.endsWith('.map')) return '.map';
                return '';
            });
            (path.join as jest.Mock).mockImplementation((...parts) => parts.join('/'));
            (path.basename as jest.Mock).mockImplementation((filePath) => filePath.split('/').pop());

            const result = await bundleAnalyzer.analyzeDirectory('/test/dist');

            expect(result.recommendations).toContainEqual(
                expect.objectContaining({
                    title: 'Consider Code Splitting for Large JavaScript Bundles'
                })
            );

            expect(result.recommendations).toContainEqual(
                expect.objectContaining({
                    title: 'Remove Source Maps in Production'
                })
            );

            expect(result.recommendations).toContainEqual(
                expect.objectContaining({
                    title: 'Analyze and Optimize Vendor Dependencies'
                })
            );
        });

        test('should identify duplicate resources', async () => {
            const mockFiles = [
                {
                    name: 'main.js',
                    isDirectory: () => false,
                    isFile: () => true
                },
                {
                    name: 'main.js',
                    isDirectory: () => false,
                    isFile: () => true
                }
            ];

            (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);
            (fs.statSync as jest.Mock).mockReturnValue({ size: 1024 });
            (path.extname as jest.Mock).mockReturnValue('.js');
            (path.join as jest.Mock).mockImplementation((...parts) => parts.join('/'));
            (path.basename as jest.Mock).mockImplementation((filePath) => filePath.split('/').pop());

            const result = await bundleAnalyzer.analyzeDirectory('/test/dist');

            expect(result.recommendations).toContainEqual(
                expect.objectContaining({
                    title: 'Check for Duplicate Resources'
                })
            );
        });

        test('should suggest image optimization when needed', async () => {
            const mockFiles = [
                {
                    name: 'large-image.png',
                    isDirectory: () => false,
                    isFile: () => true
                }
            ];

            (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);
            (fs.statSync as jest.Mock).mockReturnValue({ size: 2 * 1024 * 1024 }); // 2MB
            (path.extname as jest.Mock).mockReturnValue('.png');
            (path.join as jest.Mock).mockImplementation((...parts) => parts.join('/'));
            (path.basename as jest.Mock).mockImplementation((filePath) => filePath.split('/').pop());

            const result = await bundleAnalyzer.analyzeDirectory('/test/dist');

            expect(result.recommendations).toContainEqual(
                expect.objectContaining({
                    title: 'Optimize Images'
                })
            );
        });

        test('should suggest CSS optimization for large CSS files', async () => {
            const mockFiles = [
                {
                    name: 'large-styles.css',
                    isDirectory: () => false,
                    isFile: () => true
                }
            ];

            (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);
            (fs.statSync as jest.Mock).mockReturnValue({ size: 150 * 1024 }); // 150KB
            (path.extname as jest.Mock).mockReturnValue('.css');
            (path.join as jest.Mock).mockImplementation((...parts) => parts.join('/'));
            (path.basename as jest.Mock).mockImplementation((filePath) => filePath.split('/').pop());

            const result = await bundleAnalyzer.analyzeDirectory('/test/dist');

            expect(result.recommendations).toContainEqual(
                expect.objectContaining({
                    title: 'Optimize CSS'
                })
            );
        });
    });
});
