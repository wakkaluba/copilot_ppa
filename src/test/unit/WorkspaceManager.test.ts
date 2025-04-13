import * as assert from 'assert';
import * as vscode from 'vscode';
import { WorkspaceManager } from '../../services/WorkspaceManager';
import * as sinon from 'sinon';

suite('WorkspaceManager Tests', () => {
    let workspaceManager: WorkspaceManager;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        workspaceManager = WorkspaceManager.getInstance();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('getInstance should return singleton instance', () => {
        const instance1 = WorkspaceManager.getInstance();
        const instance2 = WorkspaceManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    test('readFile should read file content', async () => {
        const mockContent = 'test content';
        const mockReadFile = sandbox.stub(vscode.workspace.fs, 'readFile')
            .resolves(Buffer.from(mockContent));

        const content = await workspaceManager.readFile('test.txt');
        assert.strictEqual(content, mockContent);
        assert(mockReadFile.calledOnce);
    });

    test('writeFile should write content to file', async () => {
        const mockWriteFile = sandbox.stub(vscode.workspace.fs, 'writeFile')
            .resolves();

        await workspaceManager.writeFile('test.txt', 'content');
        assert(mockWriteFile.calledOnce);
    });

    test('deleteFile should delete file', async () => {
        const mockDelete = sandbox.stub(vscode.workspace.fs, 'delete')
            .resolves();

        await workspaceManager.deleteFile('test.txt');
        assert(mockDelete.calledOnce);
    });
});
