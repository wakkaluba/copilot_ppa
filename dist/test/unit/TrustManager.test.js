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
const TrustManager_1 = require("../../services/TrustManager");
suite('TrustManager Tests', () => {
    let trustManager;
    let workspaceStub;
    let windowStub;
    let workspaceTrustStub;
    let sandbox;
    setup(() => {
        sandbox = sinon.createSandbox();
        // Reset the singleton instance to ensure tests are isolated
        TrustManager_1.TrustManager.instance = undefined;
        // Stub vscode.workspace.isTrusted
        workspaceStub = sandbox.stub(vscode.workspace, 'isTrusted');
        workspaceStub.value(true);
        // Stub vscode.window.showWarningMessage
        windowStub = sandbox.stub(vscode.window, 'showWarningMessage');
        // Stub vscode.workspace.requestWorkspaceTrust
        workspaceTrustStub = sandbox.stub();
        // Create a mock function for requestWorkspaceTrust since it may not exist in all VS Code versions
        vscode.workspace.requestWorkspaceTrust = workspaceTrustStub;
        // Create a fresh instance of TrustManager
        trustManager = TrustManager_1.TrustManager.getInstance();
    });
    teardown(() => {
        sandbox.restore();
        // Clean up our mock
        delete vscode.workspace.requestWorkspaceTrust;
    });
    test('getInstance should return singleton instance', () => {
        const instance1 = TrustManager_1.TrustManager.getInstance();
        const instance2 = TrustManager_1.TrustManager.getInstance();
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
//# sourceMappingURL=TrustManager.test.js.map