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
var llmProviderManager_1 = require("../../src/llm/llmProviderManager");
var connectionStatusService_1 = require("../../src/status/connectionStatusService");
var sinon = require("sinon");
var assert = require("assert");
var vscode = require("vscode");
var MockConnectionStatusService_1 = require("../__testUtils__/MockConnectionStatusService");
var MockLLMProvider_1 = require("../__testUtils__/MockLLMProvider");
// Create mock status bar item factory
var createMockStatusBarItem = function () { return ({
    id: 'mock-status-bar',
    name: 'Mock Status Bar',
    tooltip: '',
    text: '',
    command: undefined,
    color: undefined,
    backgroundColor: undefined,
    alignment: vscode.StatusBarAlignment.Left,
    priority: 0,
    accessibilityInformation: { label: 'Mock Status', role: 'Status' },
    show: function () { },
    hide: function () { },
    dispose: function () { }
}); };
suite('LLMProviderManager Tests', function () {
    var providerManager;
    var mockProvider;
    var statusService;
    var sandbox;
    setup(function () {
        sandbox = sinon.createSandbox();
        mockProvider = new MockLLMProvider_1.MockLLMProvider();
        statusService = new MockConnectionStatusService_1.MockConnectionStatusService();
        // Stub the status service methods to track calls
        sinon.stub(statusService, 'setState');
        sinon.stub(statusService, 'showNotification');
        providerManager = new llmProviderManager_1.LLMProviderManager(statusService);
        // Set up active provider
        providerManager._activeProvider = mockProvider;
    });
    teardown(function () {
        sandbox.restore();
    });
    test('connect should establish connection with active provider', function () { return __awaiter(void 0, void 0, void 0, function () {
        var connectStub;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connectStub = sinon.stub(mockProvider, 'connect').resolves();
                    return [4 /*yield*/, providerManager.connect()];
                case 1:
                    _a.sent();
                    assert.strictEqual(connectStub.calledOnce, true);
                    sinon.assert.calledWith(statusService.setState, connectionStatusService_1.ConnectionState.Connected, sinon.match.object);
                    return [2 /*return*/];
            }
        });
    }); });
    test('connect should handle errors appropriately', function () { return __awaiter(void 0, void 0, void 0, function () {
        var connectStub;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connectStub = sinon.stub(mockProvider, 'connect').rejects(new Error('Connection failed'));
                    return [4 /*yield*/, assert.rejects(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, providerManager.connect()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, /Connection failed/)];
                case 1:
                    _a.sent();
                    sinon.assert.calledWith(statusService.setState, connectionStatusService_1.ConnectionState.Error, sinon.match.object);
                    return [2 /*return*/];
            }
        });
    }); });
    test('disconnect should properly disconnect active provider', function () { return __awaiter(void 0, void 0, void 0, function () {
        var disconnectStub;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Set provider as connected
                    mockProvider.connect(); // This will set the isConnected status to true
                    disconnectStub = sinon.stub(mockProvider, 'disconnect').resolves();
                    return [4 /*yield*/, providerManager.disconnect()];
                case 1:
                    _a.sent();
                    assert.strictEqual(disconnectStub.calledOnce, true);
                    sinon.assert.calledWith(statusService.setState, connectionStatusService_1.ConnectionState.Disconnected);
                    return [2 /*return*/];
            }
        });
    }); });
    test('setActiveModel should update provider model', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, providerManager.setActiveModel('model2')];
                case 1:
                    _a.sent();
                    // Verify status was updated
                    sinon.assert.calledWith(statusService.setState, connectionStatusService_1.ConnectionState.Connected, {
                        modelName: 'model2',
                        providerName: 'MockProvider' // From our mock provider
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    test('getActiveProvider should return current provider', function () {
        var provider = providerManager.getActiveProvider();
        assert.strictEqual(provider, mockProvider);
    });
    test('getActiveModelName should return current model name', function () {
        // Set a model name in the provider status
        mockProvider.status = __assign(__assign({}, mockProvider.getStatus()), { activeModel: 'model1' });
        var modelName = providerManager.getActiveModelName();
        assert.strictEqual(modelName, 'model1');
    });
    test('dispose should clean up resources', function () {
        providerManager.dispose();
        // Verify the active provider is cleared
        assert.strictEqual(providerManager._activeProvider, null);
    });
});
