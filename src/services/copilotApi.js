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
exports.CopilotApiService = void 0;
var logger_1 = require("../utils/logger");
var CopilotConnectionService_1 = require("./copilot/CopilotConnectionService");
var CopilotChatService_1 = require("./copilot/CopilotChatService");
var CopilotSuggestionService_1 = require("./copilot/CopilotSuggestionService");
var CopilotDataTransformer_1 = require("./copilot/CopilotDataTransformer");
var CopilotApiService = /** @class */ (function () {
    function CopilotApiService() {
        this.logger = logger_1.Logger.getInstance();
        this.connectionService = new CopilotConnectionService_1.CopilotConnectionService(this.logger);
        this.chatService = new CopilotChatService_1.CopilotChatService(this.logger);
        this.suggestionService = new CopilotSuggestionService_1.CopilotSuggestionService(this.logger);
        this.dataTransformer = new CopilotDataTransformer_1.CopilotDataTransformer();
    }
    CopilotApiService.getInstance = function () {
        if (!CopilotApiService.instance) {
            CopilotApiService.instance = new CopilotApiService();
        }
        return CopilotApiService.instance;
    };
    CopilotApiService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var copilotExtension, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.connectionService.initialize()];
                    case 1:
                        copilotExtension = _a.sent();
                        if (copilotExtension) {
                            this.chatService.setExtension(copilotExtension);
                            this.suggestionService.setExtension(copilotExtension);
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Failed to initialize Copilot API connection', error_1);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CopilotApiService.prototype.isConnected = function () {
        return this.connectionService.isConnected();
    };
    CopilotApiService.prototype.sendChatRequest = function (prompt, context) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConnected()) {
                            throw new Error('Copilot API not connected. Call initialize() first.');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.chatService.sendRequest(prompt, context)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_2 = _a.sent();
                        this.logger.error('Error sending chat request to Copilot', error_2);
                        throw new Error('Failed to communicate with Copilot: ' + (error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CopilotApiService.prototype.getCodeSuggestions = function (code, language) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConnected()) {
                            throw new Error('Copilot API not connected. Call initialize() first.');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.suggestionService.getSuggestions(code, language)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_3 = _a.sent();
                        this.logger.error('Error getting code suggestions from Copilot', error_3);
                        throw new Error('Failed to get suggestions from Copilot');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CopilotApiService.prototype.registerResponseHandler = function (callback) {
        if (!this.isConnected()) {
            throw new Error('Copilot API not connected. Call initialize() first.');
        }
        this.chatService.registerResponseHandler(callback);
    };
    CopilotApiService.prototype.transformData = function (data, targetFormat) {
        return this.dataTransformer.transform(data, targetFormat);
    };
    return CopilotApiService;
}());
exports.CopilotApiService = CopilotApiService;
