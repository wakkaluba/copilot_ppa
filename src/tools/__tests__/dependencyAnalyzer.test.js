const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const { DependencyAnalyzer } = require('../../src/tools/dependencyAnalyzer');
const util = require('util');

// Mock dependency data for testing
const mockPackageJson = {
  name: 'test-project',
  version: '1.0.0',
  dependencies: {
    'dep1': '1.0.0',
    'dep2': '^2.0.0'
  },
  devDependencies: {
    'devDep1': '3.0.0',
    'devDep2': '~4.0.0'
  }
};

// Mock file content with imports for testing
const mockJsFileWithImports = `
import module1 from 'module1';
import { func1, func2 } from 'module2';
import * as module3 from 'module3';
import('dynamicModule').then(module => {});

const module4 = require('module4');
const { func3 } = require('module5');
`;

const mockTsFileWithImports = `
import module1 from 'module1';
import { func1, func2 } from 'module2';
import * as module3 from 'module3';
import type { Type1 } from 'module4';
import('dynamicModule').then(module => {});

const module4 = require('module4');
const { func3 } = require('module5');
`;

describe('DependencyAnalyzer', () => {
  let analyzer;
  let sandbox;
  let readFileStub;
  let readdirStub;
  let statStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    analyzer = new DependencyAnalyzer();

    // Stub fs methods
    readFileStub = sandbox.stub(fs.promises || fs, 'readFile');
    readdirStub = sandbox.stub(fs.promises || fs, 'readdir');
    statStub = sandbox.stub(fs.promises || fs, 'stat');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('analyzeDependencies', () => {
    it('should analyze package.json dependencies', async () => {
      // Setup
      const projectPath = '/test/project';
      readFileStub.resolves(JSON.stringify(mockPackageJson));

      // Execute
      const result = await analyzer.analyzeDependencies(projectPath);

      // Verify
      expect(readFileStub.calledWith(path.join(projectPath, 'package.json'))).toBe(true);
      expect(result.graph.nodes.length).toBeGreaterThan(0);
      expect(result.graph.links.length).toBeGreaterThan(0);

      // Verify root node
      const rootNode = result.graph.nodes.find(n => n.id === 'root');
      expect(rootNode).toBeDefined();
      expect(rootNode.name).toBe(mockPackageJson.name);

      // Verify dependencies
      const dependencyNodes = result.graph.nodes.filter(n => n.id !== 'root');
      expect(dependencyNodes.length).toBe(Object.keys(mockPackageJson.dependencies).length +
                                         Object.keys(mockPackageJson.devDependencies).length);

      // Verify links
      expect(result.graph.links.length).toBe(Object.keys(mockPackageJson.dependencies).length +
                                           Object.keys(mockPackageJson.devDependencies).length);
    });

    it('should handle empty package.json', async () => {
      // Setup
      const projectPath = '/test/project';
      readFileStub.resolves(JSON.stringify({}));

      // Execute
      const result = await analyzer.analyzeDependencies(projectPath);

      // Verify
      expect(result.graph.nodes.length).toBe(1); // Just root node
      expect(result.graph.links.length).toBe(0); // No links
    });

    it('should throw error if package.json not found', async () => {
      // Setup
      const projectPath = '/test/project';
      const error = new Error('File not found');
      readFileStub.rejects(error);

      // Execute & Verify
      await expect(analyzer.analyzeDependencies(projectPath)).rejects.toThrow();
    });

    it('should throw error if package.json is malformed', async () => {
      // Setup
      const projectPath = '/test/project';
      readFileStub.resolves('{ malformed json');

      // Execute & Verify
      await expect(analyzer.analyzeDependencies(projectPath)).rejects.toThrow();
    });
  });

  describe('analyzeFileImports', () => {
    it('should analyze ES6 imports in JavaScript file', async () => {
      // Setup
      const filePath = '/test/file.js';
      readFileStub.resolves(mockJsFileWithImports);

      // Execute
      const result = await analyzer.analyzeFileImports(filePath);

      // Verify
      expect(readFileStub.calledWith(filePath)).toBe(true);
      expect(result.graph.nodes.length).toBeGreaterThan(0);
      expect(result.graph.links.length).toBeGreaterThan(0);

      // Verify the file node
      const fileNode = result.graph.nodes.find(n => n.path === filePath);
      expect(fileNode).toBeDefined();

      // Verify import nodes
      const importModules = ['module1', 'module2', 'module3', 'dynamicModule', 'module4', 'module5'];
      importModules.forEach(moduleName => {
        const node = result.graph.nodes.find(n => n.name.includes(moduleName));
        expect(node).toBeDefined();
      });
    });

    it('should analyze TypeScript imports including type imports', async () => {
      // Setup
      const filePath = '/test/file.ts';
      readFileStub.resolves(mockTsFileWithImports);

      // Execute
      const result = await analyzer.analyzeFileImports(filePath);

      // Verify
      expect(readFileStub.calledWith(filePath)).toBe(true);

      // Verify import nodes
      const importModules = ['module1', 'module2', 'module3', 'module4', 'dynamicModule', 'module5'];
      importModules.forEach(moduleName => {
        const node = result.graph.nodes.find(n => n.name.includes(moduleName));
        expect(node).toBeDefined();
      });
    });

    it('should handle files with unusual whitespace and formatting', async () => {
      // Setup
      const filePath = '/test/file.js';
      const fileWithUnusualFormatting = `
        import module1
          from
            'module1'  ;
        const   module2 = require(  'module2'  )
      `;
      readFileStub.resolves(fileWithUnusualFormatting);

      // Execute
      const result = await analyzer.analyzeFileImports(filePath);

      // Verify
      const moduleNames = ['module1', 'module2'];
      moduleNames.forEach(moduleName => {
        const node = result.graph.nodes.find(n => n.name.includes(moduleName));
        expect(node).toBeDefined();
      });
    });

    it('should handle relative path imports', async () => {
      // Setup
      const filePath = '/test/file.js';
      const fileWithRelativePaths = `
        import module1 from './relative/path/module1';
        import module2 from '../parent/module2';
        const module3 = require('../../grandparent/module3');
      `;
      readFileStub.resolves(fileWithRelativePaths);
      statStub.resolves({ isDirectory: () => false });

      // Execute
      const result = await analyzer.analyzeFileImports(filePath);

      // Verify
      const importPaths = [
        './relative/path/module1',
        '../parent/module2',
        '../../grandparent/module3'
      ];
      importPaths.forEach(importPath => {
        const node = result.graph.nodes.find(n => n.name.includes(importPath));
        expect(node).toBeDefined();
      });
    });

    it('should throw error if file not found', async () => {
      // Setup
      const filePath = '/test/non-existent-file.js';
      const error = new Error('File not found');
      readFileStub.rejects(error);

      // Execute & Verify
      await expect(analyzer.analyzeFileImports(filePath)).rejects.toThrow();
    });

    it('should handle empty file content', async () => {
      // Setup
      const filePath = '/test/empty-file.js';
      readFileStub.resolves('');

      // Execute
      const result = await analyzer.analyzeFileImports(filePath);

      // Verify
      expect(result.graph.nodes.length).toBe(1); // Just file node
      expect(result.graph.links.length).toBe(0); // No links
    });
  });

  describe('error handling', () => {
    it('should handle malformed import syntax without crashing', async () => {
      // Setup
      const filePath = '/test/malformed.js';
      const malformedContent = `
        import module1 from module1';  // Missing opening quote
        import { from 'module2';       // Unclosed destructuring
        const module3 = require(module3); // Missing quotes
      `;
      readFileStub.resolves(malformedContent);

      // Execute - should not throw
      const result = await analyzer.analyzeFileImports(filePath);

      // Verify - should still have the file node
      expect(result.graph.nodes.length).toBeGreaterThan(0);
    });
  });
});
