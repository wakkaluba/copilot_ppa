import { EventEmitter } from '../common/eventEmitter';
import * as vscode from 'vscode';
import { ILogger } from '../logging/ILogger';
export declare class BuildToolsManager extends EventEmitter {
    private readonly context;
    private readonly logger;
    private readonly webpackManager;
    private readonly rollupManager;
    private readonly viteManager;
    private buildScriptOptimizer;
    private bundleAnalyzer;
    constructor(context: vscode.ExtensionContext, logger: ILogger);
    private registerCommands;
    detectWebpackConfig(): Promise<void>;
    private analyzeWebpackConfig;
    private getWebpackAnalysisHtml;
    private renderEntryPoints;
    private renderOutputConfig;
    private renderLoaders;
    private renderPlugins;
    private renderOptimizationSuggestions;
    optimizeWebpackConfig(): Promise<void>;
    detectRollupConfig(): Promise<void>;
    optimizeRollupConfig(): Promise<void>;
    detectViteConfig(): Promise<void>;
    optimizeViteConfig(): Promise<void>;
    optimizeBuildScripts(): Promise<void>;
    private showBuildScriptOptimizations;
    private getBuildScriptOptimizationHtml;
    private renderBuildScriptOptimizations;
    private applyBuildScriptOptimization;
    analyzeBundleSize(): Promise<void>;
    private showBundleAnalysis;
    private getBundleAnalysisHtml;
    private formatFileSize;
    private renderBundleFiles;
    private renderBundleRecommendations;
    private detectConfigsForOptimization;
    private showOptimizationOptions;
    private findPackageJson;
    private getOptimizationSuggestionsHtml;
    private renderSharedSuggestions;
    private getRollupAnalysisHtml;
    private renderRollupInput;
    private renderRollupOutput;
    private renderRollupPlugins;
    private renderRollupExternals;
    private renderRollupOptimizationSuggestions;
    private analyzeRollupConfig;
    private getFirstWorkspaceFolder;
    /**
     * Clean up resources when manager is disposed
     */
    dispose(): void;
}
