// filepath: d:\___coding\tools\copilot_ppa\tests\unit\commands\themeSettingsCommand.test.ts
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as vscode from 'vscode';
import { ThemeSettingsCommand } from '../../../src/commands/themeSettingsCommand';
import { ThemeManager } from '../../../src/services/themeManager';
import { ThemeEditorHtmlProvider } from '../../../src/ui/ThemeEditorHtmlProvider';
import { ThemeSettingsHtmlProvider } from '../../../src/ui/ThemeSettingsHtmlProvider';
import { WebviewPanelManager } from '../../../src/webview/webviewPanelManager';

// Mock vscode API
jest.mock('vscode', () => ({
  commands: {
    registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() })
  },
  window: {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    showInputBox: jest.fn().mockResolvedValue('My Custom Theme')
  },
  ViewColumn: {
    One: 1
  },
  EventEmitter: jest.fn()
}));

// Mock ThemeManager
jest.mock('../../../src/services/themeManager', () => ({
  ThemeManager: {
    getInstance: jest.fn().mockReturnValue({
      getCurrentTheme: jest.fn().mockReturnValue({
        id: 'theme1',
        name: 'Default Theme',
        type: 'dark',
        colors: { 'editor.background': '#1e1e1e' }
      }),
      getAllThemes: jest.fn().mockReturnValue([
        {
          id: 'theme1',
          name: 'Default Theme',
          type: 'dark',
          colors: { 'editor.background': '#1e1e1e' }
        },
        {
          id: 'theme2',
          name: 'Light Theme',
          type: 'light',
          colors: { 'editor.background': '#ffffff' }
        }
      ]),
      setTheme: jest.fn(),
      addCustomTheme: jest.fn().mockResolvedValue(undefined),
      updateCustomTheme: jest.fn().mockResolvedValue(undefined),
      deleteCustomTheme: jest.fn().mockResolvedValue(undefined)
    })
  }
}));

// Mock WebviewPanelManager
jest.mock('../../../src/webview/webviewPanelManager', () => ({
  WebviewPanelManager: {
    createOrShowPanel: jest.fn().mockReturnValue({
      webview: {
        html: '',
        onDidReceiveMessage: jest.fn(),
        postMessage: jest.fn()
      },
      onDidDispose: jest.fn().mockImplementation(callback => {
        // Store the callback to simulate panel disposal later if needed
        return { dispose: jest.fn() };
      })
    })
  }
}));

// Mock ThemeSettingsHtmlProvider
jest.mock('../../../src/ui/ThemeSettingsHtmlProvider', () => ({
  ThemeSettingsHtmlProvider: {
    getSettingsHtml: jest.fn().mockReturnValue('<html>Mock Settings HTML</html>')
  }
}));

// Mock ThemeEditorHtmlProvider
jest.mock('../../../src/ui/ThemeEditorHtmlProvider', () => ({
  ThemeEditorHtmlProvider: {
    getEditorHtml: jest.fn().mockReturnValue('<html>Mock Editor HTML</html>')
  }
}));

