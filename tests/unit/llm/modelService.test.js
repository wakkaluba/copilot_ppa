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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var sinon = require("sinon");
var assert_1 = require("assert");
var axios_1 = require("axios");
var modelService_1 = require("../../../src/llm/modelService");
// Test stubs
var sandbox;
var mockContext;
describe('LLMModelService Tests', function () {
    // Test sandbox
    var sandbox;
    // VSCode window stubs
    var createStatusBarItemStub;
    var createOutputChannelStub;
    var createWebviewPanelStub;
    var showQuickPickStub;
    var showInformationMessageStub;
    var showWarningMessageStub;
    var showErrorMessageStub;
    var withProgressStub;
    // VSCode commands and workspace stubs
    var registerCommandStub;
    var getConfigurationStub;
    // Mock objects
    var mockStatusBarItem;
    var mockOutputChannel;
    var mockConfig;
    // External API stubs
    var axiosGetStub;
    beforeEach(function () {
        var _a;
        sandbox = sinon.createSandbox();
        // Mock status bar item
        mockStatusBarItem = {
            text: '',
            tooltip: '',
            command: '',
            show: sandbox.stub(),
            hide: sandbox.stub(),
            dispose: sandbox.stub()
        };
        // Mock output channel
        mockOutputChannel = {
            appendLine: sandbox.stub(),
            clear: sandbox.stub(),
            show: sandbox.stub(),
            dispose: sandbox.stub()
        };
        // Mock config
        mockConfig = {
            get: sandbox.stub().callsFake(function (key, defaultValue) { return defaultValue; })
        };
        // Mock VS Code APIs
        createStatusBarItemStub = sandbox.stub(vscode.window, 'createStatusBarItem').returns(mockStatusBarItem);
        createOutputChannelStub = sandbox.stub(vscode.window, 'createOutputChannel').returns(mockOutputChannel);
        registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand').returns({ dispose: sandbox.stub() });
        getConfigurationStub = sandbox.stub(vscode.workspace, 'getConfiguration').returns(mockConfig);
        // Fix the withProgress stub to properly handle progress reporting and promise resolution
        withProgressStub = sandbox.stub(vscode.window, 'withProgress').callsFake(function (options, callback) { return __awaiter(void 0, void 0, void 0, function () {
            var progress, token, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        progress = {
                            report: sandbox.stub()
                        };
                        token = new vscode.CancellationTokenSource().token;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, callback(progress, token)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error in withProgress:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves({ title: 'OK' });
        showWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage').resolves({ title: 'OK' });
        showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage').resolves({ title: 'OK' });
        // Mock webview panel with complete properties and event emitters
        var webviewMessageHandler = new vscode.EventEmitter();
        var onDidDisposeEmitter = new vscode.EventEmitter();
        var onDidChangeViewStateEmitter = new vscode.EventEmitter();
        // Fix the webview panel mock creation
        createWebviewPanelStub = sandbox.stub(vscode.window, 'createWebviewPanel').returns({
            viewType: 'modelCompatibility',
            title: 'Model Compatibility',
            webview: {
                html: '',
                onDidReceiveMessage: webviewMessageHandler.event,
                postMessage: sandbox.stub().resolves(true),
                asWebviewUri: function (uri) { return uri; },
                options: { enableScripts: true },
                cspSource: ''
            },
            dispose: function () { },
            onDidDispose: onDidDisposeEmitter.event,
            onDidChangeViewState: onDidChangeViewStateEmitter.event,
            reveal: sandbox.stub(),
            visible: true,
            active: true,
            options: {},
            viewColumn: vscode.ViewColumn.One
        });
        // Mock quick pick to support different return values per test
        showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick').callsFake(function (items) {
            // Return first item if items is an array
            if (Array.isArray(items) && items.length > 0) {
                return Promise.resolve(items[0]);
            }
            // Default response
            return Promise.resolve({
                label: 'Test Model',
                detail: 'Recommended model for testing',
                description: '4GB'
            });
        });
        // Ensure axios.get returns a properly structured response
        axiosGetStub = sandbox.stub(axios_1.default, 'get').callsFake(function (url) {
            if (url === 'http://localhost:11434/api/tags') {
                return Promise.resolve({
                    data: {
                        models: [
                            { name: 'llama2', modified_at: '2023-07-25T14:33:40Z', size: 3791730298 }
                        ]
                    }
                });
            }
            return Promise.reject(new Error("Unmocked URL: ".concat(url)));
        });
        // Mock extension context
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            extensionUri: vscode.Uri.parse('file:///test/path'),
            storageUri: vscode.Uri.parse('file:///test/storage'),
            globalStorageUri: vscode.Uri.parse('file:///test/globalStorage'),
            logUri: vscode.Uri.parse('file:///test/log'),
            asAbsolutePath: function (p) { return "/test/path/".concat(p); },
            storagePath: '/test/storagePath',
            globalStoragePath: '/test/globalStoragePath',
            logPath: '/test/logPath',
            extensionMode: vscode.ExtensionMode.Development,
            globalState: {
                keys: function () { return []; },
                get: function (key) { return undefined; },
                update: function (key, value) { return Promise.resolve(); },
                setKeysForSync: function (keys) { }
            },
            workspaceState: {
                keys: function () { return []; },
                get: function (key) { return undefined; },
                update: function (key, value) { return Promise.resolve(); }
            },
            secrets: {
                get: function (key) { return Promise.resolve(undefined); },
                store: function (key, value) { return Promise.resolve(); },
                delete: function (key) { return Promise.resolve(); },
                onDidChange: new vscode.EventEmitter().event
            },
            environmentVariableCollection: (_a = {
                    persistent: true,
                    description: undefined,
                    replace: function (variable, value) { },
                    append: function (variable, value) { },
                    prepend: function (variable, value) { },
                    get: function (variable) { return undefined; },
                    forEach: function (callback, thisArg) { },
                    delete: function (variable) { },
                    clear: function () { },
                    getScoped: function (scope) {
                        var _a;
                        return (_a = {
                                persistent: true,
                                description: undefined,
                                replace: function () { },
                                append: function () { },
                                prepend: function () { },
                                get: function () { return undefined; },
                                forEach: function () { },
                                delete: function () { },
                                clear: function () { }
                            },
                            _a[Symbol.iterator] = function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [5 /*yield**/, __values([])];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            }); },
                            _a);
                    }
                },
                _a[Symbol.iterator] = function () { return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [5 /*yield**/, __values([])];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                }); },
                _a),
            extension: {
                id: 'test-extension',
                extensionUri: vscode.Uri.parse('file:///test/path'),
                extensionPath: '/test/path',
                isActive: true,
                packageJSON: {},
                exports: undefined,
                activate: function () { return Promise.resolve(); },
                extensionKind: vscode.ExtensionKind.Workspace
            },
            languageModelAccessInformation: {
                onDidChange: new vscode.EventEmitter().event,
                canSendRequest: function (chat) { return true; }
            }
        };
        // Mock internal methods on the prototype to apply to all instances
        sandbox.stub(modelService_1.LLMModelService.prototype, 'getHardwareSpecs').resolves({
            gpu: {
                name: 'Test GPU',
                memory: 4096,
                available: true,
                vram: 4096,
                cudaSupport: true
            },
            ram: { total: 16384, free: 8192 },
            cpu: {
                cores: 8,
                model: 'Test CPU',
                speed: 3.2
            }
        });
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should initialize correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var modelService;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    modelService = new modelService_1.LLMModelService(mockContext);
                    // Directly await initialization rather than using setTimeout
                    return [4 /*yield*/, modelService.initPromise];
                case 1:
                    // Directly await initialization rather than using setTimeout
                    _a.sent();
                    assert_1.default.ok(createStatusBarItemStub.called, 'Should create status bar item');
                    assert_1.default.ok(createOutputChannelStub.calledWith('LLM Models'), 'Should create output channel');
                    assert_1.default.ok(registerCommandStub.calledWith('copilot-ppa.getModelRecommendations'), 'Should register getModelRecommendations command');
                    assert_1.default.ok(registerCommandStub.calledWith('copilot-ppa.checkCudaSupport'), 'Should register checkCudaSupport command');
                    assert_1.default.ok(registerCommandStub.calledWith('copilot-ppa.checkModelCompatibility'), 'Should register checkModelCompatibility command');
                    assert_1.default.ok(mockStatusBarItem.show.called, 'Should show status bar item');
                    return [2 /*return*/];
            }
        });
    }); });
    describe('getModelRecommendations', function () {
        var modelService;
        var mockHardwareSpecs = {
            gpu: {
                name: 'Test GPU',
                memory: 4096,
                available: true,
                vram: 4096,
                cudaSupport: true
            },
            ram: {
                total: 16384,
                free: 8192
            },
            cpu: {
                cores: 8,
                model: 'Test CPU',
                speed: 3.2
            }
        };
        beforeEach(function () {
            modelService = new modelService_1.LLMModelService(mockContext);
            // Mock the methods that we don't want to test directly
            modelService.getHardwareSpecs = sandbox.stub().resolves(mockHardwareSpecs);
            modelService.getOllamaModels = sandbox.stub().resolves([]);
            modelService.getLMStudioModels = sandbox.stub().resolves([]);
            modelService.getDefaultRecommendations = sandbox.stub().returns([
                { label: 'Default Model', description: '4GB', detail: 'Test model' }
            ]);
            // Stub the Ollama API call specifically
            axiosGetStub.withArgs('http://localhost:11434/api/tags').resolves({
                data: {
                    models: [
                        { name: 'llama2', modified_at: '2023-07-25T14:33:40Z', size: 3791730298 }
                    ]
                }
            });
        });
        it('should handle successful Ollama model list', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockOllamaModels, quickPickArgs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockOllamaModels = [
                            { label: 'llama2', description: '4GB', detail: 'A language model' },
                            { label: 'mistral', description: '4GB', detail: 'Another language model' }
                        ];
                        // Make getOllamaModels return the mock models
                        modelService.getOllamaModels = sandbox.stub().resolves(mockOllamaModels);
                        return [4 /*yield*/, modelService.getModelRecommendations()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(withProgressStub.called, 'Should display progress');
                        assert_1.default.ok(showQuickPickStub.called, 'Should show quick pick with models');
                        quickPickArgs = showQuickPickStub.firstCall.args[0];
                        assert_1.default.ok(Array.isArray(quickPickArgs), 'Quick pick should receive an array');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle when no models are available', function () { return __awaiter(void 0, void 0, void 0, function () {
            var defaultRecommendations, quickPickArgs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Force empty arrays for all model sources
                        modelService.getOllamaModels = sandbox.stub().resolves([]);
                        modelService.getLMStudioModels = sandbox.stub().resolves([]);
                        defaultRecommendations = [
                            { label: 'Default Model', description: '4GB', detail: 'Recommended model' }
                        ];
                        modelService.getDefaultRecommendations = sandbox.stub().returns(defaultRecommendations);
                        return [4 /*yield*/, modelService.getModelRecommendations()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(withProgressStub.called, 'Should display progress');
                        assert_1.default.ok(showQuickPickStub.called, 'Should show quick pick with recommendations');
                        quickPickArgs = showQuickPickStub.firstCall.args[0];
                        assert_1.default.ok(Array.isArray(quickPickArgs), 'Quick pick should receive an array');
                        assert_1.default.deepStrictEqual(quickPickArgs, defaultRecommendations, 'Should show default recommendations');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Force an error during recommendations process
                        modelService.getOllamaModels = sandbox.stub().throws(new Error('Test error'));
                        return [4 /*yield*/, modelService.getModelRecommendations()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(showErrorMessageStub.called, 'Should show error message');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should generate recommendations based on hardware specs', function () { return __awaiter(void 0, void 0, void 0, function () {
            var defaultRecommendations, quickPickArgs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        defaultRecommendations = [
                            { label: 'Model 7B', description: '4GB', detail: 'Small model' },
                            { label: 'Model 13B', description: '8GB', detail: 'Medium model' }
                        ];
                        modelService.getDefaultRecommendations = sandbox.stub().returns(defaultRecommendations);
                        return [4 /*yield*/, modelService.getModelRecommendations()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(withProgressStub.called, 'Should display progress');
                        assert_1.default.ok(showQuickPickStub.called, 'Should show quick pick with recommendations');
                        quickPickArgs = showQuickPickStub.firstCall.args[0];
                        assert_1.default.ok(Array.isArray(quickPickArgs), 'Quick pick should receive an array');
                        assert_1.default.deepStrictEqual(quickPickArgs, defaultRecommendations, 'Should show hardware-based recommendations');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle Ollama API failure gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock a failed API response
                        modelService.getOllamaModels = sandbox.stub().rejects(new Error('Connection refused'));
                        return [4 /*yield*/, modelService.getModelRecommendations()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(withProgressStub.called, 'Should display progress');
                        assert_1.default.ok(showQuickPickStub.called, 'Should show quick pick with default models');
                        assert_1.default.ok(mockOutputChannel.appendLine.calledWith(sinon.match(/Error getting Ollama models/)), 'Should log the error');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should filter models based on hardware compatibility', function () { return __awaiter(void 0, void 0, void 0, function () {
            var limitedHardware, mockModels;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        limitedHardware = __assign(__assign({}, mockHardwareSpecs), { gpu: __assign(__assign({}, mockHardwareSpecs.gpu), { vram: 2048, memory: 2048 }) });
                        modelService.getHardwareSpecs = sandbox.stub().resolves(limitedHardware);
                        mockModels = [
                            { label: 'small-model', description: '2GB', detail: 'Compatible model' },
                            { label: 'large-model', description: '8GB', detail: 'Incompatible model' }
                        ];
                        modelService.getOllamaModels = sandbox.stub().resolves(mockModels);
                        return [4 /*yield*/, modelService.getModelRecommendations()];
                    case 1:
                        _a.sent();
                        // Verify that showQuickPick was called with filtered models
                        assert_1.default.ok(showQuickPickStub.calledWith(sinon.match.array.deepEquals([
                            { label: 'small-model', description: '2GB', detail: 'Compatible model' }
                        ])), 'Should filter out incompatible models');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('checkCudaSupport', function () {
        var modelService;
        beforeEach(function () {
            modelService = new modelService_1.LLMModelService(mockContext);
        });
        it('should show success message when CUDA is available', function () { return __awaiter(void 0, void 0, void 0, function () {
            var specWithCuda;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        specWithCuda = {
                            gpu: {
                                name: 'Test GPU',
                                memory: 4096,
                                available: true,
                                vram: 4096,
                                cudaSupport: true
                            },
                            ram: { total: 16384, free: 8192 },
                            cpu: { cores: 8, model: 'Test CPU', speed: 3.2 }
                        };
                        modelService.getHardwareSpecs = sandbox.stub().resolves(specWithCuda);
                        return [4 /*yield*/, modelService.checkCudaSupport()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(showInformationMessageStub.calledWith(sinon.match(/CUDA support detected/)), 'Should show CUDA detected message');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show warning when GPU is available but no CUDA', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelService;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelService = new modelService_1.LLMModelService(mockContext);
                        // Mock hardware specs with GPU but no CUDA
                        modelService.getHardwareSpecs = sinon.stub().resolves({
                            gpu: {
                                name: 'Test GPU',
                                memory: 4096,
                                available: true,
                                vram: 4096,
                                cudaSupport: false
                            },
                            ram: { total: 16384, free: 8192 },
                            cpu: { cores: 8, model: 'Test CPU', speed: 3.2 }
                        });
                        return [4 /*yield*/, modelService.checkCudaSupport()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(showInformationMessageStub.calledWith(sinon.match(/GPU detected, but CUDA support not available/)), 'Should show GPU without CUDA message');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show warning when no GPU is available', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelService;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelService = new modelService_1.LLMModelService(mockContext);
                        // Mock hardware specs without GPU
                        modelService.getHardwareSpecs = sinon.stub().resolves({
                            gpu: {
                                name: 'None',
                                memory: 0,
                                available: false
                            },
                            ram: { total: 16384, free: 8192 },
                            cpu: { cores: 8, model: 'Test CPU', speed: 3.2 }
                        });
                        return [4 /*yield*/, modelService.checkCudaSupport()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(showWarningMessageStub.calledWith(sinon.match(/No GPU with CUDA support detected/)), 'Should show no GPU message');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show information message when CUDA is supported', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock GPU with CUDA support
                        modelService.getHardwareSpecs = sandbox.stub().resolves({
                            gpu: {
                                name: 'NVIDIA GPU',
                                memory: 4096,
                                available: true,
                                vram: 4096,
                                cudaSupport: true
                            },
                            ram: { total: 16384, free: 8192 },
                            cpu: { cores: 8, model: 'Test CPU', speed: 3.2 }
                        });
                        return [4 /*yield*/, modelService.checkCudaSupport()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(showInformationMessageStub.calledWith(sinon.match(/CUDA is supported/)), 'Should show message confirming CUDA support');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show warning message when CUDA is not supported', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock GPU without CUDA support
                        modelService.getHardwareSpecs = sandbox.stub().resolves({
                            gpu: {
                                name: 'AMD GPU',
                                memory: 4096,
                                available: true,
                                vram: 4096,
                                cudaSupport: false
                            },
                            ram: { total: 16384, free: 8192 },
                            cpu: { cores: 8, model: 'Test CPU', speed: 3.2 }
                        });
                        return [4 /*yield*/, modelService.checkCudaSupport()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(showWarningMessageStub.calledWith(sinon.match(/CUDA is not supported/)), 'Should show warning about missing CUDA support');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('checkModelCompatibility', function () {
        var modelService;
        var mockHardwareSpecs = {
            gpu: {
                name: 'Test GPU',
                memory: 4096,
                available: true,
                vram: 4096,
                cudaSupport: true
            },
            ram: {
                total: 16384,
                free: 8192
            },
            cpu: {
                cores: 8,
                model: 'Test CPU',
                speed: 3.2
            }
        };
        beforeEach(function () {
            modelService = new modelService_1.LLMModelService(mockContext);
            // Mock the model size estimation method
            modelService.getModelSizeEstimation = sandbox.stub().returns({
                vram: 4000,
                ram: 8000,
                recommendedVram: 6000,
                recommendedRam: 16000
            });
        });
        it('should show compatibility message for suitable model', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock hardware specs with good specs
                        modelService.getHardwareSpecs = sandbox.stub().resolves({
                            gpu: {
                                name: 'Test GPU',
                                memory: 8192,
                                available: true,
                                vram: 8192,
                                cudaSupport: true
                            },
                            ram: { total: 32768, free: 16384 },
                            cpu: { cores: 12, model: 'Test CPU', speed: 3.2 }
                        });
                        // Mock configuration to return specific values
                        mockConfig.get.withArgs('provider', sinon.match.any).returns('ollama');
                        mockConfig.get.withArgs('modelId', sinon.match.any).returns('llama2');
                        return [4 /*yield*/, modelService.checkModelCompatibility()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(showInformationMessageStub.called, 'Should show information message');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show warning for large model with insufficient RAM', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelService;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelService = new modelService_1.LLMModelService(mockContext);
                        // Mock hardware specs with limited RAM
                        modelService.getHardwareSpecs = sinon.stub().resolves({
                            gpu: {
                                name: 'Test GPU',
                                memory: 8192,
                                available: true,
                                vram: 8192,
                                cudaSupport: true
                            },
                            ram: { total: 8192, free: 4096 },
                            cpu: { cores: 8, model: 'Test CPU', speed: 3.2 }
                        });
                        // Mock configuration for large model
                        mockConfig.get.withArgs('provider', 'ollama').returns('ollama');
                        mockConfig.get.withArgs('modelId', 'llama2').returns('llama2-13b');
                        return [4 /*yield*/, modelService.checkModelCompatibility()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(showWarningMessageStub.calledWith(sinon.match(/may be too large for your system/)), 'Should show warning for large model');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle errors during compatibility check', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelService;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelService = new modelService_1.LLMModelService(mockContext);
                        // Force an error during hardware detection
                        modelService.getHardwareSpecs = sinon.stub().rejects(new Error('Hardware detection failed'));
                        return [4 /*yield*/, modelService.checkModelCompatibility()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(showErrorMessageStub.calledWith(sinon.match(/Error checking model compatibility/)), 'Should show error message when compatibility check fails');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show compatibility information for installed models', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock installed models
                        modelService.getOllamaModels = sandbox.stub().resolves([
                            { label: 'llama2', description: '4GB', detail: 'A language model' }
                        ]);
                        // Mock hardware specs
                        modelService.getHardwareSpecs = sandbox.stub().resolves(mockHardwareSpecs);
                        return [4 /*yield*/, modelService.checkModelCompatibility()];
                    case 1:
                        _a.sent();
                        // Verify that a webview panel is created to display compatibility info
                        assert_1.default.ok(createWebviewPanelStub.called, 'Should create webview panel for compatibility info');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle no installed models scenario', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock no installed models
                        modelService.getOllamaModels = sandbox.stub().resolves([]);
                        modelService.getLMStudioModels = sandbox.stub().resolves([]);
                        return [4 /*yield*/, modelService.checkModelCompatibility()];
                    case 1:
                        _a.sent();
                        assert_1.default.ok(showInformationMessageStub.calledWith(sinon.match(/No models installed/)), 'Should show message about no installed models');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getHardwareSpecs', function () {
        var modelService;
        var execStub;
        beforeEach(function () {
            modelService = new modelService_1.LLMModelService(mockContext);
            // Create a stub for child_process.exec that works
            execStub = sandbox.stub();
            var childProcess = require('child_process');
            if (childProcess.exec) {
                execStub = sandbox.stub(childProcess, 'exec');
            }
        });
        afterEach(function () {
            if (execStub.restore) {
                execStub.restore();
            }
        });
        it('should handle errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var specs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Make sure execStub is properly set up
                        if (execStub.callsFake) {
                            execStub.callsFake(function (cmd, callback) {
                                callback(new Error('Mock error'), '', 'Command failed');
                            });
                        }
                        return [4 /*yield*/, modelService.getHardwareSpecs()];
                    case 1:
                        specs = _a.sent();
                        // Even with errors, it should return an object with default values
                        assert_1.default.ok(specs, 'Should return a specs object');
                        assert_1.default.ok(specs.gpu, 'Should have gpu object');
                        assert_1.default.ok(specs.ram, 'Should have ram object');
                        assert_1.default.ok(specs.cpu, 'Should have cpu object');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getOllamaModels', function () {
        var modelService;
        beforeEach(function () {
            modelService = new modelService_1.LLMModelService(mockContext);
        });
        it('should correctly parse Ollama API response', function () { return __awaiter(void 0, void 0, void 0, function () {
            var models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Setup mock response
                        axiosGetStub.withArgs('http://localhost:11434/api/tags').resolves({
                            data: {
                                models: [
                                    { name: 'llama2', modified_at: '2023-07-25T14:33:40Z', size: 3791730298 },
                                    { name: 'mistral', modified_at: '2023-08-15T10:22:15Z', size: 4815162342 }
                                ]
                            }
                        });
                        return [4 /*yield*/, modelService.getOllamaModels()];
                    case 1:
                        models = _a.sent();
                        assert_1.default.strictEqual(models.length, 2, 'Should return two models');
                        assert_1.default.strictEqual(models[0].label, 'llama2', 'First model should be llama2');
                        assert_1.default.strictEqual(models[1].label, 'mistral', 'Second model should be mistral');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle connection errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Setup mock error response
                        axiosGetStub.withArgs('http://localhost:11434/api/tags').rejects(new Error('Connection refused'));
                        return [4 /*yield*/, modelService.getOllamaModels()];
                    case 1:
                        models = _a.sent();
                        assert_1.default.deepStrictEqual(models, [], 'Should return empty array on error');
                        assert_1.default.ok(mockOutputChannel.appendLine.calledWith(sinon.match(/Error/)), 'Should log the error');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updateStatusBarItem', function () {
        var modelService;
        beforeEach(function () {
            modelService = new modelService_1.LLMModelService(mockContext);
        });
        it('should update status bar with active model', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Wait for initialization
                    return [4 /*yield*/, modelService.initPromise];
                    case 1:
                        // Wait for initialization
                        _a.sent();
                        // Call the method with a model name
                        return [4 /*yield*/, modelService.updateStatusBarItem('llama2')];
                    case 2:
                        // Call the method with a model name
                        _a.sent();
                        assert_1.default.ok(mockStatusBarItem.text.includes('llama2'), 'Status bar should show model name');
                        assert_1.default.ok(mockStatusBarItem.show.called, 'Status bar should be shown');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle no active model', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Wait for initialization
                    return [4 /*yield*/, modelService.initPromise];
                    case 1:
                        // Wait for initialization
                        _a.sent();
                        // Call the method with no model
                        return [4 /*yield*/, modelService.updateStatusBarItem()];
                    case 2:
                        // Call the method with no model
                        _a.sent();
                        assert_1.default.ok(mockStatusBarItem.text.includes('No Model'), 'Status bar should show No Model');
                        assert_1.default.ok(mockStatusBarItem.show.called, 'Status bar should be shown');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
