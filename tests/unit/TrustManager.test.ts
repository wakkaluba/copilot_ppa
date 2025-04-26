import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { TrustManager } from '../../src/services/TrustManager';

suite('TrustManager Tests', () => {
    let trustManager: TrustManager;
    let sandbox: sinon.SinonSandbox;
    let workspaceStub: sinon.SinonStub<[], boolean | undefined>;
    let workspaceTrustStub: sinon.SinonStub<[], Thenable<boolean | undefined>>;

    setup(() => {
        sandbox = sinon.createSandbox();

        // Create stubs for VS Code workspace trust APIs
        workspaceStub = sandbox.stub(vscode.workspace, 'isTrusted');
        workspaceTrustStub = sandbox.stub<[], Thenable<boolean | undefined>>();

        // Mock workspace requestWorkspaceTrust API
        (vscode.workspace as any).requestWorkspaceTrust = workspaceTrustStub;

        // Reset singleton instance
        (TrustManager as any).instance = undefined;

        // Create a fresh instance
        trustManager = TrustManager.getInstance();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('getInstance should return a singleton instance', () => {
        const instance1 = TrustManager.getInstance();
        const instance2 = TrustManager.getInstance();
        assert.strictEqual(instance1, instance2, 'getInstance should return the same instance');
    });

    test('isWorkspaceTrusted should return true when workspace is trusted', () => {
        workspaceStub.returns(true);
        assert.ok(trustManager.isWorkspaceTrusted(), 'Should return true for trusted workspace');
    });

    test('isWorkspaceTrusted should return false when workspace is not trusted', () => {
        workspaceStub.returns(false);
        assert.ok(!trustManager.isWorkspaceTrusted(), 'Should return false for untrusted workspace');
    });

     test('isWorkspaceTrusted should return false when workspace trust is undefined', () => {
        workspaceStub.returns(undefined);
        assert.ok(!trustManager.isWorkspaceTrusted(), 'Should return false when trust is undefined');
    });

    test('requestWorkspaceTrust should call vscode.workspace.requestWorkspaceTrust', async () => {
        workspaceTrustStub.resolves(true); // Mock the promise resolution
        try {
            await trustManager.requestWorkspaceTrust();
            assert.ok(workspaceTrustStub.calledOnce, 'requestWorkspaceTrust should be called');
        } catch (error) {
            assert.fail(`Test failed with error: ${error}`);
        }
    });

     test('requestWorkspaceTrust should return the result from vscode.workspace.requestWorkspaceTrust', async () => {
        workspaceTrustStub.resolves(true);
        try {
            const result = await trustManager.requestWorkspaceTrust();
            assert.strictEqual(result, true, 'Should return true when trust is granted');
        } catch (error) {
            assert.fail(`Test failed with error: ${error}`);
        }

        workspaceTrustStub.resolves(false);
         try {
            const resultFalse = await trustManager.requestWorkspaceTrust();
            assert.strictEqual(resultFalse, false, 'Should return false when trust is denied');
        } catch (error) {
            assert.fail(`Test failed with error: ${error}`);
        }

        workspaceTrustStub.resolves(undefined);
         try {
            const resultUndefined = await trustManager.requestWorkspaceTrust();
            assert.strictEqual(resultUndefined, undefined, 'Should return undefined when trust decision is pending');
        } catch (error) {
            assert.fail(`Test failed with error: ${error}`);
        }
    });

     test('requestWorkspaceTrust should handle rejection', async () => {
        const testError = new Error('Test Error');
        workspaceTrustStub.rejects(testError); // Mock the promise rejection
        try {
            await trustManager.requestWorkspaceTrust();
            assert.fail('Should have thrown an error');
        } catch (error) {
             assert.strictEqual(error, testError, 'Should rethrow the error from the API');
        }
    });
});