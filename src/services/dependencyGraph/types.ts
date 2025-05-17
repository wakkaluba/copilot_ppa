export interface DependencyNode {
  id: string;
  path: string;
  type: 'file' | 'package' | 'workspace';
  dependencies: string[];
  metadata?: Record<string, unknown>;
}

export interface DependencyLink {
  source: string;
  target: string;
  type: 'import' | 'devDependency' | 'dependency';
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  links: DependencyLink[];
}
