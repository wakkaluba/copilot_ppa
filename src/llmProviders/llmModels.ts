import * as vscode from 'vscode';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface LLMModel {
    id: string;
    name: string;
    provider: 'ollama' | 'lmstudio' | 'huggingface';
    description: string;
    parameters?: Record<string, any>;
    size?: string;
    license?: string;
    tags?: string[];
    installed?: boolean;
}

export class LLMModelsManager {
    private context: vscode.ExtensionContext;
    private localModels: LLMModel[] = [];
    private huggingfaceModels: LLMModel[] = [];
    private _onModelsChanged = new vscode.EventEmitter<void>();
    public readonly onModelsChanged = this._onModelsChanged.event;

    private ollamaBasePath: string;
    private lmStudioBasePath: string;

    constructor(context: vscode.ExtensionContext) {
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
    private getOllamaBasePath(): string {
        const platform = os.platform();
        if (platform === 'win32') {
            return path.join(os.homedir(), 'AppData', 'Local', 'ollama');
        } else if (platform === 'darwin') {
            return path.join(os.homedir(), '.ollama');
        } else {
            // Linux and others
            return path.join(os.homedir(), '.ollama');
        }
    }

    /**
     * Gets the path where LM Studio stores models
     */
    private getLMStudioBasePath(): string {
        const platform = os.platform();
        if (platform === 'win32') {
            return path.join(os.homedir(), 'AppData', 'Local', 'LM Studio', 'models');
        } else if (platform === 'darwin') {
            return path.join(os.homedir(), 'Library', 'Application Support', 'LM Studio', 'models');
        } else {
            // Linux and others
            return path.join(os.homedir(), '.local', 'share', 'LM Studio', 'models');
        }
    }

    /**
     * Initialize the list of local models
     */
    private async initializeLocalModels(): Promise<void> {
        // Default Ollama models
        const ollamaModels: LLMModel[] = [
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
        const lmStudioModels: LLMModel[] = [
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
    private initializeHuggingFaceModels(): void {
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
    private async checkInstalledModels(): Promise<void> {
        // Check Ollama models
        try {
            const response = await axios.get('http://localhost:11434/api/tags');
            const installedOllamaModels = response.data.models || [];
            
            // Update installed status
            this.localModels.forEach(model => {
                if (model.provider === 'ollama') {
                    model.installed = installedOllamaModels.some(
                        (m: any) => m.name === model.id
                    );
                }
            });
        } catch (error) {
            // Ollama might not be running, that's ok
            console.log('Could not connect to Ollama API to check installed models');
        }
        
        // Check LM Studio models
        try {
            if (fs.existsSync(this.lmStudioBasePath)) {
                const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []): string[] => {
                    const files = fs.readdirSync(dirPath);
                    files.forEach((file) => {
                        const filePath = path.join(dirPath, file);
                        if (fs.statSync(filePath).isDirectory()) {
                            getAllFiles(filePath, arrayOfFiles);
                        } else {
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
                        model.installed = files.some((file: any) => {
                            const fileName = typeof file === 'string' ? file : file.toString();
                            return fileName.includes(modelName || '');
                        });
                    }
                });
            }
        } catch (error) {
            console.log('Could not check installed LM Studio models', error);
        }
        
        this._onModelsChanged.fire();
    }

    /**
     * Get all local LLM models
     */
    public getLocalModels(): LLMModel[] {
        return [...this.localModels];
    }

    /**
     * Get all Hugging Face models
     */
    public getHuggingFaceModels(): LLMModel[] {
        return [...this.huggingfaceModels];
    }

    /**
     * Refresh the list of installed models
     */
    public async refreshInstalledModels(): Promise<void> {
        await this.checkInstalledModels();
    }

    /**
     * Download and install a model with Ollama
     */
    public async downloadOllamaModel(modelId: string): Promise<void> {
        const model = this.localModels.find(m => m.id === modelId && m.provider === 'ollama');
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }
        
        try {
            // Start the download
            const response = await axios.post('http://localhost:11434/api/pull', {
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
            
        } catch (error) {
            throw new Error(`Failed to download model: ${error.message || error}`);
        }
    }

    /**
     * Download a model for LM Studio
     */
    public async downloadLmStudioModel(modelId: string): Promise<void> {
        const model = this.localModels.find(m => m.id === modelId && m.provider === 'lmstudio');
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }
        
        // LM Studio doesn't have a CLI or API for downloads, so we'll open the Hugging Face page
        const huggingFaceUrl = `https://huggingface.co/${model.id}`;
        
        vscode.env.openExternal(vscode.Uri.parse(huggingFaceUrl));
        
        vscode.window.showInformationMessage(
            `Opening Hugging Face page for ${model.name}. Download one of the GGUF variants and place it in your LM Studio models folder.`
        );
    }

    /**
     * Check if Ollama is installed and running
     */
    public async checkOllamaStatus(): Promise<{ installed: boolean, running: boolean }> {
        let installed = false;
        let running = false;
        
        // Check if Ollama is installed
        try {
            const platform = os.platform();
            if (platform === 'win32') {
                const { stdout } = await execAsync('where ollama');
                installed = stdout.trim().length > 0;
            } else {
                const { stdout } = await execAsync('which ollama');
                installed = stdout.trim().length > 0;
            }
        } catch (error) {
            // Command not found, Ollama is not installed
            installed = false;
        }
        
        // Check if Ollama is running
        try {
            await axios.get('http://localhost:11434/api/version');
            running = true;
        } catch (error) {
            running = false;
        }
        
        return { installed, running };
    }

    /**
     * Check if LM Studio is installed
     */
    public async checkLmStudioStatus(): Promise<{ installed: boolean }> {
        let installed = false;
        
        // Check common installation paths
        const platform = os.platform();
        let lmStudioPath = '';
        
        if (platform === 'win32') {
            lmStudioPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'LM Studio', 'LM Studio.exe');
        } else if (platform === 'darwin') {
            lmStudioPath = '/Applications/LM Studio.app';
        } else {
            // Linux - harder to determine, check the models directory
            lmStudioPath = this.lmStudioBasePath;
        }
        
        installed = fs.existsSync(lmStudioPath);
        
        return { installed };
    }

    /**
     * Get installation instructions for Ollama
     */
    public getOllamaInstallInstructions(): string {
        const platform = os.platform();
        
        if (platform === 'win32') {
            return 'Visit https://ollama.com/download and download the Windows installer.';
        } else if (platform === 'darwin') {
            return 'Visit https://ollama.com/download and download the macOS installer, or run: curl -fsSL https://ollama.com/install.sh | sh';
        } else {
            return 'Run the following command in your terminal: curl -fsSL https://ollama.com/install.sh | sh';
        }
    }

    /**
     * Get installation instructions for LM Studio
     */
    public getLmStudioInstallInstructions(): string {
        return 'Visit https://lmstudio.ai and download the installer for your platform.';
    }
}
