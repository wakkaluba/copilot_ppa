import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as vscode from 'vscode';
import { registerRuntimeAnalyzerCommands } from '../../../src/commands/runtime-analyzer-commands';
import { runtimeAnalyzer } from '../../../src/runtime-analyzer';

// Mock VS Code namespace
jest.mock('vscode', () => {
  const mockCommands = {
    registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    executeCommand: jest.fn()
  };

  const mockWindow = {
    showInformationMessage: jest.fn().mockResolvedValue(null),
    showErrorMessage: jest.fn().mockResolvedValue(null),
    showInputBox: jest.fn().mockResolvedValue(null),
    showSaveDialog: jest.fn().mockResolvedValue(null),
    createTextEditorDecorationType: jest.fn().mockReturnValue({
      dispose: jest.fn()
    })
  };

  // Mock Position and Range
  class Position {
    constructor(public readonly line: number, public readonly character: number) {}
  }

  class Range {
    constructor(
      public readonly start: Position,
      public readonly end: Position
    ) {}
  }

  // Mock Selection
  class Selection extends Range {
    constructor(
      public readonly anchor: Position,
      public readonly active: Position
    ) {
      super(anchor, active);
    }
    public isEmpty = false;
  }

  // Mock TextDocument and TextEditor
  class TextDocument {
    constructor() {}
    getText(range: Range) { return 'function test() {\n  console.log("test");\n}'; }
    lineAt(line: number) {
      return {
        text: '  console.log("test");',
        range: new Range(new Position(line, 0), new Position(line, 20))
      };
    }
  }

  return {
    commands: mockCommands,
    window: mockWindow,
    Position,
    Range,
    Selection,
    TextDocument,
    Uri: {
      file: jest.fn().mockImplementation(path => ({ fsPath: path }))
    },
    SaveDialogOptions: jest.fn(),
    ExtensionContext: jest.fn()
  };
});

// Mock runtime analyzer
jest.mock('../../../src/runtime-analyzer', () => ({
  runtimeAnalyzer: {
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    exportResults: jest.fn(),
    visualizeResults: jest.fn(),
    markStart: jest.fn(),
    markEnd: jest.fn()
  }
}));

