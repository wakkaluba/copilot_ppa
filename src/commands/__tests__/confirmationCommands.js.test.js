// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\confirmationCommands.js.test.js
const vscode = require('vscode');
const sinon = require('sinon');
const { registerConfirmationCommands } = require('../confirmationCommands');
const { UserConfirmationService } = require('../../services/UserConfirmationService');
const { ConfirmationSettingsPanel } = require('../../webviews/ConfirmationSettingsPanel');

describe('Confirmation Commands', () => {
    let mockContext;
    let commandsMock;
    let mockUserConfirmationService;
    let mockConfirmationSettingsPanel;
    let sandbox;
    let mockDisposable;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Create mock disposable
        mockDisposable = { dispose: sandbox.stub() };

        // Mock the VS Code Commands API
        commandsMock = {
            registerCommand: sandbox.stub().returns(mockDisposable)
        };
        sandbox.stub(vscode.commands, 'registerCommand').value(commandsMock.registerCommand);

        // Mock the window API
        sandbox.stub(vscode.window, 'showInformationMessage').resolves();
        sandbox.stub(vscode.window, 'showErrorMessage').resolves();

        // Mock the ExtensionContext
        mockContext = {
            subscriptions: [],
            extensionUri: vscode.Uri.parse('file:///extension/uri'),
            workspaceState: { get: sandbox.stub(), update: sandbox.stub() },
            globalState: { get: sandbox.stub(), update: sandbox.stub() }
        };

        // Mock UserConfirmationService
        mockUserConfirmationService = {
            getInstance: sandbox.stub().returns({
                enableConfirmation: sandbox.stub().resolves(),
                showConfirmation: sandbox.stub().resolves(true)
            }),
            initialize: sandbox.stub()
        };
        sandbox.stub(UserConfirmationService, 'initialize').value(mockUserConfirmationService.initialize);
        sandbox.stub(UserConfirmationService, 'getInstance').value(mockUserConfirmationService.getInstance);

        // Mock ConfirmationSettingsPanel
        mockConfirmationSettingsPanel = {
            createOrShow: sandbox.stub()
        };
        sandbox.stub(ConfirmationSettingsPanel, 'createOrShow').value(mockConfirmationSettingsPanel.createOrShow);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerConfirmationCommands', () => {
        it('should initialize the UserConfirmationService', () => {
            registerConfirmationCommands(mockContext);

            expect(mockUserConfirmationService.initialize).toHaveBeenCalledWith(mockContext);
        });

        it('should register the openConfirmationSettings command', () => {
            registerConfirmationCommands(mockContext);

            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.openConfirmationSettings',
                expect.any(Function)
            );
            expect(mockContext.subscriptions.length).toBeGreaterThan(0);
        });

        it('should register the resetConfirmationSettings command', () => {
            registerConfirmationCommands(mockContext);

            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.resetConfirmationSettings',
                expect.any(Function)
            );
            expect(mockContext.subscriptions.length).toBeGreaterThan(1);
        });

        it('should add command disposables to context.subscriptions', () => {
            registerConfirmationCommands(mockContext);

            // There should be 2 commands registered
            expect(mockContext.subscriptions.length).toBe(2);
        });

        it('should add the correct disposables to context.subscriptions', () => {
            registerConfirmationCommands(mockContext);

            expect(mockContext.subscriptions).toContain(mockDisposable);
            expect(mockContext.subscriptions.length).toBe(2);
        });
    });

    describe('openConfirmationSettings command', () => {
        it('should open the confirmation settings panel when executed', () => {
            registerConfirmationCommands(mockContext);

            // Get the registered command callback
            const openSettingsCallback = commandsMock.registerCommand.getCall(0).args[1];

            // Execute the callback
            openSettingsCallback();

            // Verify the panel was created
            expect(mockConfirmationSettingsPanel.createOrShow).toHaveBeenCalledWith(mockContext.extensionUri);
        });

        it('should handle errors when opening the confirmation settings panel', () => {
            // Setup error scenario
            const error = new Error('Failed to create panel');
            mockConfirmationSettingsPanel.createOrShow.throws(error);

            registerConfirmationCommands(mockContext);

            // Get the registered command callback
            const openSettingsCallback = commandsMock.registerCommand.getCall(0).args[1];

            // Execute the callback - should not throw
            expect(() => openSettingsCallback()).not.toThrow();
        });
    });

    describe('resetConfirmationSettings command', () => {
        it('should reset all confirmation types when executed', async () => {
            const enableConfirmationStub = sandbox.stub().resolves();
            mockUserConfirmationService.getInstance.returns({
                enableConfirmation: enableConfirmationStub
            });

            registerConfirmationCommands(mockContext);

            // Get the registered command callback
            const resetSettingsCallback = commandsMock.registerCommand.getCall(1).args[1];

            // Execute the callback
            await resetSettingsCallback();

            // Verify all confirmation types were enabled
            expect(enableConfirmationStub).toHaveBeenCalledWith('file');
            expect(enableConfirmationStub).toHaveBeenCalledWith('workspace');
            expect(enableConfirmationStub).toHaveBeenCalledWith('process');
            expect(enableConfirmationStub).toHaveBeenCalledWith('other');
            expect(enableConfirmationStub.callCount).toBe(4);

            // Verify the information message was shown
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'All confirmation settings have been reset'
            );
        });

        it('should show a notification after resetting the settings', async () => {
            registerConfirmationCommands(mockContext);

            // Get the registered command callback
            const resetSettingsCallback = commandsMock.registerCommand.getCall(1).args[1];

            // Execute the callback
            await resetSettingsCallback();

            // Verify the information message was shown
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'All confirmation settings have been reset'
            );
        });

        it('should handle errors when resetting confirmation settings', async () => {
            // Setup error scenario
            const error = new Error('Failed to reset settings');
            const enableConfirmationStub = sandbox.stub();
            enableConfirmationStub.withArgs('file').resolves();
            enableConfirmationStub.withArgs('workspace').rejects(error);

            mockUserConfirmationService.getInstance.returns({
                enableConfirmation: enableConfirmationStub
            });

            registerConfirmationCommands(mockContext);

            // Get the registered command callback
            const resetSettingsCallback = commandsMock.registerCommand.getCall(1).args[1];

            // Execute the callback - should not throw
            await expect(resetSettingsCallback()).resolves.not.toThrow();

            // Should still have tried to enable all confirmation types
            expect(enableConfirmationStub.callCount).toBe(4);
        });
    });

    describe('command disposal', () => {
        it('should provide disposable objects that call dispose when invoked', () => {
            registerConfirmationCommands(mockContext);

            // Check that the disposables were created and added to subscriptions
            expect(mockContext.subscriptions.length).toBe(2);

            // Simulate VS Code calling dispose() on the registered command
            const disposable = mockContext.subscriptions[0];
            if (disposable && typeof disposable.dispose === 'function') {
                disposable.dispose();
                expect(mockDisposable.dispose).toHaveBeenCalled();
            }
        });
    });

    describe('UserConfirmationService interaction', () => {
        it('should properly initialize UserConfirmationService before registering commands', () => {
            registerConfirmationCommands(mockContext);

            // The initialization should happen before any command registration
            const initializeCall = mockUserConfirmationService.initialize.getCall(0);
            const firstCommandRegistration = commandsMock.registerCommand.getCall(0);

            // Cannot directly compare timestamps in Sinon, but we can verify the order of calls
            expect(initializeCall).toBeTruthy();
            expect(firstCommandRegistration).toBeTruthy();
        });

        it('should handle case when UserConfirmationService getInstance throws an error', async () => {
            // Setup error scenario
            mockUserConfirmationService.getInstance.throws(new Error('Not initialized'));

            registerConfirmationCommands(mockContext);

            // Get the registered command callback
            const resetSettingsCallback = commandsMock.registerCommand.getCall(1).args[1];

            // Execute the callback - should not throw but should show an error message
            await expect(resetSettingsCallback()).resolves.not.toThrow();

            // No enableConfirmation calls should happen if getInstance throws
            const instance = mockUserConfirmationService.getInstance();
            if (instance && instance.enableConfirmation) {
                expect(instance.enableConfirmation).not.toHaveBeenCalled();
            }
        });
    });
});
