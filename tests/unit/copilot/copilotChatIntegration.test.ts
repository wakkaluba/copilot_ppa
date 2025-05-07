import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { CopilotChatIntegration } from '../../../src/copilot/copilotChatIntegration';
import { CopilotApiService } from '../../../src/services/copilotApi';
import { Logger } from '../../../src/utils/logger';

// Mock dependencies
jest.mock('../../../src/services/copilotApi');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/copilot/services/CopilotChatInitializationService', () => {
  return {
    CopilotChatInitializationService: jest.fn().mockImplementation(() => {
      return {
        initializeCopilotExtension: jest.fn().mockReturnValue(Promise.resolve({ id: 'mock-chat-provider' })),
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
        handleMessage: jest.fn().mockReturnValue(Promise.resolve({ success: true })),
        createErrorResponse: jest.fn().mockReturnValue({ error: 'Mock error' }),
        sendMessage: jest.fn().mockReturnValue(Promise.resolve(true))
      };
    })
  };
});

jest.mock('../../../src/copilot/services/CopilotChatCommandHandlerService', () => {
  return {
    CopilotChatCommandHandlerService: jest.fn().mockImplementation(() => {
      return {
        handleCommand: jest.fn().mockReturnValue(Promise.resolve({ success: true }))
      };
    })
  };
});

describe('CopilotChatIntegration', () => {
  let mockLogger: any;
  let mockCopilotApiService: any;
  let mockInitService: any;
  let mockParticipantService: any;
  let mockMessageHandlerService: any;
  let mockCommandHandlerService: any;

  beforeEach(() => {
    // Reset the singleton instance before each test
    // @ts-ignore: Accessing private static property for testing
    CopilotChatIntegration.instance = undefined;

    // Setup mocks
    mockLogger = Logger.getInstance() as jest.Mocked<Logger>;
    mockCopilotApiService = CopilotApiService.getInstance() as jest.Mocked<CopilotApiService>;

    // Get references to our mocked services
    mockInitService = jest.mocked(require('../../../src/copilot/services/CopilotChatInitializationService'), true);
    mockParticipantService = jest.mocked(require('../../../src/copilot/services/CopilotChatParticipantService'), true);
    mockMessageHandlerService = jest.mocked(require('../../../src/copilot/services/CopilotChatMessageHandlerService'), true);
    mockCommandHandlerService = jest.mocked(require('../../../src/copilot/services/CopilotChatCommandHandlerService'), true);

    // Default mock implementations
    mockCopilotApiService.initialize = jest.fn().mockReturnValue(Promise.resolve(true));
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
    mockCopilotApiService.initialize = jest.fn().mockReturnValue(Promise.resolve(false));

    const instance = CopilotChatIntegration.getInstance();
    const result = await instance.initialize();

    expect(result).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalledWith('Failed to connect to Copilot API. Integration not available.');
  });

  it('should fail initialization when extension initialization fails', async () => {
    // Mock the initialization service to return null for chat provider
    const initServiceInstance = mockInitService.CopilotChatInitializationService.mock.results[0].value;
    initServiceInstance.initializeCopilotExtension = jest.fn().mockReturnValue(Promise.resolve(null));
    initServiceInstance.isIntegrationActive = jest.fn().mockReturnValue(false);

    // Reset the singleton for this specific test
    // @ts-ignore: Accessing private static property for testing
    CopilotChatIntegration.instance = undefined;
    const instance = CopilotChatIntegration.getInstance();

    const result = await instance.initialize();

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

    // Get reference to the participant service mock instance
    const participantServiceInstance = mockParticipantService.CopilotChatParticipantService.mock.results[0].value;

    // Extract the callback that was registered
    const handleMessageCallback = participantServiceInstance.registerChatParticipant.mock.calls[0][1].handleMessage;
    const result = await handleMessageCallback({ message: 'Test message' });

    expect(result).toEqual({ success: true });
    expect(mockLogger.info).toHaveBeenCalledWith('Received chat message: Test message');
  });

  it('should handle command intents correctly', async () => {
    const instance = CopilotChatIntegration.getInstance();
    await instance.initialize();

    // Get reference to the participant service mock instance
    const participantServiceInstance = mockParticipantService.CopilotChatParticipantService.mock.results[0].value;

    // Extract the callback that was registered
    const handleCommandCallback = participantServiceInstance.registerChatParticipant.mock.calls[0][1].handleCommandIntent;
    const result = await handleCommandCallback('testCommand', { arg: 'value' });

    expect(result).toEqual({ success: true });
    expect(mockLogger.info).toHaveBeenCalledWith('Received command intent: testCommand');
  });

  it('should send messages to Copilot chat', async () => {
    const instance = CopilotChatIntegration.getInstance();

    const messageHandlerServiceInstance = mockMessageHandlerService.CopilotChatMessageHandlerService.mock.results[0].value;
    const result = await instance.sendMessageToCopilotChat('Test message');

    expect(result).toBe(true);
    expect(messageHandlerServiceInstance.sendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should handle errors when sending messages', async () => {
    const messageHandlerServiceInstance = mockMessageHandlerService.CopilotChatMessageHandlerService.mock.results[0].value;
    messageHandlerServiceInstance.sendMessage = jest.fn().mockRejectedValue(new Error('Send error'));

    const instance = CopilotChatIntegration.getInstance();
    const result = await instance.sendMessageToCopilotChat('Test message');

    expect(result).toBe(false);
    expect(mockLogger.error).toHaveBeenCalledWith('Error sending message to Copilot chat', expect.any(Error));
  });

  it('should not send messages when integration is not active', async () => {
    // Mock the initialization service to return false for isIntegrationActive
    const initServiceInstance = mockInitService.CopilotChatInitializationService.mock.results[0].value;
    initServiceInstance.isIntegrationActive = jest.fn().mockReturnValue(false);

    // Reset the singleton for this specific test
    // @ts-ignore: Accessing private static property for testing
    CopilotChatIntegration.instance = undefined;
    const instance = CopilotChatIntegration.getInstance();

    const result = await instance.sendMessageToCopilotChat('Test message');

    expect(result).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalledWith('Cannot send message: Copilot chat integration not active');
  });

  it('should check if integration is active', () => {
    const instance = CopilotChatIntegration.getInstance();
    const initServiceInstance = mockInitService.CopilotChatInitializationService.mock.results[0].value;

    const result = instance.isActive();

    expect(result).toBe(true);
    expect(initServiceInstance.isIntegrationActive).toHaveBeenCalled();
  });

  it('should toggle integration state', () => {
    const instance = CopilotChatIntegration.getInstance();
    const initServiceInstance = mockInitService.CopilotChatInitializationService.mock.results[0].value;

    const result = instance.toggleIntegration();

    expect(result).toBe(true);
    expect(initServiceInstance.toggleIntegration).toHaveBeenCalled();
  });
});
