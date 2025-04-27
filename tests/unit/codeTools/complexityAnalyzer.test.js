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
var complexityAnalyzer_1 = require("../../../src/codeTools/complexityAnalyzer");
var mockHelpers_1 = require("../../helpers/mockHelpers");
suite('ComplexityAnalyzer Tests', function () {
    var analyzer;
    var sandbox;
    var outputChannel;
    var context;
    setup(function () {
        sandbox = sinon.createSandbox();
        outputChannel = (0, mockHelpers_1.createMockOutputChannel)();
        context = (0, mockHelpers_1.createMockExtensionContext)();
        sandbox.stub(vscode.window, 'createOutputChannel').returns(outputChannel);
        sandbox.stub(vscode.workspace, 'getWorkspaceFolder').returns((0, mockHelpers_1.createMockWorkspaceFolder)());
        analyzer = new complexityAnalyzer_1.ComplexityAnalyzer(context);
    });
    teardown(function () {
        sandbox.restore();
    });
    test('initialize should create output channel', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, analyzer.initialize()];
                case 1:
                    _a.sent();
                    assert_1.strict.ok(outputChannel.show.called);
                    assert_1.strict.ok(outputChannel.clear.called);
                    return [2 /*return*/];
            }
        });
    }); });
    test('analyzeFile should warn if no active editor', function () { return __awaiter(void 0, void 0, void 0, function () {
        var showWarningStub;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');
                    sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);
                    return [4 /*yield*/, analyzer.analyzeFile()];
                case 1:
                    _a.sent();
                    assert_1.strict.ok(showWarningStub.calledWith('No active editor found'));
                    return [2 /*return*/];
            }
        });
    }); });
    test('analyzeCyclomaticComplexity should calculate correctly for simple function', function () {
        var code = "\n            function simple() {\n                return true;\n            }\n        ";
        var complexity = analyzer.calculateCyclomaticComplexity(code);
        assert_1.strict.strictEqual(complexity, 1);
    });
    test('analyzeCyclomaticComplexity should handle if statements', function () {
        var code = "\n            function withIf(value) {\n                if (value > 0) {\n                    return 'positive';\n                } else if (value < 0) {\n                    return 'negative';\n                } else {\n                    return 'zero';\n                }\n            }\n        ";
        var complexity = analyzer.calculateCyclomaticComplexity(code);
        assert_1.strict.strictEqual(complexity, 3);
    });
    test('analyzeCyclomaticComplexity should handle loops', function () {
        var code = "\n            function withLoops(arr) {\n                for (let i = 0; i < arr.length; i++) {\n                    while (arr[i] > 0) {\n                        arr[i]--;\n                    }\n                }\n            }\n        ";
        var complexity = analyzer.calculateCyclomaticComplexity(code);
        assert_1.strict.strictEqual(complexity, 3);
    });
    test('analyzeNesting should calculate maximum nesting level', function () {
        var code = "\n            function deeplyNested(condition1, condition2) {\n                if (condition1) {\n                    for (let i = 0; i < 10; i++) {\n                        if (condition2) {\n                            while (true) {\n                                break;\n                            }\n                        }\n                    }\n                }\n            }\n        ";
        var depth = analyzer.calculateNestingDepth(code);
        assert_1.strict.strictEqual(depth, 4);
    });
    test('analyzeFunction should identify complex methods', function () {
        var code = "\n            class Example {\n                complexMethod(x, y) {\n                    if (x > 0) {\n                        while (y > 0) {\n                            if (x === y) {\n                                return true;\n                            }\n                            y--;\n                        }\n                    }\n                    return false;\n                }\n\n                simpleMethod() {\n                    return 'simple';\n                }\n            }\n        ";
        var analysis = analyzer.analyzeFunction(code, 'complexMethod');
        assert_1.strict.ok(analysis.complexity > 3);
        assert_1.strict.strictEqual(analysis.name, 'complexMethod');
    });
    test('analyzeMetrics should combine different metrics', function () {
        var code = "\n            function combined(value) {\n                let result = 0;\n                if (value > 0) {\n                    for (let i = 0; i < value; i++) {\n                        result += i;\n                        if (i % 2 === 0) {\n                            while (result > 100) {\n                                result -= 10;\n                            }\n                        }\n                    }\n                }\n                return result;\n            }\n        ";
        var metrics = analyzer.analyzeMetrics(code);
        assert_1.strict.ok(metrics.cyclomaticComplexity > 4);
        assert_1.strict.ok(metrics.nestingDepth > 3);
        assert_1.strict.ok(metrics.maintainabilityIndex > 0);
        assert_1.strict.ok(metrics.maintainabilityIndex <= 100);
    });
    test('calculateMaintainabilityIndex should provide valid score', function () {
        var code = "\n            class Calculator {\n                add(a, b) { return a + b; }\n                subtract(a, b) { return a - b; }\n                multiply(a, b) { return a * b; }\n                divide(a, b) { \n                    if (b === 0) throw new Error('Division by zero');\n                    return a / b;\n                }\n            }\n        ";
        var maintainability = analyzer.calculateMaintainabilityIndex(code);
        assert_1.strict.ok(maintainability > 0);
        assert_1.strict.ok(maintainability <= 100);
    });
    test('getComplexityGrade should return correct grade', function () {
        var scores = [
            { complexity: 1, expected: 'A' },
            { complexity: 5, expected: 'A' },
            { complexity: 10, expected: 'B' },
            { complexity: 20, expected: 'C' },
            { complexity: 30, expected: 'D' },
            { complexity: 40, expected: 'E' }
        ];
        for (var _i = 0, scores_1 = scores; _i < scores_1.length; _i++) {
            var _a = scores_1[_i], complexity = _a.complexity, expected = _a.expected;
            assert_1.strict.strictEqual(analyzer.getComplexityGrade(complexity), expected);
        }
    });
});
