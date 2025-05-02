import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { WebpackConfigHandler } from '../webpackConfigHandler';

// Mock VS Code API
jest.mock('vscode', () => ({
  window: {
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showTextDocument: jest.fn(),
    withProgress: jest.fn().mockImplementation((options, task) => task()),
    createOutputChannel: jest.fn().mockReturnValue({
      appendLine: jest.fn(),
      show: jest.fn(),
      clear: jest.fn(),
    }),
  },
  workspace: {
    openTextDocument: jest.fn(),
    workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }],
  },
  ProgressLocation: {
    Notification: 1,
  },
  Uri: {
    file: jest.fn(path => ({ fsPath: path })),
  },
}));

// Mock file system
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe('WebpackConfigHandler', () => {
  let handler: WebpackConfigHandler;
  const workspacePath = '/test/workspace';
  const defaultConfigPath = path.join(workspacePath, 'webpack.config.js');

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new WebpackConfigHandler();

    // Setup default mocks
    (vscode.workspace.workspaceFolders as any) = [{ uri: { fsPath: workspacePath } }];
  });

  describe('isConfigPresent', () => {
    it('should return true when webpack config exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await handler.isConfigPresent();

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining('webpack.config.js'));
    });

    it('should return false when webpack config does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await handler.isConfigPresent();

      expect(result).toBe(false);
    });

    it('should handle errors properly', async () => {
      (fs.existsSync as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      await expect(handler.isConfigPresent()).rejects.toThrow();
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });

  describe('openConfig', () => {
    it('should open the webpack config file when it exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const mockDocument = { test: 'document' };
      (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(mockDocument);

      await handler.openConfig();

      expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith(expect.objectContaining({ fsPath: expect.stringContaining('webpack.config.js') }));
      expect(vscode.window.showTextDocument).toHaveBeenCalledWith(mockDocument);
    });

    it('should show an error message when webpack config does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await handler.openConfig();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('No webpack.config.js'));
    });

    it('should handle errors properly', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (vscode.workspace.openTextDocument as jest.Mock).mockRejectedValue(new Error('Test error'));

      await handler.openConfig();

      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });

  describe('createNewConfig', () => {
    it('should create a new webpack config file', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.readFileSync as jest.Mock).mockReturnValue('template content');
      const mockDocument = { test: 'document' };
      (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(mockDocument);

      await handler.createNewConfig();

      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('webpack.config.js'), expect.any(String));
      expect(vscode.workspace.openTextDocument).toHaveBeenCalled();
      expect(vscode.window.showTextDocument).toHaveBeenCalled();
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(expect.stringContaining('created'));
    });

    it('should show an error if webpack config already exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await handler.createNewConfig();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('already exists'));
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should handle errors during file creation', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      await handler.createNewConfig();

      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });

  describe('getWebpackConfigTemplate', () => {
    it('should return a webpack config template string', () => {
      const template = handler.getWebpackConfigTemplate();

      expect(typeof template).toBe('string');
      expect(template).toContain('module.exports');
      expect(template).toContain('entry:');
      expect(template).toContain('output:');
    });
  });

  describe('suggestOptimizations', () => {
    it('should show optimization suggestions using progress notification', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('module.exports = { mode: "development" }');

      // Mock the withProgress to execute the callback
      (vscode.window.withProgress as jest.Mock).mockImplementation((options, task) => task());

      await handler.suggestOptimizations(defaultConfigPath);

      expect(vscode.window.withProgress).toHaveBeenCalled();
      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
    });

    it('should show error when config file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await handler.suggestOptimizations(defaultConfigPath);

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('not found'));
    });

    it('should handle errors during optimization', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      await handler.suggestOptimizations(defaultConfigPath);

      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });
});
