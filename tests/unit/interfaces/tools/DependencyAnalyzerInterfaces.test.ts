/**
 * Tests for DependencyAnalyzer interfaces
 */
import { 
  DependencyNode, 
  DependencyLink, 
  DependencyGraph, 
  DependencyInfo,
  DependencyAnalysisResult
} from '../../../../src/tools/dependencyAnalyzer';

describe('DependencyNode interface', () => {
  it('should create a file type dependency node with required properties', () => {
    const node: DependencyNode = {
      id: 'file_1',
      name: 'index.ts',
      path: '/src/index.ts',
      type: 'file'
    };

    expect(node).toBeDefined();
    expect(node.id).toBe('file_1');
    expect(node.name).toBe('index.ts');
    expect(node.path).toBe('/src/index.ts');
    expect(node.type).toBe('file');
    expect(node.size).toBeUndefined();
  });

  it('should create a file type dependency node with optional size', () => {
    const node: DependencyNode = {
      id: 'file_2',
      name: 'app.js',
      path: '/src/app.js',
      type: 'file',
      size: 1024
    };

    expect(node).toBeDefined();
    expect(node.id).toBe('file_2');
    expect(node.name).toBe('app.js');
    expect(node.path).toBe('/src/app.js');
    expect(node.type).toBe('file');
    expect(node.size).toBe(1024);
  });

  it('should create a package type dependency node', () => {
    const node: DependencyNode = {
      id: 'package_1',
      name: 'my-package',
      path: '/packages/my-package',
      type: 'package'
    };

    expect(node).toBeDefined();
    expect(node.id).toBe('package_1');
    expect(node.name).toBe('my-package');
    expect(node.path).toBe('/packages/my-package');
    expect(node.type).toBe('package');
  });

  it('should create an external type dependency node', () => {
    const node: DependencyNode = {
      id: 'external_1',
      name: 'lodash',
      path: 'lodash',
      type: 'external'
    };

    expect(node).toBeDefined();
    expect(node.id).toBe('external_1');
    expect(node.name).toBe('lodash');
    expect(node.path).toBe('lodash');
    expect(node.type).toBe('external');
  });
});

describe('DependencyLink interface', () => {
  it('should create an import type dependency link with required properties', () => {
    const link: DependencyLink = {
      source: 'file_1',
      target: 'file_2',
      type: 'import'
    };

    expect(link).toBeDefined();
    expect(link.source).toBe('file_1');
    expect(link.target).toBe('file_2');
    expect(link.type).toBe('import');
    expect(link.strength).toBeUndefined();
  });

  it('should create a require type dependency link with optional strength', () => {
    const link: DependencyLink = {
      source: 'file_3',
      target: 'external_1',
      type: 'require',
      strength: 0.75
    };

    expect(link).toBeDefined();
    expect(link.source).toBe('file_3');
    expect(link.target).toBe('external_1');
    expect(link.type).toBe('require');
    expect(link.strength).toBe(0.75);
  });

  it('should create a dependency type link', () => {
    const link: DependencyLink = {
      source: 'package_1',
      target: 'external_2',
      type: 'dependency',
      strength: 1.0
    };

    expect(link).toBeDefined();
    expect(link.source).toBe('package_1');
    expect(link.target).toBe('external_2');
    expect(link.type).toBe('dependency');
    expect(link.strength).toBe(1.0);
  });
});

describe('DependencyGraph interface', () => {
  it('should create a dependency graph with nodes and links', () => {
    const nodes: DependencyNode[] = [
      {
        id: 'file_1',
        name: 'index.ts',
        path: '/src/index.ts',
        type: 'file'
      },
      {
        id: 'external_1',
        name: 'lodash',
        path: 'lodash',
        type: 'external'
      }
    ];

    const links: DependencyLink[] = [
      {
        source: 'file_1',
        target: 'external_1',
        type: 'import'
      }
    ];

    const graph: DependencyGraph = { nodes, links };

    expect(graph).toBeDefined();
    expect(graph.nodes).toHaveLength(2);
    expect(graph.links).toHaveLength(1);
    expect(graph.nodes[0].id).toBe('file_1');
    expect(graph.nodes[1].id).toBe('external_1');
    expect(graph.links[0].source).toBe('file_1');
    expect(graph.links[0].target).toBe('external_1');
  });

  it('should create an empty dependency graph', () => {
    const graph: DependencyGraph = { nodes: [], links: [] };

    expect(graph).toBeDefined();
    expect(graph.nodes).toHaveLength(0);
    expect(graph.links).toHaveLength(0);
  });
});

