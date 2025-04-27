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
var chatView_1 = require("../../src/ui/chatView"); // Assuming correct casing
var statusBar_1 = require("../../src/ui/statusBar"); // Assuming correct casing
describe('UI Components', function () {
    describe('ChatView', function () {
        var mockWebviewPanel;
        var mockEventEmitter;
        beforeEach(function () {
            mockEventEmitter = new vscode.EventEmitter();
            // Use the defined interface for the mock
            mockWebviewPanel = {
                webview: {
                    html: '',
                    onDidReceiveMessage: mockEventEmitter.event,
                    postMessage: jest.fn().mockResolvedValue(true), // Mock resolution value
                    asWebviewUri: function (uri) { return uri; },
                    options: { enableScripts: true },
                    cspSource: 'mock-csp-source'
                },
                onDidDispose: jest.fn(),
                dispose: jest.fn(),
                reveal: jest.fn(),
                active: true,
                visible: true,
                options: { enableCommandUris: true, enableScripts: true, retainContextWhenHidden: true },
                viewType: 'copilotPPAChat',
                title: 'Copilot PPA Chat',
            };
            vscode.window.createWebviewPanel.mockReturnValue(mockWebviewPanel);
        });
        afterEach(function () {
            jest.clearAllMocks();
        });
        test('initializes correctly', function () {
            var chatView = new chatView_1.ChatView();
            expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith('copilotPPAChat', 'Copilot PPA Chat', vscode.ViewColumn.Beside, expect.objectContaining({
                enableScripts: true,
                retainContextWhenHidden: true
            }));
        });
        test('posts message to webview', function () { return __awaiter(void 0, void 0, void 0, function () {
            var chatView, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chatView = new chatView_1.ChatView();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, chatView.sendMessage('Hello from test')];
                    case 2:
                        _a.sent();
                        expect(mockWebviewPanel.webview.postMessage).toHaveBeenCalledWith({
                            type: 'message',
                            content: 'Hello from test'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        // Use assert.fail for consistency if assert is preferred, or just fail the test
                        // assert.fail(`Test failed with error: ${error}`);
                        throw new Error("Test failed during sendMessage: ".concat(error_1)); // Add error handling
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        test('disposes webview correctly', function () {
            var chatView = new chatView_1.ChatView();
            chatView.dispose();
            expect(mockWebviewPanel.dispose).toHaveBeenCalled();
        });
        test('handles received messages', function () {
            var chatView = new chatView_1.ChatView();
            // Add explicit type for the callback parameter
            var messageHandler = jest.fn(function (message) { });
            chatView.onMessage(messageHandler);
            // Simulate receiving a message
            var testMessage = { type: 'test', data: 'test data' };
            mockEventEmitter.fire(testMessage);
            expect(messageHandler).toHaveBeenCalledWith(testMessage);
        });
    });
    describe('StatusBar', function () {
        var mockStatusBarItem;
        beforeEach(function () {
            // Use the defined interface for the mock
            mockStatusBarItem = {
                id: 'copilotPPAStatus',
                alignment: vscode.StatusBarAlignment.Left,
                priority: 100,
                text: '',
                tooltip: '',
                command: '',
                show: jest.fn(),
                hide: jest.fn(),
                dispose: jest.fn(),
                color: undefined,
                backgroundColor: undefined,
                name: undefined,
                accessibilityInformation: undefined,
            };
            vscode.window.createStatusBarItem.mockReturnValue(mockStatusBarItem);
        });
        test('creates status bar item', function () {
            var statusBar = new statusBar_1.StatusBar();
            expect(vscode.window.createStatusBarItem).toHaveBeenCalledWith(vscode.StatusBarAlignment.Left);
        });
        test('updates status text', function () {
            var statusBar = new statusBar_1.StatusBar();
            statusBar.setStatus('Connected');
            expect(mockStatusBarItem.text).toBe('$(check) Copilot PPA: Connected');
            expect(mockStatusBarItem.show).toHaveBeenCalled();
        });
        test('shows error status', function () {
            var statusBar = new statusBar_1.StatusBar();
            statusBar.setError('Connection failed');
            expect(mockStatusBarItem.text).toBe('$(error) Copilot PPA: Connection failed');
            expect(mockStatusBarItem.show).toHaveBeenCalled();
        });
        test('disposes status bar item', function () {
            var statusBar = new statusBar_1.StatusBar();
            statusBar.dispose();
            expect(mockStatusBarItem.dispose).toHaveBeenCalled();
        });
        test('handles click commands', function () {
            var statusBar = new statusBar_1.StatusBar();
            var command = 'copilot-ppa.showMenu';
            statusBar.setCommand(command);
            expect(mockStatusBarItem.command).toBe(command);
        });
    });
});
