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

  describe('Instance Management', () => {
    it('should create a singleton instance', () => {
      const instance1 = CopilotChatIntegration.getInstance();
      const instance2 = CopilotChatIntegration.getInstance();

      expect(instance1).toBeDefined();
      expect(instance1).toBe(instance2);
    });

    it('should properly initialize all required services', () => {
      const instance = CopilotChatIntegration.getInstance();

      expect(mockInitService.CopilotChatInitializationService).toHaveBeenCalledWith(expect.any(Object));
      expect(mockParticipantService.CopilotChatParticipantService).toHaveBeenCalledWith(expect.any(Object));
      expect(mockMessageHandlerService.CopilotChatMessageHandlerService).toHaveBeenCalledWith(expect.any(Object));
      expect(mockCommandHandlerService.CopilotChatCommandHandlerService).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('Initialization', () => {
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

    it('should register message and command handlers with participant service', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceInstance = mockParticipantService.CopilotChatParticipantService.mock.results[0].value;

      expect(participantServiceInstance.registerChatParticipant).toHaveBeenCalledWith(
        { id: 'mock-chat-provider' },
        expect.objectContaining({
          handleMessage: expect.any(Function),
          handleCommandIntent: expect.any(Function)
        })
      );
    });

    it('should retry initialization when API connection is unstable', async () => {
      // First attempt fails, second succeeds
      mockCopilotApiService.initialize = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(true);

      const instance = CopilotChatIntegration.getInstance();

      // First attempt
      let result = await instance.initialize();
      expect(result).toBe(false);

      // Second attempt should succeed
      result = await instance.initialize();
      expect(result).toBe(true);
      expect(mockCopilotApiService.initialize).toHaveBeenCalledTimes(2);
    });
  });

  describe('Message Handling', () => {
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

    it('should handle message with special characters', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceInstance = mockParticipantService.CopilotChatParticipantService.mock.results[0].value;
      const handleMessageCallback = participantServiceInstance.registerChatParticipant.mock.calls[0][1].handleMessage;

      // Test with special characters
      await handleMessageCallback({ message: 'Test <>&"\' message with äöü éèê' });

      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Test <>&"\' message with äöü éèê'));
    });

    it('should handle empty message content', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceInstance = mockParticipantService.CopilotChatParticipantService.mock.results[0].value;
      const handleMessageCallback = participantServiceInstance.registerChatParticipant.mock.calls[0][1].handleMessage;

      // Test with empty message
      await handleMessageCallback({ message: '' });

      expect(mockLogger.info).toHaveBeenCalledWith('Received chat message: ');
    });

    it('should handle message with complex request structure', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceInstance = mockParticipantService.CopilotChatParticipantService.mock.results[0].value;
      const handleMessageCallback = participantServiceInstance.registerChatParticipant.mock.calls[0][1].handleMessage;

      const complexRequest = {
        message: 'Complex message',
        requestId: '12345',
        metadata: {
          source: 'test',
          timestamp: Date.now(),
          context: {
            files: ['file1.ts', 'file2.js'],
            selections: [{start: 0, end: 10}]
          }
        }
      };

      await handleMessageCallback(complexRequest);

      expect(mockLogger.info).toHaveBeenCalledWith('Received chat message: Complex message');

      const messageHandlerServiceInstance = mockMessageHandlerService.CopilotChatMessageHandlerService.mock.results[0].value;
      expect(messageHandlerServiceInstance.handleMessage).toHaveBeenCalledWith(complexRequest);
    });

    it('should handle errors during message processing', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      // Mock an error during message handling
      const messageHandlerServiceInstance = mockMessageHandlerService.CopilotChatMessageHandlerService.mock.results[0].value;
      messageHandlerServiceInstance.handleMessage = jest.fn().mockRejectedValue(new Error('Message processing error'));

      // Get the callback
      const participantServiceInstance = mockParticipantService.CopilotChatParticipantService.mock.results[0].value;
      const handleMessageCallback = participantServiceInstance.registerChatParticipant.mock.calls[0][1].handleMessage;

      // Call the callback directly
      const result = await handleMessageCallback({ message: 'Error-triggering message' });

      expect(mockLogger.error).toHaveBeenCalledWith('Error handling chat message', expect.any(Error));
      expect(messageHandlerServiceInstance.createErrorResponse).toHaveBeenCalled();
      expect(result).toEqual({ error: 'Mock error' });
    });
  });

  describe('Command Handling', () => {
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

    it('should handle command without arguments', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceInstance = mockParticipantService.CopilotChatParticipantService.mock.results[0].value;
      const handleCommandCallback = participantServiceInstance.registerChatParticipant.mock.calls[0][1].handleCommandIntent;

      await handleCommandCallback('noArgsCommand', undefined);

      const commandHandlerServiceInstance = mockCommandHandlerService.CopilotChatCommandHandlerService.mock.results[0].value;
      expect(commandHandlerServiceInstance.handleCommand).toHaveBeenCalledWith('noArgsCommand', undefined);
    });

    it('should handle commands with complex argument structures', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceInstance = mockParticipantService.CopilotChatParticipantService.mock.results[0].value;
      const handleCommandCallback = participantServiceInstance.registerChatParticipant.mock.calls[0][1].handleCommandIntent;

      const complexArgs = {
        options: {
          recursive: true,
          force: false,
          timeout: 30000
        },
        targets: ['src/**/*.ts', 'tests/**/*.ts'],
        metadata: {
          requestor: 'user123',
          priority: 'high'
        }
      };

      await handleCommandCallback('complexCommand', complexArgs);

      const commandHandlerServiceInstance = mockCommandHandlerService.CopilotChatCommandHandlerService.mock.results[0].value;
      expect(commandHandlerServiceInstance.handleCommand).toHaveBeenCalledWith('complexCommand', complexArgs);
    });

    it('should handle error in command processing', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      // Mock an error during command handling
      const commandHandlerServiceInstance = mockCommandHandlerService.CopilotChatCommandHandlerService.mock.results[0].value;
      commandHandlerServiceInstance.handleCommand = jest.fn().mockRejectedValue(new Error('Command processing error'));

      const participantServiceInstance = mockParticipantService.CopilotChatParticipantService.mock.results[0].value;
      const handleCommandCallback = participantServiceInstance.registerChatParticipant.mock.calls[0][1].handleCommandIntent;

      // This should not throw but propagate the error
      try {
        await handleCommandCallback('errorCommand', {});
        fail('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Command processing error');
      }
    });
  });

  describe('Message Sending', () => {
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

    it('should send messages with varying lengths', async () => {
      const instance = CopilotChatIntegration.getInstance();
      const messageHandlerServiceInstance = mockMessageHandlerService.CopilotChatMessageHandlerService.mock.results[0].value;

      // Send short message
      await instance.sendMessageToCopilotChat('Hi');
      expect(messageHandlerServiceInstance.sendMessage).toHaveBeenCalledWith('Hi');

      // Send long message
      const longMessage = 'A'.repeat(5000);
      await instance.sendMessageToCopilotChat(longMessage);
      expect(messageHandlerServiceInstance.sendMessage).toHaveBeenCalledWith(longMessage);
    });

    it('should handle multiple successive message sends', async () => {
      const instance = CopilotChatIntegration.getInstance();
      const messageHandlerServiceInstance = mockMessageHandlerService.CopilotChatMessageHandlerService.mock.results[0].value;

      // First message succeeds
      messageHandlerServiceInstance.sendMessage = jest.fn().mockResolvedValueOnce(true);
      const result1 = await instance.sendMessageToCopilotChat('Message 1');
      expect(result1).toBe(true);

      // Second message fails
      messageHandlerServiceInstance.sendMessage = jest.fn().mockRejectedValueOnce(new Error('Network error'));
      const result2 = await instance.sendMessageToCopilotChat('Message 2');
      expect(result2).toBe(false);

      // Third message succeeds again
      messageHandlerServiceInstance.sendMessage = jest.fn().mockResolvedValueOnce(true);
      const result3 = await instance.sendMessageToCopilotChat('Message 3');
      expect(result3).toBe(true);
    });
  });

  describe('Integration Status', () => {
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

    it('should report inactive status correctly', () => {
      const initServiceInstance = mockInitService.CopilotChatInitializationService.mock.results[0].value;
      initServiceInstance.isIntegrationActive = jest.fn().mockReturnValue(false);

      // Reset the singleton
      // @ts-ignore: Accessing private static property for testing
      CopilotChatIntegration.instance = undefined;
      const instance = CopilotChatIntegration.getInstance();

      expect(instance.isActive()).toBe(false);
    });

    it('should handle multiple toggle calls', () => {
      const instance = CopilotChatIntegration.getInstance();
      const initServiceInstance = mockInitService.CopilotChatInitializationService.mock.results[0].value;

      // First toggle returns true
      initServiceInstance.toggleIntegration = jest.fn().mockReturnValueOnce(true);
      const result1 = instance.toggleIntegration();
      expect(result1).toBe(true);

      // Second toggle returns false
      initServiceInstance.toggleIntegration = jest.fn().mockReturnValueOnce(false);
      const result2 = instance.toggleIntegration();
      expect(result2).toBe(false);
    });
  });
});
