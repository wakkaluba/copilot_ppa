import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ApprovalManager, ChangePreview } from '../../services/ApprovalManager';
import { WorkspaceManager } from '../../services/WorkspaceManager';
import { TrustManager } from '../../services/TrustManager';

suite('ApprovalManager Tests', () => {
    let approvalManager: ApprovalManager;
    let workspaceManagerStub: sinon.SinonStubbedInstance<WorkspaceManager>;
    let trustManagerStub: sinon.SinonStubbedInstance<TrustManager>;
    let windowStub: sinon.SinonStub;
    let commandsStub: sinon.SinonStub;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Create stubs for dependencies
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager);
        trustManagerStub = sandbox.createStubInstance(TrustManager);
        
        // Replace the getInstance methods
        sandbox.stub(WorkspaceManager, 'getInstance').returns(workspaceManagerStub as unknown as WorkspaceManager);
        sandbox.stub(TrustManager, 'getInstance').returns(trustManagerStub as unknown as TrustManager);
        
        // Stub vscode.window and vscode.commands
        windowStub = sandbox.stub(vscode.window, 'showInformationMessage');
        const warningStub = sandbox.stub(vscode.window, 'showWarningMessage');
        commandsStub = sandbox.stub(vscode.commands, 'executeCommand');
        
        // Create a fresh instance of ApprovalManager for each test
        // Reset singleton instance first
        (ApprovalManager as any).instance = undefined;
        approvalManager = ApprovalManager.getInstance();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('getInstance should return singleton instance', () => {
        const instance1 = ApprovalManager.getInstance();
        const instance2 = ApprovalManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    test('requestApproval should return false if trust check fails', async () => {
        // Set up trust manager to reject trust
        trustManagerStub.requireTrust.resolves(false);
        
        const changes: ChangePreview[] = [
            {
                filePath: 'test.txt',
                originalContent: '',
                newContent: 'New content',
                type: 'create'
            }
        ];
        
        const result = await approvalManager.requestApproval(changes);
        
        assert.strictEqual(result, false);
        assert.strictEqual(trustManagerStub.requireTrust.calledOnce, true);
        assert.strictEqual(trustManagerStub.requireTrust.firstCall.args[0], 'test.txt');
    });

    test('requestApproval should show preview and confirmation dialog', async () => {
        // Set up trust manager to approve trust
        trustManagerStub.requireTrust.resolves(true);
        
        // Set up window to approve preview but skip actually showing it
        windowStub.resolves('Skip');
        
        // Set up confirmation dialog to approve changes
        (vscode.window.showWarningMessage as sinon.SinonStub).resolves('Apply Changes');
        
        const changes: ChangePreview[] = [
            {
                filePath: 'test.txt',
                originalContent: '',
                newContent: 'New content',
                type: 'create'
            }
        ];
        
        const result = await approvalManager.requestApproval(changes);
        
        assert.strictEqual(result, true);
        assert.strictEqual(trustManagerStub.requireTrust.calledOnce, true);
        assert.strictEqual((windowStub as sinon.SinonStub).calledOnce, true);
        assert.strictEqual((vscode.window.showWarningMessage as sinon.SinonStub).calledOnce, true);
    });

    test('requestApproval should cancel if user cancels preview', async () => {
        // Set up trust manager to approve trust
        trustManagerStub.requireTrust.resolves(true);
        
        // Set up window to cancel preview
        windowStub.resolves('Cancel');
        
        const changes: ChangePreview[] = [
            {
                filePath: 'test.txt',
                originalContent: '',
                newContent: 'New content',
                type: 'create'
            }
        ];
        
        const result = await approvalManager.requestApproval(changes);
        
        assert.strictEqual(result, false);
        assert.strictEqual(trustManagerStub.requireTrust.calledOnce, true);
        assert.strictEqual((windowStub as sinon.SinonStub).calledOnce, true);
        assert.strictEqual((vscode.window.showWarningMessage as sinon.SinonStub).called, false);
    });

    test('requestApproval should show diff if user requests preview', async () => {
        // Set up trust manager to approve trust
        trustManagerStub.requireTrust.resolves(true);
        
        // Set up window to show preview
        windowStub.onFirstCall().resolves('Show Preview');
        
        // Set up confirmation dialog to approve changes
        (vscode.window.showWarningMessage as sinon.SinonStub).resolves('Apply Changes');
        
        const changes: ChangePreview[] = [
            {
                filePath: 'test.txt',
                originalContent: '',
                newContent: 'New content',
                type: 'create'
            }
        ];
        
        const result = await approvalManager.requestApproval(changes);
        
        assert.strictEqual(result, true);
        assert.strictEqual(commandsStub.calledOnce, true);
        assert.strictEqual(commandsStub.firstCall.args[0], 'vscode.diff');
    });

    test('requestApproval should handle multiple changes', async () => {
        // Set up trust manager to approve trust
        trustManagerStub.requireTrust.resolves(true);
        
        // Set up window to skip preview
        windowStub.resolves('Skip');
        
        // Set up confirmation dialog to approve changes
        (vscode.window.showWarningMessage as sinon.SinonStub).resolves('Apply Changes');
        
        const changes: ChangePreview[] = [
            {
                filePath: 'test1.txt',
                originalContent: '',
                newContent: 'New content 1',
                type: 'create'
            },
            {
                filePath: 'test2.txt',
                originalContent: 'Original content',
                newContent: 'Modified content',
                type: 'modify'
            },
            {
                filePath: 'test3.txt',
                originalContent: 'Content to delete',
                newContent: '',
                type: 'delete'
            }
        ];
        
        const result = await approvalManager.requestApproval(changes);
        
        assert.strictEqual(result, true);
        assert.strictEqual(trustManagerStub.requireTrust.callCount, 3);
        assert.strictEqual((windowStub as sinon.SinonStub).callCount, 3);
        assert.strictEqual((vscode.window.showWarningMessage as sinon.SinonStub).calledOnce, true);
        
        // Verify the confirmation message contains the correct summary
        const confirmCall = (vscode.window.showWarningMessage as sinon.SinonStub).firstCall;
        const message = confirmCall.args[0];
        assert.ok(message.includes('1 files to create'));
        assert.ok(message.includes('1 files to modify'));
        assert.ok(message.includes('1 files to delete'));
    });
    
    test('requestApproval should return false if user cancels confirmation', async () => {
        // Set up trust manager to approve trust
        trustManagerStub.requireTrust.resolves(true);
        
        // Set up window to skip preview
        windowStub.resolves('Skip');
        
        // Set up confirmation dialog to cancel changes
        (vscode.window.showWarningMessage as sinon.SinonStub).resolves('Cancel');
        
        const changes: ChangePreview[] = [
            {
                filePath: 'test.txt',
                originalContent: '',
                newContent: 'New content',
                type: 'create'
            }
        ];
        
        const result = await approvalManager.requestApproval(changes);
        
        assert.strictEqual(result, false);
        assert.strictEqual((vscode.window.showWarningMessage as sinon.SinonStub).calledOnce, true);
    });
});