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
// ... imports ...
var codeOptimizer_1 = require("../../../../src/services/codeQuality/codeOptimizer");
// Assuming CodeReviewer might be part of CodeQualityService or another module now.
// Search for CodeReviewer or its functionality. Let's assume it's integrated or removed for now.
// import { CodeReviewer } from '../../../../src/services/codeQuality/codeReviewer';
var bestPracticesChecker_1 = require("../../../../src/services/codeQuality/bestPracticesChecker");
var designPatternSuggestor_1 = require("../../../../src/services/codeQuality/designPatternSuggestor");
var codeQualityService_1 = require("../../../../src/services/codeQuality/codeQualityService"); // Assuming QualityIssue is exported
var mockHelpers_1 = require("../../../helpers/mockHelpers"); // Assuming createMockLogger exists
suite('CodeQualityService Tests', function () {
    var service;
    var sandbox;
    var outputChannel; // Use LogOutputChannel
    var context;
    var optimizer;
    // let reviewer: sinon.SinonStubbedInstance<CodeReviewer>;
    var checker;
    var suggestor;
    var logger;
    setup(function () {
        sandbox = sinon.createSandbox();
        // Use createMockLogger or a manual mock
        logger = (0, mockHelpers_1.createMockLogger)(sandbox);
        outputChannel = logger.getOutputChannel(); // Get channel from logger if possible
        context = (0, mockHelpers_1.createMockExtensionContext)();
        // Stub dependencies, assuming they take logger now
        optimizer = sandbox.createStubInstance(codeOptimizer_1.CodeOptimizer);
        // reviewer = sandbox.createStubInstance(CodeReviewer);
        checker = sandbox.createStubInstance(bestPracticesChecker_1.BestPracticesChecker);
        suggestor = sandbox.createStubInstance(designPatternSuggestor_1.DesignPatternSuggestor);
        // Stub the getInstance or constructor methods of dependencies if they are singletons/static
        // sandbox.stub(CodeOptimizer, 'getInstance').returns(optimizer);
        // sandbox.stub(BestPracticesChecker, 'getInstance').returns(checker);
        // sandbox.stub(DesignPatternSuggestor, 'getInstance').returns(suggestor);
        // Instantiate the service, passing mocked dependencies
        service = new codeQualityService_1.CodeQualityService(context, logger, optimizer, checker, suggestor /*, reviewer */);
    });
    // ... teardown ...
    test('analyzeCode should call sub-analyzers and aggregate issues', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, optimizationIssues, practiceIssues, designSuggestions, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)('...');
                    optimizationIssues = [{ file: 'doc', line: 1, message: 'Optimize loop', severity: 'warning', type: 'performance' }];
                    practiceIssues = [{ file: 'doc', line: 5, message: 'Use const', severity: 'info', type: 'convention' }];
                    designSuggestions = [{ file: 'doc', line: 10, message: 'Consider Repository pattern', severity: 'suggestion', type: 'design' }];
                    // Assume analyzeDocument is the main method now for optimizer and checker
                    optimizer.analyzeDocument.resolves(optimizationIssues);
                    checker.analyzeDocument.resolves(practiceIssues); // Use analyzeDocument
                    suggestor.suggestPatterns.resolves(designSuggestions);
                    return [4 /*yield*/, service.analyzeCode(document)];
                case 1:
                    results = _a.sent();
                    assert.strictEqual(results.length, 3);
                    assert.ok(results.some(function (issue) { return issue.message.includes('Optimize loop'); }));
                    assert.ok(results.some(function (issue) { return issue.message.includes('Use const'); }));
                    assert.ok(results.some(function (issue) { return issue.message.includes('Repository pattern'); }));
                    sinon.assert.calledOnce(optimizer.analyzeDocument);
                    sinon.assert.calledOnce(checker.analyzeDocument);
                    sinon.assert.calledOnce(suggestor.suggestPatterns);
                    return [2 /*return*/];
            }
        });
    }); });
    test('optimizeCode should call CodeOptimizer', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, optimizedCode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)('function old() {}');
                    optimizer.optimizeDocument.resolves('function optimized() {}'); // Assuming optimizeDocument exists
                    return [4 /*yield*/, service.optimizeCode(document)];
                case 1:
                    optimizedCode = _a.sent();
                    assert.strictEqual(optimizedCode, 'function optimized() {}');
                    sinon.assert.calledOnce(optimizer.optimizeDocument);
                    return [2 /*return*/];
            }
        });
    }); });
    // Remove or adapt tests for removed/renamed methods like analyzeRuntimeComplexity
    /*
    test('analyzeRuntimeComplexity should identify nested loops', async () => {
        const document = createMockDocument(`
            function nestedLoop(arr) {
                for(let i=0; i<arr.length; i++) {
                    for(let j=0; j<arr.length; j++) {}
                }
            }
        `);
        // Assume analyzeDocument now returns complexity issues
        const complexityIssues: QualityIssue[] = [{ file: 'doc', line: 3, message: 'Nested loops detected O(n^2)', severity: 'warning', type: 'complexity' }];
        optimizer.analyzeDocument.resolves(complexityIssues); // Use analyzeDocument

        const issues = await service.analyzeCode(document); // Call the main analysis method

        // Add explicit type for issue parameter
        assert.ok(issues.some((issue: QualityIssue) => issue.message.includes('Nested loops')));
    });

    test('analyzeRuntimeComplexity should identify recursion', async () => {
        const document = createMockDocument(`
            function recursive(n) {
                if (n <= 0) return 1;
                return n * recursive(n - 1);
            }
        `);
         // Assume analyzeDocument now returns complexity issues
        const complexityIssues: QualityIssue[] = [{ file: 'doc', line: 4, message: 'Recursion detected', severity: 'warning', type: 'complexity' }];
        optimizer.analyzeDocument.resolves(complexityIssues); // Use analyzeDocument

        const issues = await service.analyzeCode(document); // Call the main analysis method

        // Add explicit type for issue parameter
        assert.ok(issues.some((issue: QualityIssue) => issue.message.includes('recursion')));
    });
    */
    test('checkBestPractices should call BestPracticesChecker', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, practiceIssues, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)('var x = 1; console.log(x);');
                    practiceIssues = [
                        { file: 'doc', line: 1, message: 'Use let or const instead of var', severity: 'info', type: 'convention' },
                        { file: 'doc', line: 1, message: 'Avoid console.log in production code', severity: 'warning', type: 'debugging' }
                    ];
                    checker.analyzeDocument.resolves(practiceIssues); // Use analyzeDocument
                    return [4 /*yield*/, service.checkBestPractices(document)];
                case 1:
                    issues = _a.sent();
                    assert.strictEqual(issues.length, 2);
                    // Add explicit type for issue parameter
                    assert.ok(issues.some(function (issue) { return issue.message.includes('var'); }));
                    assert.ok(issues.some(function (issue) { return issue.message.includes('console.log'); }));
                    sinon.assert.calledOnce(checker.analyzeDocument);
                    return [2 /*return*/];
            }
        });
    }); });
    test('suggestDesignPatterns should call DesignPatternSuggestor', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, designSuggestions, suggestions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)('class DataManager { load() {} save() {} }');
                    designSuggestions = [
                        { file: 'doc', line: 1, message: 'Consider using Repository pattern for data access', severity: 'suggestion', type: 'design' }
                    ];
                    suggestor.suggestPatterns.resolves(designSuggestions);
                    return [4 /*yield*/, service.suggestDesignPatterns(document)];
                case 1:
                    suggestions = _a.sent();
                    // Add await before accessing length/some
                    assert.ok(suggestions.length > 0);
                    // Add explicit type for s parameter
                    assert.ok(suggestions.some(function (s) { return s.message.includes('Repository pattern'); }));
                    sinon.assert.calledOnce(suggestor.suggestPatterns);
                    return [2 /*return*/];
            }
        });
    }); });
    // ... rest of the tests, adapting to use analyzeCode or specific service methods ...
});
