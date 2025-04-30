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
var mockHelpers_1 = require("../helpers/mockHelpers");
var errorRecoveryManager_1 = require("../../services/errorRecoveryManager");
describe('ErrorRecoveryManager', function () {
    var errorRecoveryManager;
    var mockHistory;
    var mockContext;
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
        mockContext = (0, mockHelpers_1.createMockExtensionContext)();
        mockHistory = (0, mockHelpers_1.createMockConversationHistory)();
        // Create a fresh instance for each test
        errorRecoveryManager = new errorRecoveryManager_1.ErrorRecoveryManager(mockContext, mockHistory);
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should recover from a network error', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var networkError, recoveryResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        networkError = new Error('Network connection failed');
                        networkError.name = 'NetworkError';
                        return [4 /*yield*/, errorRecoveryManager.recoverFromError(networkError)];
                    case 1:
                        recoveryResult = _a.sent();
                        assert.strictEqual(recoveryResult.success, true);
                        assert.strictEqual(recoveryResult.strategy, 'retry');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should recover from an authentication error', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var authError, recoveryResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authError = new Error('Authentication failed');
                        authError.name = 'AuthenticationError';
                        return [4 /*yield*/, errorRecoveryManager.recoverFromError(authError)];
                    case 1:
                        recoveryResult = _a.sent();
                        assert.strictEqual(recoveryResult.success, true);
                        assert.strictEqual(recoveryResult.strategy, 'refresh-token');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should recover from a conversation corruption error', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var corruptionError, conversationId, recoveryResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        corruptionError = new Error('Conversation data is corrupted');
                        corruptionError.name = 'DataCorruptionError';
                        conversationId = 'corrupted-conversation';
                        // Simulate a corrupted conversation
                        mockHistory.getConversation.withArgs(conversationId).returns({
                            id: conversationId,
                            title: 'Corrupted Conversation',
                            messages: [{ corrupted: true }],
                            created: Date.now(),
                            updated: Date.now()
                        });
                        return [4 /*yield*/, errorRecoveryManager.recoverCorruptedConversation(conversationId)];
                    case 1:
                        recoveryResult = _a.sent();
                        assert.strictEqual(recoveryResult.success, true);
                        sinon.assert.called(mockHistory.addMessage);
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should handle an unrecoverable error', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var fatalError, recoveryResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fatalError = new Error('System crash');
                        fatalError.name = 'FatalError';
                        return [4 /*yield*/, errorRecoveryManager.recoverFromError(fatalError)];
                    case 1:
                        recoveryResult = _a.sent();
                        assert.strictEqual(recoveryResult.success, false);
                        assert.strictEqual(recoveryResult.strategy, 'report');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should log error details for diagnostics', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var error, logSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error = new Error('Test error');
                        error.name = 'TestError';
                        logSpy = sinon.spy(errorRecoveryManager, 'logError');
                        return [4 /*yield*/, errorRecoveryManager.recoverFromError(error)];
                    case 1:
                        _a.sent();
                        sinon.assert.calledOnce(logSpy);
                        sinon.assert.calledWith(logSpy, error);
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=error-recovery-scenarios.test.js.map