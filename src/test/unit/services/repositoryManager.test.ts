import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { RepositoryManager } from '../../../services/repositoryManager';
import * as childProcess from 'child_process';
import { promisify } from 'util';

suite('RepositoryManager Tests', () => {
    let repositoryManager: RepositoryManager;
    let sandbox: sinon.SinonSandbox;
    let configurationStub: sinon.SinonStub;
    let execStub: sinon.SinonStub;
    let statusBarCreateStub: sinon.SinonStub;
    let showInformationMessageStub: sinon.SinonStub;
    let showErrorMessageStub: sinon.SinonStub;
    let workspaceFoldersStub: sinon.SinonStub;
    let showInputBoxStub: sinon.SinonStub;
    let fsStatStub: sinon.SinonStub;
    let fsWriteFileStub: sinon.SinonStub;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Reset the singleton instance
        (RepositoryManager as any).instance = undefined;
        
        // Stub VS Code configuration
        configurationStub = sandbox.stub(vscode.workspace, 'getConfiguration');
        configurationStub.returns({
            get: sandbox.stub().returns(false),
            update: sandbox.stub().resolves()
        });

        // Stub child_process.exec
        execStub = sandbox.stub(childProcess, 'exec');
        execStub.callsArgWith(2, null, { stdout: '', stderr: '' });

        // Stub VS Code APIs
        statusBarCreateStub = sandbox.stub(vscode.window, 'createStatusBarItem').returns({
            dispose: sandbox.stub(),
            show: sandbox.stub(),
            hide: sandbox.stub(),
            text: '',
            command: '',
            tooltip: ''
        });
        showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage');
        showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');
        workspaceFoldersStub = sandbox.stub(vscode.workspace, 'workspaceFolders').value([
            { uri: vscode.Uri.file('/test/workspace'), name: 'workspace', index: 0 }
        ]);
        showInputBoxStub = sandbox.stub(vscode.window, 'showInputBox');
        fsStatStub = sandbox.stub(vscode.workspace.fs, 'stat').resolves();
        fsWriteFileStub = sandbox.stub(vscode.workspace.fs, 'writeFile').resolves();

        // Create RepositoryManager instance
        repositoryManager = RepositoryManager.getInstance();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('getInstance should return singleton instance', () => {
        const instance1 = RepositoryManager.getInstance();
        const instance2 = RepositoryManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    test('isEnabled should return initial state from configuration', () => {
        assert.strictEqual(repositoryManager.isEnabled(), false);
    });

    test('toggleAccess should toggle repository access', async () => {
        const updateStub = sandbox.stub().resolves();
        configurationStub.returns({
            get: sandbox.stub().returns(false),
            update: updateStub
        });

        await repositoryManager.toggleAccess();

        assert.strictEqual(updateStub.calledOnce, true);
        assert.strictEqual(showInformationMessageStub.calledOnce, true);
        assert.strictEqual(repositoryManager.isEnabled(), true);
    });

    test('dispose should clean up resources', () => {
        const disposeStub = sandbox.stub();
        const statusBarItem = {
            dispose: disposeStub,
            show: sandbox.stub(),
            text: '',
            tooltip: '',
            command: ''
        };
        (repositoryManager as any)._statusBarItem = statusBarItem;
        
        repositoryManager.dispose();
        
        assert.strictEqual(disposeStub.calledOnce, true);
    });

    test('createNewRepository should throw error if repository access is disabled', async () => {
        await assert.rejects(
            () => repositoryManager.createNewRepository(),
            /Repository access is disabled/
        );
    });

    test('createNewRepository should throw error if no workspace folder is open', async () => {
        // Enable repository access
        (repositoryManager as any)._isEnabled = true;
        // Remove workspace folders
        workspaceFoldersStub.value(undefined);

        await assert.rejects(
            () => repositoryManager.createNewRepository(),
            /No workspace folder open/
        );
    });

    test('createNewRepository should initialize repository when all inputs are valid', async () => {
        // Enable repository access
        (repositoryManager as any)._isEnabled = true;

        // Mock user input
        showInputBoxStub.onFirstCall().resolves('test-repo');
        showInputBoxStub.onSecondCall().resolves('Test repository description');

        // Mock git commands success
        execStub.yields(null, { stdout: '', stderr: '' });

        await repositoryManager.createNewRepository();

        // Verify git commands were called
        assert.strictEqual(execStub.calledWith('git init'), true);
        assert.strictEqual(execStub.calledWith('git add .'), true);
        assert.strictEqual(execStub.calledWith('git commit -m "Initial commit"'), true);

        // Verify README was created
        assert.strictEqual(fsWriteFileStub.calledOnce, true);
        const [uri, content] = fsWriteFileStub.firstCall.args;
        assert.ok(uri.path.endsWith('README.md'));
        const readmeContent = Buffer.from(content).toString();
        assert.ok(readmeContent.includes('test-repo'));
        assert.ok(readmeContent.includes('Test repository description'));

        // Verify success message was shown
        assert.strictEqual(showInformationMessageStub.calledWith('Repository created successfully!'), true);
    });

    test('createNewRepository should handle user cancellation', async () => {
        // Enable repository access
        (repositoryManager as any)._isEnabled = true;

        // Mock user cancelling the input
        showInputBoxStub.resolves(undefined);

        await repositoryManager.createNewRepository();

        // Verify no git commands were called
        assert.strictEqual(execStub.called, false);
        // Verify no files were created
        assert.strictEqual(fsWriteFileStub.called, false);
    });

    test('createNewRepository should handle git command failures', async () => {
        // Enable repository access
        (repositoryManager as any)._isEnabled = true;

        // Mock user input
        showInputBoxStub.onFirstCall().resolves('test-repo');
        showInputBoxStub.onSecondCall().resolves('Test repository description');

        // Mock git init failure
        execStub.yields(new Error('Git init failed'), null);

        await repositoryManager.createNewRepository();

        // Verify error message was shown
        assert.strictEqual(showErrorMessageStub.calledWith('Failed to create repository: Error: Git init failed'), true);
    });

    test('updateStatusBar should set correct text and command', () => {
        const statusBarItem = {
            text: '',
            tooltip: '',
            command: '',
            show: sandbox.stub(),
            dispose: sandbox.stub()
        };
        (repositoryManager as any)._statusBarItem = statusBarItem;

        // Test when disabled
        (repositoryManager as any)._isEnabled = false;
        (repositoryManager as any).updateStatusBar();
        assert.strictEqual(statusBarItem.text, '$(git-branch) Repository: Disabled');
        assert.strictEqual(statusBarItem.tooltip, 'Click to toggle repository access');
        assert.strictEqual(statusBarItem.command, 'copilot-ppa.toggleRepositoryAccess');

        // Test when enabled
        (repositoryManager as any)._isEnabled = true;
        (repositoryManager as any).updateStatusBar();
        assert.strictEqual(statusBarItem.text, '$(git-branch) Repository: Enabled');
    });

    test('onDidChangeAccess should fire when access is toggled', async () => {
        const onDidChangeAccessListener = sandbox.stub();
        repositoryManager.onDidChangeAccess(onDidChangeAccessListener);

        await repositoryManager.toggleAccess();

        assert.strictEqual(onDidChangeAccessListener.calledOnce, true);
        assert.strictEqual(onDidChangeAccessListener.firstCall.args[0], true);
    });

    test('toggleAccess should update VS Code configuration', async () => {
        const updateStub = sandbox.stub().resolves();
        configurationStub.returns({
            get: sandbox.stub().returns(false),
            update: updateStub
        });

        await repositoryManager.toggleAccess();

        assert.strictEqual(updateStub.calledOnce, true);
        assert.strictEqual(updateStub.firstCall.args[0], 'repository.enabled');
        assert.strictEqual(updateStub.firstCall.args[1], true);
        assert.strictEqual(updateStub.firstCall.args[2], vscode.ConfigurationTarget.Global);
    });
});