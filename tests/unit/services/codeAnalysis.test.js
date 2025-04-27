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
var codeAnalysis_1 = require("../../../src/services/codeAnalysis");
var complexityAnalyzer_1 = require("../../../src/codeTools/complexityAnalyzer");
var bestPracticesChecker_1 = require("../../../src/services/codeQuality/bestPracticesChecker");
var codeOptimizer_1 = require("../../../src/services/codeQuality/codeOptimizer");
var mockHelpers_1 = require("../../helpers/mockHelpers");
suite('CodeAnalysisService Tests', function () {
    var service;
    var sandbox;
    var outputChannel;
    var context;
    var complexityAnalyzer;
    var bestPracticesChecker;
    var codeOptimizer;
    setup(function () {
        sandbox = sinon.createSandbox();
        outputChannel = (0, mockHelpers_1.createMockOutputChannel)();
        context = (0, mockHelpers_1.createMockExtensionContext)();
        sandbox.stub(vscode.window, 'createOutputChannel').returns(outputChannel);
        // Create and stub the dependencies
        complexityAnalyzer = new complexityAnalyzer_1.ComplexityAnalyzer(context);
        bestPracticesChecker = new bestPracticesChecker_1.BestPracticesChecker(context);
        codeOptimizer = new codeOptimizer_1.CodeOptimizer(context);
        // Create service with dependencies
        service = new codeAnalysis_1.CodeAnalysisService(context, {
            complexityAnalyzer: complexityAnalyzer,
            bestPracticesChecker: bestPracticesChecker,
            codeOptimizer: codeOptimizer
        });
    });
    teardown(function () {
        sandbox.restore();
    });
    test('initialize should set up all analyzers', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, service.initialize()];
                case 1:
                    _a.sent();
                    assert_1.strict.ok(outputChannel.show.called);
                    assert_1.strict.ok(outputChannel.clear.called);
                    return [2 /*return*/];
            }
        });
    }); });
    test('analyzeCurrentFile should warn if no active editor', function () { return __awaiter(void 0, void 0, void 0, function () {
        var showWarningStub;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');
                    sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);
                    return [4 /*yield*/, service.analyzeCurrentFile()];
                case 1:
                    _a.sent();
                    assert_1.strict.ok(showWarningStub.calledWith('No active editor found'));
                    return [2 /*return*/];
            }
        });
    }); });
    test('analyzeCode should run full analysis', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, analysis;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function complexFunction(x, y) {\n                var result = 0;\n                for (let i = 0; i < x; i++) {\n                    for (let j = 0; j < y; j++) {\n                        result += i * j;\n                        console.log(result);\n                    }\n                }\n                return result;\n            }\n        ");
                    return [4 /*yield*/, service.analyzeCode(document)];
                case 1:
                    analysis = _a.sent();
                    assert_1.strict.ok(analysis.complexity);
                    assert_1.strict.ok(analysis.bestPractices);
                    assert_1.strict.ok(analysis.optimization);
                    assert_1.strict.ok(analysis.complexity.cyclomaticComplexity > 1);
                    assert_1.strict.ok(analysis.bestPractices.some(function (issue) { return issue.type === 'convention'; }));
                    assert_1.strict.ok(analysis.optimization.suggestions.length > 0);
                    return [2 /*return*/];
            }
        });
    }); });
    test('getComplexityMetrics should return metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, metrics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function test(condition) {\n                if (condition) {\n                    return true;\n                } else {\n                    return false;\n                }\n            }\n        ");
                    return [4 /*yield*/, service.getComplexityMetrics(document)];
                case 1:
                    metrics = _a.sent();
                    assert_1.strict.ok(metrics.cyclomaticComplexity > 1);
                    assert_1.strict.ok(metrics.maintainabilityIndex >= 0);
                    assert_1.strict.ok(metrics.maintainabilityIndex <= 100);
                    return [2 /*return*/];
            }
        });
    }); });
    test('getCodeIssues should return code quality issues', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function badFunction() {\n                var x = 0;\n                console.log(x);\n                return x * 0.15;\n            }\n        ");
                    return [4 /*yield*/, service.getCodeIssues(document)];
                case 1:
                    issues = _a.sent();
                    assert_1.strict.ok(Array.isArray(issues));
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'convention'; }));
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'debugging'; }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('getOptimizationSuggestions should return suggestions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, suggestions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function inefficientFunction(arr) {\n                return arr.filter((item, index) => arr.indexOf(item) === index);\n            }\n        ");
                    return [4 /*yield*/, service.getOptimizationSuggestions(document)];
                case 1:
                    suggestions = _a.sent();
                    assert_1.strict.ok(Array.isArray(suggestions));
                    assert_1.strict.ok(suggestions.some(function (s) { return s.type === 'dataStructure'; }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('analyzeCodeQuality should provide comprehensive report', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, report;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            class TestClass {\n                constructor() {\n                    var value = 0;\n                    console.log('initialized');\n                }\n                \n                getData(param) {\n                    return param * 0.15;\n                }\n            }\n        ");
                    return [4 /*yield*/, service.analyzeCodeQuality(document)];
                case 1:
                    report = _a.sent();
                    assert_1.strict.ok(report.complexity);
                    assert_1.strict.ok(report.bestPractices);
                    assert_1.strict.ok(report.suggestions);
                    assert_1.strict.ok(report.score >= 0);
                    assert_1.strict.ok(report.score <= 100);
                    return [2 /*return*/];
            }
        });
    }); });
    test('analyzeDependencyGraph should analyze imports', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, graph;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            import { Service1 } from './service1';\n            import { Service2 } from './service2';\n            import { Utils } from '../utils';\n\n            export class MyService {\n                constructor(private service1: Service1, private service2: Service2) {}\n                \n                process() {\n                    return Utils.combine(\n                        this.service1.getData(),\n                        this.service2.getData()\n                    );\n                }\n            }\n        ");
                    return [4 /*yield*/, service.analyzeDependencyGraph(document)];
                case 1:
                    graph = _a.sent();
                    assert_1.strict.ok(graph.nodes.length === 4); // MyService + 3 imports
                    assert_1.strict.ok(graph.edges.length === 3); // 3 dependencies
                    assert_1.strict.ok(graph.circular === false);
                    return [2 /*return*/];
            }
        });
    }); });
    test('analyzeMaintainability should rate code maintainability', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            class Calculator {\n                add(a: number, b: number) { return a + b; }\n                subtract(a: number, b: number) { return a - b; }\n                multiply(a: number, b: number) { return a * b; }\n                divide(a: number, b: number) { \n                    if (b === 0) throw new Error('Division by zero');\n                    return a / b;\n                }\n            }\n        ");
                    return [4 /*yield*/, service.analyzeMaintainability(document)];
                case 1:
                    result = _a.sent();
                    assert_1.strict.ok(result.maintainabilityIndex >= 0);
                    assert_1.strict.ok(result.maintainabilityIndex <= 100);
                    assert_1.strict.ok(result.comments.length > 0);
                    return [2 /*return*/];
            }
        });
    }); });
    test('getRefactoringPlan should suggest improvements', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, plan;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function processData(items) {\n                var results = [];\n                for (var i = 0; i < items.length; i++) {\n                    var item = items[i];\n                    if (item.value > 0) {\n                        results.push({\n                            id: item.id,\n                            processed: item.value * 0.15,\n                            timestamp: new Date()\n                        });\n                    }\n                }\n                return results;\n            }\n        ");
                    return [4 /*yield*/, service.getRefactoringPlan(document)];
                case 1:
                    plan = _a.sent();
                    assert_1.strict.ok(plan.suggestions.length > 0);
                    assert_1.strict.ok(plan.priority.length > 0);
                    assert_1.strict.ok(plan.estimatedImpact >= 0);
                    assert_1.strict.ok(plan.estimatedImpact <= 1);
                    return [2 /*return*/];
            }
        });
    }); });
});
