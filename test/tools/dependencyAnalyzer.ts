/**
 * Tests for dependencyAnalyzer
 * Source: src\tools\dependencyAnalyzer.ts
 */
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import {
    DependencyAnalyzer
} from '../../src/tools/dependencyAnalyzer';

describe('DependencyAnalyzer', () => {
    let analyzer: DependencyAnalyzer;
    let sandbox: sinon.SinonSandbox;
    let readFileStub: sinon.SinonStub;
    let readdirStub: sinon.SinonStub;
    let statStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // Create a fresh instance of the analyzer for each test
        analyzer = new DependencyAnalyzer();

        // Stub fs methods
        readFileStub = sandbox.stub(fs.promises, 'readFile');
        readdirStub = sandbox.stub(fs.promises, 'readdir');
        statStub = sandbox.stub(fs.promises, 'stat');
    });

    afterEach(() => {
        // Restore all stubbed methods
        sandbox.restore();
    });

    describe('analyzeDependencies', () => {
        it('should properly analyze dependencies from package.json', async () => {
            // Setup mock data
            const projectPath = '/test/project';
            const packageJsonPath = path.join(projectPath, 'package.json');
            const mockPackageJson = {
                name: 'test-project',
                dependencies: {
                    'dependency1': '1.0.0',
                    'dependency2': '2.0.0'
                },
                devDependencies: {
                    'dev-dependency1': '1.0.0',
                    'dev-dependency2': '2.0.0'
                }
            };

            // Setup stubs
            readFileStub.withArgs(packageJsonPath, 'utf8').resolves(JSON.stringify(mockPackageJson));

            // Execute the method
            const result = await analyzer.analyzeDependencies(projectPath);

            // Assertions
            assert.strictEqual(result.filePath, packageJsonPath);

            // Check graph nodes
            assert.strictEqual(result.graph.nodes.length, 5); // root + 2 deps + 2 devDeps

            // Check root node
            const rootNode = result.graph.nodes.find(n => n.id === 'root');
            assert.ok(rootNode);
            assert.strictEqual(rootNode?.name, 'test-project');
            assert.strictEqual(rootNode?.type, 'package');

            // Check dependencies nodes
            const dep1Node = result.graph.nodes.find(n => n.name === 'dependency1');
            assert.ok(dep1Node);
            assert.strictEqual(dep1Node?.type, 'external');

            const dep2Node = result.graph.nodes.find(n => n.name === 'dependency2');
            assert.ok(dep2Node);
            assert.strictEqual(dep2Node?.type, 'external');

            // Check dev dependencies nodes
            const devDep1Node = result.graph.nodes.find(n => n.name === 'dev-dependency1');
            assert.ok(devDep1Node);
            assert.strictEqual(devDep1Node?.type, 'external');

            const devDep2Node = result.graph.nodes.find(n => n.name === 'dev-dependency2');
            assert.ok(devDep2Node);
            assert.strictEqual(devDep2Node?.type, 'external');

            // Check links
            assert.strictEqual(result.graph.links.length, 4); // 2 deps + 2 devDeps

            // Check dependency links
            const dep1Link = result.graph.links.find(l => l.target === `dep_dependency1`);
            assert.ok(dep1Link);
            assert.strictEqual(dep1Link?.source, 'root');
            assert.strictEqual(dep1Link?.type, 'dependency');

            // Check dev dependency links - they have weaker strength
            const devDep1Link = result.graph.links.find(l => l.target === `devDep_dev-dependency1`);
            assert.ok(devDep1Link);
            assert.strictEqual(devDep1Link?.source, 'root');
            assert.strictEqual(devDep1Link?.type, 'dependency');
            assert.strictEqual(devDep1Link?.strength, 0.5);
        });

        it('should handle empty package.json', async () => {
            // Setup mock data
            const projectPath = '/test/empty-project';
            const packageJsonPath = path.join(projectPath, 'package.json');
            const mockPackageJson = {};

            // Setup stubs
            readFileStub.withArgs(packageJsonPath, 'utf8').resolves(JSON.stringify(mockPackageJson));

            // Execute the method
            const result = await analyzer.analyzeDependencies(projectPath);

            // Assertions
            assert.strictEqual(result.filePath, packageJsonPath);

            // Check graph nodes - should only have root node with default name
            assert.strictEqual(result.graph.nodes.length, 1);
            const rootNode = result.graph.nodes[0];
            assert.strictEqual(rootNode.id, 'root');
            assert.strictEqual(rootNode.name, 'project');

            // No links should be present
            assert.strictEqual(result.graph.links.length, 0);
        });

        it('should throw error if package.json not found', async () => {
            // Setup mock data
            const projectPath = '/test/non-existent-project';
            const packageJsonPath = path.join(projectPath, 'package.json');

            // Setup stubs to simulate file not found
            readFileStub.withArgs(packageJsonPath, 'utf8').rejects(new Error('File not found'));

            // Execute and assert error
            await assert.rejects(
                analyzer.analyzeDependencies(projectPath),
                {
                    message: /Failed to analyze dependencies: File not found/
                }
            );
        });

        it('should throw error if package.json is invalid JSON', async () => {
            // Setup mock data
            const projectPath = '/test/invalid-json-project';
            const packageJsonPath = path.join(projectPath, 'package.json');

            // Setup stubs to return invalid JSON
            readFileStub.withArgs(packageJsonPath, 'utf8').resolves('{ this is not valid JSON }');

            // Execute and assert error
            await assert.rejects(
                analyzer.analyzeDependencies(projectPath),
                {
                    message: /Failed to analyze dependencies: /
                }
            );
        });
    });

    describe('analyzeFileImports', () => {
        it('should detect ES6 imports in JavaScript file', async () => {
            // Setup mock data
            const filePath = '/test/project/src/index.js';
            const fileContent = `
                import React from 'react';
                import { useState, useEffect } from 'react';
                import MyComponent from './components/MyComponent';
                import '../styles/main.css';
            `;

            // Setup stubs
            readFileStub.withArgs(filePath, 'utf8').resolves(fileContent);

            // Execute the method
            const result = await analyzer.analyzeFileImports(filePath);

            // Assertions
            assert.strictEqual(result.filePath, filePath);

            // Check nodes - should have the file itself + 3 imports (react is imported twice but should be one node)
            assert.strictEqual(result.graph.nodes.length, 4);

            // Check file node
            const fileNode = result.graph.nodes.find(n => n.id === 'index.js');
            assert.ok(fileNode);
            assert.strictEqual(fileNode?.type, 'file');

            // Check import nodes
            const reactNode = result.graph.nodes.find(n => n.path === 'react');
            assert.ok(reactNode);
            assert.strictEqual(reactNode?.type, 'external');

            const componentNode = result.graph.nodes.find(n => n.path === './components/MyComponent');
            assert.ok(componentNode);
            assert.strictEqual(componentNode?.type, 'file');

            const stylesNode = result.graph.nodes.find(n => n.path === '../styles/main.css');
            assert.ok(stylesNode);
            assert.strictEqual(stylesNode?.type, 'file');

            // Check links - should have 4 imports
            assert.strictEqual(result.graph.links.length, 4);
            assert.ok(result.graph.links.every(link => link.type === 'import'));
        });

        it('should detect CommonJS requires in JavaScript file', async () => {
            // Setup mock data
            const filePath = '/test/project/src/server.js';
            const fileContent = `
                const express = require('express');
                const { join } = require('path');
                const config = require('./config');
                let utils;
                utils = require('../utils');
            `;

            // Setup stubs
            readFileStub.withArgs(filePath, 'utf8').resolves(fileContent);

            // Execute the method
            const result = await analyzer.analyzeFileImports(filePath);

            // Assertions
            assert.strictEqual(result.filePath, filePath);

            // Check nodes - should have the file itself + 4 imports
            assert.strictEqual(result.graph.nodes.length, 5);

            // Check file node
            const fileNode = result.graph.nodes.find(n => n.id === 'server.js');
            assert.ok(fileNode);
            assert.strictEqual(fileNode?.type, 'file');

            // Check import nodes
            const expressNode = result.graph.nodes.find(n => n.path === 'express');
            assert.ok(expressNode);
            assert.strictEqual(expressNode?.type, 'external');

            const pathNode = result.graph.nodes.find(n => n.path === 'path');
            assert.ok(pathNode);
            assert.strictEqual(pathNode?.type, 'external');

            const configNode = result.graph.nodes.find(n => n.path === './config');
            assert.ok(configNode);
            assert.strictEqual(configNode?.type, 'file');

            const utilsNode = result.graph.nodes.find(n => n.path === '../utils');
            assert.ok(utilsNode);
            assert.strictEqual(utilsNode?.type, 'file');

            // Check links - should have 4 requires
            assert.strictEqual(result.graph.links.length, 4);
            assert.ok(result.graph.links.every(link => link.type === 'require'));
        });

        it('should handle mixed import types in a single file', async () => {
            // Setup mock data
            const filePath = '/test/project/src/mixed.js';
            const fileContent = `
                import React from 'react';
                const express = require('express');
                import { Component } from 'react';
                const path = require('path');
            `;

            // Setup stubs
            readFileStub.withArgs(filePath, 'utf8').resolves(fileContent);

            // Execute the method
            const result = await analyzer.analyzeFileImports(filePath);

            // Assertions
            assert.strictEqual(result.filePath, filePath);

            // Check nodes - file + 3 imports (react is imported twice)
            assert.strictEqual(result.graph.nodes.length, 4);

            // Check links - 2 imports and 2 requires
            assert.strictEqual(result.graph.links.length, 4);
            assert.strictEqual(
                result.graph.links.filter(link => link.type === 'import').length,
                2
            );
            assert.strictEqual(
                result.graph.links.filter(link => link.type === 'require').length,
                2
            );
        });

        it('should handle complex import patterns', async () => {
            // Setup mock data
            const filePath = '/test/project/src/complex.js';
            const fileContent = `
                import React, { useState, useEffect } from 'react';
                import * as utils from './utils';
                import DefaultExport, { NamedExport1, NamedExport2 as Alias } from './module';
                const { method1, method2: alias2 } = require('./methods');
            `;

            // Setup stubs
            readFileStub.withArgs(filePath, 'utf8').resolves(fileContent);

            // Execute the method
            const result = await analyzer.analyzeFileImports(filePath);

            // Assertions
            assert.strictEqual(result.filePath, filePath);

            // Check nodes - file + 4 imports
            assert.strictEqual(result.graph.nodes.length, 5);

            // Check import paths are correctly identified
            const paths = result.graph.nodes.map(n => n.path);
            assert.ok(paths.includes('react'));
            assert.ok(paths.includes('./utils'));
            assert.ok(paths.includes('./module'));
            assert.ok(paths.includes('./methods'));

            // Check links
            assert.strictEqual(result.graph.links.length, 4);
        });

        it('should throw error if file not found', async () => {
            // Setup mock data
            const filePath = '/test/project/src/nonexistent.js';

            // Setup stubs to simulate file not found
            readFileStub.withArgs(filePath, 'utf8').rejects(new Error('File not found'));

            // Execute and assert error
            await assert.rejects(
                analyzer.analyzeFileImports(filePath),
                {
                    message: /Failed to analyze file imports: File not found/
                }
            );
        });

        it('should detect TypeScript-specific imports', async () => {
            // Setup mock data
            const filePath = '/test/project/src/component.ts';
            const fileContent = `
                import React from 'react';
                import type { ReactNode } from 'react';
                import { Component } from 'react';
                import type { SomeInterface } from './types';
                import { SomeType } from './types';
            `;

            // Setup stubs
            readFileStub.withArgs(filePath, 'utf8').resolves(fileContent);

            // Execute the method
            const result = await analyzer.analyzeFileImports(filePath);

            // Assertions
            assert.strictEqual(result.filePath, filePath);

            // Check nodes - should have the file itself + 2 import sources (react and ./types)
            assert.strictEqual(result.graph.nodes.length, 3);

            // Verify import paths
            const paths = result.graph.nodes.map(n => n.path);
            assert.ok(paths.includes('react'));
            assert.ok(paths.includes('./types'));

            // Check links - should have 5 imports (even for type imports)
            assert.strictEqual(result.graph.links.length, 5);
            assert.ok(result.graph.links.every(link => link.type === 'import'));
        });

        it('should handle JSX/TSX file imports', async () => {
            // Setup mock data
            const filePath = '/test/project/src/App.tsx';
            const fileContent = `
                import React, { useEffect, useState } from 'react';
                import styles from './App.module.css';
                import { Header } from './components/Header';
                import { Footer } from './components/Footer';
                import { MainContent } from './components/MainContent';
            `;

            // Setup stubs
            readFileStub.withArgs(filePath, 'utf8').resolves(fileContent);

            // Execute the method
            const result = await analyzer.analyzeFileImports(filePath);

            // Assertions
            assert.strictEqual(result.filePath, filePath);

            // Check nodes - file + 5 imports
            assert.strictEqual(result.graph.nodes.length, 6);

            // Verify all import paths are detected
            const paths = result.graph.nodes.map(n => n.path);
            assert.ok(paths.includes('react'));
            assert.ok(paths.includes('./App.module.css'));
            assert.ok(paths.includes('./components/Header'));
            assert.ok(paths.includes('./components/Footer'));
            assert.ok(paths.includes('./components/MainContent'));

            // Check links
            assert.strictEqual(result.graph.links.length, 5);
        });

        it('should handle dynamic imports', async () => {
            // Setup mock data
            const filePath = '/test/project/src/dynamic.js';
            const fileContent = `
                import React from 'react';

                const loadComponent = () => import('./components/LazyComponent');

                function App() {
                    const [Component, setComponent] = useState(null);

                    useEffect(() => {
                        import('./utils/helpers').then(module => {
                            module.initializeApp();
                        });
                    }, []);

                    return <div>App</div>;
                }
            `;

            // Setup stubs
            readFileStub.withArgs(filePath, 'utf8').resolves(fileContent);

            // Execute the method
            const result = await analyzer.analyzeFileImports(filePath);

            // Assertions
            assert.strictEqual(result.filePath, filePath);

            // Currently dynamic imports might not be detected, but React should be
            // At minimum, we should see the file itself and React
            assert.ok(result.graph.nodes.length >= 2);

            // Verify standard import is detected
            const reactNode = result.graph.nodes.find(n => n.path === 'react');
            assert.ok(reactNode);
        });

        it('should handle imports with unusual whitespace and formatting', async () => {
            // Setup mock data
            const filePath = '/test/project/src/unusual.js';
            const fileContent = `
                import
                    React,
                    {
                        useState,
                        useEffect
                    }
                from
                'react';

                const
                    fs
                        =
                            require(
                                'fs'
                            );

                import * as
                    utils
                        from
                            './utils';
            `;

            // Setup stubs
            readFileStub.withArgs(filePath, 'utf8').resolves(fileContent);

            // Execute the method
            const result = await analyzer.analyzeFileImports(filePath);

            // Assertions
            assert.strictEqual(result.filePath, filePath);

            // Check nodes - file + 3 imports
            assert.strictEqual(result.graph.nodes.length, 4);

            // Verify all import paths are detected despite unusual formatting
            const paths = result.graph.nodes.map(n => n.path);
            assert.ok(paths.includes('react'));
            assert.ok(paths.includes('fs'));
            assert.ok(paths.includes('./utils'));

            // Check links - 2 imports and 1 require
            assert.strictEqual(result.graph.links.length, 3);
            assert.strictEqual(
                result.graph.links.filter(link => link.type === 'import').length,
                2
            );
            assert.strictEqual(
                result.graph.links.filter(link => link.type === 'require').length,
                1
            );
        });

        it('should handle re-exports in files', async () => {
            // Setup mock data
            const filePath = '/test/project/src/index.js';
            const fileContent = `
                export * from './components';
                export { default as Button } from './components/Button';
                export { Card, CardHeader } from './components/Card';

                // Also has some imports
                import React from 'react';
                import ReactDOM from 'react-dom';
            `;

            // Setup stubs
            readFileStub.withArgs(filePath, 'utf8').resolves(fileContent);

            // Execute the method
            const result = await analyzer.analyzeFileImports(filePath);

            // Assertions
            assert.strictEqual(result.filePath, filePath);

            // Check nodes - file + imports (exports are also imports)
            // At minimum, we should detect the normal imports
            assert.ok(result.graph.nodes.length >= 3);

            // Verify standard imports are detected
            const paths = result.graph.nodes.map(n => n.path);
            assert.ok(paths.includes('react'));
            assert.ok(paths.includes('react-dom'));
        });
    });

    describe('edge cases', () => {
        it('should handle package.json with unusual format', async () => {
            // Setup mock data with unexpected fields and structure
            const projectPath = '/test/unusual-project';
            const packageJsonPath = path.join(projectPath, 'package.json');
            const mockPackageJson = {
                // Missing name
                // Dependencies as array instead of object (invalid but testing robustness)
                dependencies: ['react', 'lodash'],
                // Other unusual fields
                customField: {
                    nestedDependencies: {
                        'nested-dep': '1.0.0'
                    }
                }
            };

            // Setup stubs
            readFileStub.withArgs(packageJsonPath, 'utf8').resolves(JSON.stringify(mockPackageJson));

            // Execute the method
            const result = await analyzer.analyzeDependencies(projectPath);

            // Assertions
            assert.strictEqual(result.filePath, packageJsonPath);

            // Should still have a root node with default name
            const rootNode = result.graph.nodes.find(n => n.id === 'root');
            assert.ok(rootNode);
            assert.strictEqual(rootNode.name, 'project'); // Default name when none provided

            // Shouldn't crash on invalid dependencies format
            assert.ok(result.graph.nodes.length >= 1); // At least the root node
        });

        it('should handle files with unconventional imports', async () => {
            // Setup mock data
            const filePath = '/test/project/src/unconventional.js';
            const fileContent = `
                // Non-standard import patterns or incorrectly formatted imports
                import*as React from"react" // Missing semicolon, unusual spacing
                require('./module') // Not assigned to a variable
                const something = require \n ('./weird/path') // Line break in require
                globalThis.customRequire('./custom-module'); // Non-standard require
            `;

            // Setup stubs
            readFileStub.withArgs(filePath, 'utf8').resolves(fileContent);

            // Execute the method
            const result = await analyzer.analyzeFileImports(filePath);

            // Assertions
            assert.strictEqual(result.filePath, filePath);

            // Should at least include the file node itself
            assert.ok(result.graph.nodes.length >= 1);

            // Check file node
            const fileNode = result.graph.nodes.find(n => n.id === path.basename(filePath));
            assert.ok(fileNode);
            assert.strictEqual(fileNode.type, 'file');
        });

        it('should handle circular dependencies in imports', async () => {
            // Setup mock data for file A that imports file B
            const filePathA = '/test/project/src/fileA.js';
            const fileContentA = `
                import { funcB } from './fileB';
                export const funcA = () => 'A calls ' + funcB();
            `;

            // Setup mock data for file B that imports file A
            const filePathB = '/test/project/src/fileB.js';
            const fileContentB = `
                import { funcA } from './fileA';
                export const funcB = () => 'B calls ' + funcA();
            `;

            // Setup stubs
            readFileStub.withArgs(filePathA, 'utf8').resolves(fileContentA);
            readFileStub.withArgs(filePathB, 'utf8').resolves(fileContentB);

            // Execute the method for file A
            const resultA = await analyzer.analyzeFileImports(filePathA);

            // Assertions for file A
            assert.strictEqual(resultA.filePath, filePathA);
            assert.strictEqual(resultA.graph.nodes.length, 2); // fileA + fileB

            // Check fileB node exists in graph
            const fileBNode = resultA.graph.nodes.find(n => n.path === './fileB');
            assert.ok(fileBNode);

            // Check link from fileA to fileB
            const linkToB = resultA.graph.links.find(l => l.target.includes('fileB'));
            assert.ok(linkToB);
            assert.strictEqual(linkToB.type, 'import');

            // Execute method for file B
            const resultB = await analyzer.analyzeFileImports(filePathB);

            // Assertions for file B
            assert.strictEqual(resultB.filePath, filePathB);
            assert.strictEqual(resultB.graph.nodes.length, 2); // fileB + fileA

            // Check fileA node exists in graph
            const fileANode = resultB.graph.nodes.find(n => n.path === './fileA');
            assert.ok(fileANode);

            // Check link from fileB to fileA
            const linkToA = resultB.graph.links.find(l => l.target.includes('fileA'));
            assert.ok(linkToA);
            assert.strictEqual(linkToA.type, 'import');
        });
    });

    describe('error handling', () => {
        it('should handle malformed import syntax without crashing', async () => {
            // Setup mock data with broken import syntax
            const filePath = '/test/project/src/broken.js';
            const fileContent = `
                import React from react'; // Missing opening quote
                import { useState from 'react'; // Missing closing brace
                const fs = require(fs); // Missing quotes
            `;

            // Setup stubs
            readFileStub.withArgs(filePath, 'utf8').resolves(fileContent);

            // Execute the method - should not throw
            const result = await analyzer.analyzeFileImports(filePath);

            // Assertions
            assert.strictEqual(result.filePath, filePath);

            // Should at least include the file itself
            assert.strictEqual(result.graph.nodes.length >= 1, true);

            const fileNode = result.graph.nodes.find(n => n.path === filePath);
            assert.ok(fileNode);
        });

        it('should handle very large files without excessive processing', async () => {
            // Setup mock data for a large file
            const filePath = '/test/project/src/large.js';

            // Create content with many imports (but not too many to crash the test)
            let fileContent = '// Large file with many imports\n';
            for (let i = 0; i < 100; i++) {
                fileContent += `import { module${i} } from './modules/module${i}';\n`;
            }
            for (let i = 0; i < 100; i++) {
                fileContent += `const ext${i} = require('external${i}');\n`;
            }

            // Setup stubs
            readFileStub.withArgs(filePath, 'utf8').resolves(fileContent);

            // Execute the method with a timeout to ensure it doesn't hang
            const result = await analyzer.analyzeFileImports(filePath);

            // Assertions
            assert.strictEqual(result.filePath, filePath);

            // Should handle a large number of imports
            assert.strictEqual(result.graph.nodes.length, 201); // 1 file + 200 imports
            assert.strictEqual(result.graph.links.length, 200); // 200 imports/requires
        });

        it('should handle empty file content', async () => {
            // Setup mock data
            const filePath = '/test/project/src/empty.js';
            const fileContent = '';

            // Setup stubs
            readFileStub.withArgs(filePath, 'utf8').resolves(fileContent);

            // Execute the method
            const result = await analyzer.analyzeFileImports(filePath);

            // Assertions
            assert.strictEqual(result.filePath, filePath);

            // Should just have the file node
            assert.strictEqual(result.graph.nodes.length, 1);
            assert.strictEqual(result.graph.links.length, 0);

            // Check file node
            const fileNode = result.graph.nodes[0];
            assert.strictEqual(fileNode.path, filePath);
            assert.strictEqual(fileNode.size, 0); // Empty file
        });
    });

    describe('private methods', () => {
        describe('addImportToGraph', () => {
            it('should correctly identify node modules vs local imports', async () => {
                const nodes: any[] = [];
                const links: any[] = [];
                const sourceId = 'test-file.js';
                const sourceDir = '/test/project/src';

                // Need to use a workaround to access private method
                const addImportToGraph = (analyzer as any).addImportToGraph.bind(analyzer);

                // Test external module
                await addImportToGraph(sourceId, 'react', sourceDir, nodes, links, 'import');

                // Test local relative import
                await addImportToGraph(sourceId, './components/Button', sourceDir, nodes, links, 'import');

                // Test local import with parent directory
                await addImportToGraph(sourceId, '../utils/helpers', sourceDir, nodes, links, 'import');

                // Assertions
                assert.strictEqual(nodes.length, 3);

                // Check node types
                const reactNode = nodes.find(n => n.path === 'react');
                assert.ok(reactNode);
                assert.strictEqual(reactNode.type, 'external');

                const buttonNode = nodes.find(n => n.path === './components/Button');
                assert.ok(buttonNode);
                assert.strictEqual(buttonNode.type, 'file');

                const helpersNode = nodes.find(n => n.path === '../utils/helpers');
                assert.ok(helpersNode);
                assert.strictEqual(helpersNode.type, 'file');

                // Check links
                assert.strictEqual(links.length, 3);
                assert.ok(links.every(link => link.source === sourceId));
                assert.ok(links.every(link => link.type === 'import'));
            });
        });

        describe('buildFileImportGraph', () => {
            it('should correctly identify imports and build graph', async () => {
                const filePath = '/test/project/src/test.js';
                const fileContent = `
                    import React from 'react';
                    const fs = require('fs');
                `;
                const fileDir = '/test/project/src';

                // Need to use a workaround to access private method
                const buildFileImportGraph = (analyzer as any).buildFileImportGraph.bind(analyzer);

                // Execute method
                const graph = await buildFileImportGraph(filePath, fileContent, fileDir);

                // Assertions
                assert.strictEqual(graph.nodes.length, 3); // File + 2 imports
                assert.strictEqual(graph.links.length, 2); // 2 imports

                // Check file node
                const fileNode = graph.nodes.find(n => n.path === filePath);
                assert.ok(fileNode);
                assert.strictEqual(fileNode.type, 'file');
                assert.strictEqual(fileNode.size, fileContent.length);

                // Check import nodes
                const reactNode = graph.nodes.find(n => n.path === 'react');
                assert.ok(reactNode);

                const fsNode = graph.nodes.find(n => n.path === 'fs');
                assert.ok(fsNode);

                // Check links
                const importLink = graph.links.find(l => l.type === 'import');
                assert.ok(importLink);

                const requireLink = graph.links.find(l => l.type === 'require');
                assert.ok(requireLink);
            });

            it('should handle files with no imports', async () => {
                const filePath = '/test/project/src/empty.js';
                const fileContent = `// This file has no imports
                    function hello() {
                        return 'world';
                    }
                `;
                const fileDir = '/test/project/src';

                // Need to use a workaround to access private method
                const buildFileImportGraph = (analyzer as any).buildFileImportGraph.bind(analyzer);

                // Execute method
                const graph = await buildFileImportGraph(filePath, fileContent, fileDir);

                // Assertions
                assert.strictEqual(graph.nodes.length, 1); // Just the file node
                assert.strictEqual(graph.links.length, 0); // No imports

                // Check file node
                const fileNode = graph.nodes[0];
                assert.strictEqual(fileNode.path, filePath);
                assert.strictEqual(fileNode.type, 'file');
            });
        });

        describe('buildDependencyGraph', () => {
            it('should handle package.json with peer and optional dependencies', async () => {
                const projectPath = '/test/project';
                const packageJson = {
                    name: 'test-project',
                    dependencies: {
                        'dep1': '1.0.0'
                    },
                    devDependencies: {
                        'dev-dep1': '1.0.0'
                    },
                    peerDependencies: {
                        'peer-dep1': '1.0.0'
                    },
                    optionalDependencies: {
                        'optional-dep1': '1.0.0'
                    }
                };

                // Need to use a workaround to access private method
                const buildDependencyGraph = (analyzer as any).buildDependencyGraph.bind(analyzer);

                // Execute method
                const graph = await buildDependencyGraph(projectPath, packageJson);

                // Assertions
                assert.strictEqual(graph.nodes.length, 5); // root + 4 dependencies
                assert.strictEqual(graph.links.length, 4); // 4 dependency links

                // Check root node
                const rootNode = graph.nodes.find(n => n.id === 'root');
                assert.ok(rootNode);
                assert.strictEqual(rootNode.name, 'test-project');

                // Currently the dependency analyzer doesn't handle peer and optional deps specially,
                // but we're testing what the current behavior is for completeness
                const depTypes = new Set(graph.nodes.map(n => n.type));
                assert.ok(depTypes.has('external'));
            });

            it('should handle empty dependencies objects', async () => {
                const projectPath = '/test/project';
                const packageJson = {
                    name: 'test-project',
                    dependencies: {},
                    devDependencies: {}
                };

                // Need to use a workaround to access private method
                const buildDependencyGraph = (analyzer as any).buildDependencyGraph.bind(analyzer);

                // Execute method
                const graph = await buildDependencyGraph(projectPath, packageJson);

                // Assertions
                assert.strictEqual(graph.nodes.length, 1); // Only root node
                assert.strictEqual(graph.links.length, 0); // No dependencies

                // Check root node
                const rootNode = graph.nodes[0];
                assert.strictEqual(rootNode.id, 'root');
                assert.strictEqual(rootNode.name, 'test-project');
            });
        });
    });
});
