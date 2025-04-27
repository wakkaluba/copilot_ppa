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
var TrustManager_1 = require("../../src/services/TrustManager");
suite('TrustManager Tests', function () {
    var trustManager;
    var sandbox;
    var workspaceStub;
    var workspaceTrustStub;
    setup(function () {
        sandbox = sinon.createSandbox();
        // Create stubs for VS Code workspace trust APIs
        workspaceStub = sandbox.stub(vscode.workspace, 'isTrusted');
        workspaceTrustStub = sandbox.stub();
        // Mock workspace requestWorkspaceTrust API
        vscode.workspace.requestWorkspaceTrust = workspaceTrustStub;
        // Reset singleton instance
        TrustManager_1.TrustManager.instance = undefined;
        // Create a fresh instance
        trustManager = TrustManager_1.TrustManager.getInstance();
    });
    teardown(function () {
        sandbox.restore();
    });
    test('getInstance should return a singleton instance', function () {
        var instance1 = TrustManager_1.TrustManager.getInstance();
        var instance2 = TrustManager_1.TrustManager.getInstance();
        assert.strictEqual(instance1, instance2, 'getInstance should return the same instance');
    });
    test('isWorkspaceTrusted should return true when workspace is trusted', function () {
        workspaceStub.returns(true);
        assert.ok(trustManager.isWorkspaceTrusted(), 'Should return true for trusted workspace');
    });
    test('isWorkspaceTrusted should return false when workspace is not trusted', function () {
        workspaceStub.returns(false);
        assert.ok(!trustManager.isWorkspaceTrusted(), 'Should return false for untrusted workspace');
    });
    test('isWorkspaceTrusted should return false when workspace trust is undefined', function () {
        workspaceStub.returns(undefined);
        assert.ok(!trustManager.isWorkspaceTrusted(), 'Should return false when trust is undefined');
    });
    test('requestWorkspaceTrust should call vscode.workspace.requestWorkspaceTrust', function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    workspaceTrustStub.resolves(true); // Mock the promise resolution
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, trustManager.requestWorkspaceTrust()];
                case 2:
                    _a.sent();
                    assert.ok(workspaceTrustStub.calledOnce, 'requestWorkspaceTrust should be called');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    assert.fail("Test failed with error: ".concat(error_1));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    test('requestWorkspaceTrust should return the result from vscode.workspace.requestWorkspaceTrust', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_2, resultFalse, error_3, resultUndefined, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    workspaceTrustStub.resolves(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, trustManager.requestWorkspaceTrust()];
                case 2:
                    result = _a.sent();
                    assert.strictEqual(result, true, 'Should return true when trust is granted');
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    assert.fail("Test failed with error: ".concat(error_2));
                    return [3 /*break*/, 4];
                case 4:
                    workspaceTrustStub.resolves(false);
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, trustManager.requestWorkspaceTrust()];
                case 6:
                    resultFalse = _a.sent();
                    assert.strictEqual(resultFalse, false, 'Should return false when trust is denied');
                    return [3 /*break*/, 8];
                case 7:
                    error_3 = _a.sent();
                    assert.fail("Test failed with error: ".concat(error_3));
                    return [3 /*break*/, 8];
                case 8:
                    workspaceTrustStub.resolves(undefined);
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, trustManager.requestWorkspaceTrust()];
                case 10:
                    resultUndefined = _a.sent();
                    assert.strictEqual(resultUndefined, undefined, 'Should return undefined when trust decision is pending');
                    return [3 /*break*/, 12];
                case 11:
                    error_4 = _a.sent();
                    assert.fail("Test failed with error: ".concat(error_4));
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    }); });
    test('requestWorkspaceTrust should handle rejection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testError, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testError = new Error('Test Error');
                    workspaceTrustStub.rejects(testError); // Mock the promise rejection
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, trustManager.requestWorkspaceTrust()];
                case 2:
                    _a.sent();
                    assert.fail('Should have thrown an error');
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    assert.strictEqual(error_5, testError, 'Should rethrow the error from the API');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
});
