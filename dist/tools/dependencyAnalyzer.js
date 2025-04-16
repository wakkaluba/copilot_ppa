"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyAnalyzer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
// Promisify fs functions
const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
class DependencyAnalyzer {
    /**
     * Analyzes dependencies in a JavaScript/TypeScript project
     * @param projectPath Path to the project root
     * @returns Promise with the dependency analysis result
     */
    async analyzeDependencies(projectPath) {
        const packageJsonPath = path.join(projectPath, 'package.json');
        try {
            const packageJsonContent = await readFile(packageJsonPath, 'utf8');
            const packageJson = JSON.parse(packageJsonContent);
            const graph = await this.buildDependencyGraph(projectPath, packageJson);
            return {
                filePath: packageJsonPath,
                graph
            };
        }
        catch (error) {
            console.error('Error analyzing dependencies:', error);
            throw new Error(`Failed to analyze dependencies: ${error.message}`);
        }
    }
    /**
     * Analyzes imports in a JavaScript/TypeScript file
     * @param filePath Path to the file
     * @returns Promise with the dependency analysis result
     */
    async analyzeFileImports(filePath) {
        try {
            const fileContent = await readFile(filePath, 'utf8');
            const fileDir = path.dirname(filePath);
            const graph = await this.buildFileImportGraph(filePath, fileContent, fileDir);
            return {
                filePath,
                graph
            };
        }
        catch (error) {
            console.error('Error analyzing file imports:', error);
            throw new Error(`Failed to analyze file imports: ${error.message}`);
        }
    }
    async buildDependencyGraph(projectPath, packageJson) {
        const nodes = [];
        const links = [];
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
    async buildFileImportGraph(filePath, fileContent, fileDir) {
        const nodes = [];
        const links = [];
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
    async addImportToGraph(sourceId, importPath, sourceDir, nodes, links, importType) {
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
exports.DependencyAnalyzer = DependencyAnalyzer;
//# sourceMappingURL=dependencyAnalyzer.js.map