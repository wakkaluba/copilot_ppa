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

describe('CopilotChatIntegration (JavaScript)', () => {
  let mockLogger;
  let mockCopilotApiService;
  let mockInitService;
  let mockParticipantService;
  let mockMessageHandlerService;
  let mockCommandHandlerService;

  beforeEach(() => {
    // Reset the singleton instance before each test
    CopilotChatIntegration.instance = undefined;

    // Setup mocks
    mockLogger = Logger.getInstance();
    mockCopilotApiService = CopilotApiService.getInstance();

    // Get references to our mocked services
    mockInitService = jest.requireMock('../../../src/copilot/services/CopilotChatInitializationService');
    mockParticipantService = jest.requireMock('../../../src/copilot/services/CopilotChatParticipantService');
    mockMessageHandlerService = jest.requireMock('../../../src/copilot/services/CopilotChatMessageHandlerService');
    mockCommandHandlerService = jest.requireMock('../../../src/copilot/services/CopilotChatCommandHandlerService');

    // Default mock implementations
    mockCopilotApiService.initialize = jest.fn().mockResolvedValue(true);
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

    it('should pass logger to all service initializations', () => {
      const instance = CopilotChatIntegration.getInstance();

      // Check that all services were initialized with the logger
      expect(mockInitService.CopilotChatInitializationService.mock.calls[0][0]).toBe(mockLogger);
      expect(mockParticipantService.CopilotChatParticipantService.mock.calls[0][0]).toBe(mockLogger);
      expect(mockMessageHandlerService.CopilotChatMessageHandlerService.mock.calls[0][0]).toBe(mockLogger);
      expect(mockCommandHandlerService.CopilotChatCommandHandlerService.mock.calls[0][0]).toBe(mockLogger);
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
      mockCopilotApiService.initialize = jest.fn().mockResolvedValue(false);

      const instance = CopilotChatIntegration.getInstance();
      const result = await instance.initialize();

      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('Failed to connect to Copilot API. Integration not available.');
    });

    it('should fail initialization when extension initialization fails', async () => {
      // Mock the initialization service to return null for chat provider
      mockInitService.CopilotChatInitializationService.mockImplementation(() => {
        return {
          initializeCopilotExtension: jest.fn().mockResolvedValue(null),
          isIntegrationActive: jest.fn().mockReturnValue(false),
          toggleIntegration: jest.fn().mockReturnValue(false)
        };
      });

      // Reset singleton for this test
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

    it('should handle network timeout during initialization', async () => {
      // Simulate a network timeout error
      const timeoutError = new Error('Network timeout');
      timeoutError.code = 'ETIMEOUT';

      mockCopilotApiService.initialize = jest.fn().mockRejectedValue(timeoutError);

      const instance = CopilotChatIntegration.getInstance();
      const result = await instance.initialize();

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error initializing Copilot chat integration',
        expect.objectContaining({ code: 'ETIMEOUT' })
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

      // Trigger the handleChatMessage method through a mocked participant registration
      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;

      // Extract the callback that was registered
      const callbacks = registerChatParticipantMock.mock.calls[0][1];
      const result = await callbacks.handleMessage({ message: 'Test message' });

      expect(result).toEqual({ success: true });
      expect(mockLogger.info).toHaveBeenCalledWith('Received chat message: Test message');
    });

    it('should handle message with special characters', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;
      const callbacks = registerChatParticipantMock.mock.calls[0][1];

      // Test with special characters
      await callbacks.handleMessage({ message: 'Test <>&"\' message with äöü éèê' });

      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Test <>&"\' message with äöü éèê'));
    });

    it('should handle empty message content', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;
      const callbacks = registerChatParticipantMock.mock.calls[0][1];

      // Test with empty message
      await callbacks.handleMessage({ message: '' });

      expect(mockLogger.info).toHaveBeenCalledWith('Received chat message: ');
    });

    it('should handle message with undefined content', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;
      const callbacks = registerChatParticipantMock.mock.calls[0][1];

      // Test with undefined message - JavaScript specific case
      await callbacks.handleMessage({ message: undefined });

      expect(mockLogger.info).toHaveBeenCalledWith('Received chat message: undefined');
    });

    it('should handle message with complex request structure', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;
      const callbacks = registerChatParticipantMock.mock.calls[0][1];

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

      await callbacks.handleMessage(complexRequest);

      expect(mockLogger.info).toHaveBeenCalledWith('Received chat message: Complex message');

      const messageHandlerServiceMock = mockMessageHandlerService;
      const handleMessageMock = messageHandlerServiceMock.CopilotChatMessageHandlerService.mock.results[0].value.handleMessage;
      expect(handleMessageMock).toHaveBeenCalledWith(complexRequest);
    });

    it('should handle errors during message processing', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      // Mock an error during message handling
      const messageHandlerServiceMock = mockMessageHandlerService;
      messageHandlerServiceMock.CopilotChatMessageHandlerService.mock.results[0].value.handleMessage.mockRejectedValue(new Error('Message processing error'));

      // Get the callback
      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;
      const callbacks = registerChatParticipantMock.mock.calls[0][1];

      // Call the callback directly
      const result = await callbacks.handleMessage({ message: 'Error-triggering message' });

      expect(mockLogger.error).toHaveBeenCalledWith('Error handling chat message', expect.any(Error));
      expect(messageHandlerServiceMock.CopilotChatMessageHandlerService.mock.results[0].value.createErrorResponse).toHaveBeenCalled();
      expect(result).toEqual({ error: 'Mock error' });
    });
  });

  describe('Command Handling', () => {
    it('should handle command intents correctly', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      // Trigger the handleCommandIntent method through a mocked participant registration
      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;

      // Extract the callback that was registered
      const callbacks = registerChatParticipantMock.mock.calls[0][1];
      const result = await callbacks.handleCommandIntent('testCommand', { arg: 'value' });

      expect(result).toEqual({ success: true });
      expect(mockLogger.info).toHaveBeenCalledWith('Received command intent: testCommand');
    });

    it('should handle command without arguments', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;
      const callbacks = registerChatParticipantMock.mock.calls[0][1];

      await callbacks.handleCommandIntent('noArgsCommand', undefined);

      const commandHandlerServiceMock = mockCommandHandlerService;
      const handleCommandMock = commandHandlerServiceMock.CopilotChatCommandHandlerService.mock.results[0].value.handleCommand;
      expect(handleCommandMock).toHaveBeenCalledWith('noArgsCommand', undefined);
    });

    it('should handle commands with null arguments (JavaScript specific)', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;
      const callbacks = registerChatParticipantMock.mock.calls[0][1];

      await callbacks.handleCommandIntent('nullArgsCommand', null);

      const commandHandlerServiceMock = mockCommandHandlerService;
      const handleCommandMock = commandHandlerServiceMock.CopilotChatCommandHandlerService.mock.results[0].value.handleCommand;
      expect(handleCommandMock).toHaveBeenCalledWith('nullArgsCommand', null);
    });

    it('should handle commands with complex argument structures', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;
      const callbacks = registerChatParticipantMock.mock.calls[0][1];

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

      await callbacks.handleCommandIntent('complexCommand', complexArgs);

      const commandHandlerServiceMock = mockCommandHandlerService;
      const handleCommandMock = commandHandlerServiceMock.CopilotChatCommandHandlerService.mock.results[0].value.handleCommand;
      expect(handleCommandMock).toHaveBeenCalledWith('complexCommand', complexArgs);
    });

    it('should handle error in command processing', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      // Mock an error during command handling
      const commandHandlerServiceMock = mockCommandHandlerService;
      commandHandlerServiceMock.CopilotChatCommandHandlerService.mock.results[0].value.handleCommand.mockRejectedValue(new Error('Command processing error'));

      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;
      const callbacks = registerChatParticipantMock.mock.calls[0][1];

      // This should propagate the error
      let error;
      try {
        await callbacks.handleCommandIntent('errorCommand', {});
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.message).toBe('Command processing error');
    });
  });

  describe('Message Sending', () => {
    it('should send messages to Copilot chat', async () => {
      const instance = CopilotChatIntegration.getInstance();

      const result = await instance.sendMessageToCopilotChat('Test message');

      expect(result).toBe(true);
      const messageHandlerServiceMock = mockMessageHandlerService;
      const sendMessageMock = messageHandlerServiceMock.CopilotChatMessageHandlerService.mock.results[0].value.sendMessage;
      expect(sendMessageMock).toHaveBeenCalledWith('Test message');
    });

    it('should handle errors when sending messages', async () => {
      const messageHandlerServiceMock = mockMessageHandlerService;
      messageHandlerServiceMock.CopilotChatMessageHandlerService.mock.results[0].value.sendMessage.mockRejectedValue(new Error('Send error'));

      const instance = CopilotChatIntegration.getInstance();
      const result = await instance.sendMessageToCopilotChat('Test message');

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('Error sending message to Copilot chat', expect.any(Error));
    });

    it('should not send messages when integration is not active', async () => {
      // Mock the initialization service to return false for isIntegrationActive
      mockInitService.CopilotChatInitializationService.mockImplementation(() => {
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

    it('should send messages with varying lengths', async () => {
      const instance = CopilotChatIntegration.getInstance();
      const messageHandlerServiceMock = mockMessageHandlerService;
      const sendMessageMock = messageHandlerServiceMock.CopilotChatMessageHandlerService.mock.results[0].value.sendMessage;

      // Send short message
      await instance.sendMessageToCopilotChat('Hi');
      expect(sendMessageMock).toHaveBeenCalledWith('Hi');

      // Send long message
      const longMessage = 'A'.repeat(5000);
      await instance.sendMessageToCopilotChat(longMessage);
      expect(sendMessageMock).toHaveBeenCalledWith(longMessage);
    });

    it('should handle falsy message values (JavaScript specific)', async () => {
      const instance = CopilotChatIntegration.getInstance();
      const messageHandlerServiceMock = mockMessageHandlerService;
      const sendMessageMock = messageHandlerServiceMock.CopilotChatMessageHandlerService.mock.results[0].value.sendMessage;

      // Empty string
      await instance.sendMessageToCopilotChat('');
      expect(sendMessageMock).toHaveBeenCalledWith('');

      // Zero
      await instance.sendMessageToCopilotChat(0);
      expect(sendMessageMock).toHaveBeenCalledWith(0);

      // False
      await instance.sendMessageToCopilotChat(false);
      expect(sendMessageMock).toHaveBeenCalledWith(false);

      // Null
      await instance.sendMessageToCopilotChat(null);
      expect(sendMessageMock).toHaveBeenCalledWith(null);
    });

    it('should handle multiple successive message sends', async () => {
      const instance = CopilotChatIntegration.getInstance();
      const messageHandlerServiceMock = mockMessageHandlerService;
      const sendMessageMock = messageHandlerServiceMock.CopilotChatMessageHandlerService.mock.results[0].value.sendMessage;

      // First message succeeds
      sendMessageMock.mockResolvedValueOnce(true);
      const result1 = await instance.sendMessageToCopilotChat('Message 1');
      expect(result1).toBe(true);

      // Second message fails
      sendMessageMock.mockRejectedValueOnce(new Error('Network error'));
      const result2 = await instance.sendMessageToCopilotChat('Message 2');
      expect(result2).toBe(false);

      // Third message succeeds again
      sendMessageMock.mockResolvedValueOnce(true);
      const result3 = await instance.sendMessageToCopilotChat('Message 3');
      expect(result3).toBe(true);
    });
  });

  describe('Integration Status', () => {
    it('should check if integration is active', () => {
      const instance = CopilotChatIntegration.getInstance();

      const result = instance.isActive();

      expect(result).toBe(true);
      const initServiceMock = mockInitService;
      expect(initServiceMock.CopilotChatInitializationService.mock.results[0].value.isIntegrationActive).toHaveBeenCalled();
    });

    it('should toggle integration state', () => {
      const instance = CopilotChatIntegration.getInstance();

      const result = instance.toggleIntegration();

      expect(result).toBe(true);
      const initServiceMock = mockInitService;
      expect(initServiceMock.CopilotChatInitializationService.mock.results[0].value.toggleIntegration).toHaveBeenCalled();
    });

    it('should report inactive status correctly', () => {
      mockInitService.CopilotChatInitializationService.mockImplementation(() => {
        return {
          initializeCopilotExtension: jest.fn().mockResolvedValue({ id: 'mock-chat-provider' }),
          isIntegrationActive: jest.fn().mockReturnValue(false),
          toggleIntegration: jest.fn().mockReturnValue(true)
        };
      });

      // Reset the singleton
      CopilotChatIntegration.instance = undefined;
      const instance = CopilotChatIntegration.getInstance();

      expect(instance.isActive()).toBe(false);
    });

    it('should handle multiple toggle calls', () => {
      const instance = CopilotChatIntegration.getInstance();
      const initServiceMock = mockInitService;
      const initServiceInstance = initServiceMock.CopilotChatInitializationService.mock.results[0].value;

      // First toggle returns true
      initServiceInstance.toggleIntegration.mockReturnValueOnce(true);
      const result1 = instance.toggleIntegration();
      expect(result1).toBe(true);

      // Second toggle returns false
      initServiceInstance.toggleIntegration.mockReturnValueOnce(false);
      const result2 = instance.toggleIntegration();
      expect(result2).toBe(false);
    });

    it('should maintain active state between calls', () => {
      // Create first instance with active = true
      let instance = CopilotChatIntegration.getInstance();
      expect(instance.isActive()).toBe(true);

      // Simulate toggling to inactive
      const initServiceMock = mockInitService;
      const initServiceInstance = initServiceMock.CopilotChatInitializationService.mock.results[0].value;
      initServiceInstance.isIntegrationActive.mockReturnValue(false);

      // Should now return inactive without recreating the instance
      expect(instance.isActive()).toBe(false);

      // Reset singleton and create a new instance
      CopilotChatIntegration.instance = undefined;
      // Configure for active again
      initServiceInstance.isIntegrationActive.mockReturnValue(true);
      instance = CopilotChatIntegration.getInstance();
      expect(instance.isActive()).toBe(true);
    });
  });

  describe('JavaScript-specific behavior', () => {
    it('should handle prototype pollution attempts', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;
      const callbacks = registerChatParticipantMock.mock.calls[0][1];

      // Create an object with __proto__ in its structure
      const maliciousRequest = {
        message: 'Prototype pollution attempt',
        __proto__: { malicious: true },
        constructor: { prototype: { isAdmin: true } }
      };

      // This should not throw but handle it gracefully
      await callbacks.handleMessage(maliciousRequest);

      // Validate correct message was logged
      expect(mockLogger.info).toHaveBeenCalledWith('Received chat message: Prototype pollution attempt');
    });

    it('should handle circular references in message objects', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;
      const callbacks = registerChatParticipantMock.mock.calls[0][1];

      // Create object with circular reference
      const circularObj = { message: 'Circular reference test' };
      circularObj.self = circularObj;

      // This should not throw but handle it gracefully
      await callbacks.handleMessage(circularObj);

      // Validate message handler was called with circular object
      const messageHandlerServiceMock = mockMessageHandlerService;
      const handleMessageMock = messageHandlerServiceMock.CopilotChatMessageHandlerService.mock.results[0].value.handleMessage;
      expect(handleMessageMock).toHaveBeenCalled();

      // Check that correct message text was logged
      expect(mockLogger.info).toHaveBeenCalledWith('Received chat message: Circular reference test');
    });

    it('should handle function objects in message parameters', async () => {
      const instance = CopilotChatIntegration.getInstance();
      await instance.initialize();

      const participantServiceMock = mockParticipantService;
      const registerChatParticipantMock = participantServiceMock.CopilotChatParticipantService.mock.results[0].value.registerChatParticipant;
      const callbacks = registerChatParticipantMock.mock.calls[0][1];

      // Create object with function property
      const funcObj = {
        message: 'Function object test',
        callback: function() { return 'test'; }
      };

      // This should not throw but handle it gracefully
      await callbacks.handleMessage(funcObj);

      // Validate message handler was called
      const messageHandlerServiceMock = mockMessageHandlerService;
      const handleMessageMock = messageHandlerServiceMock.CopilotChatMessageHandlerService.mock.results[0].value.handleMessage;
      expect(handleMessageMock).toHaveBeenCalled();

      expect(mockLogger.info).toHaveBeenCalledWith('Received chat message: Function object test');
    });
  });
});
