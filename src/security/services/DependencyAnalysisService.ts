import * as vscode from 'vscode';
import { DependencyScanner } from '../dependencyScanner';
import { DependencyScanResult, VulnerabilityInfo, SecuritySummary } from '../types';

/**
 * Service for analyzing project dependencies for security vulnerabilities
 */
export class DependencyAnalysisService implements vscode.Disposable {
    private readonly scanner: DependencyScanner;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.scanner = new DependencyScanner(context);
    }

    public async scanDependencies(
        progressCallback?: (message: string) => void
    ): Promise<DependencyScanResult> {
        try {
            progressCallback?.('Analyzing project dependencies...');
            const dependencies = await this.scanner.getDependencies();
            
            progressCallback?.('Checking for known vulnerabilities...');
            const vulnerabilities = await this.scanner.checkVulnerabilities(dependencies);
            
            progressCallback?.('Generating vulnerability report...');
            const summary = this.generateSummary(vulnerabilities);

            return {
                vulnerabilities,
                totalDependencies: dependencies.length,
                hasVulnerabilities: vulnerabilities.length > 0,
                summary
            };
        } catch (error) {
            throw new Error(`Dependency analysis failed: ${error}`);
        }
    }

    public async getVulnerabilityDetails(vulnId: string): Promise<VulnerabilityInfo | undefined> {
        return this.scanner.getVulnerabilityDetails(vulnId);
    }

    public async analyzePackageJson(): Promise<DependencyScanResult> {
        const result = await this.scanDependencies();
        return this.enrichWithPackageDetails(result);
    }

    public async analyzeNodeModules(): Promise<DependencyScanResult> {
        const result = await this.scanDependencies();
        return this.enrichWithNodeModulesDetails(result);
    }

    private async enrichWithPackageDetails(result: DependencyScanResult): Promise<DependencyScanResult> {
        try {
            const packageJson = await this.readPackageJson();
            return {
                ...result,
                packageJsonPath: packageJson.path,
                packageName: packageJson.name,
                packageVersion: packageJson.version
            };
        } catch {
            return result;
        }
    }

    private async enrichWithNodeModulesDetails(result: DependencyScanResult): Promise<DependencyScanResult> {
        try {
            const nodeModulesInfo = await this.analyzeNodeModulesFolder();
            return {
                ...result,
                nodeModulesSize: nodeModulesInfo.size,
                nodeModulesCount: nodeModulesInfo.count
            };
        } catch {
            return result;
        }
    }

    private generateSummary(vulnerabilities: any[]): SecuritySummary {
        const summary = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };

        vulnerabilities.forEach(vuln => {
            switch (vuln.severity.toLowerCase()) {
                case 'critical':
                    summary.critical++;
                    break;
                case 'high':
                    summary.high++;
                    break;
                case 'medium':
                    summary.medium++;
                    break;
                case 'low':
                    summary.low++;
                    break;
            }
        });

        return summary;
    }

    private async readPackageJson(): Promise<any> {
        try {
            const packageJsonFiles = await vscode.workspace.findFiles('**/package.json', '**/node_modules/**');
            if (packageJsonFiles.length === 0) {
                throw new Error('No package.json found');
            }

            const content = await vscode.workspace.fs.readFile(packageJsonFiles[0]);
            return {
                ...JSON.parse(content.toString()),
                path: packageJsonFiles[0].fsPath
            };
        } catch (error) {
            throw new Error(`Failed to read package.json: ${error}`);
        }
    }

    private async analyzeNodeModulesFolder(): Promise<{ size: number; count: number }> {
        try {
            const nodeModulesFolders = await vscode.workspace.findFiles('**/node_modules', null, 1);
            if (nodeModulesFolders.length === 0) {
                return { size: 0, count: 0 };
            }

            const uri = nodeModulesFolders[0];
            const stats = await vscode.workspace.fs.stat(uri);
            const files = await this.countFiles(uri);

            return {
                size: stats.size,
                count: files
            };
        } catch {
            return { size: 0, count: 0 };
        }
    }

    private async countFiles(uri: vscode.Uri): Promise<number> {
        try {
            const entries = await vscode.workspace.fs.readDirectory(uri);
            let count = entries.length;

            for (const [name, type] of entries) {
                if (type === vscode.FileType.Directory && !name.startsWith('.')) {
                    count += await this.countFiles(vscode.Uri.joinPath(uri, name));
                }
            }

            return count;
        } catch {
            return 0;
        }
    }

    public dispose(): void {
        // Clean up any resources
        this.scanner.dispose();
    }
}