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
var TrustManager_1 = require("../../services/TrustManager");
suite('TrustManager Tests', function () {
    var trustManager;
    var workspaceStub;
    var windowStub;
    var workspaceTrustStub;
    var sandbox;
    setup(function () {
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
    teardown(function () {
        sandbox.restore();
        // Clean up our mock
        delete vscode.workspace.requestWorkspaceTrust;
    });
    test('getInstance should return singleton instance', function () {
        var instance1 = TrustManager_1.TrustManager.getInstance();
        var instance2 = TrustManager_1.TrustManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });
    test('isTrusted should return true if workspace is trusted', function () {
        workspaceStub.value(true);
        var result = trustManager.isTrusted();
        assert.strictEqual(result, true);
    });
    test('isTrusted should return false if workspace is not trusted', function () {
        workspaceStub.value(false);
        var result = trustManager.isTrusted();
        assert.strictEqual(result, false);
    });
    test('requireTrust should return true immediately if workspace is trusted', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workspaceStub.value(true);
                        return [4 /*yield*/, trustManager.requireTrust('test.txt')];
                    case 1:
                        result = _a.sent();
                        assert.strictEqual(result, true);
                        assert.strictEqual(windowStub.called, false);
                        assert.strictEqual(workspaceTrustStub.called, false);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('requireTrust should show warning and request trust if workspace is not trusted', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workspaceStub.value(false);
                        // Simulate user accepting trust request - Updated to match implementation in TrustManager.ts
                        windowStub.resolves('Trust Workspace');
                        workspaceTrustStub.resolves(true);
                        return [4 /*yield*/, trustManager.requireTrust('test.txt')];
                    case 1:
                        result = _a.sent();
                        assert.strictEqual(result, true);
                        assert.strictEqual(windowStub.calledOnce, true);
                        assert.strictEqual(workspaceTrustStub.calledOnce, true);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('requireTrust should return false if user cancels trust request', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workspaceStub.value(false);
                        // Simulate user canceling trust request from the warning message
                        windowStub.resolves('Cancel');
                        return [4 /*yield*/, trustManager.requireTrust('test.txt')];
                    case 1:
                        result = _a.sent();
                        assert.strictEqual(result, false);
                        assert.strictEqual(windowStub.calledOnce, true);
                        assert.strictEqual(workspaceTrustStub.called, false);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('requireTrust should return false if workspace trust request is denied', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workspaceStub.value(false);
                        // Simulate user accepting trust request from warning but denying in the trust dialog - Updated label
                        windowStub.resolves('Trust Workspace');
                        workspaceTrustStub.resolves(false);
                        return [4 /*yield*/, trustManager.requireTrust('test.txt')];
                    case 1:
                        result = _a.sent();
                        assert.strictEqual(result, false);
                        assert.strictEqual(windowStub.calledOnce, true);
                        assert.strictEqual(workspaceTrustStub.calledOnce, true);
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=TrustManager.test.js.map