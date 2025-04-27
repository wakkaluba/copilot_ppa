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
exports.ContextManager = void 0;
var ConversationMemoryService_1 = require("./services/ConversationMemoryService");
var UserPreferencesService_1 = require("./services/UserPreferencesService");
var FilePreferencesService_1 = require("./services/FilePreferencesService");
var ContextAnalysisService_1 = require("./services/ContextAnalysisService");
var ContextManager = /** @class */ (function () {
    function ContextManager(context) {
        this.conversationService = new ConversationMemoryService_1.ConversationMemoryService(context);
        this.userPreferencesService = new UserPreferencesService_1.UserPreferencesService(context);
        this.filePreferencesService = new FilePreferencesService_1.FilePreferencesService(context);
        this.analysisService = new ContextAnalysisService_1.ContextAnalysisService();
    }
    ContextManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.conversationService.initialize(),
                                this.userPreferencesService.initialize(),
                                this.filePreferencesService.initialize()
                            ])];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        message = error_1 instanceof Error ? error_1.message : String(error_1);
                        throw new Error("Failed to initialize context manager: ".concat(message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ContextManager.prototype.addMessage = function (message) {
        this.conversationService.addMessage(message);
        if (message.role === 'user') {
            this.analysisService.analyzeMessage(message.content, this.userPreferencesService, this.filePreferencesService);
        }
    };
    ContextManager.prototype.getConversationHistory = function (limit) {
        if (limit === void 0) { limit = 10; }
        return this.conversationService.getRecentMessages(limit);
    };
    ContextManager.prototype.getPreferredLanguage = function () {
        return this.userPreferencesService.getPreferredLanguage();
    };
    ContextManager.prototype.getFrequentLanguages = function (limit) {
        if (limit === void 0) { limit = 3; }
        return this.userPreferencesService.getFrequentLanguages(limit);
    };
    ContextManager.prototype.getPreferredFramework = function () {
        return this.userPreferencesService.getPreferredFramework();
    };
    ContextManager.prototype.getRecentFileExtensions = function (limit) {
        if (limit === void 0) { limit = 5; }
        return this.filePreferencesService.getRecentExtensions(limit);
    };
    ContextManager.prototype.getRecentDirectories = function (limit) {
        if (limit === void 0) { limit = 3; }
        return this.filePreferencesService.getRecentDirectories(limit);
    };
    ContextManager.prototype.getFileNamingPatterns = function () {
        return this.filePreferencesService.getNamingPatterns();
    };
    ContextManager.prototype.buildContextString = function () {
        return this.analysisService.buildContextString(this.userPreferencesService, this.filePreferencesService, this.conversationService);
    };
    ContextManager.prototype.generateSuggestions = function (currentInput) {
        return this.analysisService.generateSuggestions(currentInput, this.userPreferencesService, this.filePreferencesService);
    };
    ContextManager.prototype.clearAllContextData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.conversationService.clearHistory(),
                                this.userPreferencesService.clearPreferences(),
                                this.filePreferencesService.clearPreferences()
                            ])];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        message = error_2 instanceof Error ? error_2.message : String(error_2);
                        throw new Error("Failed to clear context data: ".concat(message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ContextManager.prototype.dispose = function () {
        // Currently no resources to dispose
    };
    return ContextManager;
}());
exports.ContextManager = ContextManager;
