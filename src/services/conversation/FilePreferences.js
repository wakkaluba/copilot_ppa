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
exports.FilePreferences = void 0;
var FilePreferences = /** @class */ (function () {
    function FilePreferences(context) {
        this._recentExtensions = [];
        this._recentDirectories = [];
        this._namingPatterns = [];
        this._storageKey = 'fileManagementPreferences';
        this._maxExtensions = 10;
        this._maxDirectories = 5;
        this._maxPatterns = 5;
        this._context = context;
    }
    FilePreferences.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var storedData, errorMessage;
            return __generator(this, function (_a) {
                try {
                    storedData = this._context.globalState.get(this._storageKey);
                    if (storedData) {
                        this._recentExtensions = storedData.recentExtensions || [];
                        this._recentDirectories = storedData.recentDirectories || [];
                        this._namingPatterns = storedData.namingPatterns || [];
                    }
                }
                catch (error) {
                    errorMessage = error instanceof Error ? error.message : String(error);
                    throw new Error("Failed to initialize file preferences: ".concat(errorMessage));
                }
                return [2 /*return*/];
            });
        });
    };
    FilePreferences.prototype.addRecentExtension = function (extension) {
        // Move to front if exists, otherwise add to front
        this._recentExtensions = __spreadArray([
            extension
        ], this._recentExtensions.filter(function (ext) { return ext !== extension; }), true);
        // Keep the list within size limit
        if (this._recentExtensions.length > this._maxExtensions) {
            this._recentExtensions = this._recentExtensions.slice(0, this._maxExtensions);
        }
        this.saveToStorage().catch(function (error) {
            console.error('Failed to save file preferences:', error);
        });
    };
    FilePreferences.prototype.getRecentExtensions = function (limit) {
        return this._recentExtensions.slice(0, Math.min(limit, this._maxExtensions));
    };
    FilePreferences.prototype.addRecentDirectory = function (directory) {
        // Move to front if exists, otherwise add to front
        this._recentDirectories = __spreadArray([
            directory
        ], this._recentDirectories.filter(function (dir) { return dir !== directory; }), true);
        // Keep the list within size limit
        if (this._recentDirectories.length > this._maxDirectories) {
            this._recentDirectories = this._recentDirectories.slice(0, this._maxDirectories);
        }
        this.saveToStorage().catch(function (error) {
            console.error('Failed to save file preferences:', error);
        });
    };
    FilePreferences.prototype.getRecentDirectories = function (limit) {
        return this._recentDirectories.slice(0, Math.min(limit, this._maxDirectories));
    };
    FilePreferences.prototype.addNamingPattern = function (pattern) {
        if (!this._namingPatterns.includes(pattern)) {
            this._namingPatterns.push(pattern);
            // Keep the list within size limit
            if (this._namingPatterns.length > this._maxPatterns) {
                this._namingPatterns = this._namingPatterns.slice(-this._maxPatterns);
            }
            this.saveToStorage().catch(function (error) {
                console.error('Failed to save file preferences:', error);
            });
        }
    };
    FilePreferences.prototype.getNamingPatterns = function () {
        return __spreadArray([], this._namingPatterns, true);
    };
    FilePreferences.prototype.clearPreferences = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this._recentExtensions = [];
                        this._recentDirectories = [];
                        this._namingPatterns = [];
                        return [4 /*yield*/, this._context.globalState.update(this._storageKey, undefined)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        throw new Error("Failed to clear file preferences: ".concat(errorMessage));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FilePreferences.prototype.saveToStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, error_2, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        data = {
                            recentExtensions: this._recentExtensions,
                            recentDirectories: this._recentDirectories,
                            namingPatterns: this._namingPatterns
                        };
                        return [4 /*yield*/, this._context.globalState.update(this._storageKey, data)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : String(error_2);
                        throw new Error("Failed to save file preferences: ".concat(errorMessage));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return FilePreferences;
}());
exports.FilePreferences = FilePreferences;
