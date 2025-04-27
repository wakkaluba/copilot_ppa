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
var agentSidebarProvider_1 = require("../../../sidebar/agentSidebarProvider");
var jest_mock_extended_1 = require("jest-mock-extended");
describe('AgentSidebarProvider', function () {
    var provider;
    var mockWebview;
    var mockWebviewView;
    var mockConnectionManager;
    var mockExtensionUri;
    beforeEach(function () {
        mockWebview = (0, jest_mock_extended_1.mock)();
        mockWebviewView = (0, jest_mock_extended_1.mock)({
            webview: mockWebview
        });
        mockConnectionManager = (0, jest_mock_extended_1.mock)();
        mockExtensionUri = vscode.Uri.file('test-extension-path');
        provider = new agentSidebarProvider_1.AgentSidebarProvider(mockExtensionUri, mockConnectionManager);
    });
    describe('resolveWebviewView', function () {
        it('should initialize webview with correct options', function () {
            provider.resolveWebviewView(mockWebviewView, {}, {});
            expect(mockWebview.options).toEqual({
                enableScripts: true,
                localResourceRoots: [mockExtensionUri]
            });
        });
        it('should set up HTML content', function () {
            provider.resolveWebviewView(mockWebviewView, {}, {});
            expect(mockWebview.html).toBeDefined();
            expect(mockWebview.html).toContain('<!DOCTYPE html>');
        });
    });
    describe('message handling', function () {
        beforeEach(function () {
            provider.resolveWebviewView(mockWebviewView, {}, {});
        });
        it('should handle connect message', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mockWebview.onDidReceiveMessage.mock.calls[0][0]({
                            type: 'connect'
                        })];
                    case 1:
                        _a.sent();
                        expect(mockConnectionManager.connect).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle disconnect message', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mockWebview.onDidReceiveMessage.mock.calls[0][0]({
                            type: 'disconnect'
                        })];
                    case 1:
                        _a.sent();
                        expect(mockConnectionManager.disconnect).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle refreshModels message', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockModels;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockModels = [{ id: 'model1' }, { id: 'model2' }];
                        mockConnectionManager.getAvailableModels.mockResolvedValue(mockModels);
                        return [4 /*yield*/, mockWebview.onDidReceiveMessage.mock.calls[0][0]({
                                type: 'refreshModels'
                            })];
                    case 1:
                        _a.sent();
                        expect(mockConnectionManager.getAvailableModels).toHaveBeenCalled();
                        expect(mockWebview.postMessage).toHaveBeenCalledWith({
                            type: 'updateModels',
                            data: mockModels
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle setModel message', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mockWebview.onDidReceiveMessage.mock.calls[0][0]({
                            type: 'setModel',
                            data: 'test-model'
                        })];
                    case 1:
                        _a.sent();
                        expect(mockConnectionManager.setModel).toHaveBeenCalledWith('test-model');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('error handling', function () {
        beforeEach(function () {
            provider.resolveWebviewView(mockWebviewView, {}, {});
        });
        it('should handle connection errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error = new Error('Connection failed');
                        mockConnectionManager.connect.mockRejectedValue(error);
                        return [4 /*yield*/, mockWebview.onDidReceiveMessage.mock.calls[0][0]({
                                type: 'connect'
                            })];
                    case 1:
                        _a.sent();
                        expect(mockWebview.postMessage).toHaveBeenCalledWith({
                            type: 'showError',
                            data: 'Failed to connect: Connection failed'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('cleanup', function () {
        it('should dispose of all resources', function () {
            var disposableMock = { dispose: jest.fn() };
            provider['_disposables'].push(disposableMock);
            provider.dispose();
            expect(disposableMock.dispose).toHaveBeenCalled();
            expect(provider['_messageHandlers'].size).toBe(0);
            expect(provider['_view']).toBeUndefined();
        });
    });
});
