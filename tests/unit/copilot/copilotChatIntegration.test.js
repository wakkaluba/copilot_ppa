const { jest, describe, beforeEach, afterEach, it, expect } = require('@jest/globals');
const vscode = require('vscode');
const { CopilotChatIntegration } = require('../../../src/copilot/copilotChatIntegration');
const { CopilotApiService } = require('../../../src/services/copilotApi');
const { Logger } = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/services/copilotApi');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/copilot/services/CopilotChatInitializationService', () => {
  return {
    CopilotChatInitializationService: jest.fn().mockImplementation(() => {
      return {
        initializeCopilotExtension: jest.fn().mockResolvedValue({ id: 'mock-chat-provider' }),
        isIntegrationActive: jest.fn().mockReturnValue(true),
        toggleIntegration: jest.fn().mockReturnValue(true)
      };
    })
  };
});

jest.mock('../../../src/copilot/services/CopilotChatParticipantService', () => {
  return {
    CopilotChatParticipantService: jest.fn().mockImplementation(() => {
      return {
        registerChatParticipant: jest.fn()
      };
    })
  };
});

jest.mock('../../../src/copilot/services/CopilotChatMessageHandlerService', () => {
  return {
    CopilotChatMessageHandlerService: jest.fn().mockImplementation(() => {
      return {
        handleMessage: jest.fn().mockResolvedValue({ success: true }),
        createErrorResponse: jest.fn().mockReturnValue({ error: 'Mock error' }),
        sendMessage: jest.fn().mockResolvedValue(true)
      };
    })
  };
});

jest.mock('../../../src/copilot/services/CopilotChatCommandHandlerService', () => {
  return {
    CopilotChatCommandHandlerService: jest.fn().mockImplementation(() => {
      return {
        handleCommand: jest.fn().mockResolvedValue({ success: true })
      };
    })
  };
});

