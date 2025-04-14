import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

// Promisify fs functions
const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

export interface DependencyNode {
    id: string;
    name: string;
    path: string;
    type: 'file' | 'package' | 'external';
    size?: number;
}

export interface DependencyLink {
    source: string;
    target: string;
    type: 'import' | 'require' | 'dependency';
    strength?: number;
}

export interface DependencyGraph {
    nodes: DependencyNode[];
    links: DependencyLink[];
}

export interface DependencyInfo {
    name: string;
    version: string;
    isDev: boolean;
    isOptional?: boolean;
    isPeer?: boolean;
}

export interface DependencyAnalysisResult {
    filePath: string;
    graph: DependencyGraph;
}

export class DependencyAnalyzer {
    /**
     * Analyzes dependencies in a JavaScript/TypeScript project
     * @param projectPath Path to the project root
     * @returns Promise with the dependency analysis result
     */
    public async analyzeDependencies(projectPath: string): Promise<DependencyAnalysisResult> {
        const packageJsonPath = path.join(projectPath, 'package.json');
        
        try {
            const packageJsonContent = await readFile(packageJsonPath, 'utf8');
            const packageJson = JSON.parse(packageJsonContent);
            
            const graph = await this.buildDependencyGraph(projectPath, packageJson);
            
            return {
                filePath: packageJsonPath,
                graph
            };
        } catch (error) {
            console.error('Error analyzing dependencies:', error);
            throw new Error(`Failed to analyze dependencies: ${error.message}`);
        }
    }
    
    /**
     * Analyzes imports in a JavaScript/TypeScript file
     * @param filePath Path to the file
     * @returns Promise with the dependency analysis result
     */
    public async analyzeFileImports(filePath: string): Promise<DependencyAnalysisResult> {
        try {
            const fileContent = await readFile(filePath, 'utf8');
            const fileDir = path.dirname(filePath);
            
            const graph = await this.buildFileImportGraph(filePath, fileContent, fileDir);
            
            return {
                filePath,
                graph
            };
        } catch (error) {
            console.error('Error analyzing file imports:', error);
            throw new Error(`Failed to analyze file imports: ${error.message}`);
        }
    }
    
    private async buildDependencyGraph(projectPath: string, packageJson: any): Promise<DependencyGraph> {
        const nodes: DependencyNode[] = [];
        const links: DependencyLink[] = [];
        
        // Add root project node
        const rootNodeId = 'root';
        nodes.push({
            id: rootNodeId,
            name: packageJson.name || 'project',
            path: projectPath,
            type: 'package'
        });
        
        // Process dependencies
        const dependencies = packageJson.dependencies || {};
        const devDependencies = packageJson.devDependencies || {};
        
        for (const [name, version] of Object.entries(dependencies)) {
            const nodeId = `dep_${name}`;
            nodes.push({
                id: nodeId,
                name,
                path: name,
                type: 'external'
            });
            
            links.push({
                source: rootNodeId,
                target: nodeId,
                type: 'dependency'
            });
        }
        
        for (const [name, version] of Object.entries(devDependencies)) {
            const nodeId = `devDep_${name}`;
            nodes.push({
                id: nodeId,
                name,
                path: name,
                type: 'external'
            });
            
            links.push({
                source: rootNodeId,
                target: nodeId,
                type: 'dependency',
                strength: 0.5 // Weaker connection for dev dependencies
            });
        }
        
        return { nodes, links };
    }
    
    private async buildFileImportGraph(filePath: string, fileContent: string, fileDir: string): Promise<DependencyGraph> {
        const nodes: DependencyNode[] = [];
        const links: DependencyLink[] = [];
        
        // Add current file node
        const currentFileId = path.basename(filePath);
        nodes.push({
            id: currentFileId,
            name: path.basename(filePath),
            path: filePath,
            type: 'file',
            size: fileContent.length
        });
        
        // Regular expressions to detect imports
        const importRegex = /import\s+(?:[\w*{}\n\r\t, ]+from\s+)?['"]([^'"]+)['"]/g;
        const requireRegex = /(?:const|let|var)\s+(?:[\w{}\n\r\t, ]+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        
        let match;
        
        // Process ES6 imports
        while ((match = importRegex.exec(fileContent)) !== null) {
            const importPath = match[1];
            await this.addImportToGraph(currentFileId, importPath, fileDir, nodes, links, 'import');
        }
        
        // Process CommonJS requires
        while ((match = requireRegex.exec(fileContent)) !== null) {
            const importPath = match[1];
            await this.addImportToGraph(currentFileId, importPath, fileDir, nodes, links, 'require');
        }
        
        return { nodes, links };
    }
    
    private async addImportToGraph(
        sourceId: string, 
        importPath: string, 
        sourceDir: string, 
        nodes: DependencyNode[], 
        links: DependencyLink[],
        importType: 'import' | 'require'
    ): Promise<void> {
        // Generate a unique ID for the imported module
        const importId = `import_${importPath.replace(/[^\w]/g, '_')}`;
        
        // Determine if it's a node module or local file
        const isNodeModule = !importPath.startsWith('.') && !importPath.startsWith('/');
        
        // Add node if it doesn't exist
        if (!nodes.some(n => n.id === importId)) {
            nodes.push({
                id: importId,
                name: path.basename(importPath),
                path: importPath,
                type: isNodeModule ? 'external' : 'file'
            });
        }
        
        // Add link
        links.push({
            source: sourceId,
            target: importId,
            type: importType
        });
    }
}
