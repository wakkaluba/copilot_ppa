"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
/**
 * @jest-environment jsdom
 */
var vscode = require("vscode");
var codeExampleProvider_1 = require("../../src/providers/codeExampleProvider");
describe('Code Examples', function () {
    var provider;
    var mockEventEmitter;
    var mockContext;
    beforeEach(function () {
        // Set up DOM elements needed for tests
        document.body.innerHTML = "\n      <div id=\"code-examples\">\n        <div class=\"example-list\"></div>\n        <div class=\"example-detail\"></div>\n      </div>\n    ";
        // Create mock VS Code context
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            extensionUri: vscode.Uri.file('/test/path'),
            storageUri: vscode.Uri.file('/test/storage'),
            globalStorageUri: vscode.Uri.file('/test/globalStorage'),
            logUri: vscode.Uri.file('/test/log'),
            asAbsolutePath: jest.fn(function (p) { return "/test/path/".concat(p); }),
            storagePath: '/test/storage',
            globalStoragePath: '/test/globalStorage',
            logPath: '/test/log',
            extensionMode: vscode.ExtensionMode.Development,
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                setKeysForSync: jest.fn()
            },
            workspaceState: {
                get: jest.fn(),
                update: jest.fn()
            },
            secrets: {
                get: jest.fn(),
                store: jest.fn(),
                delete: jest.fn()
            },
            environmentVariableCollection: {
                persistent: true,
                replace: jest.fn(),
                append: jest.fn(),
                prepend: jest.fn(),
                get: jest.fn(),
                forEach: jest.fn(),
                delete: jest.fn(),
                clear: jest.fn()
            }
        };
        // Create event emitter for example updates
        mockEventEmitter = new vscode.EventEmitter();
        provider = new codeExampleProvider_1.CodeExampleProvider(mockContext);
    });
    afterEach(function () {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });
    describe('Example Management', function () {
        test('adds new code example', function () { return __awaiter(void 0, void 0, void 0, function () {
            var example, examples;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        example = {
                            id: '1',
                            title: 'Test Example',
                            description: 'A test example',
                            code: 'console.log("test");',
                            language: 'typescript',
                            tags: ['test']
                        };
                        return [4 /*yield*/, provider.addExample(example)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, provider.getExamples()];
                    case 2:
                        examples = _a.sent();
                        expect(examples).toContainEqual(example);
                        return [2 /*return*/];
                }
            });
        }); });
        test('updates existing example', function () { return __awaiter(void 0, void 0, void 0, function () {
            var example, updated, examples;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        example = {
                            id: '1',
                            title: 'Original Title',
                            description: 'Original description',
                            code: 'console.log("original");',
                            language: 'typescript',
                            tags: ['original']
                        };
                        return [4 /*yield*/, provider.addExample(example)];
                    case 1:
                        _a.sent();
                        updated = __assign(__assign({}, example), { title: 'Updated Title', code: 'console.log("updated");' });
                        return [4 /*yield*/, provider.updateExample(updated)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, provider.getExamples()];
                    case 3:
                        examples = _a.sent();
                        expect(examples).toContainEqual(updated);
                        expect(examples).not.toContainEqual(example);
                        return [2 /*return*/];
                }
            });
        }); });
        test('deletes example', function () { return __awaiter(void 0, void 0, void 0, function () {
            var example, examples;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        example = {
                            id: '1',
                            title: 'Test Example',
                            description: 'A test example',
                            code: 'console.log("test");',
                            language: 'typescript',
                            tags: ['test']
                        };
                        return [4 /*yield*/, provider.addExample(example)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, provider.deleteExample(example.id)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, provider.getExamples()];
                    case 3:
                        examples = _a.sent();
                        expect(examples).not.toContainEqual(example);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Search and Filter', function () {
        test('searches examples by text', function () { return __awaiter(void 0, void 0, void 0, function () {
            var examples, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        examples = [
                            {
                                id: '1',
                                title: 'Array Map Example',
                                description: 'Shows how to use array.map()',
                                code: '[1,2,3].map(x => x * 2)',
                                language: 'typescript',
                                tags: ['array', 'map']
                            },
                            {
                                id: '2',
                                title: 'Array Filter Example',
                                description: 'Shows how to use array.filter()',
                                code: '[1,2,3].filter(x => x > 1)',
                                language: 'typescript',
                                tags: ['array', 'filter']
                            }
                        ];
                        return [4 /*yield*/, Promise.all(examples.map(function (e) { return provider.addExample(e); }))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, provider.searchExamples('map')];
                    case 2:
                        results = _a.sent();
                        expect(results).toHaveLength(1);
                        expect(results[0].title).toContain('Map');
                        return [2 /*return*/];
                }
            });
        }); });
        test('filters examples by tag', function () { return __awaiter(void 0, void 0, void 0, function () {
            var examples, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        examples = [
                            {
                                id: '1',
                                title: 'React Component',
                                description: 'A React component example',
                                code: 'function App() { return <div>Hello</div>; }',
                                language: 'typescript',
                                tags: ['react', 'component']
                            },
                            {
                                id: '2',
                                title: 'Vue Component',
                                description: 'A Vue component example',
                                code: 'export default { name: "App" }',
                                language: 'typescript',
                                tags: ['vue', 'component']
                            }
                        ];
                        return [4 /*yield*/, Promise.all(examples.map(function (e) { return provider.addExample(e); }))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, provider.filterByTags(['react'])];
                    case 2:
                        results = _a.sent();
                        expect(results).toHaveLength(1);
                        expect(results[0].tags).toContain('react');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Event Handling', function () {
        test('emits event on example added', function () { return __awaiter(void 0, void 0, void 0, function () {
            var handler, example, examples;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        handler = jest.fn();
                        provider.onDidChangeExamples(handler);
                        example = {
                            id: '1',
                            title: 'Test Example',
                            description: 'A test example',
                            code: 'console.log("test");',
                            language: 'typescript',
                            tags: ['test']
                        };
                        return [4 /*yield*/, provider.addExample(example)];
                    case 1:
                        _a.sent();
                        expect(handler).toHaveBeenCalled();
                        examples = handler.mock.calls[0][0];
                        expect(examples).toContainEqual(example);
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles example selection', function () { return __awaiter(void 0, void 0, void 0, function () {
            var example, selectionHandler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        example = {
                            id: '1',
                            title: 'Test Example',
                            description: 'A test example',
                            code: 'console.log("test");',
                            language: 'typescript',
                            tags: ['test']
                        };
                        selectionHandler = jest.fn();
                        provider.onDidSelectExample(selectionHandler);
                        return [4 /*yield*/, provider.addExample(example)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, provider.selectExample(example.id)];
                    case 2:
                        _a.sent();
                        expect(selectionHandler).toHaveBeenCalledWith(example);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('UI Integration', function () {
        test('renders example list', function () { return __awaiter(void 0, void 0, void 0, function () {
            var examples, listElement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        examples = [
                            {
                                id: '1',
                                title: 'Example 1',
                                description: 'First example',
                                code: 'console.log("first");',
                                language: 'typescript',
                                tags: ['test']
                            },
                            {
                                id: '2',
                                title: 'Example 2',
                                description: 'Second example',
                                code: 'console.log("second");',
                                language: 'typescript',
                                tags: ['test']
                            }
                        ];
                        return [4 /*yield*/, Promise.all(examples.map(function (e) { return provider.addExample(e); }))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, provider.renderExampleList()];
                    case 2:
                        _a.sent();
                        listElement = document.querySelector('.example-list');
                        expect(listElement === null || listElement === void 0 ? void 0 : listElement.children.length).toBe(2);
                        return [2 /*return*/];
                }
            });
        }); });
        test('renders example detail view', function () { return __awaiter(void 0, void 0, void 0, function () {
            var example, detailElement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        example = {
                            id: '1',
                            title: 'Test Example',
                            description: 'A test example',
                            code: 'console.log("test");',
                            language: 'typescript',
                            tags: ['test']
                        };
                        return [4 /*yield*/, provider.addExample(example)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, provider.selectExample(example.id)];
                    case 2:
                        _a.sent();
                        detailElement = document.querySelector('.example-detail');
                        expect(detailElement === null || detailElement === void 0 ? void 0 : detailElement.textContent).toContain('Test Example');
                        expect(detailElement === null || detailElement === void 0 ? void 0 : detailElement.textContent).toContain('A test example');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
