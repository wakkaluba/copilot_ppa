import * as vscode from 'vscode';
import { LLMModelInfo } from './llm-provider';
import { ModelDiscoveryService } from './services/ModelDiscoveryService';
import { ModelMetricsService } from './services/ModelMetricsService';
import { ModelValidationService } from './services/ModelValidationService';
import { ModelPerformanceMetrics } from './types';

/**
 * Orchestrates model management, discovery, validation, and metrics
 */
export class ModelService implements vscode.Disposable {
    private readonly statusBarItem: vscode.StatusBarItem;
    private readonly discoveryService: ModelDiscoveryService;
    private readonly metricsService: ModelMetricsService;
    private readonly validationService: ModelValidationService;

    constructor(context: vscode.ExtensionContext) {
        // Initialize services
        this.metricsService = new ModelMetricsService();
        this.validationService = new ModelValidationService();
        this.discoveryService = new ModelDiscoveryService(
            this.metricsService,
            this.validationService
        );

        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'copilot-ppa.configureModel';
        this.statusBarItem.tooltip = 'Configure LLM Model';

        // Register commands
        context.subscriptions.push(
            this.statusBarItem,
            this.discoveryService,
            this.metricsService,
            this.validationService,
            vscode.commands.registerCommand(
                'copilot-ppa.getModelRecommendations',
                this.getModelRecommendations.bind(this)
            ),
            vscode.commands.registerCommand(
                'copilot-ppa.checkModelCompatibility',
                this.checkModelCompatibility.bind(this)
            )
        );

        // Listen for model changes
        this.discoveryService.onDidChangeModels(() => this.updateStatusBar());

        // Initialize status bar
        this.updateStatusBar();
    }

    /**
     * Register a new model
     */
    public async registerModel(model: LLMModelInfo): Promise<void> {
        await this.discoveryService.registerModel(model);
    }

    /**
     * Get all registered models
     */
    public getRegisteredModels(): LLMModelInfo[] {
        return this.discoveryService.getRegisteredModels();
    }

    /**
     * Get model by ID
     */
    public getModel(modelId: string): LLMModelInfo | undefined {
        return this.discoveryService.getModel(modelId);
    }

    /**
     * Get system-compatible models
     */
    public async getModelRecommendations(): Promise<LLMModelInfo[]> {
        return this.discoveryService.getCompatibleModels();
    }

    /**
     * Check model compatibility
     */
    public async checkModelCompatibility(modelId: string): Promise<boolean> {
        const model = this.discoveryService.getModel(modelId);
        if (!model) {
            return false;
        }
        const validation = await this.validationService.validateModel(model);
        return validation.isValid;
    }

    /**
     * Record performance metrics
     */
    public recordMetrics(
        modelId: string,
        responseTime: number,
        tokens: number,
        error?: boolean
    ): void {
        this.metricsService.recordMetrics(modelId, responseTime, tokens, error);
    }

    /**
     * Get model metrics
     */
    public getModelMetrics(modelId: string): ModelPerformanceMetrics | undefined {
        return this.metricsService.getMetrics(modelId);
    }

    /**
     * Reset metrics for a model
     */
    public resetModelMetrics(modelId: string): void {
        this.metricsService.resetMetrics(modelId);
    }

    /**
     * Subscribe to metrics updates
     */
    public onMetricsUpdated(callback: (modelId: string, metrics: ModelPerformanceMetrics) => void): void {
        this.metricsService.onMetricsUpdated(callback);
    }

    /**
     * Update status bar with current model info
     */
    private updateStatusBar(): void {
        const models = this.discoveryService.getRegisteredModels();
        if (models.length === 0) {
            this.statusBarItem.text = '$(hubot) No Models';
            this.statusBarItem.tooltip = 'Click to configure LLM models';
        } else {
            const compatibleModels = models.filter(
                model => this.validationService.validateModel(model)
            );
            this.statusBarItem.text = `$(hubot) Models: ${compatibleModels.length}/${models.length}`;
            this.statusBarItem.tooltip = 'Click to manage LLM models';
        }
        this.statusBarItem.show();
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}