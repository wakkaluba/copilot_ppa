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
var fs = require("fs");
var path = require("path");
var sinon = require("sinon");
var assert = require("assert");
var axios_1 = require("axios");
var codeExampleSearch_1 = require("../../src/codeExampleSearch");
describe('CodeExampleSearch Tests', function () {
    var sandbox;
    var mockContext;
    var fsExistsSyncStub;
    var fsMkdirSyncStub;
    var fsReadFileSyncStub;
    var fsWriteFileSyncStub;
    var fsUnlinkSyncStub;
    var axiosGetStub;
    var showInformationMessageStub;
    var createWebviewPanelStub;
    var mockWebviewPanel;
    var mockWebview;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
        // Mock the extension context
        mockContext = {
            subscriptions: [],
            workspaceState: {
                get: function () { },
                update: function () { return Promise.resolve(); },
                keys: function () { return []; }
            },
            globalState: {
                get: function () { },
                update: function () { return Promise.resolve(); },
                keys: function () { return []; },
                setKeysForSync: function () { }
            },
            extensionPath: '/fake/extension/path',
            extensionUri: vscode.Uri.parse('file:///fake/extension/path'),
            asAbsolutePath: function (p) { return path.join('/fake/extension/path', p); },
            storagePath: '/fake/storage/path',
            storageUri: vscode.Uri.parse('file:///fake/storage/path'),
            globalStoragePath: '/fake/global/storage/path',
            globalStorageUri: vscode.Uri.parse('file:///fake/global/storage/path'),
            logPath: '/fake/log/path',
            logUri: vscode.Uri.parse('file:///fake/log/path')
        };
        // Mock fs functions
        fsExistsSyncStub = sandbox.stub(fs, 'existsSync');
        fsMkdirSyncStub = sandbox.stub(fs, 'mkdirSync');
        fsReadFileSyncStub = sandbox.stub(fs, 'readFileSync');
        fsWriteFileSyncStub = sandbox.stub(fs, 'writeFileSync');
        fsUnlinkSyncStub = sandbox.stub(fs, 'unlinkSync');
        // Mock axios
        axiosGetStub = sandbox.stub(axios_1.default, 'get');
        // Mock VS Code API
        showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage');
        // Mock webview panel
        mockWebview = {
            html: '',
            onDidReceiveMessage: sandbox.stub(),
            postMessage: sandbox.stub(),
            cspSource: 'mock-csp-source'
        };
        mockWebviewPanel = {
            webview: mockWebview,
            onDidDispose: sandbox.stub()
        };
        createWebviewPanelStub = sandbox.stub(vscode.window, 'createWebviewPanel').returns(mockWebviewPanel);
    });
    afterEach(function () {
        sandbox.restore();
    });
    describe('Constructor', function () {
        it('should create cache directory if it does not exist', function () {
            fsExistsSyncStub.returns(false);
            new codeExampleSearch_1.CodeExampleSearch(mockContext);
            assert(fsExistsSyncStub.calledOnce, 'Should check if cache directory exists');
            assert(fsMkdirSyncStub.calledOnce, 'Should create cache directory');
            assert(fsMkdirSyncStub.firstCall.args[1].recursive, 'Should create directories recursively');
        });
        it('should not create cache directory if it already exists', function () {
            fsExistsSyncStub.returns(true);
            new codeExampleSearch_1.CodeExampleSearch(mockContext);
            assert(fsExistsSyncStub.calledOnce, 'Should check if cache directory exists');
            assert(fsMkdirSyncStub.notCalled, 'Should not create cache directory');
        });
    });
    describe('searchExamples', function () {
        it('should return cached results if available and not expired', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockCachedData, codeExampleSearch, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fsExistsSyncStub.returns(true);
                        mockCachedData = {
                            timestamp: new Date().toISOString(),
                            examples: [{ id: '123', filename: 'test.js', content: 'console.log("test")', language: 'javascript', url: 'https://github.com', repository: 'test/repo', relevanceScore: 0.8 }]
                        };
                        fsReadFileSyncStub.returns(JSON.stringify(mockCachedData));
                        codeExampleSearch = new codeExampleSearch_1.CodeExampleSearch(mockContext);
                        return [4 /*yield*/, codeExampleSearch.searchExamples('test query', 'javascript')];
                    case 1:
                        results = _a.sent();
                        assert.deepStrictEqual(results, mockCachedData.examples, 'Should return cached examples');
                        assert(fsReadFileSyncStub.calledOnce, 'Should read from cache file');
                        assert(axiosGetStub.notCalled, 'Should not call GitHub API');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should search GitHub API if cache is not available', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockGitHubSearchResponse, mockGitHubContentResponse, codeExampleSearch, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Make cache check fail
                        fsExistsSyncStub.returns(false);
                        mockGitHubSearchResponse = {
                            status: 200,
                            data: {
                                items: [
                                    { sha: '123', name: 'test.js', html_url: 'https://github.com/test/repo/test.js', url: 'https://api.github.com/repos/test/repo/contents/test.js', repository: { full_name: 'test/repo' } }
                                ]
                            }
                        };
                        mockGitHubContentResponse = {
                            status: 200,
                            data: 'console.log("test");'
                        };
                        axiosGetStub.onFirstCall().resolves(mockGitHubSearchResponse);
                        axiosGetStub.onSecondCall().resolves(mockGitHubContentResponse);
                        codeExampleSearch = new codeExampleSearch_1.CodeExampleSearch(mockContext);
                        return [4 /*yield*/, codeExampleSearch.searchExamples('test query', 'javascript')];
                    case 1:
                        results = _a.sent();
                        assert(axiosGetStub.calledTwice, 'Should call GitHub API twice (search + content)');
                        assert(fsWriteFileSyncStub.calledOnce, 'Should write results to cache');
                        assert.strictEqual(results.length, 1, 'Should return one example');
                        assert.strictEqual(results[0].filename, 'test.js', 'Example should have correct filename');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('showExampleUI', function () {
        it('should show information message if no examples are found', function () { return __awaiter(void 0, void 0, void 0, function () {
            var codeExampleSearch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        codeExampleSearch = new codeExampleSearch_1.CodeExampleSearch(mockContext);
                        return [4 /*yield*/, codeExampleSearch.showExampleUI([])];
                    case 1:
                        _a.sent();
                        assert(showInformationMessageStub.calledOnce, 'Should show information message');
                        assert(showInformationMessageStub.calledWith('No code examples found.'), 'Should show correct message');
                        assert(createWebviewPanelStub.notCalled, 'Should not create webview panel');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should create webview panel with examples', function () { return __awaiter(void 0, void 0, void 0, function () {
            var examples, codeExampleSearch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        examples = [
                            {
                                id: '123',
                                filename: 'test.js',
                                content: 'console.log("test")',
                                language: 'javascript',
                                url: 'https://github.com/test/repo/test.js',
                                repository: 'test/repo',
                                relevanceScore: 0.8
                            }
                        ];
                        codeExampleSearch = new codeExampleSearch_1.CodeExampleSearch(mockContext);
                        return [4 /*yield*/, codeExampleSearch.showExampleUI(examples)];
                    case 1:
                        _a.sent();
                        assert(createWebviewPanelStub.calledOnce, 'Should create webview panel');
                        assert(mockWebview.onDidReceiveMessage.calledOnce, 'Should set up message handler');
                        assert.strictEqual(typeof mockWebview.html, 'string', 'Should set HTML content');
                        assert(mockWebview.html.includes('test.js'), 'HTML should contain example filename');
                        assert(mockWebview.html.includes('console.log("test")'), 'HTML should contain example content');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
