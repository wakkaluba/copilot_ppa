const vscode = require('vscode');
const sinon = require('sinon');
const { expect } = require('chai');
const { ExtensionCommandRegistrar } = require('../ExtensionCommandRegistrar');
const { ExtensionManager } = require('../../services/ExtensionManager');

describe('ExtensionCommandRegistrar', () => {
    let commandRegistrar;
    let extensionManagerMock;
    let mockContext;
    let sandbox;

    // Mock extension list for testing
    const mockExtensions = [
        {
            id: 'publisher1.extension1',
            packageJSON: {
                displayName: 'Extension 1'
            }
        },
        {
            id: 'publisher2.extension2',
            packageJSON: {
                displayName: 'Extension 2'
            }
        }
    ];

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock ExtensionManager
        extensionManagerMock = sandbox.createStubInstance(ExtensionManager);

        // Create the registrar with the mocked manager
        commandRegistrar = new ExtensionCommandRegistrar(extensionManagerMock);

        // Mock extension context
        mockContext = {
            subscriptions: [],
            // Add other required properties for the ExtensionContext interface
            workspaceState: {},
            globalState: {},
            extensionUri: {},
            extensionPath: '',
            asAbsolutePath: sandbox.stub(),
            storagePath: '',
            globalStoragePath: '',
            logPath: '',
            subscriptionPath: '',
            extension: {},
            environmentVariableCollection: {},
            extensionMode: vscode.ExtensionMode.Development,
            storageUri: null,
            globalStorageUri: null,
            logUri: null,
            secrets: {}
        };

        // Stub vscode.commands.registerCommand
        sandbox.stub(vscode.commands, 'registerCommand').callsFake((commandId, handler) => {
            return { dispose: () => {} };
        });

        // Stub vscode.window methods
        sandbox.stub(vscode.window, 'showInputBox');
        sandbox.stub(vscode.window, 'showQuickPick');
        sandbox.stub(vscode.window, 'showErrorMessage');

        // Stub vscode.extensions
        sandbox.stub(vscode.extensions, 'all').value(mockExtensions);

        // Stub vscode.workspace
        sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: sandbox.stub().returns({ someConfig: 'value' }),
            update: sandbox.stub().resolves()
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerCommands', () => {
        it('should register the correct commands with the extension context', () => {
            // Arrange
            const registerCommandStub = vscode.commands.registerCommand;

            // Act
            commandRegistrar.registerCommands(mockContext);

            // Assert
            expect(registerCommandStub.calledThrice).to.be.true;
            expect(registerCommandStub.getCall(0).args[0]).to.equal('copilot-ppa.requestExtensionAccess');
            expect(registerCommandStub.getCall(1).args[0]).to.equal('copilot-ppa.configureExtension');
            expect(registerCommandStub.getCall(2).args[0]).to.equal('copilot-ppa.showRecommendedExtensions');
            expect(mockContext.subscriptions.length).to.equal(3);
        });
    });

    describe('requestExtensionAccess command', () => {
        it('should prompt user for extension ID and request access when ID is provided', async () => {
            // Arrange
            const showInputBoxStub = vscode.window.showInputBox;
            showInputBoxStub.resolves('publisher.extension');
            const registerCommandStub = vscode.commands.registerCommand;

            // Act
            commandRegistrar.registerCommands(mockContext);
            const requestAccessHandler = registerCommandStub.getCall(0).args[1];
            await requestAccessHandler();

            // Assert
            expect(showInputBoxStub.calledOnce).to.be.true;
            expect(extensionManagerMock.requestAccess.calledOnce).to.be.true;
            expect(extensionManagerMock.requestAccess.calledWith('publisher.extension')).to.be.true;
        });

        it('should not request access when user cancels the input', async () => {
            // Arrange
            const showInputBoxStub = vscode.window.showInputBox;
            showInputBoxStub.resolves(undefined);
            const registerCommandStub = vscode.commands.registerCommand;

            // Act
            commandRegistrar.registerCommands(mockContext);
            const requestAccessHandler = registerCommandStub.getCall(0).args[1];
            await requestAccessHandler();

            // Assert
            expect(showInputBoxStub.calledOnce).to.be.true;
            expect(extensionManagerMock.requestAccess.called).to.be.false;
        });
    });

    describe('configureExtension command', () => {
        it('should show quick pick with extensions and configure the selected extension', async () => {
            // Arrange
            const showQuickPickStub = vscode.window.showQuickPick;
            const showInputBoxStub = vscode.window.showInputBox;
            const registerCommandStub = vscode.commands.registerCommand;

            showQuickPickStub.resolves({ label: 'Extension 1', description: 'publisher1.extension1' });
            showInputBoxStub.onFirstCall().resolves('typescript.preferences');
            showInputBoxStub.onSecondCall().resolves('{"tabSize": 4}');

            extensionManagerMock.getExtension.resolves({ id: 'publisher1.extension1' });

            // Act
            commandRegistrar.registerCommands(mockContext);
            const configureExtensionHandler = registerCommandStub.getCall(1).args[1];
            await configureExtensionHandler();

            // Assert
            expect(showQuickPickStub.calledOnce).to.be.true;
            expect(extensionManagerMock.getExtension.calledWith('publisher1.extension1')).to.be.true;
            expect(showInputBoxStub.calledTwice).to.be.true;
            expect(extensionManagerMock.updateConfiguration.calledOnce).to.be.true;
            expect(extensionManagerMock.updateConfiguration.calledWith(
                'publisher1.extension1',
                'typescript.preferences',
                { tabSize: 4 }
            )).to.be.true;
        });

        it('should not configure when user cancels extension selection', async () => {
            // Arrange
            const showQuickPickStub = vscode.window.showQuickPick;
            showQuickPickStub.resolves(undefined);
            const registerCommandStub = vscode.commands.registerCommand;

            // Act
            commandRegistrar.registerCommands(mockContext);
            const configureExtensionHandler = registerCommandStub.getCall(1).args[1];
            await configureExtensionHandler();

            // Assert
            expect(showQuickPickStub.calledOnce).to.be.true;
            expect(extensionManagerMock.getExtension.called).to.be.false;
            expect(extensionManagerMock.updateConfiguration.called).to.be.false;
        });

        it('should not configure when extension not found', async () => {
            // Arrange
            const showQuickPickStub = vscode.window.showQuickPick;
            const registerCommandStub = vscode.commands.registerCommand;

            showQuickPickStub.resolves({ label: 'Extension 1', description: 'publisher1.extension1' });
            extensionManagerMock.getExtension.resolves(undefined);

            // Act
            commandRegistrar.registerCommands(mockContext);
            const configureExtensionHandler = registerCommandStub.getCall(1).args[1];
            await configureExtensionHandler();

            // Assert
            expect(showQuickPickStub.calledOnce).to.be.true;
            expect(extensionManagerMock.getExtension.calledOnce).to.be.true;
            expect(extensionManagerMock.updateConfiguration.called).to.be.false;
        });

        it('should not configure when user cancels section input', async () => {
            // Arrange
            const showQuickPickStub = vscode.window.showQuickPick;
            const showInputBoxStub = vscode.window.showInputBox;
            const registerCommandStub = vscode.commands.registerCommand;

            showQuickPickStub.resolves({ label: 'Extension 1', description: 'publisher1.extension1' });
            showInputBoxStub.onFirstCall().resolves(undefined);

            extensionManagerMock.getExtension.resolves({ id: 'publisher1.extension1' });

            // Act
            commandRegistrar.registerCommands(mockContext);
            const configureExtensionHandler = registerCommandStub.getCall(1).args[1];
            await configureExtensionHandler();

            // Assert
            expect(showQuickPickStub.calledOnce).to.be.true;
            expect(extensionManagerMock.getExtension.calledOnce).to.be.true;
            expect(showInputBoxStub.calledOnce).to.be.true;
            expect(extensionManagerMock.updateConfiguration.called).to.be.false;
        });

        it('should not configure when user cancels value input', async () => {
            // Arrange
            const showQuickPickStub = vscode.window.showQuickPick;
            const showInputBoxStub = vscode.window.showInputBox;
            const registerCommandStub = vscode.commands.registerCommand;

            showQuickPickStub.resolves({ label: 'Extension 1', description: 'publisher1.extension1' });
            showInputBoxStub.onFirstCall().resolves('typescript.preferences');
            showInputBoxStub.onSecondCall().resolves(undefined);

            extensionManagerMock.getExtension.resolves({ id: 'publisher1.extension1' });

            // Act
            commandRegistrar.registerCommands(mockContext);
            const configureExtensionHandler = registerCommandStub.getCall(1).args[1];
            await configureExtensionHandler();

            // Assert
            expect(showQuickPickStub.calledOnce).to.be.true;
            expect(extensionManagerMock.getExtension.calledOnce).to.be.true;
            expect(showInputBoxStub.calledTwice).to.be.true;
            expect(extensionManagerMock.updateConfiguration.called).to.be.false;
        });

        it('should handle invalid JSON value input', async () => {
            // Arrange
            const showQuickPickStub = vscode.window.showQuickPick;
            const showInputBoxStub = vscode.window.showInputBox;
            const showErrorMessageStub = vscode.window.showErrorMessage;
            const registerCommandStub = vscode.commands.registerCommand;

            showQuickPickStub.resolves({ label: 'Extension 1', description: 'publisher1.extension1' });
            showInputBoxStub.onFirstCall().resolves('typescript.preferences');
            showInputBoxStub.onSecondCall().resolves('invalid json');

            extensionManagerMock.getExtension.resolves({ id: 'publisher1.extension1' });

            // Act
            commandRegistrar.registerCommands(mockContext);
            const configureExtensionHandler = registerCommandStub.getCall(1).args[1];
            await configureExtensionHandler();

            // Assert
            expect(showQuickPickStub.calledOnce).to.be.true;
            expect(extensionManagerMock.getExtension.calledOnce).to.be.true;
            expect(showInputBoxStub.calledTwice).to.be.true;
            expect(showErrorMessageStub.calledOnce).to.be.true;
            expect(showErrorMessageStub.calledWith('Invalid JSON value')).to.be.true;
            expect(extensionManagerMock.updateConfiguration.called).to.be.false;
        });
    });

    describe('showRecommendedExtensions command', () => {
        it('should show quickpick with recommended extensions and install selected ones', async () => {
            // Arrange
            const mockRecommendations = [
                { id: 'publisher1.extension1', reason: 'Improves workflow' },
                { id: 'publisher2.extension2', reason: 'Enhances editing' }
            ];

            const showQuickPickStub = vscode.window.showQuickPick;
            const registerCommandStub = vscode.commands.registerCommand;

            extensionManagerMock.getRecommendations.resolves(mockRecommendations);
            showQuickPickStub.resolves([
                { label: 'publisher1.extension1', description: 'Improves workflow' }
            ]);

            // Act
            commandRegistrar.registerCommands(mockContext);
            const showRecommendedExtensionsHandler = registerCommandStub.getCall(2).args[1];
            await showRecommendedExtensionsHandler();

            // Assert
            expect(extensionManagerMock.getRecommendations.calledOnce).to.be.true;
            expect(showQuickPickStub.calledOnce).to.be.true;
            expect(extensionManagerMock.installRecommendedExtension.calledOnce).to.be.true;
            expect(extensionManagerMock.installRecommendedExtension.calledWith('publisher1.extension1')).to.be.true;
        });

        it('should handle multiple selected extensions', async () => {
            // Arrange
            const mockRecommendations = [
                { id: 'publisher1.extension1', reason: 'Improves workflow' },
                { id: 'publisher2.extension2', reason: 'Enhances editing' },
                { id: 'publisher3.extension3', reason: 'Debugging tools' }
            ];

            const showQuickPickStub = vscode.window.showQuickPick;
            const registerCommandStub = vscode.commands.registerCommand;

            extensionManagerMock.getRecommendations.resolves(mockRecommendations);
            showQuickPickStub.resolves([
                { label: 'publisher1.extension1', description: 'Improves workflow' },
                { label: 'publisher3.extension3', description: 'Debugging tools' }
            ]);

            // Act
            commandRegistrar.registerCommands(mockContext);
            const showRecommendedExtensionsHandler = registerCommandStub.getCall(2).args[1];
            await showRecommendedExtensionsHandler();

            // Assert
            expect(extensionManagerMock.getRecommendations.calledOnce).to.be.true;
            expect(showQuickPickStub.calledOnce).to.be.true;
            expect(extensionManagerMock.installRecommendedExtension.calledTwice).to.be.true;
            expect(extensionManagerMock.installRecommendedExtension.firstCall.args[0]).to.equal('publisher1.extension1');
            expect(extensionManagerMock.installRecommendedExtension.secondCall.args[0]).to.equal('publisher3.extension3');
        });

        it('should not install any extensions when user cancels', async () => {
            // Arrange
            const mockRecommendations = [
                { id: 'publisher1.extension1', reason: 'Improves workflow' },
                { id: 'publisher2.extension2', reason: 'Enhances editing' }
            ];

            const showQuickPickStub = vscode.window.showQuickPick;
            const registerCommandStub = vscode.commands.registerCommand;

            extensionManagerMock.getRecommendations.resolves(mockRecommendations);
            showQuickPickStub.resolves(undefined);

            // Act
            commandRegistrar.registerCommands(mockContext);
            const showRecommendedExtensionsHandler = registerCommandStub.getCall(2).args[1];
            await showRecommendedExtensionsHandler();

            // Assert
            expect(extensionManagerMock.getRecommendations.calledOnce).to.be.true;
            expect(showQuickPickStub.calledOnce).to.be.true;
            expect(extensionManagerMock.installRecommendedExtension.called).to.be.false;
        });

        it('should handle empty recommendations list', async () => {
            // Arrange
            const mockRecommendations = [];

            const showQuickPickStub = vscode.window.showQuickPick;
            const registerCommandStub = vscode.commands.registerCommand;

            extensionManagerMock.getRecommendations.resolves(mockRecommendations);

            // Act
            commandRegistrar.registerCommands(mockContext);
            const showRecommendedExtensionsHandler = registerCommandStub.getCall(2).args[1];
            await showRecommendedExtensionsHandler();

            // Assert
            expect(extensionManagerMock.getRecommendations.calledOnce).to.be.true;
            expect(showQuickPickStub.calledOnce).to.be.true;
            expect(showQuickPickStub.firstCall.args[0]).to.be.an('array').that.is.empty;
            expect(extensionManagerMock.installRecommendedExtension.called).to.be.false;
        });
    });
});
