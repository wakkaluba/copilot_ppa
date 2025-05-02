// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\ExtensionCommandRegistrar.js.test.js
const vscode = require('vscode');
const { ExtensionCommandRegistrar } = require('../ExtensionCommandRegistrar');
const { ExtensionManager } = require('../../services/ExtensionManager');
const sinon = require('sinon');

describe('ExtensionCommandRegistrar', () => {
    let registrar;
    let managerMock;
    let contextMock;
    let commandsMock;
    let windowMock;
    let workspaceMock;
    let extensionsMock;
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock the ExtensionManager
        managerMock = {
            requestAccess: sandbox.stub().resolves(),
            getExtension: sandbox.stub().resolves({ id: 'test.extension' }),
            updateConfiguration: sandbox.stub().resolves(),
            getRecommendations: sandbox.stub().resolves([
                { id: 'recommendation1', reason: 'Reason 1' },
                { id: 'recommendation2', reason: 'Reason 2' }
            ]),
            installRecommendedExtension: sandbox.stub().resolves()
        };

        // Mock VS Code APIs
        commandsMock = {
            registerCommand: sandbox.stub().returns({ dispose: sandbox.stub() })
        };

        windowMock = {
            showInputBox: sandbox.stub(),
            showQuickPick: sandbox.stub(),
            showErrorMessage: sandbox.stub()
        };

        workspaceMock = {
            getConfiguration: sandbox.stub().returns({
                get: sandbox.stub().returns('currentValue')
            })
        };

        extensionsMock = {
            all: [
                { id: 'test.extension1', packageJSON: { displayName: 'Test Extension 1' } },
                { id: 'test.extension2', packageJSON: { displayName: 'Test Extension 2' } }
            ]
        };

        // Mock the VS Code namespace
        sandbox.stub(vscode, 'commands').value(commandsMock);
        sandbox.stub(vscode, 'window').value(windowMock);
        sandbox.stub(vscode, 'workspace').value(workspaceMock);
        sandbox.stub(vscode, 'extensions').value(extensionsMock);

        // Mock the extension context
        contextMock = {
            subscriptions: []
        };

        // Create the registrar with the mocked manager
        registrar = new ExtensionCommandRegistrar(managerMock);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerCommands', () => {
        it('should register three commands with VS Code', () => {
            registrar.registerCommands(contextMock);

            expect(commandsMock.registerCommand.calledThrice).toBe(true);
            expect(commandsMock.registerCommand.getCall(0).args[0]).toBe('copilot-ppa.requestExtensionAccess');
            expect(commandsMock.registerCommand.getCall(1).args[0]).toBe('copilot-ppa.configureExtension');
            expect(commandsMock.registerCommand.getCall(2).args[0]).toBe('copilot-ppa.showRecommendedExtensions');

            expect(contextMock.subscriptions.length).toBe(3);
        });
    });

    describe('requestExtensionAccess command', () => {
        it('should request access with provided extension ID', async () => {
            windowMock.showInputBox.resolves('test.extension');

            registrar.registerCommands(contextMock);
            const requestAccessCommand = commandsMock.registerCommand.getCall(0).args[1];
            await requestAccessCommand();

            expect(windowMock.showInputBox.calledOnce).toBe(true);
            expect(managerMock.requestAccess.calledOnceWith('test.extension')).toBe(true);
        });

        it('should not request access when input is canceled', async () => {
            windowMock.showInputBox.resolves(undefined);

            registrar.registerCommands(contextMock);
            const requestAccessCommand = commandsMock.registerCommand.getCall(0).args[1];
            await requestAccessCommand();

            expect(windowMock.showInputBox.calledOnce).toBe(true);
            expect(managerMock.requestAccess.called).toBe(false);
        });
    });

    describe('configureExtension command', () => {
        it('should update configuration with valid JSON input', async () => {
            const mockExtensionQuickPick = { label: 'Test Extension', description: 'test.extension' };
            windowMock.showQuickPick.resolves(mockExtensionQuickPick);
            windowMock.showInputBox.onFirstCall().resolves('section.path');
            windowMock.showInputBox.onSecondCall().resolves('{"key": "value"}');

            registrar.registerCommands(contextMock);
            const configureCommand = commandsMock.registerCommand.getCall(1).args[1];
            await configureCommand();

            expect(windowMock.showQuickPick.calledOnce).toBe(true);
            expect(managerMock.getExtension.calledOnceWith('test.extension')).toBe(true);
            expect(windowMock.showInputBox.calledTwice).toBe(true);
            expect(managerMock.updateConfiguration.calledOnceWith(
                'test.extension', 'section.path', { key: 'value' }
            )).toBe(true);
        });

        it('should show error message with invalid JSON input', async () => {
            const mockExtensionQuickPick = { label: 'Test Extension', description: 'test.extension' };
            windowMock.showQuickPick.resolves(mockExtensionQuickPick);
            windowMock.showInputBox.onFirstCall().resolves('section.path');
            windowMock.showInputBox.onSecondCall().resolves('invalid json');

            registrar.registerCommands(contextMock);
            const configureCommand = commandsMock.registerCommand.getCall(1).args[1];
            await configureCommand();

            expect(windowMock.showQuickPick.calledOnce).toBe(true);
            expect(managerMock.getExtension.calledOnceWith('test.extension')).toBe(true);
            expect(windowMock.showInputBox.calledTwice).toBe(true);
            expect(windowMock.showErrorMessage.calledOnceWith('Invalid JSON value')).toBe(true);
            expect(managerMock.updateConfiguration.called).toBe(false);
        });

        it('should do nothing when extension selection is canceled', async () => {
            windowMock.showQuickPick.resolves(undefined);

            registrar.registerCommands(contextMock);
            const configureCommand = commandsMock.registerCommand.getCall(1).args[1];
            await configureCommand();

            expect(windowMock.showQuickPick.calledOnce).toBe(true);
            expect(managerMock.getExtension.called).toBe(false);
            expect(windowMock.showInputBox.called).toBe(false);
        });

        it('should do nothing when section input is canceled', async () => {
            const mockExtensionQuickPick = { label: 'Test Extension', description: 'test.extension' };
            windowMock.showQuickPick.resolves(mockExtensionQuickPick);
            windowMock.showInputBox.onFirstCall().resolves(undefined);

            registrar.registerCommands(contextMock);
            const configureCommand = commandsMock.registerCommand.getCall(1).args[1];
            await configureCommand();

            expect(windowMock.showQuickPick.calledOnce).toBe(true);
            expect(managerMock.getExtension.calledOnce).toBe(true);
            expect(windowMock.showInputBox.calledOnce).toBe(true);
            expect(windowMock.showInputBox.secondCall).toBe(null);
        });

        it('should do nothing when value input is canceled', async () => {
            const mockExtensionQuickPick = { label: 'Test Extension', description: 'test.extension' };
            windowMock.showQuickPick.resolves(mockExtensionQuickPick);
            windowMock.showInputBox.onFirstCall().resolves('section.path');
            windowMock.showInputBox.onSecondCall().resolves(undefined);

            registrar.registerCommands(contextMock);
            const configureCommand = commandsMock.registerCommand.getCall(1).args[1];
            await configureCommand();

            expect(windowMock.showQuickPick.calledOnce).toBe(true);
            expect(managerMock.getExtension.calledOnce).toBe(true);
            expect(windowMock.showInputBox.calledTwice).toBe(true);
            expect(managerMock.updateConfiguration.called).toBe(false);
        });
    });

    describe('showRecommendedExtensions command', () => {
        it('should install selected recommended extensions', async () => {
            const mockSelections = [
                { label: 'recommendation1', description: 'Reason 1' }
            ];
            windowMock.showQuickPick.resolves(mockSelections);

            registrar.registerCommands(contextMock);
            const recommendedCommand = commandsMock.registerCommand.getCall(2).args[1];
            await recommendedCommand();

            expect(managerMock.getRecommendations.calledOnce).toBe(true);
            expect(windowMock.showQuickPick.calledOnce).toBe(true);
            expect(managerMock.installRecommendedExtension.calledOnceWith('recommendation1')).toBe(true);
        });

        it('should install multiple selected recommended extensions', async () => {
            const mockSelections = [
                { label: 'recommendation1', description: 'Reason 1' },
                { label: 'recommendation2', description: 'Reason 2' }
            ];
            windowMock.showQuickPick.resolves(mockSelections);

            registrar.registerCommands(contextMock);
            const recommendedCommand = commandsMock.registerCommand.getCall(2).args[1];
            await recommendedCommand();

            expect(managerMock.getRecommendations.calledOnce).toBe(true);
            expect(windowMock.showQuickPick.calledOnce).toBe(true);
            expect(managerMock.installRecommendedExtension.calledTwice).toBe(true);
            expect(managerMock.installRecommendedExtension.firstCall.args[0]).toBe('recommendation1');
            expect(managerMock.installRecommendedExtension.secondCall.args[0]).toBe('recommendation2');
        });

        it('should not install extensions when selection is canceled', async () => {
            windowMock.showQuickPick.resolves(undefined);

            registrar.registerCommands(contextMock);
            const recommendedCommand = commandsMock.registerCommand.getCall(2).args[1];
            await recommendedCommand();

            expect(managerMock.getRecommendations.calledOnce).toBe(true);
            expect(windowMock.showQuickPick.calledOnce).toBe(true);
            expect(managerMock.installRecommendedExtension.called).toBe(false);
        });

        it('should not install extensions when empty selection', async () => {
            windowMock.showQuickPick.resolves([]);

            registrar.registerCommands(contextMock);
            const recommendedCommand = commandsMock.registerCommand.getCall(2).args[1];
            await recommendedCommand();

            expect(managerMock.getRecommendations.calledOnce).toBe(true);
            expect(windowMock.showQuickPick.calledOnce).toBe(true);
            expect(managerMock.installRecommendedExtension.called).toBe(false);
        });
    });
});
