import { BuildScriptAnalyzerService } from './BuildScriptAnalyzerService';
import { BuildScriptInfo, BuildScriptOptimization, OptimizationContext } from '../types';

export class OptimizationGeneratorService {
    private readonly analyzer: BuildScriptAnalyzerService;

    constructor() {
        this.analyzer = new BuildScriptAnalyzerService();
    }

    public async generateOptimizations(buildScripts: BuildScriptInfo[], packageJson: any): Promise<BuildScriptOptimization[]> {
        const optimizations: BuildScriptOptimization[] = [];

        for (const script of buildScripts) {
            const analysis = this.analyzer.analyzeBuildCommand(script.command);
            const context: OptimizationContext = {
                scriptInfo: script,
                packageJson,
                analysis
            };

            optimizations.push(...this.generateCrossEnvOptimizations(context));
            optimizations.push(...this.generateParallelizationOptimizations(context));
            optimizations.push(...this.generateWebpackOptimizations(context));
            optimizations.push(...this.generateTypeScriptOptimizations(context));
            optimizations.push(...this.generateCleanupOptimizations(context));
            optimizations.push(...this.generateCacheOptimizations(context));
            optimizations.push(...this.generateEnvironmentOptimizations(context));
        }

        return optimizations;
    }

    public async applyOptimizations(packageJson: any, optimizations: BuildScriptOptimization[]): Promise<any> {
        let modified = false;
        const updatedPackageJson = { ...packageJson };

        for (const optimization of optimizations) {
            if (!updatedPackageJson.scripts) {
                updatedPackageJson.scripts = {};
            }

            // Find the script that matches the 'before' state
            for (const [name, command] of Object.entries(updatedPackageJson.scripts)) {
                if (command === optimization.before) {
                    updatedPackageJson.scripts[name] = optimization.after;
                    modified = true;
                    break;
                }
            }

            // Add any required packages
            if (optimization.requiredPackages && optimization.requiredPackages.length > 0) {
                if (!updatedPackageJson.devDependencies) {
                    updatedPackageJson.devDependencies = {};
                }
                for (const pkg of optimization.requiredPackages) {
                    if (!updatedPackageJson.devDependencies[pkg]) {
                        updatedPackageJson.devDependencies[pkg] = "^1.0.0"; // Default to latest major version
                        modified = true;
                    }
                }
            }
        }

        return modified ? updatedPackageJson : null;
    }

    private generateCrossEnvOptimizations(context: OptimizationContext): BuildScriptOptimization[] {
        const { scriptInfo, analysis } = context;
        const optimizations: BuildScriptOptimization[] = [];

        if (analysis.hasEnvironmentVars && !scriptInfo.command.includes('cross-env')) {
            optimizations.push({
                title: 'Use cross-env for Cross-Platform Environment Variables',
                description: 'Add cross-env to ensure environment variables work across different platforms',
                benefit: 'Ensures your build scripts work on Windows, macOS, and Linux without platform-specific issues',
                complexity: 'low',
                before: scriptInfo.command,
                after: scriptInfo.command.replace(/(NODE_ENV=[a-zA-Z]+)/, 'cross-env $1'),
                requiredPackages: ['cross-env']
            });
        }

        return optimizations;
    }

    private generateParallelizationOptimizations(context: OptimizationContext): BuildScriptOptimization[] {
        const { scriptInfo, analysis } = context;
        const optimizations: BuildScriptOptimization[] = [];

        if (scriptInfo.command.includes('&&') && !analysis.isParallel) {
            optimizations.push({
                title: 'Use concurrently for Parallel Task Execution',
                description: 'Replace sequential task execution (&&) with concurrent execution for faster builds',
                benefit: 'Can significantly reduce build time when tasks can run in parallel',
                complexity: 'medium',
                before: scriptInfo.command,
                after: `concurrently "${scriptInfo.command.split('&&').map((cmd: string) => cmd.trim()).join('" "')}"`,
                requiredPackages: ['concurrently']
            });
        }

        return optimizations;
    }

