import * as vscode from 'vscode';
import { BuildToolsManager } from '../buildToolsManager';
import { BuildScriptOptimization, OptimizationContext } from './types';
import { Logger } from '../../utils/logger';
import { OptimizationGeneratorService } from './services/OptimizationGeneratorService';
import { BuildScriptAnalyzerService } from './services/BuildScriptAnalyzerService';
import { UserInteractionService } from './services/UserInteractionService';

export class BuildScriptOptimizer {
    private readonly logger: Logger;
    private readonly generator: OptimizationGeneratorService;
    private readonly analyzer: BuildScriptAnalyzerService;
    private readonly ui: UserInteractionService;

    constructor(
        buildTools: BuildToolsManager,
        loggerFactory?: (category: string) => Logger
    ) {
        this.logger = loggerFactory?.('BuildScriptOptimizer') ?? new Logger('BuildScriptOptimizer');
        this.generator = new OptimizationGeneratorService();
        this.analyzer = new BuildScriptAnalyzerService();
        this.ui = new UserInteractionService();
    }

    public async optimizeScript(scriptName: string, scriptCommand: string): Promise<BuildScriptOptimization[]> {
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
            const context: OptimizationContext = {
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

        } catch (error) {
            this.logger.error('Error optimizing build script:', error);
            throw this.wrapError(error);
        }
    }

    private wrapError(error: unknown): Error {
        if (error instanceof Error) {
            return error;
        }
        return new Error(`Build script optimization failed: ${String(error)}`);
    }
}
