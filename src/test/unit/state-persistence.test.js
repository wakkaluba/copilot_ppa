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
var mockHelpers_1 = require("../helpers/mockHelpers");
var statePersistenceManager_1 = require("../../services/statePersistenceManager");
describe('StatePersistenceManager', function () {
    var statePersistenceManager;
    var mockContext;
    var mockHistory;
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
        mockContext = (0, mockHelpers_1.createMockExtensionContext)();
        mockHistory = (0, mockHelpers_1.createMockConversationHistory)();
        // Create a fresh instance for each test
        statePersistenceManager = new statePersistenceManager_1.StatePersistenceManager(mockContext, mockHistory);
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should persist state to global storage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var state;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = {
                        lastConversation: 'test-123',
                        settings: {
                            theme: 'dark',
                            fontSize: 14
                        }
                    };
                    return [4 /*yield*/, statePersistenceManager.saveState('test-state', state)];
                case 1:
                    _a.sent();
                    sinon.assert.calledWith(mockContext.globalState.update, 'test-state', state);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should restore state from global storage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var expectedState, state;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expectedState = {
                        lastConversation: 'test-123',
                        settings: {
                            theme: 'dark',
                            fontSize: 14
                        }
                    };
                    mockContext.globalState.get.returns(expectedState);
                    return [4 /*yield*/, statePersistenceManager.loadState('test-state')];
                case 1:
                    state = _a.sent();
                    assert.deepStrictEqual(state, expectedState);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return default state if no state exists', function () { return __awaiter(void 0, void 0, void 0, function () {
        var defaultState, state;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    defaultState = { settings: {} };
                    mockContext.globalState.get.returns(undefined);
                    return [4 /*yield*/, statePersistenceManager.loadState('test-state', defaultState)];
                case 1:
                    state = _a.sent();
                    assert.deepStrictEqual(state, defaultState);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should clear state from global storage', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, statePersistenceManager.clearState('test-state')];
                case 1:
                    _a.sent();
                    sinon.assert.calledWith(mockContext.globalState.update, 'test-state', undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should export persistent state to JSON', function () { return __awaiter(void 0, void 0, void 0, function () {
        var state, json, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = {
                        lastConversation: 'test-123',
                        settings: {
                            theme: 'dark',
                            fontSize: 14
                        }
                    };
                    mockContext.globalState.get.returns(state);
                    return [4 /*yield*/, statePersistenceManager.exportStateToJson('test-state')];
                case 1:
                    json = _a.sent();
                    parsed = JSON.parse(json);
                    assert.deepStrictEqual(parsed, state);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should import persistent state from JSON', function () { return __awaiter(void 0, void 0, void 0, function () {
        var state, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = {
                        lastConversation: 'test-123',
                        settings: {
                            theme: 'dark',
                            fontSize: 14
                        }
                    };
                    json = JSON.stringify(state);
                    return [4 /*yield*/, statePersistenceManager.importStateFromJson('test-state', json)];
                case 1:
                    _a.sent();
                    sinon.assert.calledWith(mockContext.globalState.update, 'test-state', state);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle invalid JSON during import', function () { return __awaiter(void 0, void 0, void 0, function () {
        var invalidJson, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    invalidJson = '{invalid:json}';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, statePersistenceManager.importStateFromJson('test-state', invalidJson)];
                case 2:
                    _a.sent();
                    assert.fail('Expected error was not thrown');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    assert.ok(error_1 instanceof Error);
                    assert.ok(error_1.message.includes('Invalid JSON'));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    it('should merge states with existing data', function () { return __awaiter(void 0, void 0, void 0, function () {
        var existingState, newState, expectedMergedState;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    existingState = {
                        lastConversation: 'test-123',
                        settings: {
                            theme: 'dark',
                            fontSize: 14
                        }
                    };
                    newState = {
                        settings: {
                            fontSize: 16,
                            fontFamily: 'Arial'
                        },
                        newProperty: 'value'
                    };
                    mockContext.globalState.get.returns(existingState);
                    return [4 /*yield*/, statePersistenceManager.mergeState('test-state', newState)];
                case 1:
                    _a.sent();
                    expectedMergedState = {
                        lastConversation: 'test-123',
                        settings: {
                            theme: 'dark',
                            fontSize: 16,
                            fontFamily: 'Arial'
                        },
                        newProperty: 'value'
                    };
                    sinon.assert.calledWith(mockContext.globalState.update, 'test-state', expectedMergedState);
                    return [2 /*return*/];
            }
        });
    }); });
});
