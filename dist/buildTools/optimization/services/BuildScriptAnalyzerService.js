"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildScriptAnalyzerService = void 0;
class BuildScriptAnalyzerService {
    BUILD_RELATED_TERMS = ['build', 'webpack', 'rollup', 'vite', 'compile', 'tsc'];
    findBuildScripts(scripts) {
        return Object.entries(scripts)
            .filter(([name, script]) => this.isBuildScript(name, script))
            .map(([name, script]) => ({
            name,
            command: script
        }));
    }
    isBuildScript(name, script) {
        return this.BUILD_RELATED_TERMS.some(term => name.toLowerCase().includes(term) ||
            script.toLowerCase().includes(term));
    }
    analyzeBuildCommand(command) {
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
exports.BuildScriptAnalyzerService = BuildScriptAnalyzerService;
//# sourceMappingURL=BuildScriptAnalyzerService.js.map