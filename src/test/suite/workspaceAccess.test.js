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
var vscode = require("vscode");
var workspaceAccess_1 = require("../../commands/workspaceAccess");
describe('WorkspaceAccess Tests', function () {
    var workspaceAccess;
    var mockEventEmitter;
    beforeEach(function () {
        // Create a new event emitter for each test
        mockEventEmitter = new vscode.EventEmitter();
        jest.spyOn(workspaceAccess_1.WorkspaceAccessManager, 'onDidChangeAccessEmitter', 'get')
            .mockReturnValue(mockEventEmitter);
        workspaceAccess = workspaceAccess_1.WorkspaceAccessManager.getInstance();
    });
    afterEach(function () {
        // Reset the singleton instance
        workspaceAccess_1.WorkspaceAccessManager.instance = undefined;
        jest.clearAllMocks();
    });
    describe('Initialization', function () {
        test('initializes with correct default state', function () {
            expect(workspaceAccess.isEnabled()).toBe(false);
        });
        test('maintains singleton instance', function () {
            var instance1 = workspaceAccess_1.WorkspaceAccessManager.getInstance();
            var instance2 = workspaceAccess_1.WorkspaceAccessManager.getInstance();
            expect(instance1).toBe(instance2);
        });
    });
    describe('Access Control', function () {
        test('toggles workspace access', function () { return __awaiter(void 0, void 0, void 0, function () {
            var initialState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        initialState = workspaceAccess.isEnabled();
                        return [4 /*yield*/, workspaceAccess.toggleAccess()];
                    case 1:
                        _a.sent();
                        expect(workspaceAccess.isEnabled()).toBe(!initialState);
                        return [2 /*return*/];
                }
            });
        }); });
        test('emits change event when toggling', function () { return __awaiter(void 0, void 0, void 0, function () {
            var changeHandler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        changeHandler = jest.fn();
                        workspaceAccess.onDidChangeAccess(changeHandler);
                        return [4 /*yield*/, workspaceAccess.toggleAccess()];
                    case 1:
                        _a.sent();
                        expect(changeHandler).toHaveBeenCalledWith(true);
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles multiple event listeners', function () { return __awaiter(void 0, void 0, void 0, function () {
            var handler1, handler2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        handler1 = jest.fn();
                        handler2 = jest.fn();
                        workspaceAccess.onDidChangeAccess(handler1);
                        workspaceAccess.onDidChangeAccess(handler2);
                        return [4 /*yield*/, workspaceAccess.toggleAccess()];
                    case 1:
                        _a.sent();
                        expect(handler1).toHaveBeenCalledWith(true);
                        expect(handler2).toHaveBeenCalledWith(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Event Handling', function () {
        test('properly disposes event listeners', function () {
            var handler = jest.fn();
            var disposable = workspaceAccess.onDidChangeAccess(handler);
            disposable.dispose();
            // Trigger a change
            mockEventEmitter.fire(true);
            expect(handler).not.toHaveBeenCalled();
        });
        test('handles event subscription after initialization', function () { return __awaiter(void 0, void 0, void 0, function () {
            var handler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        handler = jest.fn();
                        // Toggle access before subscribing
                        return [4 /*yield*/, workspaceAccess.toggleAccess()];
                    case 1:
                        // Toggle access before subscribing
                        _a.sent();
                        // Subscribe to events
                        workspaceAccess.onDidChangeAccess(handler);
                        // Toggle again
                        return [4 /*yield*/, workspaceAccess.toggleAccess()];
                    case 2:
                        // Toggle again
                        _a.sent();
                        expect(handler).toHaveBeenCalledWith(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Error Handling', function () {
        test('handles toggle failure gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock a failure in the toggle operation
                        jest.spyOn(workspaceAccess, 'updateState')
                            .mockRejectedValueOnce(new Error('Toggle failed'));
                        return [4 /*yield*/, expect(workspaceAccess.toggleAccess())
                                .rejects.toThrow('Toggle failed')];
                    case 1:
                        _a.sent();
                        // State should remain unchanged
                        expect(workspaceAccess.isEnabled()).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
