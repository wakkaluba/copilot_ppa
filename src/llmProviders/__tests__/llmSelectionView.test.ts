import * as vscode from 'vscode';
import { LLMModel, LLMModelsManager } from '../llmModels';
import { LLMSelectionView } from '../llmSelectionView';

// Create mocks
jest.mock('vscode', () => {
    const originalModule = jest.requireActual('vscode');

    return {
        ...originalModule,
        window: {
            createWebviewPanel: jest.fn(() => ({
                webview: {
                    html: '',
                    onDidReceiveMessage: jest.fn(),
                    postMessage: jest.fn()
                },
                reveal: jest.fn(),
                onDidDispose: jest.fn(),
                dispose: jest.fn()
            })),
            showInformationMessage: jest.fn(),
            showErrorMessage: jest.fn()
        },
        workspace: {
            getConfiguration: jest.fn(() => ({
                update: jest.fn().mockResolvedValue(undefined)
            }))
        },
        Uri: {
            joinPath: jest.fn().mockReturnValue({ toString: () => 'path/to/resource' }),
            parse: jest.fn().mockReturnValue({ toString: () => 'https://example.com' })
        },
        ViewColumn: {
            One: 1,
            Two: 2
        },
        ConfigurationTarget: {
            Global: 1
        },
        env: {
            openExternal: jest.fn()
        }
    };
});

