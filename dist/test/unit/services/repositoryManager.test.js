"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const sinon = __importStar(require("sinon"));
const vscode = __importStar(require("vscode"));
const repositoryManager_1 = require("../../../services/repositoryManager");
const childProcess = __importStar(require("child_process"));
suite('RepositoryManager Tests', () => {
    let repositoryManager;
    let sandbox;
    let configurationStub;
    let execStub;
    let statusBarCreateStub;
    let showInformationMessageStub;
    let showErrorMessageStub;
    let workspaceFoldersStub;
    let showInputBoxStub;
    let fsStatStub;
    let fsWriteFileStub;
    setup(() => {
        sandbox = sinon.createSandbox();
        // Reset the singleton instance
        repositoryManager_1.RepositoryManager.instance = undefined;
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
        repositoryManager = repositoryManager_1.RepositoryManager.getInstance();
    });
    teardown(() => {
        sandbox.restore();
    });
    test('getInstance should return singleton instance', () => {
        const instance1 = repositoryManager_1.RepositoryManager.getInstance();
        const instance2 = repositoryManager_1.RepositoryManager.getInstance();
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
        repositoryManager._statusBarItem = statusBarItem;
        repositoryManager.dispose();
        assert.strictEqual(disposeStub.calledOnce, true);
    });
    test('createNewRepository should throw error if repository access is disabled', async () => {
        await assert.rejects(() => repositoryManager.createNewRepository(), /Repository access is disabled/);
    });
    test('createNewRepository should throw error if no workspace folder is open', async () => {
        // Enable repository access
        repositoryManager._isEnabled = true;
        // Remove workspace folders
        workspaceFoldersStub.value(undefined);
        await assert.rejects(() => repositoryManager.createNewRepository(), /No workspace folder open/);
    });
    test('createNewRepository should initialize repository when all inputs are valid', async () => {
        // Enable repository access
        repositoryManager._isEnabled = true;
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
        repositoryManager._isEnabled = true;
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
        repositoryManager._isEnabled = true;
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
        repositoryManager._statusBarItem = statusBarItem;
        // Test when disabled
        repositoryManager._isEnabled = false;
        repositoryManager.updateStatusBar();
        assert.strictEqual(statusBarItem.text, '$(git-branch) Repository: Disabled');
        assert.strictEqual(statusBarItem.tooltip, 'Click to toggle repository access');
        assert.strictEqual(statusBarItem.command, 'copilot-ppa.toggleRepositoryAccess');
        // Test when enabled
        repositoryManager._isEnabled = true;
        repositoryManager.updateStatusBar();
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
//# sourceMappingURL=repositoryManager.test.js.map