import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { DependencyAnalyzer } from '../dependencyAnalyzer';

jest.mock('fs');
jest.mock('util');

describe('DependencyAnalyzer', () => {
    let analyzer: DependencyAnalyzer;

    beforeEach(() => {
        jest.clearAllMocks();
        analyzer = new DependencyAnalyzer();

        // Mock util.promisify to return the mock fs functions
        (util.promisify as jest.Mock).mockImplementation((fn) => fn);
    });

    describe('analyzeDependencies', () => {
        it('should analyze project dependencies from package.json', async () => {
            const mockPackageJson = {
                name: 'test-project',
                dependencies: {
                    'dep1': '^1.0.0',
                    'dep2': '2.0.0'
                },
                devDependencies: {
                    'dev-dep1': '^3.0.0'
                }
            };

            (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockPackageJson));

            const result = await analyzer.analyzeDependencies('/test/project');

            expect(result.filePath).toBe(path.join('/test/project', 'package.json'));
            expect(result.graph.nodes).toHaveLength(4); // root + 3 deps
            expect(result.graph.links).toHaveLength(3); // 3 dependencies

            // Verify root node
            expect(result.graph.nodes[0]).toEqual({
                id: 'root',
                name: 'test-project',
                path: '/test/project',
                type: 'package'
            });

            // Verify dependencies are included
            const depNodes = result.graph.nodes.slice(1);
            expect(depNodes).toContainEqual(expect.objectContaining({
                name: 'dep1',
                type: 'external'
            }));
            expect(depNodes).toContainEqual(expect.objectContaining({
                name: 'dep2',
                type: 'external'
            }));
            expect(depNodes).toContainEqual(expect.objectContaining({
                name: 'dev-dep1',
                type: 'external'
            }));
        });

        it('should handle missing package.json', async () => {
            (fs.readFile as jest.Mock).mockRejectedValueOnce(new Error('File not found'));

            await expect(analyzer.analyzeDependencies('/test/project'))
                .rejects.toThrow('Failed to analyze dependencies');
        });

        it('should handle invalid package.json', async () => {
            (fs.readFile as jest.Mock).mockResolvedValueOnce('invalid json');

            await expect(analyzer.analyzeDependencies('/test/project'))
                .rejects.toThrow('Failed to analyze dependencies');
        });
    });

    describe('analyzeFileImports', () => {
        it('should analyze ES6 imports in a file', async () => {
            const mockFileContent = `
                import foo from './foo';
                import { bar } from '../bar';
                import * as baz from 'baz';
            `;

            (fs.readFile as jest.Mock).mockResolvedValueOnce(mockFileContent);

            const result = await analyzer.analyzeFileImports('/test/src/file.ts');

            expect(result.filePath).toBe('/test/src/file.ts');
            expect(result.graph.nodes).toHaveLength(4); // file + 3 imports
            expect(result.graph.links).toHaveLength(3); // 3 imports

            // Verify source file node
            expect(result.graph.nodes[0]).toEqual({
                id: 'file.ts',
                name: 'file.ts',
                path: '/test/src/file.ts',
                type: 'file',
                size: mockFileContent.length
            });

            // Verify imports are included
            const importNodes = result.graph.nodes.slice(1);
            expect(importNodes).toContainEqual(expect.objectContaining({
                name: 'foo',
                type: 'file'
            }));
            expect(importNodes).toContainEqual(expect.objectContaining({
                name: 'bar',
                type: 'file'
            }));
            expect(importNodes).toContainEqual(expect.objectContaining({
                name: 'baz',
                type: 'external'
            }));
        });

        it('should analyze CommonJS requires in a file', async () => {
            const mockFileContent = `
                const foo = require('./foo');
                const { bar } = require('../bar');
                let baz = require('baz');
            `;

            (fs.readFile as jest.Mock).mockResolvedValueOnce(mockFileContent);

            const result = await analyzer.analyzeFileImports('/test/src/file.js');

            expect(result.filePath).toBe('/test/src/file.js');
            expect(result.graph.nodes).toHaveLength(4); // file + 3 requires
            expect(result.graph.links).toHaveLength(3); // 3 requires

            // Verify source file node
            expect(result.graph.nodes[0]).toEqual({
                id: 'file.js',
                name: 'file.js',
                path: '/test/src/file.js',
                type: 'file',
                size: mockFileContent.length
            });

            // Verify requires are included
            const requireNodes = result.graph.nodes.slice(1);
            expect(requireNodes).toContainEqual(expect.objectContaining({
                name: 'foo',
                type: 'file'
            }));
            expect(requireNodes).toContainEqual(expect.objectContaining({
                name: 'bar',
                type: 'file'
            }));
            expect(requireNodes).toContainEqual(expect.objectContaining({
                name: 'baz',
                type: 'external'
            }));
        });

        it('should handle mixed imports and requires', async () => {
            const mockFileContent = `
                import foo from './foo';
                const bar = require('../bar');
                import * as baz from 'baz';
                const qux = require('qux');
            `;

            (fs.readFile as jest.Mock).mockResolvedValueOnce(mockFileContent);

            const result = await analyzer.analyzeFileImports('/test/src/file.ts');

            expect(result.graph.nodes).toHaveLength(5); // file + 4 imports/requires
            expect(result.graph.links).toHaveLength(4); // 4 dependencies

            // Verify all dependencies are included
            const depNodes = result.graph.nodes.slice(1);
            expect(depNodes).toContainEqual(expect.objectContaining({ name: 'foo', type: 'file' }));
            expect(depNodes).toContainEqual(expect.objectContaining({ name: 'bar', type: 'file' }));
            expect(depNodes).toContainEqual(expect.objectContaining({ name: 'baz', type: 'external' }));
            expect(depNodes).toContainEqual(expect.objectContaining({ name: 'qux', type: 'external' }));
        });

        it('should handle file read errors', async () => {
            (fs.readFile as jest.Mock).mockRejectedValueOnce(new Error('File not found'));

            await expect(analyzer.analyzeFileImports('/test/src/file.ts'))
                .rejects.toThrow('Failed to analyze file imports');
        });
    });
});
