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
const dependencyScanner_1 = require("../dependencyScanner");
/**
 * Service for analyzing project dependencies for security vulnerabilities
 */
class DependencyAnalysisService {
    context;
    scanner;
    constructor(context) {
        this.context = context;
        this.scanner = new dependencyScanner_1.DependencyScanner(context);
    }
    async scanDependencies(progressCallback) {
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
        }
        catch (error) {
            throw new Error(`Dependency analysis failed: ${error}`);
        }
    }
    async getVulnerabilityDetails(vulnId) {
        return this.scanner.getVulnerabilityDetails(vulnId);
    }
    async analyzePackageJson() {
        const result = await this.scanDependencies();
        return this.enrichWithPackageDetails(result);
    }
    async analyzeNodeModules() {
        const result = await this.scanDependencies();
        return this.enrichWithNodeModulesDetails(result);
    }
    async enrichWithPackageDetails(result) {
        try {
            const packageJson = await this.readPackageJson();
            return {
                ...result,
                packageJsonPath: packageJson.path,
                packageName: packageJson.name,
                packageVersion: packageJson.version
            };
        }
        catch {
            return result;
        }
    }
    async enrichWithNodeModulesDetails(result) {
        try {
            const nodeModulesInfo = await this.analyzeNodeModulesFolder();
            return {
                ...result,
                nodeModulesSize: nodeModulesInfo.size,
                nodeModulesCount: nodeModulesInfo.count
            };
        }
        catch {
            return result;
        }
    }
    generateSummary(vulnerabilities) {
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
    async readPackageJson() {
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
        }
        catch (error) {
            throw new Error(`Failed to read package.json: ${error}`);
        }
    }
    async analyzeNodeModulesFolder() {
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
        }
        catch {
            return { size: 0, count: 0 };
        }
    }
    async countFiles(uri) {
        try {
            const entries = await vscode.workspace.fs.readDirectory(uri);
            let count = entries.length;
            for (const [name, type] of entries) {
                if (type === vscode.FileType.Directory && !name.startsWith('.')) {
                    count += await this.countFiles(vscode.Uri.joinPath(uri, name));
                }
            }
            return count;
        }
        catch {
            return 0;
        }
    }
    dispose() {
        // Clean up any resources
        this.scanner.dispose();
    }
}
exports.DependencyAnalysisService = DependencyAnalysisService;
//# sourceMappingURL=DependencyAnalysisService.js.map