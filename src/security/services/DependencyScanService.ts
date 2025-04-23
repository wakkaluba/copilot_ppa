import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { VulnerabilityService } from './VulnerabilityService';
import { DependencyScanResult } from '../types';
import { Logger } from '../../utils/logger';

export class DependencyScanService {
    private readonly logger: Logger;

    constructor(private readonly vulnerabilityService: VulnerabilityService) {
        this.logger = Logger.getInstance();
    }

    public async scanWorkspace(): Promise<DependencyScanResult> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                return { vulnerabilities: [], hasVulnerabilities: false };
            }

            const vulnerabilities = [];
            for (const folder of workspaceFolders) {
                // Check for npm dependencies
                const npmVulns = await this.scanNpmDependencies(folder.uri);
                vulnerabilities.push(...npmVulns);

                // Check for Python dependencies
                const pythonVulns = await this.scanPythonDependencies(folder.uri);
                vulnerabilities.push(...pythonVulns);
            }

            return {
                vulnerabilities,
                hasVulnerabilities: vulnerabilities.length > 0
            };

        } catch (error) {
            this.logger.error('Error scanning workspace dependencies', error);
            throw error;
        }
    }

    private async scanNpmDependencies(workspaceUri: vscode.Uri): Promise<any[]> {
        try {
            const packageJsonPath = path.join(workspaceUri.fsPath, 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            const vulnerabilities = [];

            const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
            };

            for (const [name, version] of Object.entries<string>(allDeps)) {
                // Clean version string
                const cleanVersion = version.replace(/[^0-9.]/g, '');
                const vulns = await this.vulnerabilityService.checkNpmVulnerabilities(name, cleanVersion);
                if (vulns.length > 0) {
                    vulnerabilities.push({
                        package: name,
                        version: cleanVersion,
                        vulnerabilityInfo: vulns
                    });
                }
            }

            return vulnerabilities;
        } catch (error) {
            this.logger.error('Error scanning npm dependencies', error);
            return [];
        }
    }

    private async scanPythonDependencies(workspaceUri: vscode.Uri): Promise<any[]> {
        try {
            const requirementsPath = path.join(workspaceUri.fsPath, 'requirements.txt');
            const requirements = await fs.readFile(requirementsPath, 'utf8');
            const vulnerabilities = [];

            for (const line of requirements.split('\n')) {
                const [name, version] = line.split('==');
                if (name && version) {
                    const vulns = await this.vulnerabilityService.checkPythonVulnerabilities(name.trim(), version.trim());
                    if (vulns.length > 0) {
                        vulnerabilities.push({
                            package: name.trim(),
                            version: version.trim(),
                            vulnerabilityInfo: vulns
                        });
                    }
                }
            }

            return vulnerabilities;
        } catch (error) {
            this.logger.error('Error scanning Python dependencies', error);
            return [];
        }
    }
}
