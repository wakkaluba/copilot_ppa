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
var vscode = require("vscode");
var sinon = require("sinon");
var assert_1 = require("assert");
var codeOptimizer_1 = require("../../../../src/services/codeQuality/codeOptimizer");
var mockHelpers_1 = require("../../../helpers/mockHelpers");
suite('CodeOptimizer Tests', function () {
    var optimizer;
    var sandbox;
    var outputChannel;
    var context;
    setup(function () {
        sandbox = sinon.createSandbox();
        outputChannel = (0, mockHelpers_1.createMockOutputChannel)();
        context = (0, mockHelpers_1.createMockExtensionContext)();
        sandbox.stub(vscode.window, 'createOutputChannel').returns(outputChannel);
        optimizer = new codeOptimizer_1.CodeOptimizer(context);
    });
    teardown(function () {
        sandbox.restore();
    });
    test('optimizeFunction should improve loop performance', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, optimized;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function processArray(arr) {\n                for (let i = 0; i < arr.length; i++) {\n                    console.log(arr[i]);\n                }\n            }\n        ");
                    return [4 /*yield*/, optimizer.optimizeFunction(document, 'processArray')];
                case 1:
                    optimized = _a.sent();
                    assert_1.strict.ok(!optimized.includes('arr.length'));
                    assert_1.strict.ok(optimized.includes('const len ='));
                    assert_1.strict.ok(optimized.includes('< len;'));
                    return [2 /*return*/];
            }
        });
    }); });
    test('optimizeFunction should convert forEach to for...of when appropriate', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, optimized;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function processItems(items) {\n                items.forEach(item => {\n                    processItem(item);\n                });\n            }\n        ");
                    return [4 /*yield*/, optimizer.optimizeFunction(document, 'processItems')];
                case 1:
                    optimized = _a.sent();
                    assert_1.strict.ok(!optimized.includes('forEach'));
                    assert_1.strict.ok(optimized.includes('for (const item of items)'));
                    return [2 /*return*/];
            }
        });
    }); });
    test('analyzeMemoryUsage should identify potential memory leaks', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function createHandlers() {\n                const handlers = [];\n                for (let i = 0; i < 10; i++) {\n                    handlers.push(() => {\n                        console.log(i);\n                    });\n                }\n                return handlers;\n            }\n        ");
                    return [4 /*yield*/, optimizer.analyzeMemoryUsage(document)];
                case 1:
                    issues = _a.sent();
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'memory'; }));
                    assert_1.strict.ok(issues.some(function (i) { return i.message.includes('closure'); }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('suggestOptimizations should propose performance improvements', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, suggestions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function calculateFactorial(n) {\n                if (n <= 1) return 1;\n                return n * calculateFactorial(n - 1);\n            }\n        ");
                    return [4 /*yield*/, optimizer.suggestOptimizations(document)];
                case 1:
                    suggestions = _a.sent();
                    assert_1.strict.ok(suggestions.some(function (s) { return s.type === 'caching'; }));
                    assert_1.strict.ok(suggestions.some(function (s) { return s.message.includes('memoization'); }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('analyzeRedundancy should identify redundant operations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function processString(str) {\n                return str.trim().toLowerCase().trim();\n            }\n        ");
                    return [4 /*yield*/, optimizer.analyzeRedundancy(document)];
                case 1:
                    issues = _a.sent();
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'redundancy'; }));
                    assert_1.strict.ok(issues.some(function (i) { return i.message.includes('duplicate trim'); }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('suggestPropertyAccess should propose optimization', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, suggestions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function deepGet(obj) {\n                return obj.very.deep.nested.property.value;\n            }\n        ");
                    return [4 /*yield*/, optimizer.suggestPropertyAccess(document)];
                case 1:
                    suggestions = _a.sent();
                    assert_1.strict.ok(suggestions.some(function (s) { return s.type === 'propertyAccess'; }));
                    assert_1.strict.ok(suggestions.some(function (s) { return s.message.includes('destructuring'); }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('suggestAsyncOptimizations should propose improvements', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, suggestions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function processData(items) {\n                items.forEach(item => {\n                    fetch(item.url);\n                });\n            }\n        ");
                    return [4 /*yield*/, optimizer.suggestAsyncOptimizations(document)];
                case 1:
                    suggestions = _a.sent();
                    assert_1.strict.ok(suggestions.some(function (s) { return s.type === 'async'; }));
                    assert_1.strict.ok(suggestions.some(function (s) { return s.message.includes('Promise.all'); }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('suggestDataStructures should propose appropriate structures', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, suggestions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function uniqueValues(arr) {\n                return arr.filter((item, index) => arr.indexOf(item) === index);\n            }\n        ");
                    return [4 /*yield*/, optimizer.suggestDataStructures(document)];
                case 1:
                    suggestions = _a.sent();
                    assert_1.strict.ok(suggestions.some(function (s) { return s.type === 'dataStructure'; }));
                    assert_1.strict.ok(suggestions.some(function (s) { return s.message.includes('Set'); }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('analyzeTimeComplexity should identify inefficient algorithms', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, analysis;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function findDuplicates(arr) {\n                const duplicates = [];\n                for (let i = 0; i < arr.length; i++) {\n                    for (let j = i + 1; j < arr.length; j++) {\n                        if (arr[i] === arr[j]) {\n                            duplicates.push(arr[i]);\n                        }\n                    }\n                }\n                return duplicates;\n            }\n        ");
                    return [4 /*yield*/, optimizer.analyzeTimeComplexity(document)];
                case 1:
                    analysis = _a.sent();
                    assert_1.strict.strictEqual(analysis.complexity, 'O(n²)');
                    assert_1.strict.ok(analysis.suggestions.some(function (s) { return s.includes('Map') || s.includes('Set'); }));
                    return [2 /*return*/];
            }
        });
    }); });
});
