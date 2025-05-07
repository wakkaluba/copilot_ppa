"use strict";

const { afterEach, beforeEach, describe, expect, jest, test } = require('@jest/globals');
const vscode = require('vscode');
const { SnippetCommands } = require('../../../src/commands/snippetCommands');
const { SnippetManager } = require('../../../src/services/snippetManager');
const { ConversationManager } = require('../../../src/services/conversationManager');
const { SnippetCreationService } = require('../../../src/services/snippets/SnippetCreationService');
const { SnippetSelectionService } = require('../../../src/services/snippets/SnippetSelectionService');
const { SnippetInsertionService } = require('../../../src/services/snippets/SnippetInsertionService');

// Mock external dependencies
jest.mock('vscode', () => ({
  commands: {
    registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    executeCommand: jest.fn().mockResolvedValue(undefined)
  },
  window: {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn()
  },
  ExtensionContext: jest.fn()
}));

jest.mock('../../../src/services/snippetManager', () => ({
  SnippetManager: {
    getInstance: jest.fn().mockReturnValue({
      getSnippets: jest.fn().mockResolvedValue([
        { id: 'snippet1', name: 'Test Snippet 1', content: 'console.log("snippet1");' },
        { id: 'snippet2', name: 'Test Snippet 2', content: 'console.log("snippet2");' }
      ]),
      createSnippet: jest.fn().mockResolvedValue({ id: 'newSnippet', name: 'New Snippet', content: 'console.log("new snippet");' }),
      updateSnippet: jest.fn().mockResolvedValue(true),
      deleteSnippet: jest.fn().mockResolvedValue(true)
    })
  }
}));

jest.mock('../../../src/services/conversationManager', () => ({
  ConversationManager: {
    getInstance: jest.fn().mockReturnValue({
      getConversation: jest.fn().mockResolvedValue({
        id: 'conv1',
        messages: [
          { id: 'msg1', content: 'Hello', role: 'user' },
          { id: 'msg2', content: 'console.log("response code");', role: 'assistant' }
        ]
      }),
      getMessages: jest.fn().mockResolvedValue([
        { id: 'msg1', content: 'Hello', role: 'user' },
        { id: 'msg2', content: 'console.log("response code");', role: 'assistant' }
      ])
    })
  }
}));

jest.mock('../../../src/services/snippets/SnippetCreationService', () => ({
  SnippetCreationService: jest.fn().mockImplementation(() => ({
    createSnippet: jest.fn().mockResolvedValue(undefined)
  }))
}));

jest.mock('../../../src/services/snippets/SnippetSelectionService', () => ({
  SnippetSelectionService: jest.fn().mockImplementation(() => ({
    selectSnippet: jest.fn().mockResolvedValue({
      id: 'snippet1',
      name: 'Test Snippet 1',
      content: 'console.log("selected snippet");'
    })
  }))
}));

jest.mock('../../../src/services/snippets/SnippetInsertionService', () => ({
  SnippetInsertionService: jest.fn().mockImplementation(() => ({
    insertSnippet: jest.fn().mockResolvedValue(undefined)
  }))
}));