describe('ThemeSettingsCommand', () => {
  let command: ThemeSettingsCommand;
  let mockContext: vscode.ExtensionContext;
  let mockPanel: any;
  let mockThemeManager: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up a mock extension context
    mockContext = {
      subscriptions: []
    } as any;

    // Get references to mocks for easier assertions
    mockThemeManager = ThemeManager.getInstance(mockContext);
    mockPanel = WebviewPanelManager.createOrShowPanel('', '', 1);

    // Create command instance
    command = new ThemeSettingsCommand(mockContext);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should register both theme commands with VS Code', () => {
    const disposables = command.register();

    expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(2);
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilotPPA.openThemeSettings',
      expect.any(Function)
    );
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'copilotPPA.createCustomTheme',
      expect.any(Function)
    );
    expect(disposables.length).toBe(2);
  });

  test('should open theme settings panel', () => {
    // Get the openThemeSettings function
    const openThemeSettingsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilotPPA.openThemeSettings'
    )[1];

    // Execute the handler
    openThemeSettingsHandler();

    // Verify WebviewPanelManager was called with correct parameters
    expect(WebviewPanelManager.createOrShowPanel).toHaveBeenCalledWith(
      'themeSettings',
      'Theme Settings',
      vscode.ViewColumn.One
    );

    // Verify theme data was retrieved
    expect(mockThemeManager.getCurrentTheme).toHaveBeenCalled();
    expect(mockThemeManager.getAllThemes).toHaveBeenCalled();

    // Verify HTML was set
    expect(ThemeSettingsHtmlProvider.getSettingsHtml).toHaveBeenCalledWith(
      mockThemeManager.getCurrentTheme(),
      mockThemeManager.getAllThemes()
    );

    // Verify message handler was registered
    expect(mockPanel.webview.onDidReceiveMessage).toHaveBeenCalled();
  });

  test('should create a custom theme', async () => {
    // Get the createCustomTheme function
    const createCustomThemeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
      call => call[0] === 'copilotPPA.createCustomTheme'
    )[1];

    // Execute the handler
    await createCustomThemeHandler();

    // Verify input box was shown for theme name
    expect(vscode.window.showInputBox).toHaveBeenCalledWith({
      prompt: 'Enter a name for your custom theme',
      placeHolder: 'My Custom Theme',
      value: 'Default Theme (Custom)'
    });

    // Verify theme was added
    expect(mockThemeManager.addCustomTheme).toHaveBeenCalled();
    expect(mockThemeManager.addCustomTheme).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My Custom Theme'
      })
    );

    // Verify success message was shown
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Custom theme "My Custom Theme" created'
    );

    // Verify editor was opened for the new theme
    expect(WebviewPanelManager.createOrShowPanel).toHaveBeenCalledWith(
      'themeEditor',
      expect.stringContaining('Edit Theme:'),
      vscode.ViewColumn.One
    );
  });

  test('should handle user cancelling custom theme creation', async () => {
    // Mock user cancellation
    (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce(undefined);

    // Get access to the createCustomTheme method through any
    const createCustomTheme = (command as any).createCustomTheme.bind(command);

    // Call the method directly
    await createCustomTheme();

    // Verify theme was not added
    expect(mockThemeManager.addCustomTheme).not.toHaveBeenCalled();

    // Verify no webview was created
    expect(WebviewPanelManager.createOrShowPanel).not.toHaveBeenCalledWith(
      'themeEditor',
      expect.anything(),
      expect.anything()
    );
  });

  test('should handle theme creation error', async () => {
    // Mock error during theme creation
    const error = new Error('Failed to add theme');
    (mockThemeManager.addCustomTheme as jest.Mock).mockRejectedValueOnce(error);

    // Get access to the createCustomTheme method through any
    const createCustomTheme = (command as any).createCustomTheme.bind(command);

    // Call the method directly
    await createCustomTheme();

    // Verify error message was shown
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      'Failed to create custom theme: Failed to add theme'
    );
  });

  test('should edit a custom theme', async () => {
    // Get access to the editCustomTheme method through any
    const editCustomTheme = (command as any).editCustomTheme.bind(command);

    // Call the method directly with a theme ID
    await editCustomTheme('theme2');

    // Verify WebviewPanelManager was called with correct parameters
    expect(WebviewPanelManager.createOrShowPanel).toHaveBeenCalledWith(
      'themeEditor',
      'Edit Theme: Light Theme',
      vscode.ViewColumn.One
    );

    // Verify HTML was set
    expect(ThemeEditorHtmlProvider.getEditorHtml).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'theme2',
        name: 'Light Theme'
      })
    );

    // Verify message handler was registered
    expect(mockPanel.webview.onDidReceiveMessage).toHaveBeenCalled();
  });

  test('should show error when editing non-existent theme', async () => {
    // Get access to the editCustomTheme method through any
    const editCustomTheme = (command as any).editCustomTheme.bind(command);

    // Call the method directly with a non-existent theme ID
    await editCustomTheme('theme-nonexistent');

    // Verify error message was shown
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      'Theme with ID theme-nonexistent not found'
    );

    // Verify no webview was created
    expect(WebviewPanelManager.createOrShowPanel).not.toHaveBeenCalledWith(
      'themeEditor',
      expect.anything(),
      expect.anything()
    );
  });

  test('should handle settings message: selectTheme', () => {
    // Get access to the handleSettingsMessage method through any
    const handleSettingsMessage = (command as any).handleSettingsMessage.bind(command);

    // Call the method directly with a selectTheme message
    handleSettingsMessage({ command: 'selectTheme', themeId: 'theme2' }, mockPanel);

    // Verify theme manager's setTheme was called
    expect(mockThemeManager.setTheme).toHaveBeenCalledWith('theme2');
  });

  test('should handle settings message: createTheme', async () => {
    // Spy on the createCustomTheme method
    const createCustomThemeSpy = jest.spyOn(command as any, 'createCustomTheme');

    // Get access to the handleSettingsMessage method through any
    const handleSettingsMessage = (command as any).handleSettingsMessage.bind(command);

    // Call the method directly with a createTheme message
    handleSettingsMessage({ command: 'createTheme', baseThemeId: 'theme1' }, mockPanel);

    // Verify createCustomTheme was called with the right base theme ID
    expect(createCustomThemeSpy).toHaveBeenCalledWith('theme1');
  });

  test('should handle settings message: editTheme', async () => {
    // Spy on the editCustomTheme method
    const editCustomThemeSpy = jest.spyOn(command as any, 'editCustomTheme');

    // Get access to the handleSettingsMessage method through any
    const handleSettingsMessage = (command as any).handleSettingsMessage.bind(command);

    // Call the method directly with an editTheme message
    handleSettingsMessage({ command: 'editTheme', themeId: 'theme2' }, mockPanel);

    // Verify editCustomTheme was called with the right theme ID
    expect(editCustomThemeSpy).toHaveBeenCalledWith('theme2');
  });

  test('should handle settings message: deleteTheme', async () => {
    // Get access to the handleSettingsMessage method through any
    const handleSettingsMessage = (command as any).handleSettingsMessage.bind(command);

    // Call the method directly with a deleteTheme message
    await handleSettingsMessage({ command: 'deleteTheme', themeId: 'theme2' }, mockPanel);

    // Verify deleteCustomTheme was called
    expect(mockThemeManager.deleteCustomTheme).toHaveBeenCalledWith('theme2');

    // Verify panel HTML was updated after deletion
    await Promise.resolve(); // Wait for the then() callback to execute
    expect(ThemeSettingsHtmlProvider.getSettingsHtml).toHaveBeenCalledWith(
      mockThemeManager.getCurrentTheme(),
      mockThemeManager.getAllThemes()
    );
  });

  test('should handle editor message: updateTheme', async () => {
    // Get access to the handleEditorMessage method through any
    const handleEditorMessage = (command as any).handleEditorMessage.bind(command);

    // Mock theme data for update
    const themeData = {
      name: 'Updated Theme',
      colors: { 'editor.background': '#333333' }
    };

    // Call the method directly with an updateTheme message
    await handleEditorMessage({ command: 'updateTheme', data: themeData }, 'theme2', mockPanel);

    // Verify updateCustomTheme was called
    expect(mockThemeManager.updateCustomTheme).toHaveBeenCalledWith('theme2', themeData);

    // Verify panel HTML was updated after theme update
    await Promise.resolve(); // Wait for the then() callback to execute
    expect(ThemeEditorHtmlProvider.getEditorHtml).toHaveBeenCalled();
  });

  test('should handle editor message: previewTheme', () => {
    // Get access to the handleEditorMessage method through any
    const handleEditorMessage = (command as any).handleEditorMessage.bind(command);

    // Call the method directly with a previewTheme message
    handleEditorMessage({ command: 'previewTheme' }, 'theme2', mockPanel);

    // Verify setTheme was called
    expect(mockThemeManager.setTheme).toHaveBeenCalledWith('theme2');
  });

  test('should handle editor message: applyTheme', () => {
    // Get access to the handleEditorMessage method through any
    const handleEditorMessage = (command as any).handleEditorMessage.bind(command);

    // Call the method directly with an applyTheme message
    handleEditorMessage({ command: 'applyTheme' }, 'theme2', mockPanel);

    // Verify setTheme was called
    expect(mockThemeManager.setTheme).toHaveBeenCalledWith('theme2');
  });
});
