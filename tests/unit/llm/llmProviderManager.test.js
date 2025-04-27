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
var globals_1 = require("@jest/globals");
var llmProviderManager_1 = require("../../../src/llm/llmProviderManager");
var connectionStatusService_1 = require("../../../src/status/connectionStatusService");
var mockFactories_1 = require("../interfaces/mockFactories");
// Mock the ConnectionStatusService
globals_1.jest.mock('../../../src/status/connectionStatusService');
(0, globals_1.describe)('LLMProviderManager', function () {
    var llmProviderManager;
    var mockConnectionStatusService;
    var mockProvider;
    (0, globals_1.beforeEach)(function () {
        // Reset mocks
        globals_1.jest.clearAllMocks();
        // Create a mock ConnectionStatusService
        mockConnectionStatusService = (0, mockFactories_1.createMockConnectionStatusService)();
        // Create the LLMProviderManager instance
        llmProviderManager = new llmProviderManager_1.LLMProviderManager(mockConnectionStatusService);
        // Create a mock LLM provider
        mockProvider = (0, mockFactories_1.createMockLLMProvider)();
    });
    (0, globals_1.afterEach)(function () {
        globals_1.jest.resetAllMocks();
    });
    (0, globals_1.test)('constructor initializes with empty providers map and null active provider', function () {
        // Access private properties using any type casting
        var providers = llmProviderManager._providers;
        var activeProvider = llmProviderManager._activeProvider;
        (0, globals_1.expect)(providers).toBeDefined();
        (0, globals_1.expect)(providers.size).toBe(0);
        (0, globals_1.expect)(activeProvider).toBeNull();
    });
    (0, globals_1.test)('getActiveProvider returns null when no active provider is set', function () {
        (0, globals_1.expect)(llmProviderManager.getActiveProvider()).toBeNull();
    });
    (0, globals_1.test)('getActiveModelName returns null when no active provider is set', function () {
        (0, globals_1.expect)(llmProviderManager.getActiveModelName()).toBeNull();
    });
    (0, globals_1.test)('connect throws error when no active provider is set', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, globals_1.expect)(llmProviderManager.connect()).rejects.toThrow('No LLM provider is active')];
                case 1:
                    _a.sent();
                    // Verify connection status was not updated
                    (0, globals_1.expect)(mockConnectionStatusService.setState).not.toHaveBeenCalledWith(connectionStatusService_1.ConnectionState.Connected);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('connect calls provider.connect() and updates status when active provider is set', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Add a mock provider and set it as active
                    llmProviderManager._activeProvider = mockProvider;
                    return [4 /*yield*/, llmProviderManager.connect()];
                case 1:
                    _a.sent();
                    // Verify provider's connect method was called
                    (0, globals_1.expect)(mockProvider.connect).toHaveBeenCalled();
                    // Verify connection status was updated
                    (0, globals_1.expect)(mockConnectionStatusService.setState).toHaveBeenCalledWith(connectionStatusService_1.ConnectionState.Connected, globals_1.expect.objectContaining({
                        modelName: globals_1.expect.any(String),
                        providerName: globals_1.expect.any(String)
                    }));
                    // Verify notification was shown
                    (0, globals_1.expect)(mockConnectionStatusService.showNotification).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('connect handles errors and updates status accordingly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var errorProvider;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errorProvider = (0, mockFactories_1.createMockLLMProvider)({
                        connect: globals_1.jest.fn().mockRejectedValue(new Error('Connection failed'))
                    });
                    llmProviderManager._activeProvider = errorProvider;
                    return [4 /*yield*/, (0, globals_1.expect)(llmProviderManager.connect()).rejects.toThrow('Connection failed')];
                case 1:
                    _a.sent();
                    // Verify error status was set
                    (0, globals_1.expect)(mockConnectionStatusService.setState).toHaveBeenCalledWith(connectionStatusService_1.ConnectionState.Error, globals_1.expect.any(Object));
                    // Verify error notification was shown
                    (0, globals_1.expect)(mockConnectionStatusService.showNotification).toHaveBeenCalledWith(globals_1.expect.stringContaining('Failed to connect to LLM:'), 'error');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('disconnect does nothing when no active provider is set', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, llmProviderManager.disconnect()];
                case 1:
                    _a.sent();
                    // Verify connection status was not updated
                    (0, globals_1.expect)(mockConnectionStatusService.setState).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('disconnect calls provider.disconnect() and updates status when active provider is set', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Add a mock provider and set it as active
                    llmProviderManager._activeProvider = mockProvider;
                    return [4 /*yield*/, llmProviderManager.disconnect()];
                case 1:
                    _a.sent();
                    // Verify provider's disconnect method was called
                    (0, globals_1.expect)(mockProvider.disconnect).toHaveBeenCalled();
                    // Verify connection status was updated
                    (0, globals_1.expect)(mockConnectionStatusService.setState).toHaveBeenCalledWith(connectionStatusService_1.ConnectionState.Disconnected);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('disconnect handles errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var errorProvider;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errorProvider = (0, mockFactories_1.createMockLLMProvider)({
                        disconnect: globals_1.jest.fn().mockRejectedValue(new Error('Disconnection failed'))
                    });
                    llmProviderManager._activeProvider = errorProvider;
                    return [4 /*yield*/, (0, globals_1.expect)(llmProviderManager.disconnect()).rejects.toThrow('Disconnection failed')];
                case 1:
                    _a.sent();
                    // Verify error status was set
                    (0, globals_1.expect)(mockConnectionStatusService.setState).toHaveBeenCalledWith(connectionStatusService_1.ConnectionState.Error);
                    // Verify error notification was shown
                    (0, globals_1.expect)(mockConnectionStatusService.showNotification).toHaveBeenCalledWith(globals_1.expect.stringContaining('Failed to disconnect from LLM:'), 'error');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('setActiveModel updates the state with new model name', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Add a mock provider and set it as active
                    llmProviderManager._activeProvider = mockProvider;
                    return [4 /*yield*/, llmProviderManager.setActiveModel('new-model')];
                case 1:
                    _a.sent();
                    // Verify connection status was updated with the new model name
                    (0, globals_1.expect)(mockConnectionStatusService.setState).toHaveBeenCalledWith(globals_1.expect.any(String), globals_1.expect.objectContaining({
                        modelName: 'new-model',
                        providerName: globals_1.expect.any(String)
                    }));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('dispose method releases resources', function () {
        llmProviderManager.dispose();
        // Additional verification could be added here if the dispose method is enhanced
        // Currently the method is mostly a placeholder in the original implementation
    });
    (0, globals_1.test)('sendPromptWithLanguage should use the correct language for responses', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockProvider;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockProvider = (0, mockFactories_1.createMockLLMProvider)();
                    llmProviderManager._activeProvider = mockProvider;
                    return [4 /*yield*/, llmProviderManager.sendPromptWithLanguage('Hello', {}, 'es')];
                case 1:
                    _a.sent();
                    // Expect that the prompt was sent with language context
                    (0, globals_1.expect)(mockProvider.generateCompletion).toHaveBeenCalledWith(globals_1.expect.any(String), globals_1.expect.stringContaining('Spanish'), undefined, globals_1.expect.any(Object));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('sendPromptWithLanguage should correct responses in wrong language', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockProvider, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockProvider = (0, mockFactories_1.createMockLLMProvider)();
                    llmProviderManager._activeProvider = mockProvider;
                    llmProviderManager.multilingualManager = {
                        isResponseInExpectedLanguage: globals_1.jest.fn().mockReturnValue(false),
                        buildLanguageCorrectionPrompt: globals_1.jest.fn().mockReturnValue('Please correct the language'),
                        enhancePromptWithLanguage: globals_1.jest.fn().mockReturnValue('Enhanced prompt')
                    };
                    // Mock the provider responses
                    globals_1.jest.spyOn(mockProvider, 'generateCompletion')
                        .mockResolvedValueOnce({ content: 'Response in wrong language' })
                        .mockResolvedValueOnce({ content: 'Corrected response' });
                    return [4 /*yield*/, llmProviderManager.sendPromptWithLanguage('Hello', {}, 'fr')];
                case 1:
                    response = _a.sent();
                    (0, globals_1.expect)(response).toBe('Corrected response');
                    (0, globals_1.expect)(mockProvider.generateCompletion).toHaveBeenCalledTimes(2);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('sendStreamingPrompt should handle streaming responses', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockProvider, chunks, callback;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockProvider = (0, mockFactories_1.createMockLLMProvider)();
                    llmProviderManager._activeProvider = mockProvider;
                    chunks = [];
                    callback = function (chunk) { return chunks.push(chunk); };
                    // Mock the streamCompletion method
                    globals_1.jest.spyOn(mockProvider, 'streamCompletion').mockImplementationOnce(function (model, prompt, systemPrompt, options, cb) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            cb === null || cb === void 0 ? void 0 : cb({ content: 'Test', done: false });
                            cb === null || cb === void 0 ? void 0 : cb({ content: ' response', done: true });
                            return [2 /*return*/];
                        });
                    }); });
                    return [4 /*yield*/, llmProviderManager.sendStreamingPrompt('Test prompt', callback)];
                case 1:
                    _a.sent();
                    (0, globals_1.expect)(mockProvider.streamCompletion).toHaveBeenCalledWith(globals_1.expect.any(String), 'Test prompt', undefined, undefined, globals_1.expect.any(Function));
                    (0, globals_1.expect)(chunks).toEqual(['Test', ' response']);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('sendStreamingPrompt throws error when no provider is set', function () { return __awaiter(void 0, void 0, void 0, function () {
        var callback;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    callback = function (chunk) { };
                    return [4 /*yield*/, (0, globals_1.expect)(llmProviderManager.sendStreamingPrompt('Test prompt', callback)).rejects.toThrow('No LLM provider is currently connected')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('setOfflineMode should call provider method if available', function () {
        var mockProvider = (0, mockFactories_1.createMockLLMProvider)({
            setOfflineMode: globals_1.jest.fn()
        });
        llmProviderManager._activeProvider = mockProvider;
        llmProviderManager.setOfflineMode(true);
        (0, globals_1.expect)(mockProvider.setOfflineMode).toHaveBeenCalledWith(true);
    });
    (0, globals_1.test)('sendPrompt should use cached responses in offline mode', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockProvider, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockProvider = (0, mockFactories_1.createMockLLMProvider)({
                        useCachedResponse: globals_1.jest.fn().mockResolvedValue('Cached response'),
                        generateCompletion: globals_1.jest.fn()
                    });
                    llmProviderManager._activeProvider = mockProvider;
                    mockProvider._offlineMode = true;
                    return [4 /*yield*/, llmProviderManager.sendPrompt('Test prompt')];
                case 1:
                    response = _a.sent();
                    (0, globals_1.expect)(mockProvider.generateCompletion).toHaveBeenCalledWith(globals_1.expect.any(String), 'Test prompt', undefined, undefined);
                    (0, globals_1.expect)(response).toBe('Cached response');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('sendPrompt should cache responses', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockProvider;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockProvider = (0, mockFactories_1.createMockLLMProvider)({
                        generateCompletion: globals_1.jest.fn().mockResolvedValue({ content: 'New response' }),
                        cacheResponse: globals_1.jest.fn()
                    });
                    llmProviderManager._activeProvider = mockProvider;
                    return [4 /*yield*/, llmProviderManager.sendPrompt('Test prompt')];
                case 1:
                    _a.sent();
                    (0, globals_1.expect)(mockProvider.cacheResponse).toHaveBeenCalledWith('Test prompt', 'New response');
                    return [2 /*return*/];
            }
        });
    }); });
});
