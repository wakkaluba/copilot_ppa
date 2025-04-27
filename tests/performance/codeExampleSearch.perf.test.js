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
var sinon = require("sinon");
var assert = require("assert");
var fs = require("fs");
var axios_1 = require("axios");
var codeExampleSearch_1 = require("../../src/codeExampleSearch");
/**
 * Performance test suite for the CodeExampleSearch class
 */
describe('CodeExampleSearch Performance Tests', function () {
    var sandbox;
    var mockContext;
    var codeExampleSearch;
    // Performance thresholds - adjust as needed
    var CACHE_RETRIEVAL_THRESHOLD_MS = 50;
    var SEARCH_THRESHOLD_MS = 1000; // Searching will be mocked, but processing should be efficient
    beforeEach(function () {
        sandbox = sinon.createSandbox();
        // Mock extension context
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
            asAbsolutePath: function (p) { return p; },
            storagePath: '/fake/storage/path',
            storageUri: vscode.Uri.parse('file:///fake/storage/path'),
            globalStoragePath: '/fake/global/storage/path',
            globalStorageUri: vscode.Uri.parse('file:///fake/global/storage/path'),
            logPath: '/fake/log/path',
            logUri: vscode.Uri.parse('file:///fake/log/path')
        };
        // Mock file system operations
        sandbox.stub(fs, 'existsSync').returns(true);
        sandbox.stub(fs, 'mkdirSync');
        // Create test instance
        codeExampleSearch = new codeExampleSearch_1.CodeExampleSearch(mockContext);
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should retrieve cached results efficiently', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockCachedData, start, results, executionTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockCachedData = {
                        timestamp: new Date().toISOString(),
                        examples: [
                            { id: '123', filename: 'test.js', content: 'console.log("test")', language: 'javascript', url: 'https://github.com', repository: 'test/repo', relevanceScore: 0.8 }
                        ]
                    };
                    sandbox.stub(fs, 'readFileSync').returns(JSON.stringify(mockCachedData));
                    start = performance.now();
                    return [4 /*yield*/, codeExampleSearch.searchExamples('test query', 'javascript')];
                case 1:
                    results = _a.sent();
                    executionTime = performance.now() - start;
                    // Assert on results
                    assert(Array.isArray(results), 'Should return an array of results');
                    assert.strictEqual(results.length, 1, 'Should return one example');
                    // Assert on performance
                    assert(executionTime < CACHE_RETRIEVAL_THRESHOLD_MS, "Cache retrieval should be fast (took ".concat(executionTime.toFixed(2), "ms, threshold: ").concat(CACHE_RETRIEVAL_THRESHOLD_MS, "ms)"));
                    return [2 /*return*/];
            }
        });
    }); });
    it('should search and filter results efficiently', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockGitHubSearchResponse, mockGitHubContentResponse, axiosGetStub, start, results, executionTime, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock cache miss
                    sandbox.stub(fs, 'readFileSync').throws(new Error('File not found'));
                    mockGitHubSearchResponse = {
                        status: 200,
                        data: {
                            items: Array(100).fill(null).map(function (_, i) { return ({
                                sha: "sha".concat(i),
                                name: "test".concat(i, ".js"),
                                html_url: "https://github.com/test/repo/test".concat(i, ".js"),
                                url: "https://api.github.com/repos/test/repo/contents/test".concat(i, ".js"),
                                repository: { full_name: "test/repo".concat(i) }
                            }); })
                        }
                    };
                    mockGitHubContentResponse = function (url) {
                        var _a;
                        var index = parseInt(((_a = url.match(/test(\d+)\.js/)) === null || _a === void 0 ? void 0 : _a[1]) || '0', 10);
                        return {
                            status: 200,
                            data: "// Example ".concat(index, "\nconsole.log(\"test ").concat(index, "\");").concat(Array(index).fill('\n// Extra content line').join(''))
                        };
                    };
                    axiosGetStub = sandbox.stub(axios_1.default, 'get');
                    axiosGetStub.onFirstCall().resolves(mockGitHubSearchResponse);
                    // For each content request, return a different mock response
                    axiosGetStub.callsFake(function (url) {
                        if (url.includes('api.github.com/search/code')) {
                            return Promise.resolve(mockGitHubSearchResponse);
                        }
                        else {
                            return Promise.resolve(mockGitHubContentResponse(url));
                        }
                    });
                    // Mock file write to prevent actual disk writes
                    sandbox.stub(fs, 'writeFileSync');
                    start = performance.now();
                    return [4 /*yield*/, codeExampleSearch.searchExamples('test query', 'javascript')];
                case 1:
                    results = _a.sent();
                    executionTime = performance.now() - start;
                    // Assert on results
                    assert(Array.isArray(results), 'Should return an array of results');
                    assert(results.length <= 10, 'Should return at most 10 examples');
                    // Assert on performance
                    assert(executionTime < SEARCH_THRESHOLD_MS, "Search operation should complete within threshold (took ".concat(executionTime.toFixed(2), "ms, threshold: ").concat(SEARCH_THRESHOLD_MS, "ms)"));
                    // Verify the results are sorted by relevance
                    for (i = 0; i < results.length - 1; i++) {
                        assert(results[i].relevanceScore >= results[i + 1].relevanceScore, 'Results should be sorted by relevance score in descending order');
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('should measure HTML generation performance', function () { return __awaiter(void 0, void 0, void 0, function () {
        var examples, mockWebview, mockWebviewPanel, start, executionTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    examples = Array(20).fill(null).map(function (_, i) { return ({
                        id: "id".concat(i),
                        filename: "example".concat(i, ".js"),
                        content: "// Example ".concat(i, "\nconsole.log(\"test ").concat(i, "\");\n").concat(Array(50).fill('// More content').join('\n')),
                        language: 'javascript',
                        url: "https://github.com/test/repo/example".concat(i, ".js"),
                        repository: "test/repo".concat(i),
                        relevanceScore: 1 - (i / 20)
                    }); });
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
                    sandbox.stub(vscode.window, 'createWebviewPanel').returns(mockWebviewPanel);
                    start = performance.now();
                    return [4 /*yield*/, codeExampleSearch.showExampleUI(examples)];
                case 1:
                    _a.sent();
                    executionTime = performance.now() - start;
                    // Assert on HTML generation performance (should be done in under 100ms)
                    assert(executionTime < 100, "HTML generation should be fast (took ".concat(executionTime.toFixed(2), "ms, threshold: 100ms)"));
                    // Verify HTML content was generated
                    assert(mockWebview.html.length > 0, 'HTML should be generated');
                    assert(mockWebview.html.includes('example0.js'), 'HTML should include example filenames');
                    return [2 /*return*/];
            }
        });
    }); });
});
