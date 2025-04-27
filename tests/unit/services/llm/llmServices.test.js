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
var assert = require("assert");
var sinon = require("sinon");
var llm_1 = require("../../../../src/services/llm");
// Mock fetch API
global.fetch = jest.fn();
describe('LLM Services', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
        // Reset fetch mock
        global.fetch.mockReset();
        // Mock VS Code API
        sandbox.stub(vscode.window, 'createStatusBarItem').returns({
            text: '',
            tooltip: '',
            show: sandbox.stub(),
            hide: sandbox.stub(),
            dispose: sandbox.stub()
        });
        sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: sandbox.stub().callsFake(function (key, defaultValue) { return defaultValue; })
        });
    });
    afterEach(function () {
        sandbox.restore();
    });
    describe('LLMConnectionManager', function () {
        var connectionManager;
        var hostManagerStub;
        beforeEach(function () {
            // Create stub for host manager
            hostManagerStub = {
                on: sandbox.stub(),
                emit: sandbox.stub(),
                isRunning: sandbox.stub().returns(false),
                startHost: sandbox.stub().resolves(),
                stopHost: sandbox.stub().resolves(),
                restartHost: sandbox.stub().resolves(),
                dispose: sandbox.stub(),
                hostState: llm_1.HostState.STOPPED,
                getInstance: sandbox.stub()
            };
            // Mock the static getInstance method
            sandbox.stub(llm_1.LLMHostManager, 'getInstance').returns(hostManagerStub);
            // Get connection manager instance
            connectionManager = llm_1.LLMConnectionManager.getInstance({
                maxRetries: 2,
                baseRetryDelay: 100,
                maxRetryDelay: 1000,
                connectionTimeout: 1000,
                healthEndpoint: 'http://test.endpoint/health'
            });
        });
        it('should initialize with disconnected state', function () {
            assert.strictEqual(connectionManager.connectionState, llm_1.ConnectionState.DISCONNECTED);
        });
        it('should attempt to start host when connecting', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock successful connection test
                        global.fetch.mockResolvedValueOnce({
                            ok: true
                        });
                        return [4 /*yield*/, connectionManager.connectToLLM()];
                    case 1:
                        result = _a.sent();
                        assert.strictEqual(result, true);
                        assert.strictEqual(connectionManager.connectionState, llm_1.ConnectionState.CONNECTED);
                        sinon.assert.calledOnce(hostManagerStub.startHost);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should retry on connection failure', function () { return __awaiter(void 0, void 0, void 0, function () {
            var clock, connectPromise, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock failed connection test
                        global.fetch.mockRejectedValueOnce(new Error('Connection failed'));
                        clock = sinon.useFakeTimers();
                        connectPromise = connectionManager.connectToLLM();
                        // State should be error after first attempt
                        assert.strictEqual(connectionManager.connectionState, llm_1.ConnectionState.ERROR);
                        // Mock successful connection on retry
                        global.fetch.mockResolvedValueOnce({
                            ok: true
                        });
                        // Fast-forward past retry delay
                        return [4 /*yield*/, clock.tickAsync(200)];
                    case 1:
                        // Fast-forward past retry delay
                        _a.sent();
                        return [4 /*yield*/, connectPromise];
                    case 2:
                        result = _a.sent();
                        assert.strictEqual(result, true);
                        assert.strictEqual(connectionManager.connectionState, llm_1.ConnectionState.CONNECTED);
                        // Clean up
                        clock.restore();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('LLMFactory', function () {
        var factory;
        beforeEach(function () {
            // Create the factory
            factory = llm_1.LLMFactory.getInstance();
        });
        it('should provide access to all LLM services', function () {
            assert.ok(factory.connectionManager instanceof llm_1.LLMConnectionManager);
            assert.ok(factory.hostManager instanceof llm_1.LLMHostManager);
            assert.ok(factory.sessionManager instanceof llm_1.LLMSessionManager);
        });
        it('should initialize and register commands', function () { return __awaiter(void 0, void 0, void 0, function () {
            var commandRegisterStub;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        commandRegisterStub = sandbox.stub(vscode.commands, 'registerCommand').returns({
                            dispose: sandbox.stub()
                        });
                        return [4 /*yield*/, factory.initialize()];
                    case 1:
                        _a.sent();
                        // Should register 3 commands
                        assert.strictEqual(commandRegisterStub.callCount, 3);
                        assert.ok(commandRegisterStub.calledWith('copilot-ppa.llm.connect'));
                        assert.ok(commandRegisterStub.calledWith('copilot-ppa.llm.disconnect'));
                        assert.ok(commandRegisterStub.calledWith('copilot-ppa.llm.restart'));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
