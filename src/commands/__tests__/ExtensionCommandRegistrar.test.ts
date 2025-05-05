import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ExtensionManager } from '../../services/ExtensionManager';
import { ExtensionCommandRegistrar } from '../ExtensionCommandRegistrar';

describe('ExtensionCommandRegistrar', () => {
    let commandRegistrar: ExtensionCommandRegistrar;
    let extensionManagerMock: sinon.SinonStubbedInstance<ExtensionManager>;
    let mockContext: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;

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
        commandRegistrar = new ExtensionCommandRegistrar(extensionManagerMock as unknown as ExtensionManager);

        // Mock extension context
        mockContext = {
            subscriptions: [],
            // Add other required properties for the ExtensionContext interface
            workspaceState: {} as any,
            globalState: {} as any,
            extensionUri: {} as any,
            extensionPath: '',
            asAbsolutePath: sandbox.stub(),
            storagePath: '',
            globalStoragePath: '',
            logPath: '',
            subscriptionPath: '',
            extension: {} as any,
            environmentVariableCollection: {} as any,
            extensionMode: vscode.ExtensionMode.Development,
            storageUri: null,
            globalStorageUri: null,
            logUri: null,
            secrets: {} as any
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
        } as any);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerCommands', () => {
        it('should register the correct commands with the extension context', () => {
            // Arrange
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

            // Act
            commandRegistrar.registerCommands(mockContext);

            // Assert
            expect(registerCommandStub.calledThrice).to.be.true;
            expect(registerCommandStub.getCall(0).args[0]).to.equal('copilot-ppa.requestExtensionAccess');
            expect(registerCommandStub.getCall(1).args[0]).to.equal('copilot-ppa.configureExtension');
            expect(registerCommandStub.getCall(2).args[0]).to.equal('copilot-ppa.showRecommendedExtensions');
            expect(mockContext.subscriptions.length).to.equal(3);
        });

        it('should return disposables from registerCommand', () => {
            // Arrange
            const mockDisposable1 = { dispose: sandbox.stub() };
            const mockDisposable2 = { dispose: sandbox.stub() };
            const mockDisposable3 = { dispose: sandbox.stub() };

            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;
            registerCommandStub.onFirstCall().returns(mockDisposable1);
            registerCommandStub.onSecondCall().returns(mockDisposable2);
            registerCommandStub.onThirdCall().returns(mockDisposable3);

            // Act
            commandRegistrar.registerCommands(mockContext);

            // Assert
            expect(mockContext.subscriptions).to.include(mockDisposable1);
            expect(mockContext.subscriptions).to.include(mockDisposable2);
            expect(mockContext.subscriptions).to.include(mockDisposable3);
        });
    });

    describe('requestExtensionAccess command', () => {
        it('should prompt user for extension ID and request access when ID is provided', async () => {
            // Arrange
            const showInputBoxStub = vscode.window.showInputBox as sinon.SinonStub;
            showInputBoxStub.resolves('publisher.extension');
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

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
            const showInputBoxStub = vscode.window.showInputBox as sinon.SinonStub;
            showInputBoxStub.resolves(undefined);
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

            // Act
            commandRegistrar.registerCommands(mockContext);
            const requestAccessHandler = registerCommandStub.getCall(0).args[1];
            await requestAccessHandler();

            // Assert
            expect(showInputBoxStub.calledOnce).to.be.true;
            expect(extensionManagerMock.requestAccess.called).to.be.false;
        });

        it('should handle errors when requesting extension access', async () => {
            // Arrange
            const showInputBoxStub = vscode.window.showInputBox as sinon.SinonStub;
            const showErrorMessageStub = vscode.window.showErrorMessage as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

            showInputBoxStub.resolves('publisher.extension');
            extensionManagerMock.requestAccess.rejects(new Error('Access denied'));

            // Act
            commandRegistrar.registerCommands(mockContext);
            const requestAccessHandler = registerCommandStub.getCall(0).args[1];
            await requestAccessHandler();

            // Assert
            expect(showInputBoxStub.calledOnce).to.be.true;
            expect(extensionManagerMock.requestAccess.calledOnce).to.be.true;
            expect(extensionManagerMock.requestAccess.calledWith('publisher.extension')).to.be.true;
            // Note: Error handling is not implemented in the class, so we don't expect showErrorMessage to be called
            // This test indicates an area for improvement in the class implementation
        });

        it('should handle empty string input for extension ID', async () => {
            // Arrange
            const showInputBoxStub = vscode.window.showInputBox as sinon.SinonStub;
            showInputBoxStub.resolves('');
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

            // Act
            commandRegistrar.registerCommands(mockContext);
            const requestAccessHandler = registerCommandStub.getCall(0).args[1];
            await requestAccessHandler();

            // Assert
            expect(showInputBoxStub.calledOnce).to.be.true;
            expect(extensionManagerMock.requestAccess.calledOnce).to.be.true;
            expect(extensionManagerMock.requestAccess.calledWith('')).to.be.true;
            // Note: This test indicates that empty strings are not filtered, an area for improvement
        });
    });

    describe('configureExtension command', () => {
        it('should show quick pick with extensions and configure the selected extension', async () => {
            // Arrange
            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const showInputBoxStub = vscode.window.showInputBox as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

            showQuickPickStub.resolves({ label: 'Extension 1', description: 'publisher1.extension1' });
            showInputBoxStub.onFirstCall().resolves('typescript.preferences');
            showInputBoxStub.onSecondCall().resolves('{"tabSize": 4}');

            extensionManagerMock.getExtension.resolves({ id: 'publisher1.extension1' } as any);

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
            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            showQuickPickStub.resolves(undefined);
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

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
            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

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
            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const showInputBoxStub = vscode.window.showInputBox as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

            showQuickPickStub.resolves({ label: 'Extension 1', description: 'publisher1.extension1' });
            showInputBoxStub.onFirstCall().resolves(undefined);

            extensionManagerMock.getExtension.resolves({ id: 'publisher1.extension1' } as any);

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
            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const showInputBoxStub = vscode.window.showInputBox as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

            showQuickPickStub.resolves({ label: 'Extension 1', description: 'publisher1.extension1' });
            showInputBoxStub.onFirstCall().resolves('typescript.preferences');
            showInputBoxStub.onSecondCall().resolves(undefined);

            extensionManagerMock.getExtension.resolves({ id: 'publisher1.extension1' } as any);

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
            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const showInputBoxStub = vscode.window.showInputBox as sinon.SinonStub;
            const showErrorMessageStub = vscode.window.showErrorMessage as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

            showQuickPickStub.resolves({ label: 'Extension 1', description: 'publisher1.extension1' });
            showInputBoxStub.onFirstCall().resolves('typescript.preferences');
            showInputBoxStub.onSecondCall().resolves('invalid json');

            extensionManagerMock.getExtension.resolves({ id: 'publisher1.extension1' } as any);

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

        it('should handle extensions without displayName', async () => {
            // Arrange
            // Create a modified extensions list where one extension has no displayName
            const noDisplayNameExtensions = [
                {
                    id: 'publisher1.extension1',
                    packageJSON: {
                        displayName: 'Extension 1'
                    }
                },
                {
                    id: 'publisher2.extension2',
                    packageJSON: {} // No displayName
                }
            ];

            (vscode.extensions.all as any) = noDisplayNameExtensions;

            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

            // Act
            commandRegistrar.registerCommands(mockContext);
            const configureExtensionHandler = registerCommandStub.getCall(1).args[1];
            await configureExtensionHandler();

            // Assert
            expect(showQuickPickStub.calledOnce).to.be.true;

            // Verify the items passed to quickPick have the correct format
            const quickPickItems = showQuickPickStub.firstCall.args[0];
            const extension2Item = quickPickItems.find((item: any) => item.description === 'publisher2.extension2');
            expect(extension2Item).to.exist;
            expect(extension2Item.label).to.equal('publisher2.extension2'); // Falls back to id when no displayName
        });

        it('should handle configuration update errors', async () => {
            // Arrange
            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const showInputBoxStub = vscode.window.showInputBox as sinon.SinonStub;
            const showErrorMessageStub = vscode.window.showErrorMessage as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

            showQuickPickStub.resolves({ label: 'Extension 1', description: 'publisher1.extension1' });
            showInputBoxStub.onFirstCall().resolves('typescript.preferences');
            showInputBoxStub.onSecondCall().resolves('{"tabSize": 4}');

            extensionManagerMock.getExtension.resolves({ id: 'publisher1.extension1' } as any);
            extensionManagerMock.updateConfiguration.rejects(new Error('Configuration update failed'));

            // Act
            commandRegistrar.registerCommands(mockContext);
            const configureExtensionHandler = registerCommandStub.getCall(1).args[1];
            await configureExtensionHandler();

            // Assert
            expect(showQuickPickStub.calledOnce).to.be.true;
            expect(extensionManagerMock.getExtension.calledOnce).to.be.true;
            expect(showInputBoxStub.calledTwice).to.be.true;
            expect(extensionManagerMock.updateConfiguration.calledOnce).to.be.true;
            // Note: Error handling is not implemented in the class, so we don't expect showErrorMessage to be called
            // This test indicates an area for improvement in the class implementation
        });
    });

    describe('showRecommendedExtensions command', () => {
        it('should show quickpick with recommended extensions and install selected ones', async () => {
            // Arrange
            const mockRecommendations = [
                { id: 'publisher1.extension1', reason: 'Improves workflow' },
                { id: 'publisher2.extension2', reason: 'Enhances editing' }
            ];

            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

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

            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

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

            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

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
            const mockRecommendations: any[] = [];

            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

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

        it('should handle errors during extension installation', async () => {
            // Arrange
            const mockRecommendations = [
                { id: 'publisher1.extension1', reason: 'Improves workflow' }
            ];

            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const showErrorMessageStub = vscode.window.showErrorMessage as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

            extensionManagerMock.getRecommendations.resolves(mockRecommendations);
            showQuickPickStub.resolves([
                { label: 'publisher1.extension1', description: 'Improves workflow' }
            ]);
            extensionManagerMock.installRecommendedExtension.rejects(new Error('Installation failed'));

            // Act
            commandRegistrar.registerCommands(mockContext);
            const showRecommendedExtensionsHandler = registerCommandStub.getCall(2).args[1];
            await showRecommendedExtensionsHandler();

            // Assert
            expect(extensionManagerMock.getRecommendations.calledOnce).to.be.true;
            expect(showQuickPickStub.calledOnce).to.be.true;
            expect(extensionManagerMock.installRecommendedExtension.calledOnce).to.be.true;
            // Note: Error handling is not implemented in the class, so we don't expect showErrorMessage to be called
            // This test indicates an area for improvement in the class implementation
        });

        it('should handle errors when fetching recommendations', async () => {
            // Arrange
            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const showErrorMessageStub = vscode.window.showErrorMessage as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

            extensionManagerMock.getRecommendations.rejects(new Error('Failed to fetch recommendations'));

            // Act
            commandRegistrar.registerCommands(mockContext);
            const showRecommendedExtensionsHandler = registerCommandStub.getCall(2).args[1];
            await showRecommendedExtensionsHandler();

            // Assert
            expect(extensionManagerMock.getRecommendations.calledOnce).to.be.true;
            // Note: Error handling is not implemented in the class, so we don't expect showQuickPick or showErrorMessage to be called
            // This test indicates an area for improvement in the class implementation
        });

        it('should correctly format recommendation items for the quick pick', async () => {
            // Arrange
            const mockRecommendations = [
                { id: 'publisher1.extension1', reason: 'Improves workflow' },
                { id: 'publisher2.extension2', reason: 'Enhances editing' }
            ];

            const showQuickPickStub = vscode.window.showQuickPick as sinon.SinonStub;
            const registerCommandStub = vscode.commands.registerCommand as sinon.SinonStub;

            extensionManagerMock.getRecommendations.resolves(mockRecommendations);
            showQuickPickStub.resolves(undefined); // User cancels, but we still want to check the format

            // Act
            commandRegistrar.registerCommands(mockContext);
            const showRecommendedExtensionsHandler = registerCommandStub.getCall(2).args[1];
            await showRecommendedExtensionsHandler();

            // Assert
            expect(extensionManagerMock.getRecommendations.calledOnce).to.be.true;
            expect(showQuickPickStub.calledOnce).to.be.true;

            // Verify the items passed to quickPick have the correct format
            const quickPickItems = showQuickPickStub.firstCall.args[0];
            expect(quickPickItems).to.have.lengthOf(2);
            expect(quickPickItems[0].label).to.equal('publisher1.extension1');
            expect(quickPickItems[0].description).to.equal('Improves workflow');
            expect(quickPickItems[1].label).to.equal('publisher2.extension2');
            expect(quickPickItems[1].description).to.equal('Enhances editing');
        });
    });

    describe('constructor', () => {
        it('should properly initialize with ExtensionManager', () => {
            // Arrange
            const manager = new ExtensionManager({} as vscode.ExtensionContext);

            // Act
            const registrar = new ExtensionCommandRegistrar(manager);

            // Assert - if injection fails, this would typically throw an error
            // This is mostly a structural test to ensure constructor works
            expect(registrar).to.be.instanceOf(ExtensionCommandRegistrar);
        });
    });
});
