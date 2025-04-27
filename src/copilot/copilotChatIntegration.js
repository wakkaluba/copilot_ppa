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
exports.CopilotChatIntegration = void 0;
var copilotApi_1 = require("../services/copilotApi");
var logger_1 = require("../utils/logger");
var CopilotChatInitializationService_1 = require("./services/CopilotChatInitializationService");
var CopilotChatParticipantService_1 = require("./services/CopilotChatParticipantService");
var CopilotChatMessageHandlerService_1 = require("./services/CopilotChatMessageHandlerService");
var CopilotChatCommandHandlerService_1 = require("./services/CopilotChatCommandHandlerService");
var CopilotChatIntegration = /** @class */ (function () {
    function CopilotChatIntegration() {
        this.logger = logger_1.Logger.getInstance();
        this.copilotApiService = copilotApi_1.CopilotApiService.getInstance();
        this.initService = new CopilotChatInitializationService_1.CopilotChatInitializationService(this.logger);
        this.participantService = new CopilotChatParticipantService_1.CopilotChatParticipantService(this.logger);
        this.messageHandlerService = new CopilotChatMessageHandlerService_1.CopilotChatMessageHandlerService(this.logger);
        this.commandHandlerService = new CopilotChatCommandHandlerService_1.CopilotChatCommandHandlerService(this.logger);
    }
    CopilotChatIntegration.getInstance = function () {
        if (!CopilotChatIntegration.instance) {
            CopilotChatIntegration.instance = new CopilotChatIntegration();
        }
        return CopilotChatIntegration.instance;
    };
    CopilotChatIntegration.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var isConnected, chatProvider, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.copilotApiService.initialize()];
                    case 1:
                        isConnected = _a.sent();
                        if (!isConnected) {
                            this.logger.warn('Failed to connect to Copilot API. Integration not available.');
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.initService.initializeCopilotExtension()];
                    case 2:
                        chatProvider = _a.sent();
                        if (!chatProvider) {
                            return [2 /*return*/, false];
                        }
                        this.participantService.registerChatParticipant(chatProvider, {
                            handleMessage: this.handleChatMessage.bind(this),
                            handleCommandIntent: this.handleCommandIntent.bind(this)
                        });
                        this.logger.info('Successfully integrated with GitHub Copilot chat');
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.error('Error initializing Copilot chat integration', error_1);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CopilotChatIntegration.prototype.handleChatMessage = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.logger.info("Received chat message: ".concat(request.message));
                        return [4 /*yield*/, this.messageHandlerService.handleMessage(request)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error('Error handling chat message', error_2);
                        return [2 /*return*/, this.messageHandlerService.createErrorResponse(error_2)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CopilotChatIntegration.prototype.handleCommandIntent = function (command, args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.logger.info("Received command intent: ".concat(command));
                return [2 /*return*/, this.commandHandlerService.handleCommand(command, args)];
            });
        });
    };
    CopilotChatIntegration.prototype.sendMessageToCopilotChat = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.initService.isIntegrationActive()) {
                            this.logger.warn('Cannot send message: Copilot chat integration not active');
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.messageHandlerService.sendMessage(message)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_3 = _a.sent();
                        this.logger.error('Error sending message to Copilot chat', error_3);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CopilotChatIntegration.prototype.isActive = function () {
        return this.initService.isIntegrationActive();
    };
    CopilotChatIntegration.prototype.toggleIntegration = function () {
        return this.initService.toggleIntegration();
    };
    return CopilotChatIntegration;
}());
exports.CopilotChatIntegration = CopilotChatIntegration;
