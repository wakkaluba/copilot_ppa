"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var vscode = require("vscode");
var repositoryManager_1 = require("../../../services/repositoryManager");
var childProcess = require("child_process");
suite('RepositoryManager Tests', function () {
    var repositoryManager;
    var sandbox;
    var configurationStub;
    var execStub;
    var statusBarCreateStub;
    var showInformationMessageStub;
    var showErrorMessageStub;
    var workspaceFoldersStub;
    var showInputBoxStub;
    var fsStatStub;
    var fsWriteFileStub;
    setup(function () {
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
    teardown(function () {
        sandbox.restore();
    });
    test('getInstance should return singleton instance', function () {
        var instance1 = repositoryManager_1.RepositoryManager.getInstance();
        var instance2 = repositoryManager_1.RepositoryManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });
    test('isEnabled should return initial state from configuration', function () {
        assert.strictEqual(repositoryManager.isEnabled(), false);
    });
    test('toggleAccess should toggle repository access', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var updateStub;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateStub = sandbox.stub().resolves();
                        configurationStub.returns({
                            get: sandbox.stub().returns(false),
                            update: updateStub
                        });
                        return [4 /*yield*/, repositoryManager.toggleAccess()];
                    case 1:
                        _a.sent();
                        assert.strictEqual(updateStub.calledOnce, true);
                        assert.strictEqual(showInformationMessageStub.calledOnce, true);
                        assert.strictEqual(repositoryManager.isEnabled(), true);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('dispose should clean up resources', function () {
        var disposeStub = sandbox.stub();
        var statusBarItem = {
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
    test('createNewRepository should throw error if repository access is disabled', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, assert.rejects(function () { return repositoryManager.createNewRepository(); }, /Repository access is disabled/)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('createNewRepository should throw error if no workspace folder is open', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Enable repository access
                        repositoryManager._isEnabled = true;
                        // Remove workspace folders
                        workspaceFoldersStub.value(undefined);
                        return [4 /*yield*/, assert.rejects(function () { return repositoryManager.createNewRepository(); }, /No workspace folder open/)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('createNewRepository should initialize repository when all inputs are valid', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var _a, uri, content, readmeContent;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Enable repository access
                        repositoryManager._isEnabled = true;
                        // Mock user input
                        showInputBoxStub.onFirstCall().resolves('test-repo');
                        showInputBoxStub.onSecondCall().resolves('Test repository description');
                        // Mock git commands success
                        execStub.yields(null, { stdout: '', stderr: '' });
                        return [4 /*yield*/, repositoryManager.createNewRepository()];
                    case 1:
                        _b.sent();
                        // Verify git commands were called
                        assert.strictEqual(execStub.calledWith('git init'), true);
                        assert.strictEqual(execStub.calledWith('git add .'), true);
                        assert.strictEqual(execStub.calledWith('git commit -m "Initial commit"'), true);
                        // Verify README was created
                        assert.strictEqual(fsWriteFileStub.calledOnce, true);
                        _a = fsWriteFileStub.firstCall.args, uri = _a[0], content = _a[1];
                        assert.ok(uri.path.endsWith('README.md'));
                        readmeContent = Buffer.from(content).toString();
                        assert.ok(readmeContent.includes('test-repo'));
                        assert.ok(readmeContent.includes('Test repository description'));
                        // Verify success message was shown
                        assert.strictEqual(showInformationMessageStub.calledWith('Repository created successfully!'), true);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('createNewRepository should handle user cancellation', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Enable repository access
                        repositoryManager._isEnabled = true;
                        // Mock user cancelling the input
                        showInputBoxStub.resolves(undefined);
                        return [4 /*yield*/, repositoryManager.createNewRepository()];
                    case 1:
                        _a.sent();
                        // Verify no git commands were called
                        assert.strictEqual(execStub.called, false);
                        // Verify no files were created
                        assert.strictEqual(fsWriteFileStub.called, false);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('createNewRepository should handle git command failures', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Enable repository access
                        repositoryManager._isEnabled = true;
                        // Mock user input
                        showInputBoxStub.onFirstCall().resolves('test-repo');
                        showInputBoxStub.onSecondCall().resolves('Test repository description');
                        // Mock git init failure
                        execStub.yields(new Error('Git init failed'), null);
                        return [4 /*yield*/, repositoryManager.createNewRepository()];
                    case 1:
                        _a.sent();
                        // Verify error message was shown
                        assert.strictEqual(showErrorMessageStub.calledWith('Failed to create repository: Error: Git init failed'), true);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('updateStatusBar should set correct text and command', function () {
        var statusBarItem = {
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
    test('onDidChangeAccess should fire when access is toggled', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var onDidChangeAccessListener;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onDidChangeAccessListener = sandbox.stub();
                        repositoryManager.onDidChangeAccess(onDidChangeAccessListener);
                        return [4 /*yield*/, repositoryManager.toggleAccess()];
                    case 1:
                        _a.sent();
                        assert.strictEqual(onDidChangeAccessListener.calledOnce, true);
                        assert.strictEqual(onDidChangeAccessListener.firstCall.args[0], true);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('toggleAccess should update VS Code configuration', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var updateStub;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateStub = sandbox.stub().resolves();
                        configurationStub.returns({
                            get: sandbox.stub().returns(false),
                            update: updateStub
                        });
                        return [4 /*yield*/, repositoryManager.toggleAccess()];
                    case 1:
                        _a.sent();
                        assert.strictEqual(updateStub.calledOnce, true);
                        assert.strictEqual(updateStub.firstCall.args[0], 'repository.enabled');
                        assert.strictEqual(updateStub.firstCall.args[1], true);
                        assert.strictEqual(updateStub.firstCall.args[2], vscode.ConfigurationTarget.Global);
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=repositoryManager.test.js.map