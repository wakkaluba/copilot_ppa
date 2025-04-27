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
var UserPreferences_1 = require("../../../../src/services/conversation/UserPreferences");
describe('UserPreferences', function () {
    var mockContext;
    var userPreferences;
    var storedPreferences;
    beforeEach(function () {
        storedPreferences = {};
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            globalState: {
                get: jest.fn().mockImplementation(function () { return storedPreferences; }),
                update: jest.fn().mockImplementation(function (key, value) {
                    storedPreferences = value;
                    return Promise.resolve();
                }),
            },
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
            },
        };
        userPreferences = new UserPreferences_1.UserPreferences(mockContext);
    });
    afterEach(function () {
        jest.clearAllMocks();
    });
    describe('initialization', function () {
        it('should initialize with empty state when no stored data', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userPreferences.initialize()];
                    case 1:
                        _a.sent();
                        expect(userPreferences.getPreferredLanguage()).toBeUndefined();
                        expect(userPreferences.getPreferredFramework()).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should load stored preferences on initialization', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        storedPreferences = {
                            preferredLanguage: 'typescript',
                            preferredFramework: 'react',
                            languageUsage: { typescript: 2, javascript: 1 }
                        };
                        return [4 /*yield*/, userPreferences.initialize()];
                    case 1:
                        _a.sent();
                        expect(userPreferences.getPreferredLanguage()).toBe('typescript');
                        expect(userPreferences.getPreferredFramework()).toBe('react');
                        expect(userPreferences.getFrequentLanguages(1)[0].language).toBe('typescript');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle initialization errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockContext.globalState.get.mockImplementation(function () {
                            throw new Error('Storage error');
                        });
                        return [4 /*yield*/, expect(userPreferences.initialize()).rejects.toThrow('Failed to initialize user preferences: Storage error')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('language preferences', function () {
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userPreferences.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should set and get preferred language', function () {
            userPreferences.setPreferredLanguage('python');
            expect(userPreferences.getPreferredLanguage()).toBe('python');
        });
        it('should track language usage', function () {
            userPreferences.incrementLanguageUsage('javascript');
            userPreferences.incrementLanguageUsage('javascript');
            userPreferences.incrementLanguageUsage('typescript');
            var frequentLangs = userPreferences.getFrequentLanguages(2);
            expect(frequentLangs).toHaveLength(2);
            expect(frequentLangs[0].language).toBe('javascript');
            expect(frequentLangs[0].count).toBe(2);
            expect(frequentLangs[1].language).toBe('typescript');
            expect(frequentLangs[1].count).toBe(1);
        });
        it('should persist language preferences', function () {
            userPreferences.setPreferredLanguage('java');
            expect(mockContext.globalState.update).toHaveBeenCalledWith('userProgrammingPreferences', expect.objectContaining({
                preferredLanguage: 'java'
            }));
        });
    });
    describe('framework preferences', function () {
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userPreferences.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should set and get preferred framework', function () {
            userPreferences.setPreferredFramework('angular');
            expect(userPreferences.getPreferredFramework()).toBe('angular');
        });
        it('should persist framework preferences', function () {
            userPreferences.setPreferredFramework('vue');
            expect(mockContext.globalState.update).toHaveBeenCalledWith('userProgrammingPreferences', expect.objectContaining({
                preferredFramework: 'vue'
            }));
        });
    });
    describe('preference clearing', function () {
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userPreferences.initialize()];
                    case 1:
                        _a.sent();
                        userPreferences.setPreferredLanguage('typescript');
                        userPreferences.setPreferredFramework('react');
                        userPreferences.incrementLanguageUsage('typescript');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should clear all preferences', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userPreferences.clearPreferences()];
                    case 1:
                        _a.sent();
                        expect(userPreferences.getPreferredLanguage()).toBeUndefined();
                        expect(userPreferences.getPreferredFramework()).toBeUndefined();
                        expect(userPreferences.getFrequentLanguages(1)).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle errors during clearing', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockContext.globalState.update.mockRejectedValue(new Error('Clear error'));
                        return [4 /*yield*/, expect(userPreferences.clearPreferences()).rejects.toThrow('Failed to clear user preferences: Clear error')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('storage error handling', function () {
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, userPreferences.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle storage errors when saving language preference', function () {
            mockContext.globalState.update.mockRejectedValue(new Error('Storage error'));
            userPreferences.setPreferredLanguage('rust');
            // Error should be caught and logged
            expect(mockContext.globalState.update).toHaveBeenCalled();
        });
        it('should handle storage errors when saving framework preference', function () {
            mockContext.globalState.update.mockRejectedValue(new Error('Storage error'));
            userPreferences.setPreferredFramework('svelte');
            // Error should be caught and logged
            expect(mockContext.globalState.update).toHaveBeenCalled();
        });
        it('should handle storage errors when incrementing language usage', function () {
            mockContext.globalState.update.mockRejectedValue(new Error('Storage error'));
            userPreferences.incrementLanguageUsage('go');
            // Error should be caught and logged
            expect(mockContext.globalState.update).toHaveBeenCalled();
        });
    });
});
