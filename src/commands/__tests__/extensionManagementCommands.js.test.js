// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\extensionManagementCommands.js.test.js
const vscode = require('vscode');
const sinon = require('sinon');
const { afterEach, beforeEach, describe, expect, it } = require('@jest/globals');
const { ExtensionManagementCommands } = require('../extensionManagementCommands');
const { ExtensionAccessManager } = require('../../services/ExtensionAccessManager');
const { ExtensionConfigurationManager } = require('../../services/ExtensionConfigurationManager');
const { ExtensionInstallationManager } = require('../../services/ExtensionInstallationManager');

describe('Extension Management Commands', () => {
    let sandbox;
    let mockExtensionContext;
    let mockCommands;
    let mockWindow;
    let mockExtensions;
    let mockWorkspace;
    let mockInputBox;
    let mockQuickPick;
    let mockShowErrorMessage;

    // Service mocks
    let mockAccessManager;
    let mockConfigManager;
    let mockInstallManager;

    // The class under test
    let extensionManagementCommands;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock the extension context
        mockExtensionContext = {
            subscriptions: []
        };

        // Mock VS Code APIs
        mockInputBox = sandbox.stub();
        mockQuickPick = sandbox.stub();
        mockShowErrorMessage = sandbox.stub();

        mockWindow = {
            showInputBox: mockInputBox,
            showQuickPick: mockQuickPick,
            showErrorMessage: mockShowErrorMessage
        };

        mockExtensions = {
            all: [
                {
                    id: 'publisher.extension1',
                    packageJSON: { displayName: 'Extension 1' }
                },
                {
                    id: 'publisher.extension2',
                    packageJSON: { displayName: 'Extension 2' }
                }
            ]
        };

        mockWorkspace = {
            getConfiguration: sandbox.stub().returns({
                get: sandbox.stub(),
                update: sandbox.stub().resolves()
            })
        };

        mockCommands = {
            registerCommand: sandbox.stub().returns({ dispose: sandbox.stub() })
        };

        // Replace vscode namespaces with mocks
        sandbox.stub(vscode, 'window').value(mockWindow);
        sandbox.stub(vscode, 'commands').value(mockCommands);
        sandbox.stub(vscode, 'extensions').value(mockExtensions);
        sandbox.stub(vscode, 'workspace').value(mockWorkspace);

        // Create mocks for the services
        mockAccessManager = {
            requestExtensionAccess: sandbox.stub().resolves()
        };

        mockConfigManager = {
            getConfigurableSections: sandbox.stub().resolves(['section1', 'section2']),
            getExtensionConfiguration: sandbox.stub().resolves({ value: 'test' }),
            updateExtensionConfiguration: sandbox.stub().resolves()
        };

        mockInstallManager = {
            getRecommendedExtensions: sandbox.stub().resolves([
                { id: 'publisher.recommended1', reason: 'Recommended for code quality' },
                { id: 'publisher.recommended2', reason: 'Recommended for debugging' }
            ]),
            installExtension: sandbox.stub().resolves()
        };

        // Create the class under test
        extensionManagementCommands = new ExtensionManagementCommands(
            mockAccessManager,
            mockConfigManager,
            mockInstallManager
        );
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerCommands', () => {
        it('should register all extension management commands', () => {
            extensionManagementCommands.registerCommands(mockExtensionContext);

            // Verify commands are registered
            expect(mockCommands.registerCommand.callCount).toBe(3);
            expect(mockCommands.registerCommand.args[0][0]).toBe('copilot-ppa.requestExtensionAccess');
            expect(mockCommands.registerCommand.args[1][0]).toBe('copilot-ppa.configureExtension');
            expect(mockCommands.registerCommand.args[2][0]).toBe('copilot-ppa.showRecommendedExtensions');

            // Verify context subscriptions are updated
            expect(mockExtensionContext.subscriptions.length).toBe(3);
        });
    });

    describe('requestExtensionAccess command', () => {
        beforeEach(() => {
            extensionManagementCommands.registerCommands(mockExtensionContext);
        });

        it('should request access to an extension when ID is provided', async () => {
            // Get the command callback
            const requestAccessCallback = mockCommands.registerCommand.args[0][1];

            // Simulate user input
            mockInputBox.resolves('publisher.requested-extension');

            // Call the command
            await requestAccessCallback();

            // Verify access manager was called with correct extension ID
            expect(mockAccessManager.requestExtensionAccess).toHaveBeenCalledWith('publisher.requested-extension');
        });

        it('should not request access if user cancels input', async () => {
            // Get the command callback
            const requestAccessCallback = mockCommands.registerCommand.args[0][1];

            // Simulate user cancelling the input box
            mockInputBox.resolves(undefined);

            // Call the command
            await requestAccessCallback();

            // Verify access manager was not called
            expect(mockAccessManager.requestExtensionAccess).not.toHaveBeenCalled();
        });
    });

    describe('configureExtension command', () => {
        beforeEach(() => {
            extensionManagementCommands.registerCommands(mockExtensionContext);
        });

        it('should configure extension when all selections are made', async () => {
            // Get the command callback
            const configureCallback = mockCommands.registerCommand.args[1][1];

            // Mock the extension selection
            mockQuickPick.onFirstCall().resolves({
                label: 'Extension 1',
                description: 'publisher.extension1'
            });

            // Mock the section selection
            mockQuickPick.onSecondCall().resolves('section1');

            // Mock the value input
            mockInputBox.resolves('{"newValue": 123}');

            // Call the command
            await configureCallback();

            // Verify configuration manager was called with correct params
            expect(mockConfigManager.getConfigurableSections).toHaveBeenCalledWith('publisher.extension1');
            expect(mockConfigManager.getExtensionConfiguration).toHaveBeenCalledWith('publisher.extension1', 'section1');
            expect(mockConfigManager.updateExtensionConfiguration).toHaveBeenCalledWith(
                'publisher.extension1',
                'section1',
                { newValue: 123 }
            );
        });

        it('should handle invalid JSON input', async () => {
            // Get the command callback
            const configureCallback = mockCommands.registerCommand.args[1][1];

            // Mock the extension selection
            mockQuickPick.onFirstCall().resolves({
                label: 'Extension 1',
                description: 'publisher.extension1'
            });

            // Mock the section selection
            mockQuickPick.onSecondCall().resolves('section1');

            // Mock the invalid JSON input
            mockInputBox.resolves('invalid json');

            // Call the command
            await configureCallback();

            // Verify error message was shown
            expect(mockShowErrorMessage).toHaveBeenCalledWith('Invalid JSON value');

            // Verify configuration was not updated
            expect(mockConfigManager.updateExtensionConfiguration).not.toHaveBeenCalled();
        });

        it('should do nothing if no extension is selected', async () => {
            // Get the command callback
            const configureCallback = mockCommands.registerCommand.args[1][1];

            // Mock cancellation of extension selection
            mockQuickPick.onFirstCall().resolves(undefined);

            // Call the command
            await configureCallback();

            // Verify configuration manager methods were not called
            expect(mockConfigManager.getConfigurableSections).not.toHaveBeenCalled();
            expect(mockConfigManager.getExtensionConfiguration).not.toHaveBeenCalled();
            expect(mockConfigManager.updateExtensionConfiguration).not.toHaveBeenCalled();
        });

        it('should do nothing if no section is selected', async () => {
            // Get the command callback
            const configureCallback = mockCommands.registerCommand.args[1][1];

            // Mock the extension selection
            mockQuickPick.onFirstCall().resolves({
                label: 'Extension 1',
                description: 'publisher.extension1'
            });

            // Mock cancellation of section selection
            mockQuickPick.onSecondCall().resolves(undefined);

            // Call the command
            await configureCallback();

            // Verify only getConfigurableSections was called
            expect(mockConfigManager.getConfigurableSections).toHaveBeenCalled();
            expect(mockConfigManager.getExtensionConfiguration).not.toHaveBeenCalled();
            expect(mockConfigManager.updateExtensionConfiguration).not.toHaveBeenCalled();
        });

        it('should do nothing if no value is entered', async () => {
            // Get the command callback
            const configureCallback = mockCommands.registerCommand.args[1][1];

            // Mock the extension selection
            mockQuickPick.onFirstCall().resolves({
                label: 'Extension 1',
                description: 'publisher.extension1'
            });

            // Mock the section selection
            mockQuickPick.onSecondCall().resolves('section1');

            // Mock cancellation of value input
            mockInputBox.resolves(undefined);

            // Call the command
            await configureCallback();

            // Verify getExtensionConfiguration was called but not updateExtensionConfiguration
            expect(mockConfigManager.getExtensionConfiguration).toHaveBeenCalled();
            expect(mockConfigManager.updateExtensionConfiguration).not.toHaveBeenCalled();
        });
    });

    describe('showRecommendedExtensions command', () => {
        beforeEach(() => {
            extensionManagementCommands.registerCommands(mockExtensionContext);
        });

        it('should install selected recommended extensions', async () => {
            // Get the command callback
            const recommendedCallback = mockCommands.registerCommand.args[2][1];

            // Mock the extension selection
            mockQuickPick.resolves([
                {
                    label: 'publisher.recommended1',
                    description: 'Recommended for code quality',
                    recommendation: { id: 'publisher.recommended1', reason: 'Recommended for code quality' }
                }
            ]);

            // Call the command
            await recommendedCallback();

            // Verify install manager was called with correct extension ID
            expect(mockInstallManager.getRecommendedExtensions).toHaveBeenCalled();
            expect(mockInstallManager.installExtension).toHaveBeenCalledWith('publisher.recommended1');
        });

        it('should install multiple selected recommended extensions', async () => {
            // Get the command callback
            const recommendedCallback = mockCommands.registerCommand.args[2][1];

            // Mock the extension selection (multiple extensions)
            mockQuickPick.resolves([
                {
                    label: 'publisher.recommended1',
                    description: 'Recommended for code quality',
                    recommendation: { id: 'publisher.recommended1', reason: 'Recommended for code quality' }
                },
                {
                    label: 'publisher.recommended2',
                    description: 'Recommended for debugging',
                    recommendation: { id: 'publisher.recommended2', reason: 'Recommended for debugging' }
                }
            ]);

            // Call the command
            await recommendedCallback();

            // Verify install manager was called for both extension IDs
            expect(mockInstallManager.installExtension.callCount).toBe(2);
            expect(mockInstallManager.installExtension).toHaveBeenCalledWith('publisher.recommended1');
            expect(mockInstallManager.installExtension).toHaveBeenCalledWith('publisher.recommended2');
        });

        it('should do nothing if no extensions are selected', async () => {
            // Get the command callback
            const recommendedCallback = mockCommands.registerCommand.args[2][1];

            // Mock cancellation of extension selection
            mockQuickPick.resolves(undefined);

            // Call the command
            await recommendedCallback();

            // Verify install manager was called to get recommendations but not to install
            expect(mockInstallManager.getRecommendedExtensions).toHaveBeenCalled();
            expect(mockInstallManager.installExtension).not.toHaveBeenCalled();
        });
    });
});
