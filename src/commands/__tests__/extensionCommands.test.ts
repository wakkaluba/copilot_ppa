// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\extensionCommands.test.ts
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ExtensionManager } from '../../services/ExtensionManager';
import { registerExtensionCommands } from '../extensionCommands';

describe('Extension Commands', () => {
    let sandbox: sinon.SinonSandbox;
    let mockExtensionManager: any;
    let mockContext: any;
    let mockCommands: any;
    let mockWindow: any;
    let mockQuickPick: sinon.SinonStub;
    let mockInfoMessage: sinon.SinonStub;
    let mockExecuteCommand: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock the extension manager with all required methods
        mockExtensionManager = {
            listExtensions: sandbox.stub().resolves([
                {
                    id: 'ext1',
                    packageJSON: { displayName: 'Extension 1' }
                },
                {
                    id: 'ext2',
                    packageJSON: { displayName: 'Extension 2' }
                }
            ]),
            toggleExtension: sandbox.stub().resolves(),
            getExtension: sandbox.stub().resolves(),
            clearPermissions: sandbox.stub()
        };

        // Create a mock for ExtensionManager.getInstance
        sandbox.stub(ExtensionManager, 'getInstance').returns(mockExtensionManager);

        // Mock VS Code API
        mockQuickPick = sandbox.stub();
        mockInfoMessage = sandbox.stub();
        mockExecuteCommand = sandbox.stub().resolves();

        mockWindow = {
            showQuickPick: mockQuickPick,
            showInformationMessage: mockInfoMessage
        };

        mockCommands = {
            registerCommand: sandbox.stub().returns({ dispose: sandbox.stub() }),
            executeCommand: mockExecuteCommand
        };

        // Replace vscode namespaces with mocks
        sandbox.stub(vscode, 'window').value(mockWindow);
        sandbox.stub(vscode, 'commands').value(mockCommands);

        // Mock the extension context
        mockContext = {
            subscriptions: []
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerExtensionCommands', () => {
        it('should register the extension commands', () => {
            registerExtensionCommands(mockContext);

            // Verify commands are registered
            expect(mockCommands.registerCommand.callCount).toBe(2);
            expect(mockCommands.registerCommand.args[0][0]).toBe('copilot-ppa.listExtensions');
            expect(mockCommands.registerCommand.args[1][0]).toBe('copilot-ppa.clearExtensionPermissions');

            // Verify context subscriptions are updated
            expect(mockContext.subscriptions.length).toBe(2);
        });
    });

    describe('listExtensions command', () => {
        beforeEach(() => {
            registerExtensionCommands(mockContext);
        });

        it('should list extensions and allow selection', async () => {
            // Get the command callback
            const listExtensionsCallback = mockCommands.registerCommand.args[0][1];

            // Simulate extension selection
            mockQuickPick.onFirstCall().resolves({
                label: 'Extension 1',
                description: 'ext1',
                extension: { id: 'ext1', packageJSON: { displayName: 'Extension 1' } }
            });

            // Simulate action selection
            mockQuickPick.onSecondCall().resolves({
                label: 'Toggle Enable/Disable',
                action: 'toggle'
            });

            // Execute the command
            await listExtensionsCallback();

            // Verify the extension manager was called to list extensions
            expect(mockExtensionManager.listExtensions).toHaveBeenCalled();

            // Verify the quick pick shows the extensions
            expect(mockQuickPick.firstCall.args[0]).toEqual([
                {
                    label: 'Extension 1',
                    description: 'ext1',
                    extension: { id: 'ext1', packageJSON: { displayName: 'Extension 1' } }
                },
                {
                    label: 'Extension 2',
                    description: 'ext2',
                    extension: { id: 'ext2', packageJSON: { displayName: 'Extension 2' } }
                }
            ]);

            // Verify the toggle action was executed
            expect(mockExtensionManager.toggleExtension).toHaveBeenCalledWith('ext1');
        });

        it('should handle the access action', async () => {
            // Get the command callback
            const listExtensionsCallback = mockCommands.registerCommand.args[0][1];

            // Simulate extension selection
            mockQuickPick.onFirstCall().resolves({
                label: 'Extension 1',
                description: 'ext1',
                extension: { id: 'ext1', packageJSON: { displayName: 'Extension 1' } }
            });

            // Simulate action selection
            mockQuickPick.onSecondCall().resolves({
                label: 'Request Access',
                action: 'access'
            });

            // Execute the command
            await listExtensionsCallback();

            // Verify the getExtension method was called
            expect(mockExtensionManager.getExtension).toHaveBeenCalledWith('ext1');
        });

        it('should handle the details action', async () => {
            // Get the command callback
            const listExtensionsCallback = mockCommands.registerCommand.args[0][1];

            // Simulate extension selection
            mockQuickPick.onFirstCall().resolves({
                label: 'Extension 1',
                description: 'ext1',
                extension: { id: 'ext1', packageJSON: { displayName: 'Extension 1' } }
            });

            // Simulate action selection
            mockQuickPick.onSecondCall().resolves({
                label: 'View Details',
                action: 'details'
            });

            // Execute the command
            await listExtensionsCallback();

            // Verify the VS Code command was executed
            expect(mockExecuteCommand).toHaveBeenCalledWith('workbench.extensions.action.showExtensionsWithIds', ['ext1']);
        });

        it('should do nothing if no extension is selected', async () => {
            // Get the command callback
            const listExtensionsCallback = mockCommands.registerCommand.args[0][1];

            // Simulate no extension selection
            mockQuickPick.onFirstCall().resolves(undefined);

            // Execute the command
            await listExtensionsCallback();

            // Verify no actions were executed
            expect(mockExtensionManager.toggleExtension).not.toHaveBeenCalled();
            expect(mockExtensionManager.getExtension).not.toHaveBeenCalled();
            expect(mockExecuteCommand).not.toHaveBeenCalled();
        });

        it('should do nothing if no action is selected', async () => {
            // Get the command callback
            const listExtensionsCallback = mockCommands.registerCommand.args[0][1];

            // Simulate extension selection
            mockQuickPick.onFirstCall().resolves({
                label: 'Extension 1',
                description: 'ext1',
                extension: { id: 'ext1', packageJSON: { displayName: 'Extension 1' } }
            });

            // Simulate no action selection
            mockQuickPick.onSecondCall().resolves(undefined);

            // Execute the command
            await listExtensionsCallback();

            // Verify no actions were executed
            expect(mockExtensionManager.toggleExtension).not.toHaveBeenCalled();
            expect(mockExtensionManager.getExtension).not.toHaveBeenCalled();
            expect(mockExecuteCommand).not.toHaveBeenCalled();
        });
    });

    describe('clearExtensionPermissions command', () => {
        beforeEach(() => {
            registerExtensionCommands(mockContext);
        });

        it('should clear permissions and show a message', async () => {
            // Get the command callback
            const clearPermissionsCallback = mockCommands.registerCommand.args[1][1];

            // Execute the command
            await clearPermissionsCallback();

            // Verify permissions were cleared
            expect(mockExtensionManager.clearPermissions).toHaveBeenCalled();

            // Verify information message was shown
            expect(mockInfoMessage).toHaveBeenCalledWith('Extension permissions have been cleared');
        });
    });
});
