"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildScriptOptimizer = void 0;
const logger_1 = require("../../utils/logger");
const OptimizationGeneratorService_1 = require("./services/OptimizationGeneratorService");
const BuildScriptAnalyzerService_1 = require("./services/BuildScriptAnalyzerService");
const UserInteractionService_1 = require("./services/UserInteractionService");
class BuildScriptOptimizer {
    constructor(buildTools, loggerFactory) {
        this.logger = loggerFactory?.('BuildScriptOptimizer') ?? new logger_1.Logger('BuildScriptOptimizer');
        this.generator = new OptimizationGeneratorService_1.OptimizationGeneratorService();
        this.analyzer = new BuildScriptAnalyzerService_1.BuildScriptAnalyzerService();
        this.ui = new UserInteractionService_1.UserInteractionService();
    }
    async optimizeScript(scriptName, scriptCommand) {
        try {
            this.logger.info(`Analyzing build script: ${scriptName}`);
            const buildScripts = this.analyzer.findBuildScripts({
                [scriptName]: scriptCommand
            });
            if (!buildScripts.length) {
                this.logger.warn('No build scripts found to optimize');
                return [];
            }
            const analysis = this.analyzer.analyzeBuildCommand(scriptCommand);
            const context = {
                scriptInfo: buildScripts[0],
                packageJson: {},
                analysis
            };
            const optimizations = await this.generator.generateOptimizations([buildScripts[0]], {});
            this.logger.info(`Generated ${optimizations.length} optimization suggestions`);
            const selectedOptimizations = await this.ui.selectOptimizations(optimizations);
            if (selectedOptimizations.length > 0) {
                this.ui.showInfo(`Selected ${selectedOptimizations.length} optimizations to apply`);
            }
            return selectedOptimizations;
        }
        catch (error) {
            this.logger.error('Error optimizing build script:', error);
            throw this.wrapError(error);
        }
    }
    wrapError(error) {
        if (error instanceof Error) {
            return error;
        }
        return new Error(`Build script optimization failed: ${String(error)}`);
    }
}
exports.BuildScriptOptimizer = BuildScriptOptimizer;
//# sourceMappingURL=buildScriptOptimizer.js.map