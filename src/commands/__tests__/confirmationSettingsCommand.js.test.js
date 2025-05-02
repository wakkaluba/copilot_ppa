// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\confirmationSettingsCommand.js.test.js
const vscode = require('vscode');
const sinon = require('sinon');
const { registerConfirmationSettingsCommand } = require('../confirmationSettingsCommand');
const { ConfirmationSettingsPanel } = require('../../webviews/ConfirmationSettingsPanel');

describe('Confirmation Settings Command', () => {
    let mockContext;
    let commandsMock;
    let mockConfirmationSettingsPanel;
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock the VS Code Commands API
        commandsMock = {
            registerCommand: sandbox.stub().returns({ dispose: sandbox.stub() })
        };
        sandbox.stub(vscode.commands, 'registerCommand').value(commandsMock.registerCommand);

        // Mock the ExtensionContext
        mockContext = {
            subscriptions: [],
            extensionUri: vscode.Uri.parse('file:///extension/uri')
        };

        // Mock ConfirmationSettingsPanel
        mockConfirmationSettingsPanel = {
            createOrShow: sandbox.stub()
        };
        sandbox.stub(ConfirmationSettingsPanel, 'createOrShow').value(mockConfirmationSettingsPanel.createOrShow);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerConfirmationSettingsCommand', () => {
        it('should register the openConfirmationSettings command', () => {
            registerConfirmationSettingsCommand(mockContext);

            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.openConfirmationSettings',
                expect.any(Function)
            );
        });

        it('should add command disposable to context.subscriptions', () => {
            registerConfirmationSettingsCommand(mockContext);

            expect(mockContext.subscriptions.length).toBe(1);
        });
    });

    describe('command execution', () => {
        it('should open the confirmation settings panel when command is executed', () => {
            registerConfirmationSettingsCommand(mockContext);

            // Get the registered command callback
            const openSettingsCallback = commandsMock.registerCommand.getCall(0).args[1];

            // Execute the callback
            openSettingsCallback();

            // Verify the panel was created
            expect(mockConfirmationSettingsPanel.createOrShow).toHaveBeenCalledWith(mockContext.extensionUri);
        });

        it('should pass the extension URI to the settings panel', () => {
            const testUri = vscode.Uri.parse('file:///test/uri');
            mockContext.extensionUri = testUri;

            registerConfirmationSettingsCommand(mockContext);

            // Get the registered command callback
            const openSettingsCallback = commandsMock.registerCommand.getCall(0).args[1];

            // Execute the callback
            openSettingsCallback();

            // Verify the correct URI was passed to the panel
            expect(mockConfirmationSettingsPanel.createOrShow).toHaveBeenCalledWith(testUri);
        });
    });
});
