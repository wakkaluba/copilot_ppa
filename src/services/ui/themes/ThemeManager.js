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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ThemeManager = exports.ThemeError = void 0;
var vscode = require("vscode");
var ThemeService_1 = require("./ThemeService");
var cssGenerator_1 = require("./cssGenerator");
var defaultThemes_1 = require("./defaultThemes");
/**
 * Theme manager error types
 */
var ThemeError = /** @class */ (function (_super) {
    __extends(ThemeError, _super);
    function ThemeError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'ThemeError';
        return _this;
    }
    return ThemeError;
}(Error));
exports.ThemeError = ThemeError;
var ThemeManager = /** @class */ (function () {
    function ThemeManager(storage) {
        var _this = this;
        this.storage = storage;
        this.themes = new Map();
        this.customThemes = new Map();
        this.disposables = [];
        // Event emitters
        this.onThemeChangedEmitter = new vscode.EventEmitter();
        this.onUIOptionsChangedEmitter = new vscode.EventEmitter();
        // Event handlers
        this.onThemeChanged = this.onThemeChangedEmitter.event;
        this.onUIOptionsChanged = this.onUIOptionsChangedEmitter.event;
        // Initialize default themes
        defaultThemes_1.defaultThemes.forEach(function (theme, id) { return _this.themes.set(id, theme); });
        // Load saved theme preference and custom themes
        this.activeThemeId = this.storage.getActiveThemeId();
        this.loadCustomThemes();
        // Initialize services
        this.cssGenerator = new cssGenerator_1.CSSGenerator();
        this.themeService = new ThemeService_1.ThemeService(this.handleVSCodeThemeChange.bind(this));
        this.disposables.push(this.themeService);
        // Set up event cleanup
        this.disposables.push(this.onThemeChangedEmitter, this.onUIOptionsChangedEmitter);
    }
    /**
     * Get all available themes
     */
    ThemeManager.prototype.getAllThemes = function () {
        return __spreadArray(__spreadArray([], this.themes.values(), true), this.customThemes.values(), true);
    };
    /**
     * Get a specific theme by ID
     */
    ThemeManager.prototype.getTheme = function (id) {
        return this.themes.get(id) || this.customThemes.get(id);
    };
    /**
     * Get the currently active theme
     */
    ThemeManager.prototype.getActiveTheme = function () {
        var theme = this.getTheme(this.activeThemeId);
        if (!theme) {
            // Fallback to default if active theme not found
            return this.themes.get('default');
        }
        return theme;
    };
    /**
     * Set the active theme
     */
    ThemeManager.prototype.setActiveTheme = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var theme;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        theme = this.getTheme(id);
                        if (!theme) {
                            throw new ThemeError("Theme not found: ".concat(id));
                        }
                        this.activeThemeId = id;
                        return [4 /*yield*/, this.storage.setActiveThemeId(id)];
                    case 1:
                        _a.sent();
                        this.onThemeChangedEmitter.fire(theme);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new custom theme based on an existing one
     */
    ThemeManager.prototype.createCustomTheme = function (name, baseThemeId, customizations) {
        return __awaiter(this, void 0, void 0, function () {
            var baseTheme, id, newTheme;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseTheme = this.getTheme(baseThemeId);
                        if (!baseTheme) {
                            throw new ThemeError("Base theme not found: ".concat(baseThemeId));
                        }
                        id = "custom-".concat(Date.now());
                        newTheme = __assign({ id: id, name: name, isBuiltIn: false, colors: __assign({}, baseTheme.colors), font: __assign({}, baseTheme.font) }, customizations);
                        // Validate theme
                        this.validateTheme(newTheme);
                        this.customThemes.set(id, newTheme);
                        return [4 /*yield*/, this.saveCustomThemes()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, newTheme];
                }
            });
        });
    };
    /**
     * Update an existing custom theme
     */
    ThemeManager.prototype.updateCustomTheme = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existing = this.customThemes.get(id);
                        if (!existing) {
                            throw new ThemeError("Custom theme not found: ".concat(id));
                        }
                        updated = __assign(__assign(__assign({}, existing), updates), { id: id, isBuiltIn: false // Prevent built-in flag changes
                         });
                        // Validate theme
                        this.validateTheme(updated);
                        this.customThemes.set(id, updated);
                        return [4 /*yield*/, this.saveCustomThemes()];
                    case 1:
                        _a.sent();
                        if (this.activeThemeId === id) {
                            this.onThemeChangedEmitter.fire(updated);
                        }
                        return [2 /*return*/, updated];
                }
            });
        });
    };
    /**
     * Delete a custom theme
     */
    ThemeManager.prototype.deleteCustomTheme = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var theme;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        theme = this.customThemes.get(id);
                        if (!theme) {
                            throw new ThemeError("Custom theme not found: ".concat(id));
                        }
                        this.customThemes.delete(id);
                        return [4 /*yield*/, this.saveCustomThemes()];
                    case 1:
                        _a.sent();
                        if (!(this.activeThemeId === id)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.setActiveTheme('default')];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the current UI layout options
     */
    ThemeManager.prototype.getUILayoutOptions = function () {
        return this.storage.getUILayoutOptions();
    };
    /**
     * Update UI layout options
     */
    ThemeManager.prototype.updateUILayoutOptions = function (updates) {
        return __awaiter(this, void 0, void 0, function () {
            var current, updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        current = this.getUILayoutOptions();
                        updated = __assign(__assign({}, current), updates);
                        return [4 /*yield*/, this.storage.saveUILayoutOptions(updated)];
                    case 1:
                        _a.sent();
                        this.onUIOptionsChangedEmitter.fire(updated);
                        return [2 /*return*/, updated];
                }
            });
        });
    };
    /**
     * Get CSS for the current theme
     */
    ThemeManager.prototype.getThemeCSS = function () {
        return this.cssGenerator.generateThemeCSS(this.getActiveTheme());
    };
    /**
     * Get CSS for the current layout options
     */
    ThemeManager.prototype.getLayoutCSS = function () {
        return this.cssGenerator.generateLayoutCSS(this.getUILayoutOptions());
    };
    ThemeManager.prototype.validateTheme = function (theme) {
        if (!theme.id) {
            throw new ThemeError('Theme must have an ID');
        }
        if (!theme.name) {
            throw new ThemeError('Theme must have a name');
        }
        if (!theme.colors) {
            throw new ThemeError('Theme must have colors defined');
        }
        if (!theme.font) {
            throw new ThemeError('Theme must have font settings defined');
        }
    };
    ThemeManager.prototype.loadCustomThemes = function () {
        var _this = this;
        var customThemes = this.storage.getCustomThemes();
        customThemes.forEach(function (theme) { return _this.customThemes.set(theme.id, theme); });
    };
    ThemeManager.prototype.saveCustomThemes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.saveCustomThemes(Array.from(this.customThemes.values()))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ThemeManager.prototype.handleVSCodeThemeChange = function (kind) {
        // Only auto-switch if using a built-in theme
        if (this.activeThemeId === 'default' || this.activeThemeId === 'dark') {
            var newThemeId = kind === vscode.ColorThemeKind.Light ? 'default' : 'dark';
            if (newThemeId !== this.activeThemeId) {
                this.setActiveTheme(newThemeId).catch(function (error) {
                    console.error('Failed to switch theme:', error);
                });
            }
        }
    };
    ThemeManager.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
    };
    return ThemeManager;
}());
exports.ThemeManager = ThemeManager;