describe('DependencyInfo interface', () => {
  it('should create a dependency info with required properties', () => {
    const info: DependencyInfo = {
      name: 'lodash',
      version: '4.17.21',
      isDev: false
    };

    expect(info).toBeDefined();
    expect(info.name).toBe('lodash');
    expect(info.version).toBe('4.17.21');
    expect(info.isDev).toBe(false);
    expect(info.isOptional).toBeUndefined();
    expect(info.isPeer).toBeUndefined();
  });

  it('should create a dependency info with optional properties', () => {
    const info: DependencyInfo = {
      name: 'typescript',
      version: '4.9.5',
      isDev: true,
      isOptional: false,
      isPeer: false
    };

    expect(info).toBeDefined();
    expect(info.name).toBe('typescript');
    expect(info.version).toBe('4.9.5');
    expect(info.isDev).toBe(true);
    expect(info.isOptional).toBe(false);
    expect(info.isPeer).toBe(false);
  });

  it('should create an optional dependency info', () => {
    const info: DependencyInfo = {
      name: 'prettier',
      version: '2.8.4',
      isDev: true,
      isOptional: true
    };

    expect(info).toBeDefined();
    expect(info.name).toBe('prettier');
    expect(info.version).toBe('2.8.4');
    expect(info.isDev).toBe(true);
    expect(info.isOptional).toBe(true);
  });

  it('should create a peer dependency info', () => {
    const info: DependencyInfo = {
      name: 'react',
      version: '^18.0.0',
      isDev: false,
      isPeer: true
    };

    expect(info).toBeDefined();
    expect(info.name).toBe('react');
    expect(info.version).toBe('^18.0.0');
    expect(info.isDev).toBe(false);
    expect(info.isPeer).toBe(true);
  });
});

describe('DependencyAnalysisResult interface', () => {
  it('should create a dependency analysis result', () => {
    const nodes: DependencyNode[] = [
      {
        id: 'file_1',
        name: 'index.ts',
        path: '/src/index.ts',
        type: 'file'
      }
    ];

    const links: DependencyLink[] = [];
    const graph: DependencyGraph = { nodes, links };

    const result: DependencyAnalysisResult = {
      filePath: '/project/package.json',
      graph
    };

    expect(result).toBeDefined();
    expect(result.filePath).toBe('/project/package.json');
    expect(result.graph).toBe(graph);
    expect(result.graph.nodes).toHaveLength(1);
    expect(result.graph.links).toHaveLength(0);
  });
});

/**
 * Mock factory functions for dependency analyzer interfaces
 */

export function createMockDependencyNode(overrides?: Partial<DependencyNode>): DependencyNode {
  const defaultNode: DependencyNode = {
    id: 'mock-node-1',
    name: 'mock-file.ts',
    path: '/src/mock-file.ts',
    type: 'file',
  };

  return { ...defaultNode, ...overrides };
}

export function createMockDependencyLink(overrides?: Partial<DependencyLink>): DependencyLink {
  const defaultLink: DependencyLink = {
    source: 'mock-node-1',
    target: 'mock-node-2',
    type: 'import'
  };

  return { ...defaultLink, ...overrides };
}

export function createMockDependencyGraph(overrides?: Partial<DependencyGraph>): DependencyGraph {
  const defaultGraph: DependencyGraph = {
    nodes: [
      createMockDependencyNode({ id: 'mock-node-1' }),
      createMockDependencyNode({ id: 'mock-node-2', name: 'another-file.ts', path: '/src/another-file.ts' })
    ],
    links: [
      createMockDependencyLink({ source: 'mock-node-1', target: 'mock-node-2' })
    ]
  };

  return { ...defaultGraph, ...overrides };
}

export function createMockDependencyInfo(overrides?: Partial<DependencyInfo>): DependencyInfo {
  const defaultInfo: DependencyInfo = {
    name: 'mock-package',
    version: '1.0.0',
    isDev: false
  };

  return { ...defaultInfo, ...overrides };
}

export function createMockDependencyAnalysisResult(overrides?: Partial<DependencyAnalysisResult>): DependencyAnalysisResult {
  const defaultResult: DependencyAnalysisResult = {
    filePath: '/mock/package.json',
    graph: createMockDependencyGraph()
  };

  return { ...defaultResult, ...overrides };
}