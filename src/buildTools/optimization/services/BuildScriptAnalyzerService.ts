import { BuildScriptInfo } from '../types';

export class BuildScriptAnalyzerService {
    private readonly BUILD_RELATED_TERMS = ['build', 'webpack', 'rollup', 'vite', 'compile', 'tsc'];

    public findBuildScripts(scripts: Record<string, string>): BuildScriptInfo[] {
        return Object.entries(scripts)
            .filter(([name, script]) => this.isBuildScript(name, script))
            .map(([name, script]) => ({
                name,
                command: script
            }));
    }

    private isBuildScript(name: string, script: string): boolean {
        return this.BUILD_RELATED_TERMS.some(term => 
            name.toLowerCase().includes(term) || 
            script.toLowerCase().includes(term)
        );
    }

    public analyzeBuildCommand(command: string): {
        hasTypeScript: boolean;
        hasWebpack: boolean;
        hasRollup: boolean;
        hasVite: boolean;
        isParallel: boolean;
        hasEnvironmentVars: boolean;
        hasCleaning: boolean;
        hasCache: boolean;
    } {
        return {
            hasTypeScript: command.includes('tsc'),
            hasWebpack: command.includes('webpack'),
            hasRollup: command.includes('rollup'),
            hasVite: command.includes('vite'),
            isParallel: command.includes('concurrently') || command.includes('npm-run-all'),
            hasEnvironmentVars: command.includes('NODE_ENV='),
            hasCleaning: command.includes('rimraf') || command.includes('del') || command.includes('rm -rf'),
            hasCache: command.includes('cache') || command.includes('--cache')
        };
    }
}