    private generateWebpackOptimizations(context: OptimizationContext): BuildScriptOptimization[] {
        const { scriptInfo, analysis } = context;
        const optimizations: BuildScriptOptimization[] = [];

        if (analysis.hasWebpack) {
            if (!scriptInfo.command.includes('--profile') && !scriptInfo.command.includes('--json')) {
                optimizations.push({
                    title: 'Add Build Profiling',
                    description: 'Add --profile flag to analyze webpack build performance',
                    benefit: 'Helps identify bottlenecks in your build process',
                    complexity: 'low',
                    before: scriptInfo.command,
                    after: `${scriptInfo.command} --profile`
                });
            }

            if (!analysis.hasCache) {
                optimizations.push({
                    title: 'Enable Webpack Caching',
                    description: 'Add caching to webpack builds for faster rebuilds',
                    benefit: 'Significantly speeds up incremental builds during development',
                    complexity: 'low',
                    before: scriptInfo.command,
                    after: `${scriptInfo.command} --cache`
                });
            }
        }

        return optimizations;
    }

    private generateTypeScriptOptimizations(context: OptimizationContext): BuildScriptOptimization[] {
        const { scriptInfo, analysis } = context;
        const optimizations: BuildScriptOptimization[] = [];

        if (analysis.hasTypeScript) {
            if (!scriptInfo.command.includes('--incremental')) {
                optimizations.push({
                    title: 'Enable Incremental TypeScript Compilation',
                    description: 'Add --incremental flag to TypeScript compilation',
                    benefit: 'Reduces compilation time by reusing information from previous compilations',
                    complexity: 'low',
                    before: scriptInfo.command,
                    after: `${scriptInfo.command} --incremental`
                });
            }

            if (!scriptInfo.command.includes('--noEmit') && scriptInfo.command.includes('--project') && scriptInfo.command.includes('lint')) {
                optimizations.push({
                    title: 'Use --noEmit for Type Checking Only',
                    description: 'Add --noEmit when running TypeScript for linting/checking only',
                    benefit: 'Speeds up type checking by skipping file generation',
                    complexity: 'low',
                    before: scriptInfo.command,
                    after: `${scriptInfo.command} --noEmit`
                });
            }
        }

        return optimizations;
    }

    private generateCleanupOptimizations(context: OptimizationContext): BuildScriptOptimization[] {
        const { scriptInfo, analysis } = context;
        const optimizations: BuildScriptOptimization[] = [];

        if (scriptInfo.name === 'build' && !analysis.hasCleaning) {
            optimizations.push({
                title: 'Add Clean Step Before Build',
                description: 'Clean output directory before building to prevent stale files',
                benefit: 'Prevents issues with outdated files persisting in your build directory',
                complexity: 'low',
                before: scriptInfo.command,
                after: `rimraf dist && ${scriptInfo.command}`,
                requiredPackages: ['rimraf']
            });
        }

        return optimizations;
    }

    private generateCacheOptimizations(context: OptimizationContext): BuildScriptOptimization[] {
        const { scriptInfo, analysis } = context;
        const optimizations: BuildScriptOptimization[] = [];

        if ((analysis.hasWebpack || analysis.hasRollup || analysis.hasVite) && !analysis.hasCache) {
            const tool = analysis.hasWebpack ? 'webpack' : analysis.hasRollup ? 'rollup' : 'vite';
            optimizations.push({
                title: `Enable ${tool} Build Caching`,
                description: `Add cache configuration for ${tool}`,
                benefit: 'Speeds up subsequent builds by caching build artifacts',
                complexity: 'medium',
                before: scriptInfo.command,
                after: `${scriptInfo.command} --cache`
            });
        }

        return optimizations;
    }

    private generateEnvironmentOptimizations(context: OptimizationContext): BuildScriptOptimization[] {
        const { scriptInfo } = context;
        const optimizations: BuildScriptOptimization[] = [];

        if (scriptInfo.name === 'build' && !scriptInfo.command.includes('NODE_ENV=production')) {
            optimizations.push({
                title: 'Add Production Environment Flag',
                description: 'Specify NODE_ENV=production for production builds',
                benefit: 'Ensures bundlers and tools apply production optimizations',
                complexity: 'low',
                before: scriptInfo.command,
                after: `cross-env NODE_ENV=production ${scriptInfo.command}`,
                requiredPackages: ['cross-env']
            });
        }

        return optimizations;
    }
}