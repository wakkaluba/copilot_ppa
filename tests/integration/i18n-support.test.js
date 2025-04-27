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
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var localizationManager_1 = require("../../src/i18n/localizationManager");
var languageService_1 = require("../../src/services/languageService");
var localeLoader_1 = require("../../src/i18n/localeLoader");
describe('Internationalization Support', function () {
    var localizationManager;
    var languageService;
    var localeLoader;
    var testLocalesDir;
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Create test locales directory
                    testLocalesDir = path.join(__dirname, '.test-locales');
                    if (!fs.existsSync(testLocalesDir)) {
                        fs.mkdirSync(testLocalesDir, { recursive: true });
                    }
                    context = {
                        subscriptions: [],
                        workspaceState: new MockMemento(),
                        globalState: new MockMemento(),
                        extensionPath: testLocalesDir,
                        storagePath: path.join(testLocalesDir, 'storage')
                    };
                    // Set up test locale files
                    return [4 /*yield*/, setupTestLocales()];
                case 1:
                    // Set up test locale files
                    _a.sent();
                    localizationManager = new localizationManager_1.LocalizationManager(context);
                    languageService = new languageService_1.LanguageService();
                    localeLoader = new localeLoader_1.LocaleLoader(context);
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () {
        if (fs.existsSync(testLocalesDir)) {
            fs.rmSync(testLocalesDir, { recursive: true, force: true });
        }
    });
    function setupTestLocales() {
        return __awaiter(this, void 0, void 0, function () {
            var locales, _i, _a, _b, locale, content;
            return __generator(this, function (_c) {
                locales = {
                    'en.json': {
                        "welcome": "Welcome",
                        "error.notFound": "Not found",
                        "dialog.confirm": "Are you sure?",
                        "complex.path.nested.key": "Nested English value",
                        "interpolation": "Hello, {name}!",
                        "plural": {
                            "one": "{count} item",
                            "other": "{count} items"
                        }
                    },
                    'ja.json': {
                        "welcome": "ようこそ",
                        "error.notFound": "見つかりません",
                        "dialog.confirm": "よろしいですか？",
                        "complex.path.nested.key": "ネストされた日本語の値",
                        "interpolation": "こんにちは、{name}さん！",
                        "plural": {
                            "other": "{count}個のアイテム"
                        }
                    },
                    'ar.json': {
                        "welcome": "مرحباً",
                        "error.notFound": "غير موجود",
                        "dialog.confirm": "هل أنت متأكد؟",
                        "complex.path.nested.key": "قيمة متداخلة باللغة العربية",
                        "interpolation": "مرحباً، {name}!",
                        "plural": {
                            "zero": "لا يوجد عناصر",
                            "one": "عنصر واحد",
                            "two": "عنصران",
                            "few": "{count} عناصر",
                            "many": "{count} عنصراً",
                            "other": "{count} عنصر"
                        }
                    },
                    'zh.json': {
                        "welcome": "欢迎",
                        "error.notFound": "未找到",
                        "dialog.confirm": "确定吗？",
                        "complex.path.nested.key": "嵌套的中文值",
                        "interpolation": "你好，{name}！",
                        "plural": {
                            "other": "{count}个项目"
                        }
                    }
                };
                // Write locale files
                for (_i = 0, _a = Object.entries(locales); _i < _a.length; _i++) {
                    _b = _a[_i], locale = _b[0], content = _b[1];
                    fs.writeFileSync(path.join(testLocalesDir, locale), JSON.stringify(content, null, 2), 'utf8');
                }
                return [2 /*return*/];
            });
        });
    }
    test('handles complex character sets correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testCases, _i, testCases_1, _a, locale, key, expected, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, localizationManager.initialize()];
                case 1:
                    _b.sent();
                    testCases = [
                        { locale: 'ja', key: 'welcome', expected: 'ようこそ' },
                        { locale: 'ar', key: 'welcome', expected: 'مرحباً' },
                        { locale: 'zh', key: 'welcome', expected: '欢迎' }
                    ];
                    _i = 0, testCases_1 = testCases;
                    _b.label = 2;
                case 2:
                    if (!(_i < testCases_1.length)) return [3 /*break*/, 5];
                    _a = testCases_1[_i], locale = _a.locale, key = _a.key, expected = _a.expected;
                    return [4 /*yield*/, localizationManager.setLocale(locale)];
                case 3:
                    _b.sent();
                    result = localizationManager.translate(key);
                    assert.strictEqual(result, expected);
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('supports nested translation keys', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, fallback;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, localizationManager.initialize()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, localizationManager.setLocale('en')];
                case 2:
                    _a.sent();
                    result = localizationManager.translate('complex.path.nested.key');
                    assert.strictEqual(result, 'Nested English value');
                    // Test fallback behavior
                    return [4 /*yield*/, localizationManager.setLocale('fr')];
                case 3:
                    // Test fallback behavior
                    _a.sent(); // Non-existent locale
                    fallback = localizationManager.translate('complex.path.nested.key');
                    assert.strictEqual(fallback, 'Nested English value'); // Should fall back to English
                    return [2 /*return*/];
            }
        });
    }); });
    test('handles interpolation with different writing systems', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testCases, _i, testCases_2, _a, locale, key, vars, expected, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, localizationManager.initialize()];
                case 1:
                    _b.sent();
                    testCases = [
                        {
                            locale: 'en',
                            key: 'interpolation',
                            vars: { name: 'John' },
                            expected: 'Hello, John!'
                        },
                        {
                            locale: 'ja',
                            key: 'interpolation',
                            vars: { name: '田中' },
                            expected: 'こんにちは、田中さん！'
                        },
                        {
                            locale: 'ar',
                            key: 'interpolation',
                            vars: { name: 'أحمد' },
                            expected: 'مرحباً، أحمد!'
                        }
                    ];
                    _i = 0, testCases_2 = testCases;
                    _b.label = 2;
                case 2:
                    if (!(_i < testCases_2.length)) return [3 /*break*/, 5];
                    _a = testCases_2[_i], locale = _a.locale, key = _a.key, vars = _a.vars, expected = _a.expected;
                    return [4 /*yield*/, localizationManager.setLocale(locale)];
                case 3:
                    _b.sent();
                    result = localizationManager.translate(key, vars);
                    assert.strictEqual(result, expected);
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('supports complex plural rules', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testCases, _i, testCases_3, _a, locale, count, expected, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, localizationManager.initialize()];
                case 1:
                    _b.sent();
                    testCases = [
                        // English
                        { locale: 'en', count: 1, expected: '1 item' },
                        { locale: 'en', count: 2, expected: '2 items' },
                        // Arabic (complex plural rules)
                        { locale: 'ar', count: 0, expected: 'لا يوجد عناصر' },
                        { locale: 'ar', count: 1, expected: 'عنصر واحد' },
                        { locale: 'ar', count: 2, expected: 'عنصران' },
                        { locale: 'ar', count: 3, expected: '3 عناصر' },
                        { locale: 'ar', count: 11, expected: '11 عنصراً' },
                        // Japanese (no plural forms)
                        { locale: 'ja', count: 1, expected: '1個のアイテム' },
                        { locale: 'ja', count: 2, expected: '2個のアイテム' }
                    ];
                    _i = 0, testCases_3 = testCases;
                    _b.label = 2;
                case 2:
                    if (!(_i < testCases_3.length)) return [3 /*break*/, 5];
                    _a = testCases_3[_i], locale = _a.locale, count = _a.count, expected = _a.expected;
                    return [4 /*yield*/, localizationManager.setLocale(locale)];
                case 3:
                    _b.sent();
                    result = localizationManager.translate('plural', { count: count });
                    assert.strictEqual(result, expected);
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('handles concurrent locale switches', function () { return __awaiter(void 0, void 0, void 0, function () {
        var operations, locales, results, switches;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, localizationManager.initialize()];
                case 1:
                    _a.sent();
                    operations = 50;
                    locales = ['en', 'ja', 'ar', 'zh'];
                    results = new Map();
                    switches = Array(operations).fill(null).map(function (_, i) { return __awaiter(void 0, void 0, void 0, function () {
                        var locale, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    locale = locales[i % locales.length];
                                    return [4 /*yield*/, localizationManager.setLocale(locale)];
                                case 1:
                                    _a.sent();
                                    result = localizationManager.translate('welcome');
                                    results.set(locale, result);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(switches)];
                case 2:
                    _a.sent();
                    // Verify results for each locale
                    assert.strictEqual(results.get('en'), 'Welcome');
                    assert.strictEqual(results.get('ja'), 'ようこそ');
                    assert.strictEqual(results.get('ar'), 'مرحباً');
                    assert.strictEqual(results.get('zh'), '欢迎');
                    return [2 /*return*/];
            }
        });
    }); });
    test('maintains locale-specific number formatting', function () { return __awaiter(void 0, void 0, void 0, function () {
        var number, testCases, _i, testCases_4, _a, locale, expected, formatted;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, localizationManager.initialize()];
                case 1:
                    _b.sent();
                    number = 1234567.89;
                    testCases = [
                        { locale: 'en', expected: '1,234,567.89' },
                        { locale: 'de', expected: '1.234.567,89' },
                        { locale: 'ar', expected: '١٬٢٣٤٬٥٦٧٫٨٩' }
                    ];
                    _i = 0, testCases_4 = testCases;
                    _b.label = 2;
                case 2:
                    if (!(_i < testCases_4.length)) return [3 /*break*/, 5];
                    _a = testCases_4[_i], locale = _a.locale, expected = _a.expected;
                    return [4 /*yield*/, localizationManager.setLocale(locale)];
                case 3:
                    _b.sent();
                    formatted = languageService.formatNumber(number);
                    assert.strictEqual(formatted, expected);
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    }); });
});
// Mock implementation of vscode.Memento for testing
var MockMemento = /** @class */ (function () {
    function MockMemento() {
        this.storage = new Map();
    }
    MockMemento.prototype.get = function (key, defaultValue) {
        return this.storage.has(key) ? this.storage.get(key) : defaultValue;
    };
    MockMemento.prototype.update = function (key, value) {
        this.storage.set(key, value);
        return Promise.resolve();
    };
    return MockMemento;
}());
