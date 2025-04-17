import * as vscode from 'vscode';
import { describe, expect, test, beforeEach, jest, afterEach } from '@jest/globals';
import { LLMProviderManager } from '../../../src/llm/llmProviderManager';
import { ConnectionState, ConnectionStatusService } from '../../../src/status/connectionStatusService';
import { createMockLLMProvider } from '../interfaces/mockFactories';
import { LLMProvider } from '../../../src/llm/llmProvider';
import { SupportedLanguage } from '../../../src/i18n';
import { MultilingualPromptManager } from '../../../src/llm/multilingualPromptManager';

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
    mockConnectionStatusService = {
      setState: jest.fn(),
      showNotification: jest.fn(),
      state: ConnectionState.Disconnected,
      activeModelName: '',
      providerName: '',
      onDidChangeState: jest.fn() as any,
      dispose: jest.fn(),
    } as unknown as jest.Mocked<ConnectionStatusService>;

    // Create a mock LLM provider
    mockProvider = createMockLLMProvider();

    // Create the LLMProviderManager instance
    llmProviderManager = new LLMProviderManager(mockConnectionStatusService);
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
    
    // Verify provider's disconnect method was not called
    expect(mockProvider.disconnect).not.toHaveBeenCalled();
    
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
      ConnectionState.Disconnected,
      expect.objectContaining({
        providerName: expect.any(String)
      })
    );
    
    // Verify notification was shown
    expect(mockConnectionStatusService.showNotification).toHaveBeenCalled();
  });

  test('disconnect handles errors and updates status accordingly', async () => {
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
    
    expect(mockProvider.sendPrompt).toHaveBeenCalledWith(
      expect.stringContaining('Spanish'),
      expect.any(Object)
    );
  });

  test('sendPromptWithLanguage should correct responses in wrong language', async () => {
    const mockProvider = createMockLLMProvider({
      sendPrompt: jest.fn()
        .mockResolvedValueOnce('Response in wrong language')
        .mockResolvedValueOnce('Corrected response')
    });
    (llmProviderManager as any)._activeProvider = mockProvider;
    (llmProviderManager as any).multilingualManager = {
      isResponseInExpectedLanguage: jest.fn().mockReturnValue(false),
      buildLanguageCorrectionPrompt: jest.fn().mockReturnValue('Please correct the language'),
      enhancePromptWithLanguage: jest.fn().mockReturnValue('Enhanced prompt')
    };

    const response = await llmProviderManager.sendPromptWithLanguage(
      'Hello',
      {},
      'fr' as SupportedLanguage
    );

    expect(response).toBe('Corrected response');
    expect(mockProvider.sendPrompt).toHaveBeenCalledTimes(2);
  });

  test('sendStreamingPrompt should handle streaming responses', async () => {
    const mockProvider = createMockLLMProvider();
    (llmProviderManager as any)._activeProvider = mockProvider;
    
    const chunks: string[] = [];
    const callback = (chunk: string) => chunks.push(chunk);

    await llmProviderManager.sendStreamingPrompt('Test prompt', callback);

    expect(mockProvider.sendPrompt).toHaveBeenCalledWith(
      'Test prompt',
      expect.any(Object)
    );
  });

  test('sendStreamingPrompt should handle streaming errors', async () => {
    const mockProvider = createMockLLMProvider({
      sendPrompt: jest.fn().mockRejectedValue(new Error('Stream error'))
    });
    (llmProviderManager as any)._activeProvider = mockProvider;

    const callback = jest.fn();
    
    await expect(
      llmProviderManager.sendStreamingPrompt('Test prompt', callback)
    ).rejects.toThrow('Stream error');

    expect(callback).not.toHaveBeenCalled();
  });

  describe('Offline Mode and Caching', () => {
    test('should enable offline mode', () => {
      const mockProvider = createMockLLMProvider();
      (llmProviderManager as any)._activeProvider = mockProvider;
      
      llmProviderManager.setOfflineMode(true);
      
      expect(mockProvider.setOfflineMode).toHaveBeenCalledWith(true);
    });

    test('should use cached response in offline mode', async () => {
      const mockProvider = createMockLLMProvider({
        setOfflineMode: jest.fn(),
        useCachedResponse: jest.fn().mockResolvedValue('Cached response'),
        sendPrompt: jest.fn()
      });
      (llmProviderManager as any)._activeProvider = mockProvider;
      
      llmProviderManager.setOfflineMode(true);
      
      const response = await llmProviderManager.sendPrompt('Test prompt');
      
      expect(mockProvider.useCachedResponse).toHaveBeenCalledWith('Test prompt');
      expect(response).toBe('Cached response');
      expect(mockProvider.sendPrompt).not.toHaveBeenCalled();
    });

    test('should fall back to last known response when cache misses', async () => {
      const mockProvider = createMockLLMProvider({
        setOfflineMode: jest.fn(),
        useCachedResponse: jest.fn().mockResolvedValue(null),
        getLastResponse: jest.fn().mockReturnValue('Last known response')
      });
      (llmProviderManager as any)._activeProvider = mockProvider;
      
      llmProviderManager.setOfflineMode(true);
      
      const response = await llmProviderManager.sendPrompt('Test prompt');
      
      expect(mockProvider.useCachedResponse).toHaveBeenCalled();
      expect(mockProvider.getLastResponse).toHaveBeenCalled();
      expect(response).toBe('Last known response');
    });

    test('should cache responses in online mode', async () => {
      const mockProvider = createMockLLMProvider({
        sendPrompt: jest.fn().mockResolvedValue('New response'),
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
});