// filepath: d:\___coding\tools\copilot_ppa\tests\unit\commands\structureReorganizationCommand.test.js
const { afterEach, beforeEach, describe, expect, jest, test } = require('@jest/globals');
const vscode = require('vscode');
const path = require('path');
const { StructureReorganizationCommand } = require('../../../src/commands/structureReorganizationCommand');
const { StructureReorganizer } = require('../../../src/services/refactoring/structureReorganizer');

// Mock vscode API
jest.mock('vscode', () => ({
  commands: {
    registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    executeCommand: jest.fn().mockResolvedValue(undefined)
  },
  window: {
    activeTextEditor: undefined,
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn().mockResolvedValue(undefined),
    withProgress: jest.fn().mockImplementation((options, task) => task({ report: jest.fn() }))
  },
  workspace: {
    registerTextDocumentContentProvider: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    applyEdit: jest.fn().mockResolvedValue(true)
  },
  ProgressLocation: {
    Notification: 1
  },
  Uri: {
    file: jest.fn(filePath => ({ fsPath: filePath })),
    with: jest.fn().mockImplementation(() => ({
      scheme: 'proposed-reorganization',
      fsPath: '/test/path'
    }))
  },
  Range: jest.fn(),
  EventEmitter: jest.fn().mockImplementation(() => ({
    event: 'event',
    fire: jest.fn()
  })),
  WorkspaceEdit: jest.fn().mockImplementation(() => ({
    replace: jest.fn()
  }))
}));

// Mock path module
jest.mock('path', () => ({
  basename: jest.fn().mockReturnValue('test-file.ts')
}));

// Mock StructureReorganizer
jest.mock('../../../src/services/refactoring/structureReorganizer', () => ({
  StructureReorganizer: jest.fn().mockImplementation(() => ({
    analyzeFileStructure: jest.fn().mockResolvedValue({
      suggestions: [
        { type: 'split_file', description: 'File is too large', severity: 'warning' }
      ],
      summary: 'Found 1 improvement suggestion'
    }),
    proposeReorganization: jest.fn().mockResolvedValue({
      originalCode: 'original code',
      reorganizedCode: 'reorganized code',
      changes: [
        { type: 'split_file', description: 'File is too large', location: { start: 0, end: 10 } }
      ]
    }),
    applyReorganization: jest.fn().mockResolvedValue(undefined)
  }))
}));