describe('CopilotChatIntegration', () => {
  let mockLogger;
  let mockCopilotApiService;

  beforeEach(() => {
    // Reset the singleton instance before each test
    CopilotChatIntegration.instance = undefined;

    // Setup mocks
    mockLogger = Logger.getInstance();
    mockCopilotApiService = CopilotApiService.getInstance();

    // Default mock implementations
    mockCopilotApiService.initialize = jest.fn().mockResolvedValue(true);
    mockLogger.info = jest.fn();
    mockLogger.warn = jest.fn();
    mockLogger.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a singleton instance', () => {
    const instance1 = CopilotChatIntegration.getInstance();
    const instance2 = CopilotChatIntegration.getInstance();

    expect(instance1).toBeDefined();
    expect(instance1).toBe(instance2);
  });

  it('should initialize successfully when Copilot API connects', async () => {
    const instance = CopilotChatIntegration.getInstance();

    const result = await instance.initialize();

    expect(result).toBe(true);
    expect(mockCopilotApiService.initialize).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith('Successfully integrated with GitHub Copilot chat');
  });

  it('should fail initialization when Copilot API fails to connect', async () => {
    mockCopilotApiService.initialize = jest.fn().mockResolvedValue(false);

    const instance = CopilotChatIntegration.getInstance();
    const result = await instance.initialize();

    expect(result).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalledWith('Failed to connect to Copilot API. Integration not available.');
  });

  it('should fail initialization when extension initialization fails', async () => {
    // Mock the initialization service to return null for chat provider
    jest.requireMock('../../../src/copilot/services/CopilotChatInitializationService').CopilotChatInitializationService.mockImplementation(() => {
      return {
        initializeCopilotExtension: jest.fn().mockResolvedValue(null),
        isIntegrationActive: jest.fn().mockReturnValue(false),
        toggleIntegration: jest.fn().mockReturnValue(false)
      };
    });

    const instance = CopilotChatIntegration.getInstance();
    // Reset the singleton for this specific test
    CopilotChatIntegration.instance = undefined;
    const newInstance = CopilotChatIntegration.getInstance();

    const result = await newInstance.initialize();

    expect(result).toBe(false);
  });

  it('should handle errors during initialization', async () => {
    mockCopilotApiService.initialize = jest.fn().mockRejectedValue(new Error('Mock initialization error'));

    const instance = CopilotChatIntegration.getInstance();
    const result = await instance.initialize();

    expect(result).toBe(false);
    expect(mockLogger.error).toHaveBeenCalledWith('Error initializing Copilot chat integration', expect.any(Error));
  });

  it('should handle chat messages correctly', async () => {
    const instance = CopilotChatIntegration.getInstance();
    await instance.initialize();

    // Trigger the handleChatMessage method through a mocked participant registration
    const participantServiceMock = jest.requireMock('../../../src/copilot/services/CopilotChatParticipantService');
    const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;

    // Extract the callback that was registered
    const callbacks = registerChatParticipantMock.mock.calls[0][1];
    const result = await callbacks.handleMessage({ message: 'Test message' });

    expect(result).toEqual({ success: true });
    expect(mockLogger.info).toHaveBeenCalledWith('Received chat message: Test message');
  });

  it('should handle command intents correctly', async () => {
    const instance = CopilotChatIntegration.getInstance();
    await instance.initialize();

    // Trigger the handleCommandIntent method through a mocked participant registration
    const participantServiceMock = jest.requireMock('../../../src/copilot/services/CopilotChatParticipantService');
    const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;

    // Extract the callback that was registered
    const callbacks = registerChatParticipantMock.mock.calls[0][1];
    const result = await callbacks.handleCommandIntent('testCommand', { arg: 'value' });

    expect(result).toEqual({ success: true });
    expect(mockLogger.info).toHaveBeenCalledWith('Received command intent: testCommand');
  });

  it('should send messages to Copilot chat', async () => {
    const instance = CopilotChatIntegration.getInstance();

    const result = await instance.sendMessageToCopilotChat('Test message');

    expect(result).toBe(true);
    const messageHandlerServiceMock = jest.requireMock('../../../src/copilot/services/CopilotChatMessageHandlerService');
    const sendMessageMock = messageHandlerServiceMock.CopilotChatMessageHandlerService.mock.results[0].value.sendMessage;
    expect(sendMessageMock).toHaveBeenCalledWith('Test message');
  });

  it('should handle errors when sending messages', async () => {
    const messageHandlerServiceMock = jest.requireMock('../../../src/copilot/services/CopilotChatMessageHandlerService');
    messageHandlerServiceMock.CopilotChatMessageHandlerService.mock.results[0].value.sendMessage.mockRejectedValue(new Error('Send error'));

    const instance = CopilotChatIntegration.getInstance();
    const result = await instance.sendMessageToCopilotChat('Test message');

    expect(result).toBe(false);
    expect(mockLogger.error).toHaveBeenCalledWith('Error sending message to Copilot chat', expect.any(Error));
  });

  it('should not send messages when integration is not active', async () => {
    // Mock the initialization service to return false for isIntegrationActive
    jest.requireMock('../../../src/copilot/services/CopilotChatInitializationService').CopilotChatInitializationService.mockImplementation(() => {
      return {
        initializeCopilotExtension: jest.fn().mockResolvedValue({ id: 'mock-chat-provider' }),
        isIntegrationActive: jest.fn().mockReturnValue(false),
        toggleIntegration: jest.fn().mockReturnValue(true)
      };
    });

    // Reset the singleton for this specific test
    CopilotChatIntegration.instance = undefined;
    const instance = CopilotChatIntegration.getInstance();

    const result = await instance.sendMessageToCopilotChat('Test message');

    expect(result).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalledWith('Cannot send message: Copilot chat integration not active');
  });

  it('should check if integration is active', () => {
    const instance = CopilotChatIntegration.getInstance();

    const result = instance.isActive();

    expect(result).toBe(true);
    const initServiceMock = jest.requireMock('../../../src/copilot/services/CopilotChatInitializationService');
    expect(initServiceMock.CopilotChatInitializationService.mock.results[0].value.isIntegrationActive).toHaveBeenCalled();
  });

  it('should toggle integration state', () => {
    const instance = CopilotChatIntegration.getInstance();

    const result = instance.toggleIntegration();

    expect(result).toBe(true);
    const initServiceMock = jest.requireMock('../../../src/copilot/services/CopilotChatInitializationService');
    expect(initServiceMock.CopilotChatInitializationService.mock.results[0].value.toggleIntegration).toHaveBeenCalled();
  });
});
