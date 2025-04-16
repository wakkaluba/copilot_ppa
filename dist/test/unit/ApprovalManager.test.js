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
const ApprovalManager_1 = require("../../services/ApprovalManager");
const WorkspaceManager_1 = require("../../services/WorkspaceManager");
const TrustManager_1 = require("../../services/TrustManager");
suite('ApprovalManager Tests', () => {
    let approvalManager;
    let workspaceManagerStub;
    let trustManagerStub;
    let windowStub;
    let commandsStub;
    let sandbox;
    setup(() => {
        sandbox = sinon.createSandbox();
        // Create stubs for dependencies
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager_1.WorkspaceManager);
        trustManagerStub = sandbox.createStubInstance(TrustManager_1.TrustManager);
        // Replace the getInstance methods
        sandbox.stub(WorkspaceManager_1.WorkspaceManager, 'getInstance').returns(workspaceManagerStub);
        sandbox.stub(TrustManager_1.TrustManager, 'getInstance').returns(trustManagerStub);
        // Stub vscode.window and vscode.commands
        windowStub = sandbox.stub(vscode.window, 'showInformationMessage');
        const warningStub = sandbox.stub(vscode.window, 'showWarningMessage');
        commandsStub = sandbox.stub(vscode.commands, 'executeCommand');
        // Create a fresh instance of ApprovalManager for each test
        // Reset singleton instance first
        ApprovalManager_1.ApprovalManager.instance = undefined;
        approvalManager = ApprovalManager_1.ApprovalManager.getInstance();
    });
    teardown(() => {
        sandbox.restore();
    });
    test('getInstance should return singleton instance', () => {
        const instance1 = ApprovalManager_1.ApprovalManager.getInstance();
        const instance2 = ApprovalManager_1.ApprovalManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });
    test('requestApproval should return false if trust check fails', async () => {
        // Set up trust manager to reject trust
        trustManagerStub.requireTrust.resolves(false);
        const changes = [
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
        vscode.window.showWarningMessage.resolves('Apply Changes');
        const changes = [
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
        assert.strictEqual(windowStub.calledOnce, true);
        assert.strictEqual(vscode.window.showWarningMessage.calledOnce, true);
    });
    test('requestApproval should cancel if user cancels preview', async () => {
        // Set up trust manager to approve trust
        trustManagerStub.requireTrust.resolves(true);
        // Set up window to cancel preview
        windowStub.resolves('Cancel');
        const changes = [
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
        assert.strictEqual(windowStub.calledOnce, true);
        assert.strictEqual(vscode.window.showWarningMessage.called, false);
    });
    test('requestApproval should show diff if user requests preview', async () => {
        // Set up trust manager to approve trust
        trustManagerStub.requireTrust.resolves(true);
        // Set up window to show preview
        windowStub.onFirstCall().resolves('Show Preview');
        // Set up confirmation dialog to approve changes
        vscode.window.showWarningMessage.resolves('Apply Changes');
        const changes = [
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
        vscode.window.showWarningMessage.resolves('Apply Changes');
        const changes = [
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
        assert.strictEqual(windowStub.callCount, 3);
        assert.strictEqual(vscode.window.showWarningMessage.calledOnce, true);
        // Verify the confirmation message contains the correct summary
        const confirmCall = vscode.window.showWarningMessage.firstCall;
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
        vscode.window.showWarningMessage.resolves('Cancel');
        const changes = [
            {
                filePath: 'test.txt',
                originalContent: '',
                newContent: 'New content',
                type: 'create'
            }
        ];
        const result = await approvalManager.requestApproval(changes);
        assert.strictEqual(result, false);
        assert.strictEqual(vscode.window.showWarningMessage.calledOnce, true);
    });
});
//# sourceMappingURL=ApprovalManager.test.js.map