describe('StructureReorganizationCommand', () => {
  let command;
  let mockEditor;
  let mockDocument;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up a mock editor and document
    mockDocument = {
      uri: { fsPath: '/test/file.ts', with: jest.fn() },
      getText: jest.fn().mockReturnValue('mock file content'),
      positionAt: jest.fn().mockReturnValue({ line: 0, character: 0 })
    };

    mockEditor = {
      document: mockDocument,
      selection: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }
    };

    // Set active text editor
    vscode.window.activeTextEditor = mockEditor;

    // Create command instance
    command = new StructureReorganizationCommand();
  });

  afterEach(() => {
    jest.resetAllMocks();
    vscode.window.activeTextEditor = undefined;
  });

  test('should register command with VS Code', () => {
    const disposable = command.register();

    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'vscodeLocalLLMAgent.reorganizeCodeStructure',
      expect.any(Function)
    );
    expect(disposable).toBeDefined();
  });

  test('should show error when no active editor', async () => {
    // Remove active editor
    vscode.window.activeTextEditor = undefined;

    // Get the registered command handler
    const handler = vscode.commands.registerCommand.mock.calls[0][1];

    // Execute the command handler
    await handler();

    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No active editor found');
    expect(vscode.window.withProgress).not.toHaveBeenCalled();
  });

  test('should analyze structure and show proposal', async () => {
    // Get the registered command handler
    const handler = vscode.commands.registerCommand.mock.calls[0][1];

    // Execute the command handler
    await handler();

    // Verify progress was shown
    expect(vscode.window.withProgress).toHaveBeenCalled();
    expect(vscode.window.withProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        location: vscode.ProgressLocation.Notification,
        title: expect.stringContaining('Analyzing code structure')
      }),
      expect.any(Function)
    );

    // Verify structure reorganizer was called
    const structureReorganizer = new StructureReorganizer();
    expect(structureReorganizer.analyzeFileStructure).toHaveBeenCalledWith('/test/file.ts');
    expect(structureReorganizer.proposeReorganization).toHaveBeenCalledWith('/test/file.ts');

    // Verify content provider was registered
    expect(vscode.workspace.registerTextDocumentContentProvider).toHaveBeenCalledWith(
      'proposed-reorganization',
      expect.any(Object)
    );

    // Verify diff view was shown
    expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
      'vscode.diff',
      expect.anything(),
      expect.anything(),
      expect.stringContaining('Structure Reorganization'),
      expect.anything()
    );

    // Verify user was asked about applying changes
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining('structure improvements suggested'),
      expect.any(Object),
      'Apply',
      'Cancel'
    );
  });

  test('should apply reorganization when user confirms', async () => {
    // Mock user confirmation
    vscode.window.showInformationMessage.mockResolvedValueOnce('Apply');

    // Get the registered command handler
    const handler = vscode.commands.registerCommand.mock.calls[0][1];

    // Execute the command handler
    await handler();

    // Verify reorganization was applied
    const structureReorganizer = new StructureReorganizer();
    expect(structureReorganizer.applyReorganization).toHaveBeenCalledWith(
      '/test/file.ts',
      expect.objectContaining({
        originalCode: 'original code',
        reorganizedCode: 'reorganized code'
      })
    );

    // Verify success message was shown
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Code structure reorganized successfully.'
    );
  });

  test('should not apply reorganization when user cancels', async () => {
    // Mock user cancellation
    vscode.window.showInformationMessage.mockResolvedValueOnce('Cancel');

    // Get the registered command handler
    const handler = vscode.commands.registerCommand.mock.calls[0][1];

    // Execute the command handler
    await handler();

    // Verify reorganization was not applied
    const structureReorganizer = new StructureReorganizer();
    expect(structureReorganizer.applyReorganization).not.toHaveBeenCalled();
  });

  test('should show message when no improvements suggested', async () => {
    // Mock empty changes array
    const structureReorganizer = new StructureReorganizer();
    structureReorganizer.proposeReorganization.mockResolvedValueOnce({
      originalCode: 'original code',
      reorganizedCode: 'original code',
      changes: []
    });

    // Get the registered command handler
    const handler = vscode.commands.registerCommand.mock.calls[0][1];

    // Execute the command handler
    await handler();

    // Verify appropriate message was shown
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'No structure improvements suggested for this file.'
    );

    // Verify diff view was not shown
    expect(vscode.commands.executeCommand).not.toHaveBeenCalledWith(
      'vscode.diff',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything()
    );
  });

  test('should handle errors during analysis', async () => {
    // Mock analysis error
    const structureReorganizer = new StructureReorganizer();
    const testError = new Error('Analysis failed');
    structureReorganizer.analyzeFileStructure.mockRejectedValueOnce(testError);

    // Get the registered command handler
    const handler = vscode.commands.registerCommand.mock.calls[0][1];

    // Execute the command handler
    await handler();

    // Verify error message was shown
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      'Error analyzing code structure: Analysis failed'
    );
  });

  test('should handle non-Error objects during analysis', async () => {
    // Mock analysis error with a non-Error object
    const structureReorganizer = new StructureReorganizer();
    structureReorganizer.analyzeFileStructure.mockRejectedValueOnce('String error');

    // Get the registered command handler
    const handler = vscode.commands.registerCommand.mock.calls[0][1];

    // Execute the command handler
    await handler();

    // Verify error message was shown
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      'Error analyzing code structure: String error'
    );
  });

  test('should provide correct content via TextDocumentContentProvider', async () => {
    // Get the registered command handler
    const handler = vscode.commands.registerCommand.mock.calls[0][1];

    // Execute the command handler
    await handler();

    // Get the content provider that was registered
    const contentProvider = vscode.workspace.registerTextDocumentContentProvider.mock.calls[0][1];

    // Test the provideTextDocumentContent method
    const content = contentProvider.provideTextDocumentContent({
      scheme: 'proposed-reorganization',
      fsPath: '/test/file.ts'
    });

    expect(content).toBe('reorganized code');
  });

  test('should dispose of the content provider registration', async () => {
    // Mock the registration return value
    const mockDispose = jest.fn();
    vscode.workspace.registerTextDocumentContentProvider.mockReturnValueOnce({
      dispose: mockDispose
    });

    // Get the registered command handler
    const handler = vscode.commands.registerCommand.mock.calls[0][1];

    // Execute the command handler
    await handler();

    // Verify registration was disposed
    expect(mockDispose).toHaveBeenCalled();
  });
});
