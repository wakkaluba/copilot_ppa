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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMModelService = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
/**
 * Service for managing LLM models
 */
class LLMModelService {
    statusBarItem;
    outputChannel;
    constructor(context) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'copilot-ppa.configureModel';
        this.statusBarItem.tooltip = 'Configure LLM Model';
        context.subscriptions.push(this.statusBarItem);
        this.outputChannel = vscode.window.createOutputChannel('LLM Models');
        context.subscriptions.push(this.outputChannel);
        // Register commands
        context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.getModelRecommendations', this.getModelRecommendations.bind(this)), vscode.commands.registerCommand('copilot-ppa.checkCudaSupport', this.checkCudaSupport.bind(this)), vscode.commands.registerCommand('copilot-ppa.checkModelCompatibility', this.checkModelCompatibility.bind(this)));
        this.updateStatusBar();
    }
    /**
     * Update the status bar with the current model information
     */
    updateStatusBar() {
        const config = vscode.workspace.getConfiguration('localLLM');
        const provider = config.get('provider', 'ollama');
        const modelId = config.get('modelId', 'llama2');
        this.statusBarItem.text = `$(hubot) ${provider}: ${modelId}`;
        this.statusBarItem.show();
    }
    /**
     * Get LLM model recommendations based on the user's system
     */
    async getModelRecommendations() {
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Analyzing system for LLM model recommendations",
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 10, message: "Checking hardware specifications..." });
                // Get hardware specs
                const hwSpecs = await this.getHardwareSpecs();
                progress.report({ increment: 30, message: "Checking available models..." });
                // Get available models from providers
                const ollamaModels = await this.getOllamaModels();
                const lmStudioModels = await this.getLMStudioModels();
                progress.report({ increment: 40, message: "Generating recommendations..." });
                // Generate recommendations based on hardware and available models
                const recommendations = this.generateRecommendations(hwSpecs, [...ollamaModels, ...lmStudioModels]);
                if (recommendations.length === 0) {
                    vscode.window.showInformationMessage('No model recommendations available.');
                    return;
                }
                progress.report({ increment: 20, message: "Preparing results..." });
                // Show recommendations in a quick pick
                const items = recommendations.map(rec => ({
                    label: `${rec.modelInfo.name} (${rec.modelInfo.provider})`,
                    description: `Suitability: ${rec.suitability}%`,
                    detail: rec.reason,
                    recommendation: rec
                }));
                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Select a model to see details or configure',
                    title: 'LLM Model Recommendations'
                });
                if (selected) {
                    this.showModelDetails(selected.recommendation);
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error getting model recommendations: ${error.message}`);
            this.outputChannel.appendLine(`Error in getModelRecommendations: ${error}`);
        }
    }
    /**
     * Show detailed information about a recommended model
     */
    async showModelDetails(recommendation) {
        // Create a markdown string with model details
        const modelDetails = new vscode.MarkdownString();
        modelDetails.isTrusted = true;
        modelDetails.appendMarkdown(`# ${recommendation.modelInfo.name}\n\n`);
        modelDetails.appendMarkdown(`**Provider:** ${recommendation.modelInfo.provider}\n\n`);
        modelDetails.appendMarkdown(`**Suitability Score:** ${recommendation.suitability}%\n\n`);
        modelDetails.appendMarkdown(`**Description:** ${recommendation.modelInfo.description}\n\n`);
        modelDetails.appendMarkdown(`**Why this model:** ${recommendation.reason}\n\n`);
        modelDetails.appendMarkdown('## System Requirements\n\n');
        modelDetails.appendMarkdown(`- RAM: ${recommendation.systemRequirements.minRAM / 1024} GB\n`);
        if (recommendation.systemRequirements.minVRAM) {
            modelDetails.appendMarkdown(`- VRAM: ${recommendation.systemRequirements.minVRAM / 1024} GB\n`);
        }
        if (recommendation.systemRequirements.minCPUCores) {
            modelDetails.appendMarkdown(`- CPU Cores: ${recommendation.systemRequirements.minCPUCores}\n`);
        }
        if (recommendation.systemRequirements.cudaRequired) {
            modelDetails.appendMarkdown(`- CUDA Support: Required\n`);
        }
        if (recommendation.modelInfo.contextLength) {
            modelDetails.appendMarkdown(`\n**Context Length:** ${recommendation.modelInfo.contextLength} tokens\n`);
        }
        if (recommendation.modelInfo.parameters) {
            modelDetails.appendMarkdown(`**Size:** ${recommendation.modelInfo.parameters}B parameters\n`);
        }
        if (recommendation.modelInfo.quantization) {
            modelDetails.appendMarkdown(`**Quantization:** ${recommendation.modelInfo.quantization}\n`);
        }
        modelDetails.appendMarkdown(`\n**Tags:** ${recommendation.modelInfo.tags.join(', ')}\n\n`);
        // Add configuration button
        modelDetails.appendMarkdown('---\n\n');
        modelDetails.appendMarkdown(`[Configure this model](command:copilot-ppa.configureModel?${encodeURIComponent(JSON.stringify({
            provider: recommendation.modelInfo.provider,
            modelId: recommendation.modelInfo.id
        }))})\n\n`);
        // Show in a webview panel
        const panel = vscode.window.createWebviewPanel('modelDetails', `${recommendation.modelInfo.name} Details`, vscode.ViewColumn.One, {
            enableScripts: true,
            enableCommandUris: true
        });
        panel.webview.html = this.getWebviewContent(recommendation);
    }
    /**
     * Get the webview HTML content for model details
     */
    getWebviewContent(recommendation) {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${recommendation.modelInfo.name} Details</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-editor-foreground);
                    padding: 20px;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .suitability {
                    background-color: ${recommendation.suitability > 80 ? 'var(--vscode-terminal-ansiGreen)' :
            recommendation.suitability > 50 ? 'var(--vscode-terminal-ansiYellow)' :
                'var(--vscode-terminal-ansiRed)'};
                    color: var(--vscode-terminal-foreground);
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-weight: bold;
                }
                .section {
                    margin-bottom: 24px;
                }
                .requirements {
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    padding: 10px;
                    border-radius: 4px;
                }
                .tag {
                    display: inline-block;
                    background-color: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 2px 6px;
                    margin: 2px;
                    border-radius: 4px;
                    font-size: 0.85em;
                }
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    cursor: pointer;
                    border-radius: 2px;
                    font-size: 1em;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${recommendation.modelInfo.name}</h1>
                <span class="suitability">Suitability: ${recommendation.suitability}%</span>
            </div>
            
            <div class="section">
                <h3>Provider</h3>
                <p>${recommendation.modelInfo.provider}</p>
            </div>
            
            <div class="section">
                <h3>Description</h3>
                <p>${recommendation.modelInfo.description}</p>
            </div>
            
            <div class="section">
                <h3>Why this model?</h3>
                <p>${recommendation.reason}</p>
            </div>
            
            <div class="section">
                <h3>System Requirements</h3>
                <div class="requirements">
                    <p>RAM: ${recommendation.systemRequirements.minRAM / 1024} GB</p>
                    ${recommendation.systemRequirements.minVRAM ?
            `<p>VRAM: ${recommendation.systemRequirements.minVRAM / 1024} GB</p>` : ''}
                    ${recommendation.systemRequirements.minCPUCores ?
            `<p>CPU Cores: ${recommendation.systemRequirements.minCPUCores}</p>` : ''}
                    ${recommendation.systemRequirements.cudaRequired ?
            `<p>CUDA Support: Required</p>` : ''}
                </div>
            </div>
            
            ${recommendation.modelInfo.contextLength ?
            `<div class="section">
                <h3>Context Length</h3>
                <p>${recommendation.modelInfo.contextLength} tokens</p>
              </div>` : ''}
            
            ${recommendation.modelInfo.parameters ?
            `<div class="section">
                <h3>Size</h3>
                <p>${recommendation.modelInfo.parameters}B parameters</p>
              </div>` : ''}
            
            ${recommendation.modelInfo.quantization ?
            `<div class="section">
                <h3>Quantization</h3>
                <p>${recommendation.modelInfo.quantization}</p>
              </div>` : ''}
            
            <div class="section">
                <h3>Tags</h3>
                <p>
                    ${recommendation.modelInfo.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                </p>
            </div>
            
            <div class="section">
                <button id="configureBtn">Configure This Model</button>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                document.getElementById('configureBtn').addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'configureModel',
                        provider: '${recommendation.modelInfo.provider}',
                        modelId: '${recommendation.modelInfo.id}'
                    });
                });
            </script>
        </body>
        </html>`;
    }
    /**
     * Get hardware specifications for the current system
     */
    async getHardwareSpecs() {
        // In a real implementation, we would use node modules to detect these
        // This is a simplified version
        return {
            gpu: {
                available: true, // Simplified - would actually detect
                name: "Generic GPU",
                vram: 4096, // 4 GB
                cudaSupport: true
            },
            ram: {
                total: 16384, // 16 GB
                free: 8192 // 8 GB
            },
            cpu: {
                cores: 8,
                model: "Generic CPU"
            }
        };
    }
    /**
     * Get models available from Ollama
     */
    async getOllamaModels() {
        try {
            const endpoint = vscode.workspace.getConfiguration('vscodeLocalLLMAgent').get('ollamaEndpoint', 'http://localhost:11434');
            const response = await axios_1.default.get(`${endpoint}/api/tags`, { timeout: 2000 });
            if (response.status === 200 && response.data && response.data.models) {
                return response.data.models.map((model) => ({
                    id: model.name,
                    name: model.name,
                    provider: 'ollama',
                    description: `Ollama model ${model.name}`,
                    tags: ['ollama'],
                    size: model.size
                }));
            }
            return [];
        }
        catch (error) {
            this.outputChannel.appendLine(`Error getting Ollama models: ${error}`);
            return [];
        }
    }
    /**
     * Get models available from LM Studio
     */
    async getLMStudioModels() {
        try {
            const endpoint = vscode.workspace.getConfiguration('vscodeLocalLLMAgent').get('lmStudioEndpoint', 'http://localhost:1234');
            const response = await axios_1.default.get(`${endpoint}/v1/models`, { timeout: 2000 });
            if (response.status === 200 && response.data && response.data.data) {
                return response.data.data.map((model) => ({
                    id: model.id,
                    name: model.id,
                    provider: 'lmstudio',
                    description: `LM Studio model ${model.id}`,
                    tags: ['lmstudio'],
                }));
            }
            return [];
        }
        catch (error) {
            this.outputChannel.appendLine(`Error getting LM Studio models: ${error}`);
            return [];
        }
    }
    /**
     * Generate model recommendations based on hardware specs and available models
     */
    generateRecommendations(hardware, availableModels) {
        const recommendations = [];
        // If no models are available, provide default recommendations
        if (availableModels.length === 0) {
            return this.getDefaultRecommendations(hardware);
        }
        // Process each available model
        for (const model of availableModels) {
            // Calculate suitability score based on model and hardware
            // This is a simplified example - real implementation would have more complex logic
            let suitability = 80; // Base suitability
            let reason = "This model is available on your system and should work well.";
            let systemRequirements = {
                minRAM: 8192, // 8GB default
                minVRAM: hardware.gpu.available ? 2048 : undefined, // 2GB if GPU available
                minCPUCores: 4,
                cudaRequired: false
            };
            // Adjust suitability based on model properties
            if (model.provider === 'ollama') {
                // Adjust for specific Ollama models
                if (model.name.includes('llama')) {
                    if (model.name.includes('13b')) {
                        systemRequirements.minRAM = 16384; // 16GB
                        systemRequirements.minVRAM = 6144; // 6GB
                        systemRequirements.cudaRequired = true;
                        if (hardware.ram.total < systemRequirements.minRAM) {
                            suitability -= 30;
                            reason = "This model may be too large for your system's RAM.";
                        }
                        else if (hardware.gpu.available && hardware.gpu.vram && hardware.gpu.vram < systemRequirements.minVRAM) {
                            suitability -= 20;
                            reason = "This model may run slowly due to limited VRAM.";
                        }
                        else {
                            suitability += 5;
                            reason = "This model is well-suited for your hardware.";
                        }
                    }
                    else if (model.name.includes('7b')) {
                        systemRequirements.minRAM = 8192; // 8GB
                        systemRequirements.minVRAM = 4096; // 4GB
                        if (hardware.ram.total >= 16384) {
                            suitability += 10;
                            reason = "This model is well-suited for your hardware with ample RAM.";
                        }
                    }
                    if (model.name.includes('code')) {
                        reason += " It's optimized for code-related tasks.";
                    }
                }
                else if (model.name.includes('mistral')) {
                    systemRequirements.minRAM = 8192; // 8GB
                    systemRequirements.minVRAM = 4096; // 4GB
                    suitability += 5;
                    reason = "Mistral models typically offer good performance on modest hardware.";
                }
            }
            else if (model.provider === 'lmstudio') {
                // Adjust for LM Studio models
                if (model.name.includes('neural') || model.name.includes('chat')) {
                    suitability += 5;
                    reason = "This model performs well for conversational tasks.";
                }
                if (!hardware.gpu.available || !hardware.gpu.cudaSupport) {
                    suitability -= 15;
                    reason = "LM Studio models perform best with GPU acceleration.";
                }
            }
            // Check actual hardware against requirements
            if (hardware.ram.total < systemRequirements.minRAM) {
                suitability -= 30;
                reason = `This model requires at least ${systemRequirements.minRAM / 1024}GB RAM, but your system has ${hardware.ram.total / 1024}GB.`;
            }
            if (systemRequirements.cudaRequired && (!hardware.gpu.available || !hardware.gpu.cudaSupport)) {
                suitability -= 50;
                reason = "This model requires CUDA support, which was not detected on your system.";
            }
            // Cap suitability between 0-100
            suitability = Math.max(0, Math.min(100, suitability));
            recommendations.push({
                modelInfo: model,
                suitability,
                reason,
                systemRequirements
            });
        }
        // Sort by suitability (descending)
        return recommendations.sort((a, b) => b.suitability - a.suitability);
    }
    /**
     * Get default model recommendations when no models are available
     */
    getDefaultRecommendations(hardware) {
        const recommendations = [];
        // Default recommended models
        const defaultModels = [
            {
                id: 'llama2',
                name: 'Llama 2 (7B)',
                provider: 'ollama',
                description: 'A versatile 7B parameter model that works well on most systems.',
                tags: ['general', 'coding', 'chat'],
                parameters: 7,
                contextLength: 4096,
                quantization: 'Q4_0'
            },
            {
                id: 'mistral',
                name: 'Mistral (7B)',
                provider: 'ollama',
                description: 'A powerful and efficient 7B parameter model with good performance.',
                tags: ['general', 'chat', 'efficient'],
                parameters: 7,
                contextLength: 8192,
                quantization: 'Q4_0'
            },
            {
                id: 'codellama',
                name: 'Code Llama (7B)',
                provider: 'ollama',
                description: 'Specialized model for code generation and understanding.',
                tags: ['coding', 'development'],
                parameters: 7,
                contextLength: 4096,
                quantization: 'Q4_0'
            }
        ];
        // Generate recommendations for default models
        for (const model of defaultModels) {
            let suitability = 70; // Base suitability for recommended models
            let reason = `${model.name} is recommended for general use.`;
            let systemRequirements = {
                minRAM: 8192, // 8GB default
                minVRAM: hardware.gpu.available ? 4096 : undefined,
                minCPUCores: 4,
                cudaRequired: false
            };
            if (model.id === 'codellama') {
                reason = 'Code Llama is optimized for programming tasks.';
                if (hardware.ram.total >= 12288) { // 12GB+
                    suitability += 10;
                    reason += ' Your system has sufficient RAM to run it well.';
                }
            }
            if (model.id === 'mistral') {
                reason = 'Mistral offers great performance with efficient resource usage.';
                if (hardware.ram.total < 8192) {
                    suitability -= 10;
                    reason += ' But your system may have limited RAM.';
                }
            }
            // Adjust based on hardware
            if (hardware.gpu.available && hardware.gpu.cudaSupport) {
                suitability += 15;
                reason += ' GPU acceleration will improve performance.';
            }
            else {
                suitability -= 10;
                reason += ' Performance may be limited without GPU acceleration.';
            }
            recommendations.push({
                modelInfo: model,
                suitability,
                reason,
                systemRequirements
            });
        }
        return recommendations.sort((a, b) => b.suitability - a.suitability);
    }
    /**
     * Check for CUDA support on the system
     */
    async checkCudaSupport() {
        try {
            // In a real implementation, we would use a node module like node-cuda or similar
            // This is a simplified simulation
            const hardwareSpecs = await this.getHardwareSpecs();
            if (hardwareSpecs.gpu.available && hardwareSpecs.gpu.cudaSupport) {
                vscode.window.showInformationMessage(`CUDA support detected. GPU: ${hardwareSpecs.gpu.name}, VRAM: ${hardwareSpecs.gpu.vram / 1024}GB.`);
            }
            else if (hardwareSpecs.gpu.available) {
                vscode.window.showInformationMessage('GPU detected, but CUDA support not available.');
            }
            else {
                vscode.window.showWarningMessage('No GPU with CUDA support detected. LLM models will use CPU only, which may be slower.');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error checking CUDA support: ${error.message}`);
            this.outputChannel.appendLine(`Error in checkCudaSupport: ${error}`);
        }
    }
    /**
     * Check model compatibility with current system
     */
    async checkModelCompatibility() {
        try {
            const config = vscode.workspace.getConfiguration('localLLM');
            const provider = config.get('provider', 'ollama');
            const modelId = config.get('modelId', 'llama2');
            const hardwareSpecs = await this.getHardwareSpecs();
            // Simple compatibility check
            let compatible = true;
            let message = `Model ${modelId} is compatible with your system.`;
            if (provider === 'ollama') {
                if (modelId.includes('13b') || modelId.includes('30b') || modelId.includes('65b')) {
                    // Check for large models
                    if (hardwareSpecs.ram.total < 16384) { // Less than 16GB
                        compatible = false;
                        message = `Model ${modelId} may be too large for your system's RAM (${hardwareSpecs.ram.total / 1024}GB).`;
                    }
                    else if (!hardwareSpecs.gpu.available) {
                        compatible = false;
                        message = `Model ${modelId} requires GPU acceleration for good performance.`;
                    }
                }
            }
            if (compatible) {
                vscode.window.showInformationMessage(message);
            }
            else {
                vscode.window.showWarningMessage(message + ' Consider using a smaller model.');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error checking model compatibility: ${error.message}`);
            this.outputChannel.appendLine(`Error in checkModelCompatibility: ${error}`);
        }
    }
}
exports.LLMModelService = LLMModelService;
//# sourceMappingURL=modelService.js.map