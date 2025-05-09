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
exports.CoreAgent = void 0;
var PromptManager_1 = require("./PromptManager");
var ContextManager_1 = require("./ContextManager");
var CommandParser_1 = require("./CommandParser");
var conversationManager_1 = require("./conversationManager");
var CoreAgent = /** @class */ (function () {
    function CoreAgent(context, contextManager) {
        this.status = 'idle';
        this.promptManager = PromptManager_1.PromptManager.getInstance(context);
        this.contextManager = contextManager || ContextManager_1.ContextManager.getInstance(context);
        this.commandParser = CommandParser_1.CommandParser.getInstance();
        this.conversationManager = conversationManager_1.ConversationManager.getInstance();
    }
    CoreAgent.getInstance = function (context) {
        if (!this.instance) {
            if (!context) {
                throw new Error('Context is required when creating CoreAgent for the first time');
            }
            this.instance = new CoreAgent(context);
        }
        return this.instance;
    };
    CoreAgent.prototype.processInput = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var messageId, context, error_1, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.status = 'processing';
                        messageId = this.generateId();
                        // Add the user input to the context manager
                        this.contextManager.addMessage({
                            id: messageId,
                            role: 'user',
                            content: input,
                            timestamp: Date.now()
                        });
                        
                        // Get the context
                        context = this.contextManager.buildContextString();
                        
                        // In a real implementation, this would call an LLM service
                        // For now we return a mock response
                        this.status = 'idle';
                        return [2 /*return*/, {
                            response: 'Test response',
                            context: context
                        }];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.status = 'error';
                        message = error_1 instanceof Error ? error_1.message : String(error_1);
                        throw new Error("Failed to process input: " + message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CoreAgent.prototype.handleResponse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var commands, _i, commands_1, command;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!response.includes('#')) return [3 /*break*/, 4];
                        commands = response.match(/#\w+\([^)]+\)/g) || [];
                        _i = 0, commands_1 = commands;
                        _a.label = 1;
                    case 1:
                        if (!(_i < commands_1.length)) return [3 /*break*/, 4];
                        command = commands_1[_i];
                        return [4 /*yield*/, this.commandParser.parseAndExecute(command)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: 
                    // Update conversation history
                    return [4 /*yield*/, this.conversationManager.addMessage('assistant', response)];
                    case 5:
                        // Update conversation history
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CoreAgent.prototype.analyzeCode = function (code, context) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt;
            return __generator(this, function (_a) {
                prompt = this.promptManager.generatePrompt('analyze-code', {
                    code: code,
                    context: context || ''
                });
                // Process with LLM and return analysis
                return [2 /*return*/, prompt]; // Placeholder
            });
        });
    };
    CoreAgent.prototype.suggestImprovements = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt;
            return __generator(this, function (_a) {
                prompt = this.promptManager.generatePrompt('suggest-improvements', {
                    code: code
                });
                // Process with LLM and return suggestions
                return [2 /*return*/, prompt]; // Placeholder
            });
        });
    };
    CoreAgent.prototype.continueCodingIteration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var context_2, prompt_2, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        this.status = 'processing';
                        return [4 /*yield*/, this.contextManager.buildContext('current', 'continue iteration')];
                    case 1:
                        context_2 = _a.sent();
                        prompt_2 = this.promptManager.generatePrompt('continue-iteration', {
                            context: context_2.join('\n')
                        });
                        // Process the response
                        return [4 /*yield*/, this.handleResponse(prompt_2)];
                    case 2:
                        // Process the response
                        _a.sent();
                        this.status = 'idle';
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        this.status = 'error';
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CoreAgent.prototype.getStatus = function () {
        return this.status;
    };
    CoreAgent.prototype.getSuggestions = function (input) {
        // Pass the input to the contextManager to get suggestions
        return this.contextManager.generateSuggestions(input);
    };
    CoreAgent.prototype.clearContext = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.contextManager.clearAllContextData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_3 = _a.sent();
                        message = error_3 instanceof Error ? error_3.message : String(error_3);
                        throw new Error("Failed to clear context: " + message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CoreAgent.prototype.dispose = function () {
        // Clean up resources
        this.contextManager.dispose();
    };
    CoreAgent.prototype.generateId = function () {
        return Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
    };
    return CoreAgent;
}());
exports.CoreAgent = CoreAgent;
