"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.LLMStreamProvider = void 0;
var events_1 = require("events");
var LLMConnectionManager_1 = require("./LLMConnectionManager");
var llm_1 = require("../../types/llm");
var LLMStreamProcessor_1 = require("./services/LLMStreamProcessor");
var LLMChunkExtractor_1 = require("./services/LLMChunkExtractor");
var LLMStreamManager_1 = require("./services/LLMStreamManager");
var LLMStreamError_1 = require("./errors/LLMStreamError");
/**
 * Provider for handling streaming LLM responses
 */
var LLMStreamProvider = /** @class */ (function (_super) {
    __extends(LLMStreamProvider, _super);
    /**
     * Creates a new LLM stream provider
     * @param streamEndpoint URL endpoint for streaming
     */
    function LLMStreamProvider(streamEndpoint) {
        if (streamEndpoint === void 0) { streamEndpoint = 'http://localhost:11434/api/chat'; }
        var _this = _super.call(this) || this;
        _this.connectionManager = LLMConnectionManager_1.LLMConnectionManager.getInstance();
        _this.streamProcessor = new LLMStreamProcessor_1.LLMStreamProcessor();
        _this.chunkExtractor = new LLMChunkExtractor_1.LLMChunkExtractor();
        _this.streamManager = new LLMStreamManager_1.LLMStreamManager(streamEndpoint);
        _this.setupEventHandlers();
        return _this;
    }
    LLMStreamProvider.prototype.setupEventHandlers = function () {
        var _this = this;
        this.streamProcessor.on('data', function (chunk) { return _this.emit('data', chunk); });
        this.streamProcessor.on('error', function (error) { return _this.handleError(error); });
        this.streamProcessor.on('end', function (text) { return _this.emit('end', text); });
    };
    /**
     * Streams a message request to the LLM
     *
     * @param payload The message payload
     * @param config Optional session configuration
     * @returns Promise that resolves when streaming ends
     */
    LLMStreamProvider.prototype.streamMessage = function (payload, config) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.ensureConnection()];
                    case 1:
                        _a.sent();
                        this.streamManager.resetState();
                        return [4 /*yield*/, this.streamManager.startStream(payload, config)];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, this.streamProcessor.processStream(response)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        this.handleError(error_1 instanceof Error ? error_1 : new LLMStreamError_1.LLMStreamError(String(error_1)));
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    LLMStreamProvider.prototype.ensureConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connected;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.connectionManager.connectionState !== llm_1.ConnectionState.CONNECTED)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connectionManager.connectToLLM()];
                    case 1:
                        connected = _a.sent();
                        if (!connected) {
                            throw new LLMStreamError_1.LLMStreamError('Failed to connect to LLM service');
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    LLMStreamProvider.prototype.handleError = function (error) {
        console.error('LLM stream error:', error);
        this.emit('error', error);
        this.streamManager.cleanup();
    };
    /**
     * Aborts the current stream if active
     */
    LLMStreamProvider.prototype.abort = function () {
        this.streamManager.abort();
    };
    LLMStreamProvider.prototype.on = function (event, listener) {
        return _super.prototype.on.call(this, event, listener);
    };
    LLMStreamProvider.prototype.once = function (event, listener) {
        return _super.prototype.once.call(this, event, listener);
    };
    return LLMStreamProvider;
}(events_1.EventEmitter));
exports.LLMStreamProvider = LLMStreamProvider;
