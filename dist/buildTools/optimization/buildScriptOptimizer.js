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
exports.BuildScriptOptimizer = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Optimizes build scripts in package.json
 */
class BuildScriptOptimizer {
    /**
     * Searches for package.json files in the workspace
     */
    async findPackageJsonFiles() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return [];
        }
        const packageJsonFiles = [];
        for (const folder of workspaceFolders) {
            const packageJsonPath = path.join(folder.uri.fsPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                packageJsonFiles.push(packageJsonPath);
            }
            // Search in subdirectories for monorepos
            const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, '**/package.json'), new vscode.RelativePattern(folder, '**/node_modules/**'));
            for (const file of files) {
                const filePath = file.fsPath;
                if (!packageJsonFiles.includes(filePath)) {
                    packageJsonFiles.push(filePath);
                }
            }
        }
        return packageJsonFiles;
    }
    /**
     * Analyze and optimize build scripts
     */
    async optimize() {
        const packageJsonFiles = await this.findPackageJsonFiles();
        if (packageJsonFiles.length === 0) {
            vscode.window.showInformationMessage('No package.json files found in the workspace');
            return;
        }
        // If multiple package.json files exist, let the user choose which one to optimize
        let selectedPackageJsonPath;
        if (packageJsonFiles.length === 1) {
            selectedPackageJsonPath = packageJsonFiles[0];
        }
        else {
            const items = packageJsonFiles.map(filePath => ({
                label: path.basename(path.dirname(filePath)),
                description: filePath,
                path: filePath
            }));
            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select a package.json file to optimize'
            });
            if (!selected) {
                return;
            }
            selectedPackageJsonPath = selected.path;
        }
        try {
            const packageJsonContent = fs.readFileSync(selectedPackageJsonPath, 'utf8');
            const packageJson = JSON.parse(packageJsonContent);
            if (!packageJson.scripts) {
                vscode.window.showInformationMessage('No scripts found in the selected package.json');
                return;
            }
            const buildScripts = Object.entries(packageJson.scripts)
                .filter(([key, value]) => key.includes('build') ||
                String(value).includes('build') ||
                String(value).includes('webpack') ||
                String(value).includes('rollup') ||
                String(value).includes('vite'));
            if (buildScripts.length === 0) {
                vscode.window.showInformationMessage('No build scripts found in the selected package.json');
                return;
            }
            const optimizations = await this.analyzeAndGenerateOptimizations(buildScripts, packageJson);
            if (optimizations.length === 0) {
                vscode.window.showInformationMessage('No optimizations available for the build scripts');
                return;
            }
            const selectedOptimizations = await vscode.window.showQuickPick(optimizations.map(opt => ({
                label: opt.name,
                description: opt.description,
                detail: opt.detail,
                optimization: opt
            })), {
                placeHolder: 'Select optimizations to apply',
                canPickMany: true
            });
            if (!selectedOptimizations || selectedOptimizations.length === 0) {
                return;
            }
            const updatedPackageJson = { ...packageJson };
            let hasChanges = false;
            for (const selected of selectedOptimizations) {
                const opt = selected.optimization;
                if (opt.type === 'add') {
                    updatedPackageJson.scripts[opt.scriptKey] = opt.scriptValue;
                    hasChanges = true;
                }
                else if (opt.type === 'modify') {
                    updatedPackageJson.scripts[opt.scriptKey] = opt.scriptValue;
                    hasChanges = true;
                }
            }
            if (hasChanges) {
                fs.writeFileSync(selectedPackageJsonPath, JSON.stringify(updatedPackageJson, null, 2), 'utf8');
                vscode.window.showInformationMessage('Build scripts optimized successfully');
            }
            else {
                vscode.window.showInformationMessage('No changes were made to build scripts');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error optimizing build scripts: ${error}`);
        }
    }
    /**
     * Analyzes build scripts and generates optimization suggestions
     */
    async analyzeAndGenerateOptimizations(buildScripts, packageJson) {
        const optimizations = [];
        // Check for parallel build script
        const hasBuildScript = buildScripts.some(([key]) => key === 'build');
        const hasParallelBuild = buildScripts.some(([key]) => key === 'build:parallel');
        if (hasBuildScript && !hasParallelBuild) {
            optimizations.push({
                type: 'add',
                name: 'Add parallel build script',
                description: 'Creates a new build script that runs tasks in parallel',
                detail: 'Uses npm-run-all to run build tasks in parallel for faster builds',
                scriptKey: 'build:parallel',
                scriptValue: 'run-p build:*'
            });
            // Also suggest adding npm-run-all as a dev dependency if not present
            if (!packageJson.devDependencies?.['npm-run-all']) {
                optimizations.push({
                    type: 'add',
                    name: 'Add npm-run-all dependency',
                    description: 'Adds npm-run-all as a dev dependency',
                    detail: 'Required for running parallel build tasks',
                    scriptKey: 'devDependencies.npm-run-all',
                    scriptValue: '^4.1.5'
                });
            }
        }
        // Check for production build optimization
        const hasProductionBuild = buildScripts.some(([key]) => key === 'build:prod');
        if (hasBuildScript && !hasProductionBuild) {
            optimizations.push({
                type: 'add',
                name: 'Add production build script',
                description: 'Creates an optimized production build script',
                detail: 'Sets NODE_ENV=production for better optimization',
                scriptKey: 'build:prod',
                scriptValue: 'cross-env NODE_ENV=production npm run build'
            });
            // Also suggest adding cross-env as a dev dependency if not present
            if (!packageJson.devDependencies?.['cross-env']) {
                optimizations.push({
                    type: 'add',
                    name: 'Add cross-env dependency',
                    description: 'Adds cross-env as a dev dependency',
                    detail: 'Required for setting environment variables cross-platform',
                    scriptKey: 'devDependencies.cross-env',
                    scriptValue: '^7.0.3'
                });
            }
        }
        // Check for analyze build script
        const hasAnalyzeBuild = buildScripts.some(([key]) => key === 'build:analyze');
        if (hasBuildScript && !hasAnalyzeBuild) {
            let analyzeTool = '';
            let analyzeScript = '';
            if (buildScripts.some(([_, value]) => String(value).includes('webpack'))) {
                analyzeTool = 'webpack-bundle-analyzer';
                analyzeScript = 'webpack --config webpack.config.js --profile --json > stats.json && webpack-bundle-analyzer stats.json';
            }
            else if (buildScripts.some(([_, value]) => String(value).includes('rollup'))) {
                analyzeTool = 'rollup-plugin-visualizer';
                analyzeScript = 'ROLLUP_VISUALIZER=true npm run build';
            }
            else if (buildScripts.some(([_, value]) => String(value).includes('vite'))) {
                analyzeTool = 'rollup-plugin-visualizer';
                analyzeScript = 'VITE_VISUALIZER=true npm run build';
            }
            if (analyzeTool && analyzeScript) {
                optimizations.push({
                    type: 'add',
                    name: 'Add bundle analyzer script',
                    description: `Creates a script to analyze bundle size using ${analyzeTool}`,
                    detail: 'Helps identify large dependencies and optimization opportunities',
                    scriptKey: 'build:analyze',
                    scriptValue: analyzeScript
                });
                // Also suggest adding the analyzer tool as a dev dependency if not present
                if (!packageJson.devDependencies?.[analyzeTool]) {
                    optimizations.push({
                        type: 'add',
                        name: `Add ${analyzeTool} dependency`,
                        description: `Adds ${analyzeTool} as a dev dependency`,
                        detail: 'Required for bundle analysis',
                        scriptKey: `devDependencies.${analyzeTool}`,
                        scriptValue: '^4.4.0'
                    });
                }
            }
        }
        return optimizations;
    }
}
exports.BuildScriptOptimizer = BuildScriptOptimizer;
//# sourceMappingURL=buildScriptOptimizer.js.map