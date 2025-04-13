import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { TrustManager } from '../../services/TrustManager';

suite('TrustManager Tests', () => {
    let trustManager: TrustManager;
    let workspaceStub: sinon.SinonStub;
    let windowStub: sinon.SinonStub;
    let workspaceTrustStub: sinon.SinonStub;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Reset the singleton instance to ensure tests are isolated
        (TrustManager as any).instance = undefined;
        
        // Stub vscode.workspace.isTrusted
        workspaceStub = sandbox.stub(vscode.workspace, 'isTrusted');
        workspaceStub.value(true);
        
        // Stub vscode.window.showWarningMessage
        windowStub = sandbox.stub(vscode.window, 'showWarningMessage');
        
        // Stub vscode.workspace.requestWorkspaceTrust
        workspaceTrustStub = sandbox.stub();
        // Create a mock function for requestWorkspaceTrust since it may not exist in all VS Code versions
        (vscode.workspace as any).requestWorkspaceTrust = workspaceTrustStub;
        
        // Create a fresh instance of TrustManager
        trustManager = TrustManager.getInstance();
    });

    teardown(() => {
        sandbox.restore();
        // Clean up our mock
        delete (vscode.workspace as any).requestWorkspaceTrust;
    });

    test('getInstance should return singleton instance', () => {
        const instance1 = TrustManager.getInstance();
        const instance2 = TrustManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    test('isTrusted should return true if workspace is trusted', () => {
        workspaceStub.value(true);
        
        const result = trustManager.isTrusted();
        
        assert.strictEqual(result, true);
    });

    test('isTrusted should return false if workspace is not trusted', () => {
        workspaceStub.value(false);
        
        const result = trustManager.isTrusted();
        
        assert.strictEqual(result, false);
    });

    test('requireTrust should return true immediately if workspace is trusted', async () => {
        workspaceStub.value(true);
        
        const result = await trustManager.requireTrust('test.txt');
        
        assert.strictEqual(result, true);
        assert.strictEqual(windowStub.called, false);
        assert.strictEqual(workspaceTrustStub.called, false);
    });

    test('requireTrust should show warning and request trust if workspace is not trusted', async () => {
        workspaceStub.value(false);
        
        // Simulate user accepting trust request - Updated to match implementation in TrustManager.ts
        windowStub.resolves('Trust Workspace');
        workspaceTrustStub.resolves(true);
        
        const result = await trustManager.requireTrust('test.txt');
        
        assert.strictEqual(result, true);
        assert.strictEqual(windowStub.calledOnce, true);
        assert.strictEqual(workspaceTrustStub.calledOnce, true);
    });

    test('requireTrust should return false if user cancels trust request', async () => {
        workspaceStub.value(false);
        
        // Simulate user canceling trust request from the warning message
        windowStub.resolves('Cancel');
        
        const result = await trustManager.requireTrust('test.txt');
        
        assert.strictEqual(result, false);
        assert.strictEqual(windowStub.calledOnce, true);
        assert.strictEqual(workspaceTrustStub.called, false);
    });

    test('requireTrust should return false if workspace trust request is denied', async () => {
        workspaceStub.value(false);
        
        // Simulate user accepting trust request from warning but denying in the trust dialog - Updated label
        windowStub.resolves('Trust Workspace');
        workspaceTrustStub.resolves(false);
        
        const result = await trustManager.requireTrust('test.txt');
        
        assert.strictEqual(result, false);
        assert.strictEqual(windowStub.calledOnce, true);
        assert.strictEqual(workspaceTrustStub.calledOnce, true);
    });
});