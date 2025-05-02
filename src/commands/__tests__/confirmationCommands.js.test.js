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

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock the VS Code Commands API
        commandsMock = {
            registerCommand: sandbox.stub().returns({ dispose: sandbox.stub() })
        };
        sandbox.stub(vscode.commands, 'registerCommand').value(commandsMock.registerCommand);

        // Mock the window API
        sandbox.stub(vscode.window, 'showInformationMessage').resolves();

        // Mock the ExtensionContext
        mockContext = {
            subscriptions: [],
            extensionUri: vscode.Uri.parse('file:///extension/uri')
        };

        // Mock UserConfirmationService
        mockUserConfirmationService = {
            getInstance: sandbox.stub().returns({
                enableConfirmation: sandbox.stub().resolves()
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
    });
});
