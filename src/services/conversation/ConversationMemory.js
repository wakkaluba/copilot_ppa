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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationMemory = void 0;
var ConversationMemory = /** @class */ (function () {
    function ConversationMemory(context) {
        this._messages = [];
        this._storageKey = 'conversationMemory';
        this._maxHistorySize = 200; // Store up to 200 messages
        this._context = context;
    }
    ConversationMemory.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var storedData, errorMessage;
            return __generator(this, function (_a) {
                try {
                    storedData = this._context.globalState.get(this._storageKey);
                    if (storedData && Array.isArray(storedData)) {
                        this._messages = storedData;
                    }
                }
                catch (error) {
                    errorMessage = error instanceof Error ? error.message : String(error);
                    console.error('Failed to initialize conversation memory:', errorMessage);
                    throw new Error("Failed to initialize conversation memory: ".concat(errorMessage));
                }
                return [2 /*return*/];
            });
        });
    };
    ConversationMemory.prototype.addMessage = function (message) {
        this._messages.push(message);
        // Trim history if it exceeds the maximum size
        if (this._messages.length > this._maxHistorySize) {
            this._messages = this._messages.slice(-this._maxHistorySize);
        }
        // Save to storage
        this.saveToStorage().catch(function (error) {
            console.error('Failed to save conversation memory:', error);
        });
    };
    ConversationMemory.prototype.getRecentMessages = function (limit) {
        return this._messages.slice(-limit);
    };
    ConversationMemory.prototype.getAllMessages = function () {
        return __spreadArray([], this._messages, true);
    };
    ConversationMemory.prototype.clearHistory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this._messages = [];
                        return [4 /*yield*/, this._context.globalState.update(this._storageKey, [])];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        throw new Error("Failed to clear conversation history: ".concat(errorMessage));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ConversationMemory.prototype.searchMessages = function (term) {
        var lowerTerm = term.toLowerCase();
        return this._messages.filter(function (msg) {
            return msg.content.toLowerCase().includes(lowerTerm);
        });
    };
    ConversationMemory.prototype.getMessagesByDateRange = function (startTime, endTime) {
        return this._messages.filter(function (msg) {
            return msg.timestamp >= startTime && msg.timestamp <= endTime;
        });
    };
    ConversationMemory.prototype.saveToStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._context.globalState.update(this._storageKey, this._messages)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : String(error_2);
                        throw new Error("Failed to save conversation memory: ".concat(errorMessage));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ConversationMemory;
}());
exports.ConversationMemory = ConversationMemory;
