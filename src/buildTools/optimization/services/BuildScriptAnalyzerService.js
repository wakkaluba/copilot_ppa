"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildScriptAnalyzerService = void 0;
var BuildScriptAnalyzerService = /** @class */ (function () {
    function BuildScriptAnalyzerService() {
        this.BUILD_RELATED_TERMS = ['build', 'webpack', 'rollup', 'vite', 'compile', 'tsc'];
    }
    BuildScriptAnalyzerService.prototype.findBuildScripts = function (scripts) {
        var _this = this;
        return Object.entries(scripts)
            .filter(function (_a) {
            var name = _a[0], script = _a[1];
            return _this.isBuildScript(name, script);
        })
            .map(function (_a) {
            var name = _a[0], script = _a[1];
            return ({
                name: name,
                command: script
            });
        });
    };
    BuildScriptAnalyzerService.prototype.isBuildScript = function (name, script) {
        return this.BUILD_RELATED_TERMS.some(function (term) {
            return name.toLowerCase().includes(term) ||
                script.toLowerCase().includes(term);
        });
    };
    BuildScriptAnalyzerService.prototype.analyzeBuildCommand = function (command) {
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
    };
    return BuildScriptAnalyzerService;
}());
exports.BuildScriptAnalyzerService = BuildScriptAnalyzerService;
