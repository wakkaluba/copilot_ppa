import * as vscode from 'vscode';
import { BuildToolsManager } from '../../../src/buildTools/buildToolsManager';
import { ILogger } from '../../../src/logging/ILogger';

describe('BuildToolsManager', () => {
    let buildToolsManager: BuildToolsManager;
    let mockContext: vscode.ExtensionContext;
    let mockLogger: ILogger;

    beforeEach(() => {
        // Setup mocks
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            storageUri: vscode.Uri.file('/test/storage'),
            extensionUri: vscode.Uri.file('/test/path'),
            globalStorageUri: vscode.Uri.file('/test/global-storage'),
            logUri: vscode.Uri.file('/test/log'),
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn()
            },
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn(),
                setKeysForSync: jest.fn()
            },
            secrets: {
                get: jest.fn(),
                store: jest.fn(),
                delete: jest.fn()
            },
            extensionMode: vscode.ExtensionMode.Test,
            environmentVariableCollection: {} as vscode.EnvironmentVariableCollection,
            storagePath: '/test/storage',
            globalStoragePath: '/test/global-storage',
            logPath: '/test/log',
            asAbsolutePath: jest.fn(x => x)
        } as unknown as vscode.ExtensionContext;

        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        };

        buildToolsManager = new BuildToolsManager(mockContext, mockLogger);
    });

    describe('detectWebpackConfig', () => {
        it('should handle no webpack configs found', async () => {
            const mockShowInfo = jest.spyOn(vscode.window, 'showInformationMessage');

            // Mock workspace.findFiles to return empty array
            jest.spyOn(vscode.workspace, 'findFiles').mockResolvedValue([]);

            await buildToolsManager.detectWebpackConfig();

            expect(mockShowInfo).toHaveBeenCalledWith('No webpack configuration files found in the workspace.');
        });

        it('should detect webpack configs and show quick pick', async () => {
            const configs = [
                vscode.Uri.file('/test/webpack.config.js'),
                vscode.Uri.file('/test/webpack.dev.js')
            ];

            jest.spyOn(vscode.workspace, 'findFiles').mockResolvedValue(configs);
            const mockShowQuickPick = jest.spyOn(vscode.window, 'showQuickPick');
            mockShowQuickPick.mockResolvedValue({ label: 'webpack.config.js', description: configs[0].fsPath });

            await buildToolsManager.detectWebpackConfig();

            expect(mockShowQuickPick).toHaveBeenCalled();
        });
    });

    describe('optimizeWebpackConfig', () => {
        it('should handle no configs found', async () => {
            jest.spyOn(vscode.workspace, 'findFiles').mockResolvedValue([]);
            const mockShowInfo = jest.spyOn(vscode.window, 'showInformationMessage');

            await buildToolsManager.optimizeWebpackConfig();

            expect(mockShowInfo).toHaveBeenCalledWith('No webpack configuration files found in the workspace.');
        });
    });

    describe('analyzeBundleSize', () => {
        it('should analyze build directory when found', async () => {
            const mockExistsSync = jest.spyOn(require('fs'), 'existsSync');
            const mockStatSync = jest.spyOn(require('fs'), 'statSync');

            mockExistsSync.mockReturnValue(true);
            mockStatSync.mockReturnValue({ isDirectory: () => true });

            const mockAnalyzeDirectory = jest.fn().mockResolvedValue({
                totalSize: 1000,
                files: [],
                recommendations: []
            });

            // @ts-ignore - Accessing private property for testing
            buildToolsManager.bundleAnalyzer.analyzeDirectory = mockAnalyzeDirectory;

            await buildToolsManager.analyzeBundleSize();

            expect(mockAnalyzeDirectory).toHaveBeenCalled();
        });

        it('should handle no build directories found', async () => {
            const mockExistsSync = jest.spyOn(require('fs'), 'existsSync');
            mockExistsSync.mockReturnValue(false);

            const mockShowInfo = jest.spyOn(vscode.window, 'showInformationMessage');
            const mockShowOpenDialog = jest.spyOn(vscode.window, 'showOpenDialog');
            mockShowOpenDialog.mockResolvedValue(undefined);

            await buildToolsManager.analyzeBundleSize();

            expect(mockShowInfo).toHaveBeenCalledWith('No standard build output directories found. Please select a directory to analyze.');
        });
    });

    describe('dispose', () => {
        it('should clean up resources', () => {
            const mockDispose = jest.fn();
            // @ts-ignore - Accessing private property for testing
            buildToolsManager.webpackManager = { dispose: mockDispose };

            buildToolsManager.dispose();

            expect(mockDispose).toHaveBeenCalled();
        });
    });
});