describe('Runtime Analyzer Commands', () => {
  let mockContext: vscode.ExtensionContext;
  let mockSubscriptions: { dispose: jest.Mock }[];
  let mockEditor: {
    document: any;
    selection: any;
    edit: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mock context
    mockSubscriptions = [];
    mockContext = {
      subscriptions: mockSubscriptions
    } as unknown as vscode.ExtensionContext;

    // Set up mock editor
    mockEditor = {
      document: new vscode.TextDocument(),
      selection: new vscode.Selection(
        new vscode.Position(1, 0),
        new vscode.Position(1, 20)
      ),
      edit: jest.fn().mockImplementation(callback => {
        callback({ replace: jest.fn() });
        return Promise.resolve(true);
      })
    };

    // Mock the active text editor
    (vscode.window as any).activeTextEditor = mockEditor;

    // Register the commands to test
    registerRuntimeAnalyzerCommands(mockContext);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should register all runtime analyzer commands', () => {
    // Verify all commands are registered
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'localLLMAgent.runtimeAnalyzer.startRecording',
      expect.any(Function)
    );

    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'localLLMAgent.runtimeAnalyzer.stopRecording',
      expect.any(Function)
    );

    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'localLLMAgent.runtimeAnalyzer.exportResults',
      expect.any(Function)
    );

    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'localLLMAgent.runtimeAnalyzer.visualize',
      expect.any(Function)
    );

    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'localLLMAgent.runtimeAnalyzer.addMarkers',
      expect.any(Function)
    );

    // Verify subscriptions are added
    expect(mockContext.subscriptions.length).toBe(5);
  });

  test('startRecording command should start recording and show notification', () => {
    // Get the registered command handler
    const startRecordingHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'localLLMAgent.runtimeAnalyzer.startRecording'
    )[1];

    // Call the handler
    startRecordingHandler();

    // Verify recording started and user was notified
    expect(runtimeAnalyzer.startRecording).toHaveBeenCalled();
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Runtime analysis recording started'
    );
  });

  test('stopRecording command should stop recording and show notification', () => {
    // Get the registered command handler
    const stopRecordingHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'localLLMAgent.runtimeAnalyzer.stopRecording'
    )[1];

    // Call the handler
    stopRecordingHandler();

    // Verify recording stopped and user was notified
    expect(runtimeAnalyzer.stopRecording).toHaveBeenCalled();
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Runtime analysis recording stopped'
    );
  });

  test('exportResults command should show save dialog and export results when uri is provided', async () => {
    // Mock the save dialog to return a URI
    const mockUri = { fsPath: '/path/to/export.json' };
    (vscode.window.showSaveDialog as jest.Mock).mockResolvedValue(mockUri);

    // Get the registered command handler
    const exportResultsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'localLLMAgent.runtimeAnalyzer.exportResults'
    )[1];

    // Call the handler
    await exportResultsHandler();

    // Verify save dialog was shown with correct options
    expect(vscode.window.showSaveDialog).toHaveBeenCalledWith({
      defaultUri: expect.anything(),
      filters: {
        'JSON files': ['json'],
        'All files': ['*']
      }
    });

    // Verify export was called with the correct path
    expect(runtimeAnalyzer.exportResults).toHaveBeenCalledWith('/path/to/export.json');
  });

  test('exportResults command should not export when uri is not provided', async () => {
    // Mock the save dialog to return null (user cancelled)
    (vscode.window.showSaveDialog as jest.Mock).mockResolvedValue(null);

    // Get the registered command handler
    const exportResultsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'localLLMAgent.runtimeAnalyzer.exportResults'
    )[1];

    // Call the handler
    await exportResultsHandler();

    // Verify save dialog was shown
    expect(vscode.window.showSaveDialog).toHaveBeenCalled();

    // Verify export was not called
    expect(runtimeAnalyzer.exportResults).not.toHaveBeenCalled();
  });

  test('visualize command should call visualizeResults', () => {
    // Get the registered command handler
    const visualizeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'localLLMAgent.runtimeAnalyzer.visualize'
    )[1];

    // Call the handler
    visualizeHandler();

    // Verify visualize was called
    expect(runtimeAnalyzer.visualizeResults).toHaveBeenCalled();
  });

  test('addMarkers command should show error when no editor is active', async () => {
    // Remove the active editor
    (vscode.window as any).activeTextEditor = undefined;

    // Get the registered command handler
    const addMarkersHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'localLLMAgent.runtimeAnalyzer.addMarkers'
    )[1];

    // Call the handler
    await addMarkersHandler();

    // Verify error message was shown
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No active editor');

    // Verify no further actions were taken
    expect(vscode.window.showInputBox).not.toHaveBeenCalled();
  });

  test('addMarkers command should show error when no text is selected', async () => {
    // Set an empty selection
    mockEditor.selection.isEmpty = true;

    // Get the registered command handler
    const addMarkersHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'localLLMAgent.runtimeAnalyzer.addMarkers'
    )[1];

    // Call the handler
    await addMarkersHandler();

    // Verify error message was shown
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No code selected');

    // Verify no further actions were taken
    expect(vscode.window.showInputBox).not.toHaveBeenCalled();
  });

  test('addMarkers command should abort when no marker ID is provided', async () => {
    // Mock input box to return null (user cancelled)
    (vscode.window.showInputBox as jest.Mock).mockResolvedValue(null);

    // Get the registered command handler
    const addMarkersHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'localLLMAgent.runtimeAnalyzer.addMarkers'
    )[1];

    // Call the handler
    await addMarkersHandler();

    // Verify input box was shown with correct options
    expect(vscode.window.showInputBox).toHaveBeenCalledWith({
      prompt: 'Enter a marker ID for this code section',
      placeHolder: 'e.g., functionName, processData, etc.'
    });

    // Verify no edit was attempted
    expect(mockEditor.edit).not.toHaveBeenCalled();
  });

  test('addMarkers command should add markers to selected code', async () => {
    // Mock input box to return a marker ID
    (vscode.window.showInputBox as jest.Mock).mockResolvedValue('testFunction');

    // Get the registered command handler
    const addMarkersHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'localLLMAgent.runtimeAnalyzer.addMarkers'
    )[1];

    // Call the handler
    await addMarkersHandler();

    // Verify input box was shown
    expect(vscode.window.showInputBox).toHaveBeenCalled();

    // Verify editor.edit was called
    expect(mockEditor.edit).toHaveBeenCalled();

    // Verify information message was shown
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Runtime analyzer markers added for "testFunction"'
    );
  });

  test('getIndentation function should extract indentation from text', () => {
    // Create a test document and position
    const document = new vscode.TextDocument();
    const lineNumber = 1; // Line with indentation

    // Call the private getIndentation function
    // We need to extract it from the command handler
    const addMarkersHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'localLLMAgent.runtimeAnalyzer.addMarkers'
    )[1];

    // Mock the window.showInputBox to return a value so we can track the execution
    (vscode.window.showInputBox as jest.Mock).mockResolvedValue('testFunction');

    // Prepare to intercept the result by mocking edit
    let capturedMarkedCode = '';
    mockEditor.edit.mockImplementation(callback => {
      callback({
        replace: (range, text) => {
          capturedMarkedCode = text;
        }
      });
      return Promise.resolve(true);
    });

    // Call the handler
    return addMarkersHandler().then(() => {
      // Verify the indentation was extracted and used in the marked code
      expect(capturedMarkedCode).toContain('  runtimeAnalyzer.markStart');
      expect(capturedMarkedCode).toContain('  runtimeAnalyzer.markEnd');
    });
  });
});
