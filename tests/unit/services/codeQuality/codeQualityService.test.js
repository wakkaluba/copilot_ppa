"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sinon = require("sinon");
var assert = require("assert");
var codeQuality_1 = require("../../../../src/services/codeQuality");
var securityScanner_1 = require("../../../../src/services/codeQuality/securityScanner");
var codeOptimizer_1 = require("../../../../src/services/codeQuality/codeOptimizer");
var bestPracticesChecker_1 = require("../../../../src/services/codeQuality/bestPracticesChecker");
var codeReviewer_1 = require("../../../../src/services/codeQuality/codeReviewer");
var designImprovementSuggester_1 = require("../../../../src/services/codeQuality/designImprovementSuggester");
suite('CodeQualityService Tests', function () {
    var service;
    var sandbox;
    var context;
    setup(function () {
        sandbox = sinon.createSandbox();
        // Create mock extension context
        context = {
            subscriptions: [],
            extensionPath: '/test/path',
            // Add other required context properties as needed
        };
        service = new codeQuality_1.CodeQualityService(context);
    });
    teardown(function () {
        sandbox.restore();
    });
    test('service should initialize all components', function () {
        assert.ok(service.getSecurityScanner() instanceof securityScanner_1.SecurityScanner);
        assert.ok(service.getCodeOptimizer() instanceof codeOptimizer_1.CodeOptimizer);
        assert.ok(service.getBestPracticesChecker() instanceof bestPracticesChecker_1.BestPracticesChecker);
        assert.ok(service.getCodeReviewer() instanceof codeReviewer_1.CodeReviewer);
        assert.ok(service.getDesignImprovementSuggester() instanceof designImprovementSuggester_1.DesignImprovementSuggester);
    });
    test('code optimizer should analyze runtime complexity', function () {
        var optimizer = service.getCodeOptimizer();
        var document = {
            getText: function () { return "\n                function test() {\n                    for (let i = 0; i < n; i++) {\n                        for (let j = 0; j < n; j++) {\n                            // O(n\u00B2) complexity\n                        }\n                    }\n                }\n            "; },
            fileName: 'test.js',
            uri: { fsPath: 'test.js' }
        };
        var issues = optimizer.analyzeRuntimeComplexity(document);
        assert.ok(issues.length > 0);
        assert.ok(issues.some(function (issue) { return issue.message.includes('nested loops'); }));
    });
    test('code optimizer should detect potentially unbounded recursion', function () {
        var optimizer = service.getCodeOptimizer();
        var document = {
            getText: function () { return "\n                function factorial(n) {\n                    return n * factorial(n - 1); // Missing base case\n                }\n            "; },
            fileName: 'test.js',
            uri: { fsPath: 'test.js' }
        };
        var issues = optimizer.analyzeRuntimeComplexity(document);
        assert.ok(issues.length > 0);
        assert.ok(issues.some(function (issue) { return issue.message.includes('recursion'); }));
    });
    test('best practices checker should detect common issues', function () {
        var checker = service.getBestPracticesChecker();
        var document = {
            getText: function () { return "\n                function test() {\n                    var x = 1; // Using var instead of let/const\n                    console.log(x); // Using console.log in production\n                }\n            "; },
            fileName: 'test.js',
            uri: { fsPath: 'test.js' }
        };
        var issues = checker.analyzeDocument(document);
        assert.ok(issues.length >= 2);
        assert.ok(issues.some(function (issue) { return issue.message.includes('var'); }));
        assert.ok(issues.some(function (issue) { return issue.message.includes('console.log'); }));
    });
    test('design improvement suggester should detect design patterns', function () {
        var suggester = service.getDesignImprovementSuggester();
        var document = {
            getText: function () { return "\n                class UserManager {\n                    constructor() {\n                        this.users = [];\n                    }\n                    \n                    addUser(user) { this.users.push(user); }\n                    removeUser(user) { /* ... */ }\n                    getUser(id) { /* ... */ }\n                    updateUser(user) { /* ... */ }\n                }\n            "; },
            fileName: 'test.js',
            uri: { fsPath: 'test.js' }
        };
        var suggestions = suggester.analyzeDesign(document);
        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(function (s) { return s.message.includes('Repository pattern'); }));
    });
});
