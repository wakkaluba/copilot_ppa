// filepath: d:\___coding\tools\copilot_ppa\src\llm\__tests__\providerManager.js.test.ts
import * as vscode from 'vscode';
import { SupportedLanguage } from '../../i18n';
import { ConnectionStatusService } from '../../status/connectionStatusService';
import { LLMProvider, LLMRequestOptions } from '../llm-provider';
import { LLMProviderManager as MainLLMProviderManager } from '../llmProviderManager';
import { MultilingualPromptManager } from '../multilingualPromptManager';
import { LLMProviderManager } from '../providerManager.js';

// Mock dependencies
jest.mock('../multilingualPromptManager');
jest.mock('../llmProviderManager');
jest.mock('../../status/connectionStatusService');
jest.mock('vscode', () => ({
    ExtensionContext: jest.fn(),
    window: {
        showInformationMessage: jest.fn(),
        showErrorMessage: jest.fn()
    }
}), { virtual: true });

describe('LLMProviderManager (JavaScript)', () => {
    let providerManager: LLMProviderManager;
    let mockContext: vscode.ExtensionContext;
    let mockMainProviderManager: jest.Mocked<MainLLMProviderManager>;
    let mockMultilingualManager: jest.Mocked<MultilingualPromptManager>;
    let mockStatusService: jest.Mocked<ConnectionStatusService>;
    let mockProvider: jest.Mocked<LLMProvider>;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create mock context
        mockContext = {} as vscode.ExtensionContext;

        // Setup mock provider
        mockProvider = {
            getStatus: jest.fn().mockReturnValue({ activeModel: 'test-model-js' }),
            sendPrompt: jest.fn(),
            sendStreamingPrompt: jest.fn(),
            isAvailable: jest.fn(),
            getModels: jest.fn()
        } as unknown as jest.Mocked<LLMProvider>;

        // Setup mock main provider manager
        mockMainProviderManager = {
            getInstance: jest.fn().mockReturnThis(),
            sendPromptWithLanguage: jest.fn().mockResolvedValue('mock js response'),
            sendPrompt: jest.fn().mockResolvedValue('mock js response'),
            sendStreamingPrompt: jest.fn().mockImplementation((prompt, callback, options) => {
                callback('js chunk 1');
                callback('js chunk 2');
                return Promise.resolve('js chunk 1js chunk 2');
            }),
            getActiveProvider: jest.fn().mockReturnValue(mockProvider)
        } as unknown as jest.Mocked<MainLLMProviderManager>;

        // Setup connection status service
        mockStatusService = new ConnectionStatusService() as jest.Mocked<ConnectionStatusService>;

        // Setup multilingual manager
        mockMultilingualManager = new MultilingualPromptManager() as jest.Mocked<MultilingualPromptManager>;

        // Setup MainLLMProviderManager mock
        (MainLLMProviderManager.getInstance as jest.Mock).mockReturnValue(mockMainProviderManager);

        // Create instance of provider manager under test
        providerManager = new LLMProviderManager(mockContext);
    });

    describe('constructor', () => {
        it('should initialize with the required dependencies', () => {
            expect(providerManager).toBeDefined();
            expect(MultilingualPromptManager).toHaveBeenCalled();
            expect(ConnectionStatusService).toHaveBeenCalled();
            expect(MainLLMProviderManager.getInstance).toHaveBeenCalledWith(
                expect.any(ConnectionStatusService)
            );
        });
    });

    describe('sendPromptWithLanguage', () => {
        it('should delegate to the main provider manager', async () => {
            const prompt = 'test js prompt';
            const options: LLMRequestOptions = { temperature: 0.8 };
            const targetLanguage: SupportedLanguage = 'de';

            const result = await providerManager.sendPromptWithLanguage(prompt, options, targetLanguage);

            expect(mockMainProviderManager.sendPromptWithLanguage).toHaveBeenCalledWith(
                prompt, options, targetLanguage
            );
            expect(result).toBe('mock js response');
        });

        it('should work with default options', async () => {
            const prompt = 'test js prompt';

            const result = await providerManager.sendPromptWithLanguage(prompt);

            expect(mockMainProviderManager.sendPromptWithLanguage).toHaveBeenCalledWith(
                prompt, undefined, undefined
            );
            expect(result).toBe('mock js response');
        });
    });

    describe('getCurrentProvider', () => {
        it('should return the active provider when available', () => {
            const result = providerManager.getCurrentProvider();

            expect(mockMainProviderManager.getActiveProvider).toHaveBeenCalled();
            expect(result).toBe(mockProvider);
        });

        it('should throw an error when no provider is active', () => {
            // Mock getActiveProvider to return null
            mockMainProviderManager.getActiveProvider.mockReturnValueOnce(null);

            expect(() => providerManager.getCurrentProvider()).toThrow('No LLM provider is currently active');
        });
    });

    describe('getCurrentModelId', () => {
        it('should return the active model ID', () => {
            const result = providerManager.getCurrentModelId();

            expect(mockMainProviderManager.getActiveProvider).toHaveBeenCalled();
            expect(mockProvider.getStatus).toHaveBeenCalled();
            expect(result).toBe('test-model-js');
        });

        it('should return empty string when no active model', () => {
            // Mock getStatus to return an object without activeModel
            mockProvider.getStatus.mockReturnValueOnce({});

            const result = providerManager.getCurrentModelId();

            expect(result).toBe('');
        });
    });

    describe('sendPrompt', () => {
        it('should delegate to the main provider manager', async () => {
            const prompt = 'test js prompt';
            const options: LLMRequestOptions = { temperature: 0.8 };

            const result = await providerManager.sendPrompt(prompt, options);

            expect(mockMainProviderManager.sendPrompt).toHaveBeenCalledWith(prompt, options);
            expect(result).toBe('mock js response');
        });

        it('should work with default options', async () => {
            const prompt = 'test js prompt';

            const result = await providerManager.sendPrompt(prompt);

            expect(mockMainProviderManager.sendPrompt).toHaveBeenCalledWith(prompt, undefined);
            expect(result).toBe('mock js response');
        });
    });

    describe('sendStreamingPrompt', () => {
        it('should delegate to the main provider manager and process chunks', async () => {
            const prompt = 'test js prompt';
            const options: LLMRequestOptions = { temperature: 0.8 };
            const callback = jest.fn();

            const result = await providerManager.sendStreamingPrompt(prompt, callback, options);

            expect(mockMainProviderManager.sendStreamingPrompt).toHaveBeenCalledWith(
                prompt, callback, options
            );
            expect(callback).toHaveBeenCalledWith('js chunk 1');
            expect(callback).toHaveBeenCalledWith('js chunk 2');
            expect(result).toBe('js chunk 1js chunk 2');
        });

        it('should work with default options', async () => {
            const prompt = 'test js prompt';
            const callback = jest.fn();

            const result = await providerManager.sendStreamingPrompt(prompt, callback);

            expect(mockMainProviderManager.sendStreamingPrompt).toHaveBeenCalledWith(
                prompt, callback, undefined
            );
            expect(result).toBe('js chunk 1js chunk 2');
        });

        it('should handle errors in streaming properly', async () => {
            const prompt = 'test js prompt that will fail';
            const callback = jest.fn();
            const error = new Error('Streaming failed');

            mockMainProviderManager.sendStreamingPrompt.mockRejectedValueOnce(error);

            await expect(providerManager.sendStreamingPrompt(prompt, callback))
                .rejects.toThrow('Streaming failed');

            expect(mockMainProviderManager.sendStreamingPrompt).toHaveBeenCalledWith(
                prompt, callback, undefined
            );
        });
    });

    // Additional edge case tests for JavaScript implementation
    describe('edge cases', () => {
        it('should handle null options gracefully', async () => {
            const prompt = 'test js prompt';

            await providerManager.sendPrompt(prompt, null);

            expect(mockMainProviderManager.sendPrompt).toHaveBeenCalledWith(
                prompt, null
            );
        });

        it('should handle empty prompt strings', async () => {
            const prompt = '';

            await providerManager.sendPrompt(prompt);

            expect(mockMainProviderManager.sendPrompt).toHaveBeenCalledWith(
                prompt, undefined
            );
        });
    });
});
