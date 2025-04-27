"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var vscode = require("vscode");
var ApprovalManager_1 = require("../../services/ApprovalManager");
var WorkspaceManager_1 = require("../../services/WorkspaceManager");
var TrustManager_1 = require("../../services/TrustManager");
describe('ApprovalManager Tests', function () {
    var approvalManager;
    var workspaceManagerStub;
    var trustManagerStub;
    var windowStub;
    var commandsStub;
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
        // Create stubs for dependencies
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager_1.WorkspaceManager);
        trustManagerStub = sandbox.createStubInstance(TrustManager_1.TrustManager);
        // Replace the getInstance methods
        sandbox.stub(WorkspaceManager_1.WorkspaceManager, 'getInstance').returns(workspaceManagerStub);
        sandbox.stub(TrustManager_1.TrustManager, 'getInstance').returns(trustManagerStub);
        // Stub vscode.window and vscode.commands
        windowStub = sandbox.stub(vscode.window, 'showInformationMessage');
        var warningStub = sandbox.stub(vscode.window, 'showWarningMessage');
        commandsStub = sandbox.stub(vscode.commands, 'executeCommand');
        // Create a fresh instance of ApprovalManager for each test
        // Reset singleton instance first
        ApprovalManager_1.ApprovalManager.instance = undefined;
        approvalManager = ApprovalManager_1.ApprovalManager.getInstance();
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('getInstance should return singleton instance', function () {
        var instance1 = ApprovalManager_1.ApprovalManager.getInstance();
        var instance2 = ApprovalManager_1.ApprovalManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });
    it('requestApproval should return false if trust check fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var changes, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Set up trust manager to reject trust
                    trustManagerStub.requireTrust.resolves(false);
                    changes = [
                        {
                            filePath: 'test.txt',
                            originalContent: '',
                            newContent: 'New content',
                            type: 'create'
                        }
                    ];
                    return [4 /*yield*/, approvalManager.requestApproval(changes)];
                case 1:
                    result = _a.sent();
                    assert.strictEqual(result, false);
                    assert.strictEqual(trustManagerStub.requireTrust.calledOnce, true);
                    assert.strictEqual(trustManagerStub.requireTrust.firstCall.args[0], 'test.txt');
                    return [2 /*return*/];
            }
        });
    }); });
    it('requestApproval should show preview and confirmation dialog', function () { return __awaiter(void 0, void 0, void 0, function () {
        var changes, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Set up trust manager to approve trust
                    trustManagerStub.requireTrust.resolves(true);
                    // Set up window to approve preview but skip actually showing it
                    windowStub.resolves('Skip');
                    // Set up confirmation dialog to approve changes
                    vscode.window.showWarningMessage.resolves('Apply Changes');
                    changes = [
                        {
                            filePath: 'test.txt',
                            originalContent: '',
                            newContent: 'New content',
                            type: 'create'
                        }
                    ];
                    return [4 /*yield*/, approvalManager.requestApproval(changes)];
                case 1:
                    result = _a.sent();
                    assert.strictEqual(result, true);
                    assert.strictEqual(trustManagerStub.requireTrust.calledOnce, true);
                    assert.strictEqual((windowStub).calledOnce, true);
                    assert.strictEqual(vscode.window.showWarningMessage.calledOnce, true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('requestApproval should cancel if user cancels preview', function () { return __awaiter(void 0, void 0, void 0, function () {
        var changes, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Set up trust manager to approve trust
                    trustManagerStub.requireTrust.resolves(true);
                    // Set up window to cancel preview
                    windowStub.resolves('Cancel');
                    changes = [
                        {
                            filePath: 'test.txt',
                            originalContent: '',
                            newContent: 'New content',
                            type: 'create'
                        }
                    ];
                    return [4 /*yield*/, approvalManager.requestApproval(changes)];
                case 1:
                    result = _a.sent();
                    assert.strictEqual(result, false);
                    assert.strictEqual(trustManagerStub.requireTrust.calledOnce, true);
                    assert.strictEqual((windowStub).calledOnce, true);
                    assert.strictEqual(vscode.window.showWarningMessage.called, false);
                    return [2 /*return*/];
            }
        });
    }); });
    it('requestApproval should show diff if user requests preview', function () { return __awaiter(void 0, void 0, void 0, function () {
        var changes, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Set up trust manager to approve trust
                    trustManagerStub.requireTrust.resolves(true);
                    // Set up window to show preview
                    windowStub.onFirstCall().resolves('Show Preview');
                    // Set up confirmation dialog to approve changes
                    vscode.window.showWarningMessage.resolves('Apply Changes');
                    changes = [
                        {
                            filePath: 'test.txt',
                            originalContent: '',
                            newContent: 'New content',
                            type: 'create'
                        }
                    ];
                    return [4 /*yield*/, approvalManager.requestApproval(changes)];
                case 1:
                    result = _a.sent();
                    assert.strictEqual(result, true);
                    assert.strictEqual(commandsStub.calledOnce, true);
                    assert.strictEqual(commandsStub.firstCall.args[0], 'vscode.diff');
                    return [2 /*return*/];
            }
        });
    }); });
    it('requestApproval should handle multiple changes', function () { return __awaiter(void 0, void 0, void 0, function () {
        var changes, result, confirmCall, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Set up trust manager to approve trust
                    trustManagerStub.requireTrust.resolves(true);
                    // Set up window to skip preview
                    windowStub.resolves('Skip');
                    // Set up confirmation dialog to approve changes
                    vscode.window.showWarningMessage.resolves('Apply Changes');
                    changes = [
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
                    return [4 /*yield*/, approvalManager.requestApproval(changes)];
                case 1:
                    result = _a.sent();
                    assert.strictEqual(result, true);
                    assert.strictEqual(trustManagerStub.requireTrust.callCount, 3);
                    assert.strictEqual((windowStub).callCount, 3);
                    assert.strictEqual(vscode.window.showWarningMessage.calledOnce, true);
                    confirmCall = vscode.window.showWarningMessage.firstCall;
                    message = confirmCall.args[0];
                    assert.ok(message.includes('1 files to create'));
                    assert.ok(message.includes('1 files to modify'));
                    assert.ok(message.includes('1 files to delete'));
                    return [2 /*return*/];
            }
        });
    }); });
    it('requestApproval should return false if user cancels confirmation', function () { return __awaiter(void 0, void 0, void 0, function () {
        var changes, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Set up trust manager to approve trust
                    trustManagerStub.requireTrust.resolves(true);
                    // Set up window to skip preview
                    windowStub.resolves('Skip');
                    // Set up confirmation dialog to cancel changes
                    vscode.window.showWarningMessage.resolves('Cancel');
                    changes = [
                        {
                            filePath: 'test.txt',
                            originalContent: '',
                            newContent: 'New content',
                            type: 'create'
                        }
                    ];
                    return [4 /*yield*/, approvalManager.requestApproval(changes)];
                case 1:
                    result = _a.sent();
                    assert.strictEqual(result, false);
                    assert.strictEqual(vscode.window.showWarningMessage.calledOnce, true);
                    return [2 /*return*/];
            }
        });
    }); });
});
