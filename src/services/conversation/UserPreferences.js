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
exports.UserPreferences = void 0;
var UserPreferences = /** @class */ (function () {
    function UserPreferences(context) {
        this._languageUsage = {};
        this._storageKey = 'userProgrammingPreferences';
        this._context = context;
    }
    UserPreferences.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var storedData, errorMessage;
            return __generator(this, function (_a) {
                try {
                    storedData = this._context.globalState.get(this._storageKey);
                    if (storedData) {
                        this._preferredLanguage = storedData.preferredLanguage;
                        this._preferredFramework = storedData.preferredFramework;
                        this._languageUsage = storedData.languageUsage || {};
                    }
                }
                catch (error) {
                    errorMessage = error instanceof Error ? error.message : String(error);
                    throw new Error("Failed to initialize user preferences: ".concat(errorMessage));
                }
                return [2 /*return*/];
            });
        });
    };
    UserPreferences.prototype.setPreferredLanguage = function (language) {
        this._preferredLanguage = language;
        this.saveToStorage().catch(function (error) {
            console.error('Failed to save user preferences:', error);
        });
    };
    UserPreferences.prototype.getPreferredLanguage = function () {
        return this._preferredLanguage;
    };
    UserPreferences.prototype.setPreferredFramework = function (framework) {
        this._preferredFramework = framework;
        this.saveToStorage().catch(function (error) {
            console.error('Failed to save user preferences:', error);
        });
    };
    UserPreferences.prototype.getPreferredFramework = function () {
        return this._preferredFramework;
    };
    UserPreferences.prototype.incrementLanguageUsage = function (language) {
        this._languageUsage[language] = (this._languageUsage[language] || 0) + 1;
        this.saveToStorage().catch(function (error) {
            console.error('Failed to save language usage:', error);
        });
    };
    UserPreferences.prototype.getFrequentLanguages = function (limit) {
        return Object.entries(this._languageUsage)
            .map(function (_a) {
            var language = _a[0], count = _a[1];
            return ({ language: language, count: count });
        })
            .sort(function (a, b) { return b.count - a.count; })
            .slice(0, limit);
    };
    UserPreferences.prototype.clearPreferences = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this._preferredLanguage = undefined;
                        this._preferredFramework = undefined;
                        this._languageUsage = {};
                        return [4 /*yield*/, this._context.globalState.update(this._storageKey, undefined)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        throw new Error("Failed to clear user preferences: ".concat(errorMessage));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserPreferences.prototype.saveToStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, error_2, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        data = {
                            languageUsage: this._languageUsage
                        };
                        if (this._preferredLanguage !== undefined) {
                            data.preferredLanguage = this._preferredLanguage;
                        }
                        if (this._preferredFramework !== undefined) {
                            data.preferredFramework = this._preferredFramework;
                        }
                        return [4 /*yield*/, this._context.globalState.update(this._storageKey, data)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : String(error_2);
                        throw new Error("Failed to save user preferences: ".concat(errorMessage));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return UserPreferences;
}());
exports.UserPreferences = UserPreferences;
