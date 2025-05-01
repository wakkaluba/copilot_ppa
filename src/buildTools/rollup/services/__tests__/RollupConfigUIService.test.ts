import * as fs from 'fs';
import * as vscode from 'vscode';
import { RollupConfigManager } from '../../rollupConfigManager';
import { RollupConfigUIService } from '../RollupConfigUIService';
import { RollupConfigAnalysis } from '../types';

// Mock VS Code API
jest.mock('vscode', () => ({
  window: {
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showQuickPick: jest.fn(),
    showInputBox: jest.fn(),
    showTextDocument: jest.fn(),
    createOutputChannel: jest.fn().mockReturnValue({
      appendLine: jest.fn(),
      show: jest.fn(),
      clear: jest.fn(),
    }),
  },
  workspace: {
    openTextDocument: jest.fn(),
  },
  Uri: {
    file: jest.fn((path) => ({ fsPath: path })),
    parse: jest.fn(),
  },
  commands: {
    executeCommand: jest.fn(),
  },
  ProgressLocation: {
    Notification: 1,
  },
}));

// Mock file system
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
    access: jest.fn(),
  },
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

describe('RollupConfigUIService', () => {
  let service: RollupConfigUIService;
  let mockLogger: any;
  let mockConfigManager: RollupConfigManager;
  const mockWorkspacePath = '/path/to/workspace';
  const mockConfigPath = '/path/to/workspace/rollup.config.js';
  const mockConfigContent = `
    export default {
      input: 'src/index.js',
      output: {
        file: 'dist/bundle.js',
        format: 'es',
      },
      plugins: []
    };
  `;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    mockConfigManager = {
      detectConfig: jest.fn().mockResolvedValue(mockConfigPath),
      validateConfig: jest.fn().mockResolvedValue(true),
      optimizeConfig: jest.fn().mockResolvedValue([
        { type: 'minification', description: 'Add terser plugin for minification', example: 'plugins: [...plugins, terser()]' }
      ]),
      createDefaultConfig: jest.fn().mockResolvedValue(mockConfigPath),
      getConfigTemplate: jest.fn().mockReturnValue(mockConfigContent),
      readConfig: jest.fn().mockResolvedValue(mockConfigContent),
    } as unknown as RollupConfigManager;

    // Mock filesystem behavior
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(mockConfigContent);
    (fs.promises.readFile as jest.Mock).mockResolvedValue(mockConfigContent);

    // Mock VSCode behavior
    (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue({});
    (vscode.window.showTextDocument as jest.Mock).mockResolvedValue({});
    (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'Yes' });
    (vscode.window.showInputBox as jest.Mock).mockResolvedValue('rollup.config.js');

    service = new RollupConfigUIService(mockLogger, mockConfigManager);
  });

  describe('openConfig', () => {
    it('should open existing config file', async () => {
      await service.openConfig();

      expect(mockConfigManager.detectConfig).toHaveBeenCalled();
      expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith(
        expect.objectContaining({ fsPath: mockConfigPath })
      );
      expect(vscode.window.showTextDocument).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Opening Rollup config'));
    });

    it('should handle error when opening config file', async () => {
      (vscode.workspace.openTextDocument as jest.Mock).mockRejectedValue(new Error('Failed to open document'));

      await service.openConfig();

      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error opening Rollup config'));
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });

    it('should prompt to create new config if none exists', async () => {
      (mockConfigManager.detectConfig as jest.Mock).mockResolvedValue(null);
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'Yes' });

      await service.openConfig();

      expect(vscode.window.showQuickPick).toHaveBeenCalled();
      expect(mockConfigManager.createDefaultConfig).toHaveBeenCalled();
    });

    it('should not create config if user declines', async () => {
      (mockConfigManager.detectConfig as jest.Mock).mockResolvedValue(null);
      (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'No' });

      await service.openConfig();

      expect(vscode.window.showQuickPick).toHaveBeenCalled();
      expect(mockConfigManager.createDefaultConfig).not.toHaveBeenCalled();
    });
  });

  describe('createNewConfig', () => {
    it('should create new config file', async () => {
      await service.createNewConfig();

      expect(vscode.window.showInputBox).toHaveBeenCalled();
      expect(mockConfigManager.createDefaultConfig).toHaveBeenCalled();
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        expect.stringContaining('Created new Rollup config')
      );
    });

    it('should handle error during config creation', async () => {
      (mockConfigManager.createDefaultConfig as jest.Mock).mockRejectedValue(new Error('Failed to create config'));

      await service.createNewConfig();

      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error creating Rollup config'));
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });

    it('should abort if user cancels input dialog', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(undefined);

      await service.createNewConfig();

      expect(mockConfigManager.createDefaultConfig).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Config creation cancelled'));
    });
  });

  describe('suggestOptimizations', () => {
    it('should suggest optimizations for config file', async () => {
      const result = await service.suggestOptimizations(mockConfigPath);

      expect(mockConfigManager.optimizeConfig).toHaveBeenCalledWith(mockConfigPath);
      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'minification' })
      ]));
    });

    it('should handle no optimizations found', async () => {
      (mockConfigManager.optimizeConfig as jest.Mock).mockResolvedValue([]);

      const result = await service.suggestOptimizations(mockConfigPath);

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        expect.stringContaining('No optimization suggestions')
      );
      expect(result).toEqual([]);
    });

    it('should handle errors during optimization scanning', async () => {
      (mockConfigManager.optimizeConfig as jest.Mock).mockRejectedValue(new Error('Optimization failed'));

      await service.suggestOptimizations(mockConfigPath);

      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error suggesting optimizations'));
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });

  describe('getRollupConfigTemplate', () => {
    it('should return a config template', () => {
      const template = service.getRollupConfigTemplate();

      expect(mockConfigManager.getConfigTemplate).toHaveBeenCalled();
      expect(template).toEqual(mockConfigContent);
    });
  });

  let mockWebviewPanel: any;
  let mockWebview: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    };
    mockConfigManager = {
        detectConfigs: jest.fn(),
        analyzeConfig: jest.fn(),
        generateOptimizations: jest.fn(),
        validateConfig: jest.fn()
    };
    mockWebview = {
        html: '',
        onDidReceiveMessage: jest.fn(),
        postMessage: jest.fn()
    };
    mockWebviewPanel = {
        webview: mockWebview,
        reveal: jest.fn(),
        dispose: jest.fn()
    };
    (vscode.window.createWebviewPanel as jest.Mock).mockReturnValue(mockWebviewPanel);
    service = new RollupConfigUIService(mockLogger, mockConfigManager);
  });

  describe('selectConfig', () => {
      it('should handle no configs found', async () => {
          mockConfigManager.detectConfigs.mockResolvedValue([]);

          const result = await service.selectConfig('/workspace/path');

          expect(result).toBeUndefined();
          expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
              'No Rollup configuration files found'
          );
      });

      it('should return single config without prompting', async () => {
          const config = '/workspace/rollup.config.js';
          mockConfigManager.detectConfigs.mockResolvedValue([config]);

          const result = await service.selectConfig('/workspace/path');

          expect(result).toBe(config);
          expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
      });

      it('should prompt user to select from multiple configs', async () => {
          const configs = [
              '/workspace/rollup.config.js',
              '/workspace/rollup.prod.config.js'
          ];
          mockConfigManager.detectConfigs.mockResolvedValue(configs);
          (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({
              label: 'rollup.config.js',
              description: configs[0]
          });

          const result = await service.selectConfig('/workspace/path');

          expect(result).toBe(configs[0]);
          expect(vscode.window.showQuickPick).toHaveBeenCalled();
      });

      it('should handle user cancellation', async () => {
          const configs = ['/workspace/rollup.config.js', '/workspace/rollup.prod.config.js'];
          mockConfigManager.detectConfigs.mockResolvedValue(configs);
          (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);

          const result = await service.selectConfig('/workspace/path');

          expect(result).toBeUndefined();
      });

      it('should handle errors gracefully', async () => {
          const error = new Error('Detection failed');
          mockConfigManager.detectConfigs.mockRejectedValue(error);

          const result = await service.selectConfig('/workspace/path');

          expect(result).toBeUndefined();
          expect(mockLogger.error).toHaveBeenCalled();
          expect(vscode.window.showErrorMessage).toHaveBeenCalled();
      });
  });

  describe('selectOptimizations', () => {
      it('should handle empty suggestions list', async () => {
          const result = await service.selectOptimizations([]);

          expect(result).toEqual([]);
          expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
              'No optimization suggestions available'
          );
      });

      it('should allow user to select multiple optimizations', async () => {
          const suggestions = [
              'Add terser plugin',
              'Enable source maps',
              'Add bundle analysis'
          ];
          (vscode.window.showQuickPick as jest.Mock).mockResolvedValue([
              { label: suggestions[0] },
              { label: suggestions[2] }
          ]);

          const result = await service.selectOptimizations(suggestions);

          expect(result).toEqual([suggestions[0], suggestions[2]]);
          expect(vscode.window.showQuickPick).toHaveBeenCalledWith(
              expect.arrayContaining([
                  expect.objectContaining({ label: suggestions[0] }),
                  expect.objectContaining({ label: suggestions[1] }),
                  expect.objectContaining({ label: suggestions[2] })
              ]),
              expect.objectContaining({ canPickMany: true })
          );
      });

      it('should handle user cancellation', async () => {
          const suggestions = ['Add terser plugin', 'Enable source maps'];
          (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);

          const result = await service.selectOptimizations(suggestions);

          expect(result).toEqual([]);
      });

      it('should format suggestions with descriptions', async () => {
          const suggestions = ['Add terser plugin for minification'];
          (vscode.window.showQuickPick as jest.Mock).mockResolvedValue([
              { label: suggestions[0] }
          ]);

          await service.selectOptimizations(suggestions);

          expect(vscode.window.showQuickPick).toHaveBeenCalledWith(
              [expect.objectContaining({
                  label: suggestions[0],
                  description: 'Optimization suggestion'
              })],
              expect.anything()
          );
      });
  });

  describe('showInfo', () => {
      it('should show information message', async () => {
          const message = 'Test message';
          await service.showInfo(message);

          expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(message);
      });
  });

  describe('showError', () => {
      it('should show error message', async () => {
          const message = 'Test error';
          await service.showError(message);

          expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(message);
      });

      it('should log error message', async () => {
          const message = 'Test error';
          await service.showError(message);

          expect(mockLogger.error).toHaveBeenCalledWith(message);
      });
  });

  describe('showConfigDetails', () => {
      it('should display config analysis in a tree view', async () => {
          const analysis: RollupConfigAnalysis = {
              input: [{ name: 'main', path: 'src/index.js', external: ['react'] }],
              output: [{ format: 'es', file: 'dist/bundle.js', sourcemap: true }],
              plugins: [{ name: 'TerserPlugin', description: 'Minify bundle' }],
              content: '',
              external: ['react']
          };

          (vscode.window.createTreeView as jest.Mock).mockReturnValue({
              reveal: jest.fn(),
              dispose: jest.fn()
          });

          await service.showConfigDetails('rollup.config.js', analysis);

          expect(vscode.window.createTreeView).toHaveBeenCalled();
          expect(mockLogger.debug).toHaveBeenCalled();
      });

      it('should handle empty analysis', async () => {
          const analysis: RollupConfigAnalysis = {
              input: [],
              output: [],
              plugins: [],
              content: '',
              external: []
          };

          (vscode.window.createTreeView as jest.Mock).mockReturnValue({
              reveal: jest.fn(),
              dispose: jest.fn()
          });

          await service.showConfigDetails('rollup.config.js', analysis);

          expect(vscode.window.createTreeView).toHaveBeenCalled();
          expect(mockLogger.debug).toHaveBeenCalled();
      });
  });

  describe('showOptimizationSuggestions', () => {
      it('should display optimization suggestions', async () => {
          const suggestions = [
              {
                  title: 'Add minification',
                  description: 'Minify bundle for production',
                  code: 'terser()'
              }
          ];

          (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({
              title: 'Add minification',
              description: 'Minify bundle for production',
              code: 'terser()'
          });

          await service.showOptimizationSuggestions('rollup.config.js', suggestions);

          expect(vscode.window.showQuickPick).toHaveBeenCalled();
          expect(mockLogger.debug).toHaveBeenCalled();
      });

      it('should handle no selection', async () => {
          const suggestions = [
              {
                  title: 'Add minification',
                  description: 'Minify bundle for production',
                  code: 'terser()'
              }
          ];

          (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);

          await service.showOptimizationSuggestions('rollup.config.js', suggestions);

          expect(vscode.window.showQuickPick).toHaveBeenCalled();
          expect(mockLogger.debug).toHaveBeenCalled();
      });

      it('should handle empty suggestions', async () => {
          await service.showOptimizationSuggestions('rollup.config.js', []);

          expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
              'No optimization suggestions available for this configuration.'
          );
          expect(mockLogger.debug).toHaveBeenCalled();
      });
  });

  describe('showConfigCreation', () => {
      it('should display config creation options and create config', async () => {
          (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({
              label: 'TypeScript Library',
              detail: 'Configure for TypeScript library with ES modules output'
          });

          const mockUri = { fsPath: '/workspace' };
          (vscode.window.showSaveDialog as jest.Mock).mockResolvedValue(mockUri);

          await service.showConfigCreation();

          expect(vscode.window.showQuickPick).toHaveBeenCalled();
          expect(vscode.window.showSaveDialog).toHaveBeenCalled();
          expect(mockLogger.debug).toHaveBeenCalled();
      });

      it('should handle cancelled template selection', async () => {
          (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);

          await service.showConfigCreation();

          expect(vscode.window.showQuickPick).toHaveBeenCalled();
          expect(vscode.window.showSaveDialog).not.toHaveBeenCalled();
          expect(mockLogger.debug).toHaveBeenCalled();
      });

      it('should handle cancelled file save', async () => {
          (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({
              label: 'TypeScript Library',
              detail: 'Configure for TypeScript library with ES modules output'
          });
          (vscode.window.showSaveDialog as jest.Mock).mockResolvedValue(undefined);

          await service.showConfigCreation();

          expect(vscode.window.showQuickPick).toHaveBeenCalled();
          expect(vscode.window.showSaveDialog).toHaveBeenCalled();
          expect(mockLogger.debug).toHaveBeenCalled();
      });
  });

  describe('updateViewport', () => {
      it('should handle concurrent viewport updates gracefully', async () => {
          const updates = [
              service.updateViewport({ content: 'update 1' }),
              service.updateViewport({ content: 'update 2' }),
              service.updateViewport({ content: 'update 3' })
          ];

          await Promise.all(updates);
          expect(mockLogger.debug).toHaveBeenCalled();
      });

      it('should handle failed viewport updates', async () => {
          mockWebviewPanel.webview.postMessage = jest.fn().mockRejectedValue(new Error('Update failed'));

          await service.updateViewport({ content: 'test' });
          expect(mockLogger.error).toHaveBeenCalled();
      });
  });

  describe('renderPluginInfo', () => {
      it('should handle empty plugin list', () => {
          const html = service.renderPluginInfo([]);
          expect(html).toContain('No plugins configured');
      });

      it('should handle plugins with missing descriptions', () => {
          const plugins = [
              { name: 'plugin1' },
              { name: 'plugin2', description: 'test' }
          ];
          const html = service.renderPluginInfo(plugins);
          expect(html).toContain('plugin1');
          expect(html).toContain('plugin2');
          expect(html).toContain('test');
      });

      it('should handle special characters in plugin names/descriptions', () => {
          const plugins = [
              { name: 'plugin & test', description: 'test < > description' }
          ];
          const html = service.renderPluginInfo(plugins);
          expect(html).toContain('plugin &amp; test');
          expect(html).toContain('test &lt; &gt; description');
      });
  });

  describe('renderBundleInfo', () => {
      it('should handle empty bundle config', () => {
          const html = service.renderBundleInfo([], []);
          expect(html).toContain('No entry points defined');
          expect(html).toContain('No output configuration defined');
      });

      it('should handle complex bundle configurations', () => {
          const inputs = ['src/main.js', 'src/worker.js'];
          const outputs = [
              { format: 'es', file: 'dist/bundle.js', sourcemap: true },
              { format: 'cjs', dir: 'dist/chunks', preserveModules: true }
          ];
          const html = service.renderBundleInfo(inputs, outputs);
          expect(html).toContain('src/main.js');
          expect(html).toContain('src/worker.js');
          expect(html).toContain('dist/bundle.js');
          expect(html).toContain('dist/chunks');
          expect(html).toContain('preserveModules: true');
      });

      it('should handle missing optional output properties', () => {
          const outputs = [{ format: 'es' }];
          const html = service.renderBundleInfo([], outputs);
          expect(html).toContain('format: es');
      });
  });

  describe('error handling', () => {
      it('should handle webview disposal errors', () => {
          mockWebviewPanel.dispose.mockImplementation(() => {
              throw new Error('Disposal error');
          });

          service.dispose();
          expect(mockLogger.error).toHaveBeenCalled();
      });

      it('should handle message posting errors', async () => {
          mockWebviewPanel.webview.postMessage = jest.fn().mockRejectedValue(new Error('Post error'));

          await service.updateViewport({ content: 'test' });
          expect(mockLogger.error).toHaveBeenCalled();
      });
  });

  describe('resource management', () => {
      it('should clean up resources on disposal', () => {
          const disposables = [
              { dispose: jest.fn() },
              { dispose: jest.fn() }
          ];

          service.registerDisposable(disposables[0]);
          service.registerDisposable(disposables[1]);
          service.dispose();

          disposables.forEach(d => {
              expect(d.dispose).toHaveBeenCalled();
          });
      });

      it('should handle null/undefined disposables', () => {
          service.registerDisposable(null);
          service.registerDisposable(undefined);
          service.dispose();
          expect(mockLogger.debug).toHaveBeenCalled();
      });
  });

  describe('showConfigurationUI', () => {
      it('should create and show a webview panel', () => {
          const config = {
              input: 'src/index.js',
              output: {
                  file: 'dist/bundle.js',
                  format: 'es'
              }
          };

          service.showConfigurationUI(config);

          expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
              'rollupConfig',
              'Rollup Configuration',
              vscode.ViewColumn.One,
              { enableScripts: true }
          );
          expect(mockWebviewPanel.webview.html).toBeTruthy();
      });

      it('should handle config updates from webview', async () => {
          const config = {
              input: 'src/index.js',
              output: {
                  file: 'dist/bundle.js',
                  format: 'es'
              }
          };

          service.showConfigurationUI(config);

          const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
          await messageHandler({
              command: 'updateConfig',
              config: {
                  input: 'src/main.js',
                  output: {
                      file: 'dist/bundle.min.js',
                      format: 'cjs'
                  }
              }
          });

          expect(mockLogger.info).toHaveBeenCalled();
      });

      it('should handle panel disposal', () => {
          const config = {
              input: 'src/index.js',
              output: {
                  file: 'dist/bundle.js',
                  format: 'es'
              }
          };

          service.showConfigurationUI(config);

          const disposeHandler = mockWebviewPanel.onDidDispose.mock.calls[0][0];
          disposeHandler();

          expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('disposed'));
      });

      it('should handle errors during UI updates', async () => {
          const config = {
              input: 'src/index.js',
              output: {
                  file: 'dist/bundle.js',
                  format: 'es'
              }
          };

          mockWebview.postMessage.mockRejectedValue(new Error('Update failed'));

          service.showConfigurationUI(config);

          const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
          await messageHandler({
              command: 'updateConfig',
              config: {}
          });

          expect(mockLogger.error).toHaveBeenCalled();
      });

      it('should handle viewport state updates', () => {
          const config = {
              input: 'src/index.js',
              output: {
                  file: 'dist/bundle.js',
                  format: 'es'
              }
          };

          service.showConfigurationUI(config);

          const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
          messageHandler({
              command: 'viewportUpdate',
              state: { scrollTop: 100 }
          });

          expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('viewport'));
      });

      it('should update UI with plugin changes', async () => {
          const config = {
              input: 'src/index.js',
              output: {
                  file: 'dist/bundle.js',
                  format: 'es'
              },
              plugins: []
          };

          service.showConfigurationUI(config);

          const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
          await messageHandler({
              command: 'updatePlugins',
              plugins: [
                  { name: 'typescript' },
                  { name: 'terser' }
              ]
          });

          expect(mockWebview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
              command: 'updatePlugins'
          }));
      });

      it('should handle plugin removal', async () => {
          const config = {
              input: 'src/index.js',
              output: {
                  file: 'dist/bundle.js',
                  format: 'es'
              },
              plugins: [
                  { name: 'typescript' },
                  { name: 'terser' }
              ]
          };

          service.showConfigurationUI(config);

          const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
          await messageHandler({
              command: 'removePlugin',
              pluginName: 'terser'
          });

          expect(mockWebview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
              command: 'updatePlugins'
          }));
      });

      it('should handle bundle info updates', async () => {
          const config = {
              input: 'src/index.js',
              output: {
                  file: 'dist/bundle.js',
                  format: 'es'
              }
          };

          service.showConfigurationUI(config);

          const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
          await messageHandler({
              command: 'updateBundleInfo',
              bundleInfo: {
                  size: 1024,
                  modules: ['index.js', 'utils.js']
              }
          });

          expect(mockWebview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
              command: 'updateBundleInfo'
          }));
      });
  });

  describe('dispose', () => {
      it('should clean up resources when disposed', () => {
          const config = {
              input: 'src/index.js',
              output: {
                  file: 'dist/bundle.js',
                  format: 'es'
              }
          };

          service.showConfigurationUI(config);
          service.dispose();

          expect(mockWebviewPanel.dispose).toHaveBeenCalled();
      });
  });

  describe('viewport error handling', () => {
      it('should handle missing webview panel', async () => {
          service['webviewPanel'] = undefined;
          await service.updateViewport({ content: 'test' });
          expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('No active webview'));
      });

      it('should handle disposed webview panel', async () => {
          service.showConfigurationUI({ input: 'test.js' });
          mockWebviewPanel.dispose();
          await service.updateViewport({ content: 'test' });
          expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('disposed'));
      });

      it('should handle concurrent viewport updates with errors', async () => {
          service.showConfigurationUI({ input: 'test.js' });
          mockWebviewPanel.webview.postMessage
              .mockRejectedValueOnce(new Error('First failed'))
              .mockResolvedValueOnce(true)
              .mockRejectedValueOnce(new Error('Third failed'));

          const updates = [
              service.updateViewport({ content: '1' }),
              service.updateViewport({ content: '2' }),
              service.updateViewport({ content: '3' })
          ];

          await Promise.all(updates);
          expect(mockLogger.error).toHaveBeenCalledTimes(2);
          expect(mockLogger.debug).toHaveBeenCalled();
      });
  });

  describe('plugin management error handling', () => {
      it('should handle invalid plugin configurations', async () => {
          const config = {
              input: 'src/index.js',
              plugins: [
                  undefined,
                  null,
                  { },
                  { name: '' }
              ]
          };

          service.showConfigurationUI(config);

          const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
          await messageHandler({
              command: 'validatePlugins'
          });

          expect(mockWebview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
              command: 'pluginValidation',
              issues: expect.arrayContaining([
                  expect.stringContaining('Invalid plugin configuration'),
                  expect.stringContaining('Missing plugin name')
              ])
          }));
      });

      it('should handle plugin resolution errors', async () => {
          const config = {
              input: 'src/index.js',
              plugins: [
                  { name: 'nonexistent-plugin' }
              ]
          };

          mockConfigManager.validateConfig.mockRejectedValue(
              new Error('Could not resolve plugin: nonexistent-plugin')
          );

          service.showConfigurationUI(config);

          const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
          await messageHandler({
              command: 'validatePlugins'
          });

          expect(mockLogger.error).toHaveBeenCalledWith(
              expect.stringContaining('Could not resolve plugin')
          );
          expect(mockWebview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
              command: 'pluginValidation',
              error: expect.stringContaining('Could not resolve plugin')
          }));
      });

      it('should handle cyclic plugin dependencies', async () => {
          const config = {
              input: 'src/index.js',
              plugins: [
                  { name: 'plugin-a', after: ['plugin-b'] },
                  { name: 'plugin-b', after: ['plugin-a'] }
              ]
          };

          service.showConfigurationUI(config);

          const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
          await messageHandler({
              command: 'validatePlugins'
          });

          expect(mockWebview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
              command: 'pluginValidation',
              issues: expect.arrayContaining([
                  expect.stringContaining('Cyclic dependency detected')
              ])
          }));
      });
  });

  describe('optimization suggestion error handling', () => {
      it('should handle failed config parsing', async () => {
          const configPath = '/test/rollup.config.js';
          mockConfigManager.generateOptimizations.mockRejectedValue(
              new Error('Invalid config syntax')
          );

          await service.suggestOptimizations(configPath);

          expect(mockLogger.error).toHaveBeenCalledWith(
              expect.stringContaining('Error suggesting optimizations'),
              expect.any(Error)
          );
          expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
              expect.stringContaining('Invalid config syntax')
          );
      });

      it('should handle failed optimization application', async () => {
          const configPath = '/test/rollup.config.js';
          const optimizations = [{
              title: 'Add minification',
              description: 'Minify bundle',
              code: 'terser()'
          }];

          mockConfigManager.generateOptimizations.mockResolvedValue(optimizations);
          (vscode.window.showQuickPick as jest.Mock).mockResolvedValue([{
              label: 'Add minification',
              description: 'Minify bundle',
              detail: 'terser()'
          }]);
          (vscode.workspace.openTextDocument as jest.Mock).mockRejectedValue(
              new Error('File access denied')
          );

          await service.suggestOptimizations(configPath);

          expect(mockLogger.error).toHaveBeenCalledWith(
              expect.stringContaining('Error suggesting optimizations'),
              expect.any(Error)
          );
          expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
              expect.stringContaining('File access denied')
          );
      });

      it('should handle invalid optimization selections', async () => {
          const configPath = '/test/rollup.config.js';
          const optimizations = [{
              title: 'Add minification',
              description: 'Minify bundle',
              code: 'terser()'
          }];

          mockConfigManager.generateOptimizations.mockResolvedValue(optimizations);
          (vscode.window.showQuickPick as jest.Mock).mockResolvedValue([{}]); // Invalid selection

          await service.suggestOptimizations(configPath);

          expect(mockLogger.error).toHaveBeenCalledWith(
              expect.stringContaining('Invalid optimization selection')
          );
          expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
              expect.stringContaining('Invalid optimization selection')
          );
      });

      it('should handle concurrent optimization requests', async () => {
          const configPath = '/test/rollup.config.js';
          let optimizationPromiseResolve: Function;
          const optimizationPromise = new Promise(resolve => {
              optimizationPromiseResolve = resolve;
          });

          mockConfigManager.generateOptimizations.mockReturnValue(optimizationPromise);

          const promise1 = service.suggestOptimizations(configPath);
          const promise2 = service.suggestOptimizations(configPath);

          optimizationPromiseResolve([{
              title: 'Add minification',
              description: 'Minify bundle',
              code: 'terser()'
          }]);

          await Promise.all([promise1, promise2]);

          expect(mockLogger.warn).toHaveBeenCalledWith(
              expect.stringContaining('Optimization already in progress')
          );
      });
  });
});