describe('LLMSelectionView', () => {
    let view: LLMSelectionView;
    let mockContext: vscode.ExtensionContext;
    let mockModelsManager: LLMModelsManager;
    let mockPanel: any;
    let modelsChangedCallback: () => void;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create mock for ModelsManager
        mockModelsManager = {
            onModelsChanged: jest.fn((callback: () => void) => {
                modelsChangedCallback = callback;
                return { dispose: jest.fn() };
            }),
            getLocalModels: jest.fn().mockReturnValue([]),
            getHuggingFaceModels: jest.fn().mockReturnValue([]),
            initialize: jest.fn().mockResolvedValue(undefined),
            refreshInstalledModels: jest.fn().mockResolvedValue(undefined),
            getInstalledModels: jest.fn().mockResolvedValue([]),
            getAvailableModels: jest.fn().mockResolvedValue([]),
            getAllModels: jest.fn().mockResolvedValue([]),
            getModel: jest.fn().mockResolvedValue(null),
            downloadModel: jest.fn().mockResolvedValue(undefined),
            downloadOllamaModel: jest.fn().mockResolvedValue(undefined),
            downloadLmStudioModel: jest.fn().mockResolvedValue(undefined),
            deleteModel: jest.fn().mockResolvedValue(undefined),
            checkOllamaStatus: jest.fn().mockResolvedValue({ installed: true, running: true }),
            checkLmStudioStatus: jest.fn().mockResolvedValue({ installed: true }),
            startOllama: jest.fn().mockResolvedValue(undefined),
            stopOllama: jest.fn().mockResolvedValue(undefined),
            getOllamaInstallInstructions: jest.fn().mockReturnValue('curl http://ollama.com | sh'),
            getLmStudioInstallInstructions: jest.fn().mockReturnValue('Download from http://lmstudio.com')
        } as unknown as LLMModelsManager;

        // Create mock for Context
        mockContext = {
            extensionUri: { fsPath: '/path/to/extension' } as vscode.Uri,
            subscriptions: [],
            extensionPath: '/path/to/extension'
        } as unknown as vscode.ExtensionContext;

        // Create the view
        view = new LLMSelectionView(mockContext, mockModelsManager);

        // Mock the panel after creation
        mockPanel = (vscode.window.createWebviewPanel as jest.Mock).mock.results[0]?.value;
    });

    describe('Initialization', () => {
        it('should create a LLMSelectionView and register model change event', () => {
            expect(view).toBeDefined();
            expect(mockModelsManager.onModelsChanged).toHaveBeenCalled();
        });
    });

    describe('show()', () => {
        it('should create and show a webview panel when first called', () => {
            view.show();

            expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
                'llmSelection',
                'LLM Model Selection',
                vscode.ViewColumn.One,
                expect.objectContaining({
                    enableScripts: true,
                    retainContextWhenHidden: true
                })
            );

            expect(mockPanel.webview.onDidReceiveMessage).toHaveBeenCalled();
            expect(mockPanel.onDidDispose).toHaveBeenCalled();
        });

        it('should reveal the panel if it already exists', () => {
            // First call creates the panel
            view.show();

            // Reset the mocks to verify the second call
            (vscode.window.createWebviewPanel as jest.Mock).mockClear();

            // Second call should just reveal the existing panel
            view.show();

            expect(vscode.window.createWebviewPanel).not.toHaveBeenCalled();
            expect(mockPanel.reveal).toHaveBeenCalled();
        });
    });

    describe('updateView()', () => {
        it('should update the webview HTML content', () => {
            // Show the view to create the panel
            view.show();

            // Mock the getWebviewContent method
            const mockHtml = '<html>Test content</html>';
            jest.spyOn(view as any, 'getWebviewContent').mockReturnValue(mockHtml);

            // Call updateView
            (view as any).updateView();

            // Verify the HTML was updated
            expect(mockPanel.webview.html).toBe(mockHtml);
        });

        it('should do nothing if panel is not defined', () => {
            // Create view but don't show it (panel is undefined)
            const testView = new LLMSelectionView(mockContext, mockModelsManager);

            // Mock the getWebviewContent method
            const mockGetWebviewContent = jest.spyOn(testView as any, 'getWebviewContent');

            // Call updateView
            (testView as any).updateView();

            // Verify getWebviewContent was not called
            expect(mockGetWebviewContent).not.toHaveBeenCalled();
        });
    });

    describe('getWebviewContent()', () => {
        it('should generate HTML content with local and Hugging Face models', () => {
            // Mock the models
            const mockLocalModels: LLMModel[] = [
                {
                    id: 'model1',
                    name: 'Model 1',
                    provider: 'ollama',
                    description: 'A test model',
                    installed: true,
                    tags: ['code', 'small']
                }
            ];

            const mockHFModels: LLMModel[] = [
                {
                    id: 'org/model2',
                    name: 'Model 2',
                    provider: 'huggingface',
                    description: 'A HF model',
                    installed: false,
                    tags: ['chat']
                }
            ];

            (mockModelsManager.getLocalModels as jest.Mock).mockReturnValue(mockLocalModels);
            (mockModelsManager.getHuggingFaceModels as jest.Mock).mockReturnValue(mockHFModels);

            // Generate the content
            const html = (view as any).getWebviewContent();

            // Basic verification that the content includes expected elements
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('LLM Model Selection');
            expect(html).toContain('Ollama: Checking');
            expect(html).toContain('LM Studio: Checking');
            expect(html).toContain('Local Models');
            expect(html).toContain('Hugging Face Models');

            // Check for model data
            expect(html).toContain('Model 1');
            expect(html).toContain('A test model');
            expect(html).toContain('Model 2');
            expect(html).toContain('A HF model');
        });
    });

    describe('generateModelCards()', () => {
        it('should generate HTML for model cards', () => {
            const models: LLMModel[] = [
                {
                    id: 'model1',
                    name: 'Test Model',
                    provider: 'ollama',
                    description: 'Description of the test model',
                    size: '3GB',
                    license: 'MIT',
                    installed: true,
                    tags: ['code', 'small']
                },
                {
                    id: 'model2',
                    name: 'Another Model',
                    provider: 'lmstudio',
                    description: 'Another model description',
                    installed: false
                }
            ];

            const result = (view as any).generateModelCards(models);

            // Check first model (installed)
            expect(result).toContain('Test Model');
            expect(result).toContain('Description of the test model');
            expect(result).toContain('Size: 3GB');
            expect(result).toContain('MIT');
            expect(result).toContain('class="model-card installed"');
            expect(result).toContain('class="installed-tag"');
            expect(result).toContain('data-model-id="model1"');
            expect(result).toContain('select-button');

            // Check second model (not installed)
            expect(result).toContain('Another Model');
            expect(result).toContain('Another model description');
            expect(result).toContain('Size: Unknown');
            expect(result).toContain('download-button');
        });

        it('should handle models without tags', () => {
            const models: LLMModel[] = [
                {
                    id: 'model1',
                    name: 'No Tags Model',
                    provider: 'ollama',
                    description: 'A model without tags',
                    installed: false
                }
            ];

            const result = (view as any).generateModelCards(models);

            expect(result).toContain('No Tags Model');
            expect(result).toContain('data-tags=""');
        });
    });

    describe('formatProviderName()', () => {
        it('should format provider names correctly', () => {
            expect((view as any).formatProviderName('ollama')).toBe('Ollama');
            expect((view as any).formatProviderName('lmstudio')).toBe('LM Studio');
            expect((view as any).formatProviderName('huggingface')).toBe('Hugging Face');
            expect((view as any).formatProviderName('custom')).toBe('custom');
        });
    });

    describe('getNonce()', () => {
        it('should generate a random nonce string', () => {
            const nonce1 = (view as any).getNonce();
            const nonce2 = (view as any).getNonce();

            expect(typeof nonce1).toBe('string');
            expect(nonce1.length).toBe(32);
            expect(nonce1).not.toBe(nonce2); // Should be random
        });
    });

    describe('handleWebviewMessage()', () => {
        beforeEach(() => {
            // Show the view to create the panel
            view.show();
        });

        it('should handle checkOllamaStatus message', async () => {
            await (view as any).handleWebviewMessage({ command: 'checkOllamaStatus' });

            expect(mockModelsManager.checkOllamaStatus).toHaveBeenCalled();
            expect(mockPanel.webview.postMessage).toHaveBeenCalledWith({
                command: 'updateOllamaStatus',
                installed: true,
                running: true
            });
        });

        it('should handle checkLmStudioStatus message', async () => {
            await (view as any).handleWebviewMessage({ command: 'checkLmStudioStatus' });

            expect(mockModelsManager.checkLmStudioStatus).toHaveBeenCalled();
            expect(mockPanel.webview.postMessage).toHaveBeenCalledWith({
                command: 'updateLmStudioStatus',
                installed: true
            });
        });

        it('should handle refreshModels message', async () => {
            await (view as any).handleWebviewMessage({ command: 'refreshModels' });

            expect(mockModelsManager.refreshInstalledModels).toHaveBeenCalled();
        });

        it('should handle getOllamaInstallInstructions message', async () => {
            await (view as any).handleWebviewMessage({ command: 'getOllamaInstallInstructions' });

            expect(mockModelsManager.getOllamaInstallInstructions).toHaveBeenCalled();
            expect(mockPanel.webview.postMessage).toHaveBeenCalledWith({
                command: 'showInstallInstructions',
                content: expect.stringContaining('To install Ollama')
            });
        });

        it('should handle getLmStudioInstallInstructions message', async () => {
            await (view as any).handleWebviewMessage({ command: 'getLmStudioInstallInstructions' });

            expect(mockModelsManager.getLmStudioInstallInstructions).toHaveBeenCalled();
            expect(mockPanel.webview.postMessage).toHaveBeenCalledWith({
                command: 'showInstallInstructions',
                content: expect.stringContaining('To install LM Studio')
            });
        });

        it('should handle startOllama message', async () => {
            await (view as any).handleWebviewMessage({ command: 'startOllama' });

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                expect.stringContaining('start Ollama manually')
            );
        });

        it('should handle downloadOllamaModel message', async () => {
            await (view as any).handleWebviewMessage({
                command: 'downloadOllamaModel',
                modelId: 'llama2'
            });

            expect(mockModelsManager.downloadOllamaModel).toHaveBeenCalledWith('llama2');
        });

        it('should handle errors when downloading Ollama models', async () => {
            (mockModelsManager.downloadOllamaModel as jest.Mock).mockRejectedValueOnce(new Error('Download failed'));

            await (view as any).handleWebviewMessage({
                command: 'downloadOllamaModel',
                modelId: 'llama2'
            });

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                'Failed to download model: Download failed'
            );
        });

        it('should handle downloadLmStudioModel message', async () => {
            await (view as any).handleWebviewMessage({
                command: 'downloadLmStudioModel',
                modelId: 'mistral'
            });

            expect(mockModelsManager.downloadLmStudioModel).toHaveBeenCalledWith('mistral');
        });

        it('should handle errors when downloading LM Studio models', async () => {
            (mockModelsManager.downloadLmStudioModel as jest.Mock).mockRejectedValueOnce(new Error('Connection error'));

            await (view as any).handleWebviewMessage({
                command: 'downloadLmStudioModel',
                modelId: 'mistral'
            });

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                'Failed to download model: Connection error'
            );
        });

        it('should handle openHuggingFace message', async () => {
            await (view as any).handleWebviewMessage({
                command: 'openHuggingFace',
                modelId: 'meta-llama/Llama-2-7b'
            });

            expect(vscode.env.openExternal).toHaveBeenCalledWith(
                expect.objectContaining({
                    toString: expect.any(Function)
                })
            );
            expect(vscode.Uri.parse).toHaveBeenCalledWith('https://huggingface.co/meta-llama/Llama-2-7b');
        });

        it('should handle selectModel message', async () => {
            await (view as any).handleWebviewMessage({
                command: 'selectModel',
                modelId: 'llama2',
                provider: 'ollama'
            });

            expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('localLLM');
            expect(vscode.workspace.getConfiguration().update).toHaveBeenCalledWith(
                'provider',
                'ollama',
                vscode.ConfigurationTarget.Global
            );
            expect(vscode.workspace.getConfiguration().update).toHaveBeenCalledWith(
                'modelId',
                'llama2',
                vscode.ConfigurationTarget.Global
            );
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'Selected model "llama2" with provider "ollama"'
            );
        });
    });

    describe('Event Handling', () => {
        it('should update the view when models change', () => {
            // Show the view to create the panel
            view.show();

            // Mock updateView method to check if it's called
            jest.spyOn(view as any, 'updateView');

            // Trigger the models changed event
            modelsChangedCallback();

            // Verify updateView was called
            expect((view as any).updateView).toHaveBeenCalled();
        });

        it('should not update the view when models change if panel is not defined', () => {
            // Create view but don't show it
            const testView = new LLMSelectionView(mockContext, mockModelsManager);

            // Get the callback registered with the models manager
            const callback = (mockModelsManager.onModelsChanged as jest.Mock).mock.calls[0][0];

            // Mock updateView method to check if it's called
            jest.spyOn(testView as any, 'updateView');

            // Trigger the callback
            callback();

            // Verify updateView was not called
            expect((testView as any).updateView).not.toHaveBeenCalled();
        });

        it('should dispose the panel when it is closed', () => {
            // Show the view to create the panel
            view.show();

            // Get the onDidDispose callback
            const disposeCallback = mockPanel.onDidDispose.mock.calls[0][0];

            // Trigger the panel dispose event
            disposeCallback();

            // Try to show again
            (vscode.window.createWebviewPanel as jest.Mock).mockClear();
            view.show();

            // Verify that a new panel is created because the old one was disposed
            expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
        });
    });
});
