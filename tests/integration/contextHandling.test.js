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
var contextManager_1 = require("../../src/context/contextManager");
var llmProviderFactory_1 = require("../../src/providers/llmProviderFactory");
describe('Context Handling Integration', function () {
    var contextManager;
    var mockProviderFactory;
    beforeEach(function () {
        mockProviderFactory = new llmProviderFactory_1.LLMProviderFactory();
        jest.spyOn(mockProviderFactory, 'createProvider').mockImplementation(function () { return ({
            sendMessage: jest.fn(),
            getContext: jest.fn(),
            getCapabilities: jest.fn()
        }); });
        contextManager = new contextManager_1.ContextManager(mockProviderFactory);
    });
    afterEach(function () {
        jest.clearAllMocks();
    });
    describe('Context Capture', function () {
        test('captures current file context', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fileUri, fileContent, context;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileUri = vscode.Uri.file('/test/file.js');
                        fileContent = 'function test() { return true; }';
                        vscode.workspace.fs.readFile.mockResolvedValueOnce(Buffer.from(fileContent));
                        // Mock active editor
                        vscode.window.activeTextEditor = {
                            document: {
                                uri: fileUri,
                                fileName: '/test/file.js',
                                languageId: 'javascript',
                                getText: jest.fn().mockReturnValue(fileContent)
                            }
                        };
                        return [4 /*yield*/, contextManager.captureCurrentFileContext()];
                    case 1:
                        context = _a.sent();
                        expect(context).toHaveProperty('filePath', '/test/file.js');
                        expect(context).toHaveProperty('language', 'javascript');
                        expect(context).toHaveProperty('content', fileContent);
                        return [2 /*return*/];
                }
            });
        }); });
        test('captures workspace context', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockFiles, fileContents, context;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFiles = [
                            vscode.Uri.file('/test/file1.js'),
                            vscode.Uri.file('/test/file2.js'),
                            vscode.Uri.file('/test/package.json')
                        ];
                        // Mock findFiles method
                        vscode.workspace.findFiles.mockResolvedValueOnce(mockFiles);
                        fileContents = {
                            '/test/file1.js': 'function file1() {}',
                            '/test/file2.js': 'function file2() {}',
                            '/test/package.json': '{ "name": "test-project" }'
                        };
                        vscode.workspace.fs.readFile.mockImplementation(function (uri) {
                            var content = fileContents[uri.fsPath] || '';
                            return Promise.resolve(Buffer.from(content));
                        });
                        return [4 /*yield*/, contextManager.captureWorkspaceContext(['**/*.js', '**/package.json'], 3)];
                    case 1:
                        context = _a.sent();
                        expect(context).toHaveProperty('files');
                        expect(context.files).toHaveLength(3);
                        expect(context.files[0]).toHaveProperty('filePath');
                        expect(context.files[0]).toHaveProperty('content');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Context Management', function () {
        test('adds message to conversation history', function () {
            var message = 'Test message';
            contextManager.addMessage('user', message);
            var history = contextManager.getConversationHistory();
            expect(history).toHaveLength(1);
            expect(history[0]).toHaveProperty('role', 'user');
            expect(history[0]).toHaveProperty('content', message);
        });
        test('manages conversation history size', function () {
            // Add multiple messages beyond the default limit
            var messageLimit = 10;
            for (var i = 0; i < messageLimit + 5; i++) {
                contextManager.addMessage('user', "Message ".concat(i));
            }
            var history = contextManager.getConversationHistory();
            expect(history).toHaveLength(messageLimit);
            expect(history[messageLimit - 1]).toHaveProperty('content', "Message ".concat(messageLimit + 4));
        });
        test('clears conversation history', function () {
            contextManager.addMessage('user', 'Test message');
            contextManager.clearConversationHistory();
            var history = contextManager.getConversationHistory();
            expect(history).toHaveLength(0);
        });
    });
    describe('Context Building', function () {
        test('builds prompt with current context', function () { return __awaiter(void 0, void 0, void 0, function () {
            var prompt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock active editor context
                        vscode.window.activeTextEditor = {
                            document: {
                                uri: vscode.Uri.file('/test/file.js'),
                                fileName: '/test/file.js',
                                languageId: 'javascript',
                                getText: jest.fn().mockReturnValue('function test() { return true; }')
                            }
                        };
                        // Add some history
                        contextManager.addMessage('user', 'What does this function do?');
                        contextManager.addMessage('assistant', 'This function returns true.');
                        return [4 /*yield*/, contextManager.buildPrompt('Tell me more about this code')];
                    case 1:
                        prompt = _a.sent();
                        expect(prompt).toContain('/test/file.js');
                        expect(prompt).toContain('function test()');
                        expect(prompt).toContain('What does this function do?');
                        expect(prompt).toContain('This function returns true.');
                        expect(prompt).toContain('Tell me more about this code');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
