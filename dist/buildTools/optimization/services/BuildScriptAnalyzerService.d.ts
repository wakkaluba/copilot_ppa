import { BuildScriptInfo } from '../types';
export declare class BuildScriptAnalyzerService {
    private readonly BUILD_RELATED_TERMS;
    findBuildScripts(scripts: Record<string, string>): BuildScriptInfo[];
    private isBuildScript;
    analyzeBuildCommand(command: string): {
        hasTypeScript: boolean;
        hasWebpack: boolean;
        hasRollup: boolean;
        hasVite: boolean;
        isParallel: boolean;
        hasEnvironmentVars: boolean;
        hasCleaning: boolean;
        hasCache: boolean;
    };
}
