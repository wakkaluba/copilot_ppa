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
exports.LLMFactory = void 0;
/**
 * LLM Factory - Creates and provides access to LLM services
 */
var vscode = require("vscode");
var LLMConnectionManager_1 = require("./LLMConnectionManager");
var LLMHostManager_1 = require("./LLMHostManager");
var LLMSessionManager_1 = require("./LLMSessionManager");
var LLMCommandHandlerService_1 = require("./services/LLMCommandHandlerService");
var LLMProviderCreationService_1 = require("./services/LLMProviderCreationService");
var LLMInitializationService_1 = require("./services/LLMInitializationService");
/**
 * Factory for accessing LLM services
 */
var LLMFactory = /** @class */ (function () {
    /**
     * Creates a new LLM factory
     */
    function LLMFactory(options) {
        if (options === void 0) { options = {}; }
        this.disposables = [];
        this.connectionManager = LLMConnectionManager_1.LLMConnectionManager.getInstance(options);
        this.hostManager = LLMHostManager_1.LLMHostManager.getInstance();
        this.sessionManager = LLMSessionManager_1.LLMSessionManager.getInstance();
        this.commandHandler = new LLMCommandHandlerService_1.LLMCommandHandlerService(this.connectionManager, this.hostManager);
        this.providerCreator = new LLMProviderCreationService_1.LLMProviderCreationService();
        this.initService = new LLMInitializationService_1.LLMInitializationService(this.connectionManager);
        this.registerCommands();
    }
    /**
     * Gets the singleton instance of the LLM factory
     */
    LLMFactory.getInstance = function (options) {
        if (options === void 0) { options = {}; }
        if (!this.instance) {
            this.instance = new LLMFactory(options);
        }
        return this.instance;
    };
    /**
     * Gets the connection manager
     */
    LLMFactory.prototype.getConnectionManager = function () {
        return this.connectionManager;
    };
    /**
     * Gets the host manager
     */
    LLMFactory.prototype.getHostManager = function () {
        return this.hostManager;
    };
    /**
     * Gets the session manager
     */
    LLMFactory.prototype.getSessionManager = function () {
        return this.sessionManager;
    };
    /**
     * Creates a new stream provider
     */
    LLMFactory.prototype.createStreamProvider = function (endpoint) {
        return this.providerCreator.createStreamProvider(endpoint);
    };
    /**
     * Initializes the LLM services
     */
    LLMFactory.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initService.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Register commands related to LLM services
     */
    LLMFactory.prototype.registerCommands = function () {
        var _this = this;
        this.disposables.push(vscode.commands.registerCommand('copilot-ppa.llm.connect', function () { return _this.commandHandler.handleConnect(); }), vscode.commands.registerCommand('copilot-ppa.llm.disconnect', function () { return _this.commandHandler.handleDisconnect(); }), vscode.commands.registerCommand('copilot-ppa.llm.restart', function () { return _this.commandHandler.handleRestart(); }));
    };
    /**
     * Disposes resources
     */
    LLMFactory.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.commandHandler.dispose();
    };
    return LLMFactory;
}());
exports.LLMFactory = LLMFactory;
