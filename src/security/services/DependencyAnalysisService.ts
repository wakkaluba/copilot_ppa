import * as vscode from 'vscode';
import { IDependencyAnalysisService, DependencyScanResult, DependencyVulnerability } from '../types';

export class DependencyAnalysisService implements IDependencyAnalysisService {
    private readonly disposables: vscode.Disposable[] = [];

    public async scanDependencies(): Promise<DependencyScanResult> {
        const vulnerabilities: DependencyVulnerability[] = [];
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders) {
            return {
                vulnerabilities: [],
                hasVulnerabilities: false,
                timestamp: Date.now(),
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
            timestamp: Date.now(),
            totalDependencies: await this.countTotalDependencies()
        };
    }

    private async scanNpmDependencies(workspaceUri: vscode.Uri): Promise<DependencyVulnerability[]> {
        try {
            const packageJsonUri = vscode.Uri.joinPath(workspaceUri, 'package.json');
            const packageLockUri = vscode.Uri.joinPath(workspaceUri, 'package-lock.json');
            
            const vulnerabilities: DependencyVulnerability[] = [];
            
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
                    const vulns = await this.checkNpmVulnerabilities(name, version as string);
                    if (vulns.length > 0) {
                        vulnerabilities.push({
                            name,
                            version: version as string,
                            vulnerabilityInfo: vulns
                        });
                    }
                }
            } catch (err) {
                console.error('Error reading package.json:', err);
            }

            return vulnerabilities;
        } catch (err) {
            console.error('Error scanning npm dependencies:', err);
            return [];
        }
    }

    private async scanPythonDependencies(workspaceUri: vscode.Uri): Promise<DependencyVulnerability[]> {
        try {
            const requirementsUri = vscode.Uri.joinPath(workspaceUri, 'requirements.txt');
            const vulnerabilities: DependencyVulnerability[] = [];

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
            } catch (err) {
                console.error('Error reading requirements.txt:', err);
            }

            return vulnerabilities;
        } catch (err) {
            console.error('Error scanning Python dependencies:', err);
            return [];
        }
    }

    private async scanJavaDependencies(workspaceUri: vscode.Uri): Promise<DependencyVulnerability[]> {
        try {
            const pomXmlUri = vscode.Uri.joinPath(workspaceUri, 'pom.xml');
            const vulnerabilities: DependencyVulnerability[] = [];

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
            } catch (err) {
                console.error('Error reading pom.xml:', err);
            }

            return vulnerabilities;
        } catch (err) {
            console.error('Error scanning Java dependencies:', err);
            return [];
        }
    }

    private async checkNpmVulnerabilities(name: string, version: string): Promise<any[]> {
        // In a real implementation, this would check against npm audit or a vulnerability database
        // This is a simplified version
        return [];
    }

    private async checkPythonVulnerabilities(name: string, version: string): Promise<any[]> {
        // In a real implementation, this would check against PyPI's security advisory database
        // This is a simplified version
        return [];
    }

    private async checkMavenVulnerabilities(groupId: string, artifactId: string, version: string): Promise<any[]> {
        // In a real implementation, this would check against Maven Central's security advisory database
        // This is a simplified version
        return [];
    }

    private async countTotalDependencies(): Promise<number> {
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
                } catch (err) {
                    // package.json doesn't exist or is invalid
                }

                // Count Python dependencies
                const requirementsUri = vscode.Uri.joinPath(folder.uri, 'requirements.txt');
                try {
                    const requirementsContent = await vscode.workspace.fs.readFile(requirementsUri);
                    const requirements = requirementsContent.toString().split('\n');
                    total += requirements.filter(line => line.trim() && !line.startsWith('#')).length;
                } catch (err) {
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
                } catch (err) {
                    // pom.xml doesn't exist
                }
            } catch (err) {
                console.error('Error counting dependencies:', err);
            }
        }

        return total;
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}