describe('SnippetCommands', () => {
  let snippetCommands;
  let mockContext;
  let mockCreationService;
  let mockSelectionService;
  let mockInsertionService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mock context
    mockContext = {
      subscriptions: []
    };

    // Create instance of SnippetCommands
    snippetCommands = new SnippetCommands(mockContext);

    // Access the private services for testing
    mockCreationService = snippetCommands.creationService;
    mockSelectionService = snippetCommands.selectionService;
    mockInsertionService = snippetCommands.insertionService;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should register all snippet commands', () => {
    // Register commands
    const disposables = snippetCommands.register();

    // Verify command registration
    expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(3);
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilotPPA.createSnippet',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilotPPA.insertSnippet',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilotPPA.manageSnippets',
      expect.any(Function)
    );

    // Verify disposables are returned
    expect(disposables.length).toBe(3);
    disposables.forEach(disposable => {
      expect(disposable).toHaveProperty('dispose');
    });
  });

  test('should create snippet with conversation id and message indices', async () => {
    // Get the registered command handler for createSnippet
    const createSnippetHandler = vscode.commands.registerCommand.mock.calls.find(
      call => call[0] === 'copilotPPA.createSnippet'
    )[1];

    // Call the handler with test parameters
    const conversationId = 'test-conversation';
    const messageIndices = [0, 1];
    await createSnippetHandler(conversationId, messageIndices);

    // Verify the creation service was called with correct parameters
    expect(mockCreationService.createSnippet).toHaveBeenCalledWith(conversationId, messageIndices);
  });

  test('should handle error when creating snippet', async () => {
    // Get the registered command handler for createSnippet
    const createSnippetHandler = vscode.commands.registerCommand.mock.calls.find(
      call => call[0] === 'copilotPPA.createSnippet'
    )[1];

    // Make the creation service throw an error
    const testError = new Error('Failed to create snippet');
    mockCreationService.createSnippet.mockRejectedValueOnce(testError);

    // Call the handler
    await createSnippetHandler();

    // Verify error message was shown
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Failed to create snippet: Failed to create snippet');
  });

  test('should select and insert snippet', async () => {
    // Get the registered command handler for insertSnippet
    const insertSnippetHandler = vscode.commands.registerCommand.mock.calls.find(
      call => call[0] === 'copilotPPA.insertSnippet'
    )[1];

    // Call the handler
    await insertSnippetHandler();

    // Verify the selection service was called
    expect(mockSelectionService.selectSnippet).toHaveBeenCalled();

    // Verify the insertion service was called with the selected snippet
    expect(mockInsertionService.insertSnippet).toHaveBeenCalledWith({
      id: 'snippet1',
      name: 'Test Snippet 1',
      content: 'console.log("selected snippet");'
    });
  });

  test('should not insert when no snippet is selected', async () => {
    // Get the registered command handler for insertSnippet
    const insertSnippetHandler = vscode.commands.registerCommand.mock.calls.find(
      call => call[0] === 'copilotPPA.insertSnippet'
    )[1];

    // Make the selection service return null (no snippet selected)
    mockSelectionService.selectSnippet.mockResolvedValueOnce(null);

    // Call the handler
    await insertSnippetHandler();

    // Verify the selection service was called
    expect(mockSelectionService.selectSnippet).toHaveBeenCalled();

    // Verify the insertion service was not called
    expect(mockInsertionService.insertSnippet).not.toHaveBeenCalled();
  });

  test('should handle error when inserting snippet', async () => {
    // Get the registered command handler for insertSnippet
    const insertSnippetHandler = vscode.commands.registerCommand.mock.calls.find(
      call => call[0] === 'copilotPPA.insertSnippet'
    )[1];

    // Make the selection service throw an error
    const testError = new Error('Failed to select snippet');
    mockSelectionService.selectSnippet.mockRejectedValueOnce(testError);

    // Call the handler
    await insertSnippetHandler();

    // Verify error message was shown
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Failed to insert snippet: Failed to select snippet');
  });

  test('should open snippets panel when managing snippets', async () => {
    // Get the registered command handler for manageSnippets
    const manageSnippetsHandler = vscode.commands.registerCommand.mock.calls.find(
      call => call[0] === 'copilotPPA.manageSnippets'
    )[1];

    // Call the handler
    await manageSnippetsHandler();

    // Verify the correct command was executed
    expect(vscode.commands.executeCommand).toHaveBeenCalledWith('copilotPPA.openSnippetsPanel');
  });

  test('should properly initialize services', () => {
    // Verify the services were initialized correctly
    expect(SnippetManager.getInstance).toHaveBeenCalledWith(mockContext);
    expect(ConversationManager.getInstance).toHaveBeenCalledWith(mockContext);
    expect(SnippetCreationService).toHaveBeenCalledWith(
      SnippetManager.getInstance(mockContext),
      ConversationManager.getInstance(mockContext)
    );
    expect(SnippetSelectionService).toHaveBeenCalledWith(
      SnippetManager.getInstance(mockContext),
      ConversationManager.getInstance(mockContext)
    );
    expect(SnippetInsertionService).toHaveBeenCalled();
  });
});
