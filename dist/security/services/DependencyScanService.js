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
exports.DependencyScanService = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
class DependencyScanService {
    vulnerabilityService;
    logger;
    constructor(vulnerabilityService) {
        this.vulnerabilityService = vulnerabilityService;
        this.logger = logger_1.Logger.getInstance();
    }
    async scanWorkspace() {
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
        }
        catch (error) {
            this.logger.error('Error scanning workspace dependencies', error);
            throw error;
        }
    }
    async scanNpmDependencies(workspaceUri) {
        try {
            const packageJsonPath = path.join(workspaceUri.fsPath, 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            const vulnerabilities = [];
            const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
            };
            for (const [name, version] of Object.entries(allDeps)) {
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
        }
        catch (error) {
            this.logger.error('Error scanning npm dependencies', error);
            return [];
        }
    }
    async scanPythonDependencies(workspaceUri) {
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
        }
        catch (error) {
            this.logger.error('Error scanning Python dependencies', error);
            return [];
        }
    }
}
exports.DependencyScanService = DependencyScanService;
//# sourceMappingURL=DependencyScanService.js.map