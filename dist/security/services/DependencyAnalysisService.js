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
exports.DependencyAnalysisService = void 0;
const vscode = __importStar(require("vscode"));
class DependencyAnalysisService {
    disposables = [];
    async scanDependencies() {
        const vulnerabilities = [];
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return {
                vulnerabilities: [],
                hasVulnerabilities: false,
                timestamp: new Date(),
                totalDependencies: 0
            };
        }
        for (const folder of workspaceFolders) {
            // Scan package.json for npm dependencies
            const packageJsonVulns = await this.scanNpmDependencies(folder.uri);
            vulnerabilities.push(...packageJsonVulns);
            // Scan requirements.txt for Python dependencies
            const pythonVulns = await this.scanPythonDependencies(folder.uri);
            vulnerabilities.push(...pythonVulns);
            // Scan pom.xml for Java dependencies
            const javaVulns = await this.scanJavaDependencies(folder.uri);
            vulnerabilities.push(...javaVulns);
        }
        return {
            vulnerabilities,
            hasVulnerabilities: vulnerabilities.length > 0,
            timestamp: new Date(),
            totalDependencies: await this.countTotalDependencies()
        };
    }
    async scanNpmDependencies(workspaceUri) {
        try {
            const packageJsonUri = vscode.Uri.joinPath(workspaceUri, 'package.json');
            const packageLockUri = vscode.Uri.joinPath(workspaceUri, 'package-lock.json');
            const vulnerabilities = [];
            try {
                const packageJsonContent = await vscode.workspace.fs.readFile(packageJsonUri);
                const packageJson = JSON.parse(packageJsonContent.toString());
                // Analyze both dependencies and devDependencies
                const allDeps = {
                    ...packageJson.dependencies,
                    ...packageJson.devDependencies
                };
                // Check each dependency against known vulnerability databases
                for (const [name, version] of Object.entries(allDeps)) {
                    const vulns = await this.checkNpmVulnerabilities(name, version);
                    if (vulns.length > 0) {
                        vulnerabilities.push({
                            name,
                            version: version,
                            vulnerabilityInfo: vulns
                        });
                    }
                }
            }
            catch (err) {
                console.error('Error reading package.json:', err);
            }
            return vulnerabilities;
        }
        catch (err) {
            console.error('Error scanning npm dependencies:', err);
            return [];
        }
    }
    async scanPythonDependencies(workspaceUri) {
        try {
            const requirementsUri = vscode.Uri.joinPath(workspaceUri, 'requirements.txt');
            const vulnerabilities = [];
            try {
                const requirementsContent = await vscode.workspace.fs.readFile(requirementsUri);
                const requirements = requirementsContent.toString().split('\n');
                for (const requirement of requirements) {
                    const [name, version] = requirement.split('==');
                    if (name && version) {
                        const vulns = await this.checkPythonVulnerabilities(name.trim(), version.trim());
                        if (vulns.length > 0) {
                            vulnerabilities.push({
                                name,
                                version,
                                vulnerabilityInfo: vulns
                            });
                        }
                    }
                }
            }
            catch (err) {
                console.error('Error reading requirements.txt:', err);
            }
            return vulnerabilities;
        }
        catch (err) {
            console.error('Error scanning Python dependencies:', err);
            return [];
        }
    }
    async scanJavaDependencies(workspaceUri) {
        try {
            const pomXmlUri = vscode.Uri.joinPath(workspaceUri, 'pom.xml');
            const vulnerabilities = [];
            try {
                const pomContent = await vscode.workspace.fs.readFile(pomXmlUri);
                // Parse pom.xml and check for vulnerabilities
                // This is a simplified version - in practice you'd want to use a proper XML parser
                const pomXml = pomContent.toString();
                const depRegex = /<dependency>[\s\S]*?<groupId>(.*?)<\/groupId>[\s\S]*?<artifactId>(.*?)<\/artifactId>[\s\S]*?<version>(.*?)<\/version>[\s\S]*?<\/dependency>/g;
                let match;
                while ((match = depRegex.exec(pomXml)) !== null) {
                    const [, groupId, artifactId, version] = match;
                    const vulns = await this.checkMavenVulnerabilities(groupId, artifactId, version);
                    if (vulns.length > 0) {
                        vulnerabilities.push({
                            name: `${groupId}:${artifactId}`,
                            version,
                            vulnerabilityInfo: vulns
                        });
                    }
                }
            }
            catch (err) {
                console.error('Error reading pom.xml:', err);
            }
            return vulnerabilities;
        }
        catch (err) {
            console.error('Error scanning Java dependencies:', err);
            return [];
        }
    }
    async checkNpmVulnerabilities(name, version) {
        // In a real implementation, this would check against npm audit or a vulnerability database
        // This is a simplified version
        return [];
    }
    async checkPythonVulnerabilities(name, version) {
        // In a real implementation, this would check against PyPI's security advisory database
        // This is a simplified version
        return [];
    }
    async checkMavenVulnerabilities(groupId, artifactId, version) {
        // In a real implementation, this would check against Maven Central's security advisory database
        // This is a simplified version
        return [];
    }
    async countTotalDependencies() {
        let total = 0;
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return 0;
        }
        for (const folder of workspaceFolders) {
            try {
                // Count npm dependencies
                const packageJsonUri = vscode.Uri.joinPath(folder.uri, 'package.json');
                try {
                    const packageJsonContent = await vscode.workspace.fs.readFile(packageJsonUri);
                    const packageJson = JSON.parse(packageJsonContent.toString());
                    total += Object.keys(packageJson.dependencies || {}).length;
                    total += Object.keys(packageJson.devDependencies || {}).length;
                }
                catch (err) {
                    // package.json doesn't exist or is invalid
                }
                // Count Python dependencies
                const requirementsUri = vscode.Uri.joinPath(folder.uri, 'requirements.txt');
                try {
                    const requirementsContent = await vscode.workspace.fs.readFile(requirementsUri);
                    const requirements = requirementsContent.toString().split('\n');
                    total += requirements.filter(line => line.trim() && !line.startsWith('#')).length;
                }
                catch (err) {
                    // requirements.txt doesn't exist
                }
                // Count Java dependencies
                const pomXmlUri = vscode.Uri.joinPath(folder.uri, 'pom.xml');
                try {
                    const pomContent = await vscode.workspace.fs.readFile(pomXmlUri);
                    const pomXml = pomContent.toString();
                    const depMatches = pomXml.match(/<dependency>/g);
                    if (depMatches) {
                        total += depMatches.length;
                    }
                }
                catch (err) {
                    // pom.xml doesn't exist
                }
            }
            catch (err) {
                console.error('Error counting dependencies:', err);
            }
        }
        return total;
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.DependencyAnalysisService = DependencyAnalysisService;
//# sourceMappingURL=DependencyAnalysisService.js.map