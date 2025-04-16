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
exports.LLMModelsManager = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class LLMModelsManager {
    constructor(context) {
        this.localModels = [];
        this.huggingfaceModels = [];
        this._onModelsChanged = new vscode.EventEmitter();
        this.onModelsChanged = this._onModelsChanged.event;
        this.context = context;
        // Default paths
        this.ollamaBasePath = this.getOllamaBasePath();
        this.lmStudioBasePath = this.getLMStudioBasePath();
        // Initialize models
        this.initializeLocalModels();
        this.initializeHuggingFaceModels();
    }
    /**
     * Gets the path where Ollama stores models
     */
    getOllamaBasePath() {
        const platform = os.platform();
        if (platform === 'win32') {
            return path.join(os.homedir(), 'AppData', 'Local', 'ollama');
        }
        else if (platform === 'darwin') {
            return path.join(os.homedir(), '.ollama');
        }
        else {
            // Linux and others
            return path.join(os.homedir(), '.ollama');
        }
    }
    /**
     * Gets the path where LM Studio stores models
     */
    getLMStudioBasePath() {
        const platform = os.platform();
        if (platform === 'win32') {
            return path.join(os.homedir(), 'AppData', 'Local', 'LM Studio', 'models');
        }
        else if (platform === 'darwin') {
            return path.join(os.homedir(), 'Library', 'Application Support', 'LM Studio', 'models');
        }
        else {
            // Linux and others
            return path.join(os.homedir(), '.local', 'share', 'LM Studio', 'models');
        }
    }
    /**
     * Initialize the list of local models
     */
    async initializeLocalModels() {
        // Default Ollama models
        const ollamaModels = [
            {
                id: 'llama2',
                name: 'Llama 2 (7B)',
                provider: 'ollama',
                description: 'A 7B parameter model optimized for chat and general purpose tasks.',
                tags: ['chat', 'general'],
                size: '3.8GB',
                license: 'Llama 2 Community License'
            },
            {
                id: 'llama2:13b',
                name: 'Llama 2 (13B)',
                provider: 'ollama',
                description: 'A 13B parameter model with improved reasoning capabilities.',
                tags: ['chat', 'reasoning'],
                size: '7.3GB',
                license: 'Llama 2 Community License'
            },
            {
                id: 'codellama',
                name: 'Code Llama (7B)',
                provider: 'ollama',
                description: 'Specialized for code generation and understanding.',
                tags: ['code', 'programming'],
                size: '3.8GB',
                license: 'Llama 2 Community License'
            },
            {
                id: 'mistral',
                name: 'Mistral (7B)',
                provider: 'ollama',
                description: 'A powerful 7B model with strong performance across various tasks.',
                tags: ['general', 'reasoning'],
                size: '4.1GB',
                license: 'Apache 2.0'
            },
            {
                id: 'mixtral',
                name: 'Mixtral (8x7B)',
                provider: 'ollama',
                description: 'Mixture of Experts model with strong performance.',
                tags: ['general', 'reasoning'],
                size: '26GB',
                license: 'Apache 2.0'
            },
            {
                id: 'wizardcoder',
                name: 'WizardCoder (15B)',
                provider: 'ollama',
                description: 'Specialized for coding tasks with great code generation capabilities.',
                tags: ['code', 'programming'],
                size: '8.0GB',
                license: 'Llama 2 Community License'
            },
            {
                id: 'openhermes',
                name: 'OpenHermes (Mistral 7B)',
                provider: 'ollama',
                description: 'Mistral fine-tuned for chat with improved instruction following.',
                tags: ['chat', 'instruction'],
                size: '4.1GB',
                license: 'Apache 2.0'
            }
        ];
        // Default LM Studio compatible models
        const lmStudioModels = [
            {
                id: 'TheBloke/Llama-2-7B-Chat-GGUF',
                name: 'Llama 2 Chat (7B) GGUF',
                provider: 'lmstudio',
                description: 'GGUF version of Llama 2 7B optimized for chat.',
                tags: ['chat', 'general'],
                size: '3.8GB',
                license: 'Llama 2 Community License'
            },
            {
                id: 'TheBloke/CodeLlama-7B-Instruct-GGUF',
                name: 'CodeLlama Instruct (7B) GGUF',
                provider: 'lmstudio',
                description: 'GGUF version of CodeLlama 7B optimized for code generation.',
                tags: ['code', 'programming'],
                size: '3.8GB',
                license: 'Llama 2 Community License'
            },
            {
                id: 'TheBloke/Mistral-7B-Instruct-v0.2-GGUF',
                name: 'Mistral Instruct (7B) GGUF',
                provider: 'lmstudio',
                description: 'GGUF version of Mistral 7B optimized for instruction following.',
                tags: ['general', 'instruction'],
                size: '4.1GB',
                license: 'Apache 2.0'
            },
            {
                id: 'TheBloke/WizardCoder-Python-13B-V1.0-GGUF',
                name: 'WizardCoder Python (13B) GGUF',
                provider: 'lmstudio',
                description: 'GGUF version of WizardCoder 13B specialized for Python.',
                tags: ['code', 'python'],
                size: '7.3GB',
                license: 'Llama 2 Community License'
            },
            {
                id: 'TheBloke/Mixtral-8x7B-Instruct-v0.1-GGUF',
                name: 'Mixtral Instruct (8x7B) GGUF',
                provider: 'lmstudio',
                description: 'GGUF version of Mixtral 8x7B optimized for instruction following.',
                tags: ['general', 'instruction'],
                size: '26GB',
                license: 'Apache 2.0'
            }
        ];
        // Combine models
        this.localModels = [...ollamaModels, ...lmStudioModels];
        // Check installed models
        await this.checkInstalledModels();
        this._onModelsChanged.fire();
    }
    /**
     * Initialize the list of Hugging Face models
     */
    initializeHuggingFaceModels() {
        // Curated list of useful models on Hugging Face
        this.huggingfaceModels = [
            {
                id: 'meta-llama/Llama-2-7b-chat-hf',
                name: 'Llama 2 Chat (7B)',
                provider: 'huggingface',
                description: 'Open foundation language model for chat use cases.',
                tags: ['chat', 'general'],
                size: '13GB',
                license: 'Llama 2 Community License'
            },
            {
                id: 'meta-llama/CodeLlama-7b-hf',
                name: 'CodeLlama (7B)',
                provider: 'huggingface',
                description: 'A code-specialized version of Llama 2.',
                tags: ['code', 'programming'],
                size: '13GB',
                license: 'Llama 2 Community License'
            },
            {
                id: 'mistralai/Mistral-7B-Instruct-v0.2',
                name: 'Mistral Instruct (7B)',
                provider: 'huggingface',
                description: 'Instruction-tuned version of the Mistral 7B model.',
                tags: ['instruction', 'general'],
                size: '14GB',
                license: 'Apache 2.0'
            },
            {
                id: 'WizardLM/WizardCoder-Python-13B-V1.0',
                name: 'WizardCoder Python (13B)',
                provider: 'huggingface',
                description: 'Specialized for Python code generation.',
                tags: ['code', 'python'],
                size: '26GB',
                license: 'Llama 2 Community License'
            },
            {
                id: 'microsoft/Phi-2',
                name: 'Phi-2 (2.7B)',
                provider: 'huggingface',
                description: 'Small yet powerful language model by Microsoft.',
                tags: ['general', 'small'],
                size: '5.8GB',
                license: 'Microsoft Research License'
            },
            {
                id: 'google/gemma-7b-it',
                name: 'Gemma Instruct (7B)',
                provider: 'huggingface',
                description: 'Instruction-tuned version of Google\'s Gemma 7B.',
                tags: ['instruction', 'general'],
                size: '14GB',
                license: 'Gemma License'
            },
            {
                id: 'stabilityai/stablelm-zephyr-3b',
                name: 'StableLM Zephyr (3B)',
                provider: 'huggingface',
                description: 'A lightweight general-purpose chat model.',
                tags: ['chat', 'small'],
                size: '6.4GB',
                license: 'CC BY-SA 4.0'
            },
            {
                id: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
                name: 'TinyLlama Chat (1.1B)',
                provider: 'huggingface',
                description: 'Extremely compact chat model for resource-constrained environments.',
                tags: ['chat', 'tiny'],
                size: '2.2GB',
                license: 'Apache 2.0'
            }
        ];
        this._onModelsChanged.fire();
    }
    /**
     * Check which models are installed
     */
    async checkInstalledModels() {
        // Check Ollama models
        try {
            const response = await axios_1.default.get('http://localhost:11434/api/tags');
            const installedOllamaModels = response.data.models || [];
            // Update installed status
            this.localModels.forEach(model => {
                if (model.provider === 'ollama') {
                    model.installed = installedOllamaModels.some((m) => m.name === model.id);
                }
            });
        }
        catch (error) {
            // Ollama might not be running, that's ok
            console.log('Could not connect to Ollama API to check installed models');
        }
        // Check LM Studio models
        try {
            if (fs.existsSync(this.lmStudioBasePath)) {
                const getAllFiles = (dirPath, arrayOfFiles = []) => {
                    const files = fs.readdirSync(dirPath);
                    files.forEach((file) => {
                        const filePath = path.join(dirPath, file);
                        if (fs.statSync(filePath).isDirectory()) {
                            getAllFiles(filePath, arrayOfFiles);
                        }
                        else {
                            arrayOfFiles.push(filePath);
                        }
                    });
                    return arrayOfFiles;
                };
                const files = getAllFiles(this.lmStudioBasePath);
                // Update installed status for LM Studio models
                this.localModels.forEach(model => {
                    if (model.provider === 'lmstudio') {
                        // Extract model name from id
                        const modelName = model.id.split('/').pop();
                        model.installed = files.some((file) => {
                            const fileName = typeof file === 'string' ? file : file.toString();
                            return fileName.includes(modelName || '');
                        });
                    }
                });
            }
        }
        catch (error) {
            console.log('Could not check installed LM Studio models', error);
        }
        this._onModelsChanged.fire();
    }
    /**
     * Get all local LLM models
     */
    getLocalModels() {
        return [...this.localModels];
    }
    /**
     * Get all Hugging Face models
     */
    getHuggingFaceModels() {
        return [...this.huggingfaceModels];
    }
    /**
     * Refresh the list of installed models
     */
    async refreshInstalledModels() {
        await this.checkInstalledModels();
    }
    /**
     * Download and install a model with Ollama
     */
    async downloadOllamaModel(modelId) {
        const model = this.localModels.find(m => m.id === modelId && m.provider === 'ollama');
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }
        try {
            // Start the download
            const response = await axios_1.default.post('http://localhost:11434/api/pull', {
                name: model.id
            });
            if (response.status !== 200) {
                throw new Error(`Failed to start download: ${response.statusText}`);
            }
            // Return immediately as Ollama handles the download in the background
            // You can provide a way to check download progress if needed
            vscode.window.showInformationMessage(`Started downloading ${model.name}. This may take some time.`);
            // Set up a check to refresh model list after a delay
            setTimeout(() => this.refreshInstalledModels(), 10000);
        }
        catch (error) {
            throw new Error(`Failed to download model: ${error.message || error}`);
        }
    }
    /**
     * Download a model for LM Studio
     */
    async downloadLmStudioModel(modelId) {
        const model = this.localModels.find(m => m.id === modelId && m.provider === 'lmstudio');
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }
        // LM Studio doesn't have a CLI or API for downloads, so we'll open the Hugging Face page
        const huggingFaceUrl = `https://huggingface.co/${model.id}`;
        vscode.env.openExternal(vscode.Uri.parse(huggingFaceUrl));
        vscode.window.showInformationMessage(`Opening Hugging Face page for ${model.name}. Download one of the GGUF variants and place it in your LM Studio models folder.`);
    }
    /**
     * Check if Ollama is installed and running
     */
    async checkOllamaStatus() {
        let installed = false;
        let running = false;
        // Check if Ollama is installed
        try {
            const platform = os.platform();
            if (platform === 'win32') {
                const { stdout } = await execAsync('where ollama');
                installed = stdout.trim().length > 0;
            }
            else {
                const { stdout } = await execAsync('which ollama');
                installed = stdout.trim().length > 0;
            }
        }
        catch (error) {
            // Command not found, Ollama is not installed
            installed = false;
        }
        // Check if Ollama is running
        try {
            await axios_1.default.get('http://localhost:11434/api/version');
            running = true;
        }
        catch (error) {
            running = false;
        }
        return { installed, running };
    }
    /**
     * Check if LM Studio is installed
     */
    async checkLmStudioStatus() {
        let installed = false;
        // Check common installation paths
        const platform = os.platform();
        let lmStudioPath = '';
        if (platform === 'win32') {
            lmStudioPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'LM Studio', 'LM Studio.exe');
        }
        else if (platform === 'darwin') {
            lmStudioPath = '/Applications/LM Studio.app';
        }
        else {
            // Linux - harder to determine, check the models directory
            lmStudioPath = this.lmStudioBasePath;
        }
        installed = fs.existsSync(lmStudioPath);
        return { installed };
    }
    /**
     * Get installation instructions for Ollama
     */
    getOllamaInstallInstructions() {
        const platform = os.platform();
        if (platform === 'win32') {
            return 'Visit https://ollama.com/download and download the Windows installer.';
        }
        else if (platform === 'darwin') {
            return 'Visit https://ollama.com/download and download the macOS installer, or run: curl -fsSL https://ollama.com/install.sh | sh';
        }
        else {
            return 'Run the following command in your terminal: curl -fsSL https://ollama.com/install.sh | sh';
        }
    }
    /**
     * Get installation instructions for LM Studio
     */
    getLmStudioInstallInstructions() {
        return 'Visit https://lmstudio.ai and download the installer for your platform.';
    }
}
exports.LLMModelsManager = LLMModelsManager;
//# sourceMappingURL=llmModels.js.map