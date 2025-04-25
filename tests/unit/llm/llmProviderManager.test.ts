import * as vscode from 'vscode';
import { describe, expect, test, beforeEach, jest, afterEach } from '@jest/globals';
import { LLMProviderManager } from '../../../src/llm/llmProviderManager';
import { ConnectionState, ConnectionStatusService } from '../../../src/status/connectionStatusService';
import { createMockLLMProvider, createMockConnectionStatusService } from '../interfaces/mockFactories';
import { LLMProvider } from '../../../src/llm/llm-provider';
import { SupportedLanguage } from '../../../src/i18n';

// Mock the ConnectionStatusService
jest.mock('../../../src/status/connectionStatusService');

describe('LLMProviderManager', () => {
  let llmProviderManager: LLMProviderManager;
  let mockConnectionStatusService: jest.Mocked<ConnectionStatusService>;
  let mockProvider: LLMProvider;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a mock ConnectionStatusService
    mockConnectionStatusService = createMockConnectionStatusService();

    // Create the LLMProviderManager instance
    llmProviderManager = new LLMProviderManager(mockConnectionStatusService);
    
    // Create a mock LLM provider
    mockProvider = createMockLLMProvider();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('constructor initializes with empty providers map and null active provider', () => {
    // Access private properties using any type casting
    const providers = (llmProviderManager as any)._providers;
    const activeProvider = (llmProviderManager as any)._activeProvider;
    
    expect(providers).toBeDefined();
    expect(providers.size).toBe(0);
    expect(activeProvider).toBeNull();
  });

  test('getActiveProvider returns null when no active provider is set', () => {
    expect(llmProviderManager.getActiveProvider()).toBeNull();
  });

  test('getActiveModelName returns null when no active provider is set', () => {
    expect(llmProviderManager.getActiveModelName()).toBeNull();
  });

  test('connect throws error when no active provider is set', async () => {
    await expect(llmProviderManager.connect()).rejects.toThrow('No LLM provider is active');
    
    // Verify connection status was not updated
    expect(mockConnectionStatusService.setState).not.toHaveBeenCalledWith(ConnectionState.Connected);
  });

  test('connect calls provider.connect() and updates status when active provider is set', async () => {
    // Add a mock provider and set it as active
    (llmProviderManager as any)._activeProvider = mockProvider;
    
    await llmProviderManager.connect();
    
    // Verify provider's connect method was called
    expect(mockProvider.connect).toHaveBeenCalled();
    
    // Verify connection status was updated
    expect(mockConnectionStatusService.setState).toHaveBeenCalledWith(
      ConnectionState.Connected,
      expect.objectContaining({
        modelName: expect.any(String),
        providerName: expect.any(String)
      })
    );
    
    // Verify notification was shown
    expect(mockConnectionStatusService.showNotification).toHaveBeenCalled();
  });

  test('connect handles errors and updates status accordingly', async () => {
    // Add a mock provider that throws an error when connect is called
    const errorProvider = createMockLLMProvider({
      connect: jest.fn().mockRejectedValue(new Error('Connection failed'))
    });
    
    (llmProviderManager as any)._activeProvider = errorProvider;
    
    await expect(llmProviderManager.connect()).rejects.toThrow('Connection failed');
    
    // Verify error status was set
    expect(mockConnectionStatusService.setState).toHaveBeenCalledWith(
      ConnectionState.Error,
      expect.any(Object)
    );
    
    // Verify error notification was shown
    expect(mockConnectionStatusService.showNotification).toHaveBeenCalledWith(
      expect.stringContaining('Failed to connect to LLM:'),
      'error'
    );
  });

  test('disconnect does nothing when no active provider is set', async () => {
    await llmProviderManager.disconnect();
    
    // Verify connection status was not updated
    expect(mockConnectionStatusService.setState).not.toHaveBeenCalled();
  });

  test('disconnect calls provider.disconnect() and updates status when active provider is set', async () => {
    // Add a mock provider and set it as active
    (llmProviderManager as any)._activeProvider = mockProvider;
    
    await llmProviderManager.disconnect();
    
    // Verify provider's disconnect method was called
    expect(mockProvider.disconnect).toHaveBeenCalled();
    
    // Verify connection status was updated
    expect(mockConnectionStatusService.setState).toHaveBeenCalledWith(
      ConnectionState.Disconnected
    );
  });

  test('disconnect handles errors gracefully', async () => {
    // Add a mock provider that throws an error when disconnect is called
    const errorProvider = createMockLLMProvider({
      disconnect: jest.fn().mockRejectedValue(new Error('Disconnection failed'))
    });
    
    (llmProviderManager as any)._activeProvider = errorProvider;
    
    await expect(llmProviderManager.disconnect()).rejects.toThrow('Disconnection failed');
    
    // Verify error status was set
    expect(mockConnectionStatusService.setState).toHaveBeenCalledWith(
      ConnectionState.Error
    );
    
    // Verify error notification was shown
    expect(mockConnectionStatusService.showNotification).toHaveBeenCalledWith(
      expect.stringContaining('Failed to disconnect from LLM:'),
      'error'
    );
  });

  test('setActiveModel updates the state with new model name', async () => {
    // Add a mock provider and set it as active
    (llmProviderManager as any)._activeProvider = mockProvider;
    
    await llmProviderManager.setActiveModel('new-model');
    
    // Verify connection status was updated with the new model name
    expect(mockConnectionStatusService.setState).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        modelName: 'new-model',
        providerName: expect.any(String)
      })
    );
  });

  test('dispose method releases resources', () => {
    llmProviderManager.dispose();
    
    // Additional verification could be added here if the dispose method is enhanced
    // Currently the method is mostly a placeholder in the original implementation
  });

  test('sendPromptWithLanguage should use the correct language for responses', async () => {
    const mockProvider = createMockLLMProvider();
    (llmProviderManager as any)._activeProvider = mockProvider;
    
    await llmProviderManager.sendPromptWithLanguage(
      'Hello',
      {},
      'es' as SupportedLanguage
    );
    
    // Expect that the prompt was sent with language context
    expect(mockProvider.generateCompletion).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Spanish'),
      undefined,
      expect.any(Object)
    );
  });

  test('sendPromptWithLanguage should correct responses in wrong language', async () => {
    // Create a multilingualManager mock inside llmProviderManager
    const mockProvider = createMockLLMProvider();
    (llmProviderManager as any)._activeProvider = mockProvider;
    (llmProviderManager as any).multilingualManager = {
      isResponseInExpectedLanguage: jest.fn().mockReturnValue(false),
      buildLanguageCorrectionPrompt: jest.fn().mockReturnValue('Please correct the language'),
      enhancePromptWithLanguage: jest.fn().mockReturnValue('Enhanced prompt')
    };

    // Mock the provider responses
    jest.spyOn(mockProvider, 'generateCompletion')
      .mockResolvedValueOnce({ content: 'Response in wrong language' })
      .mockResolvedValueOnce({ content: 'Corrected response' });

    const response = await llmProviderManager.sendPromptWithLanguage(
      'Hello',
      {},
      'fr' as SupportedLanguage
    );

    expect(response).toBe('Corrected response');
    expect(mockProvider.generateCompletion).toHaveBeenCalledTimes(2);
  });

  test('sendStreamingPrompt should handle streaming responses', async () => {
    const mockProvider = createMockLLMProvider();
    (llmProviderManager as any)._activeProvider = mockProvider;
    
    const chunks: string[] = [];
    const callback = (chunk: string) => chunks.push(chunk);

    // Mock the streamCompletion method
    jest.spyOn(mockProvider, 'streamCompletion').mockImplementationOnce(async (model, prompt, systemPrompt, options, cb) => {
      cb?.({ content: 'Test', done: false });
      cb?.({ content: ' response', done: true });
    });

    await llmProviderManager.sendStreamingPrompt('Test prompt', callback);

    expect(mockProvider.streamCompletion).toHaveBeenCalledWith(
      expect.any(String),
      'Test prompt',
      undefined,
      undefined,
      expect.any(Function)
    );
    expect(chunks).toEqual(['Test', ' response']);
  });

  test('sendStreamingPrompt throws error when no provider is set', async () => {
    const callback = (chunk: string) => {};
    
    await expect(
      llmProviderManager.sendStreamingPrompt('Test prompt', callback)
    ).rejects.toThrow('No LLM provider is currently connected');
  });

  test('setOfflineMode should call provider method if available', () => {
    const mockProvider = createMockLLMProvider({
      setOfflineMode: jest.fn()
    });
    (llmProviderManager as any)._activeProvider = mockProvider;
    
    llmProviderManager.setOfflineMode(true);
    
    expect(mockProvider.setOfflineMode).toHaveBeenCalledWith(true);
  });

  test('sendPrompt should use cached responses in offline mode', async () => {
    const mockProvider = createMockLLMProvider({
      useCachedResponse: jest.fn().mockResolvedValue('Cached response'),
      generateCompletion: jest.fn()
    });
    (llmProviderManager as any)._activeProvider = mockProvider;
    (mockProvider as any)._offlineMode = true;
    
    const response = await llmProviderManager.sendPrompt('Test prompt');
    
    expect(mockProvider.generateCompletion).toHaveBeenCalledWith(
      expect.any(String),
      'Test prompt',
      undefined,
      undefined
    );
    expect(response).toBe('Cached response');
  });

  test('sendPrompt should cache responses', async () => {
    const mockProvider = createMockLLMProvider({
      generateCompletion: jest.fn().mockResolvedValue({ content: 'New response' }),
      cacheResponse: jest.fn()
    });
    (llmProviderManager as any)._activeProvider = mockProvider;
    
    await llmProviderManager.sendPrompt('Test prompt');
    
    expect(mockProvider.cacheResponse).toHaveBeenCalledWith(
      'Test prompt',
      'New response'
    );
  });
});