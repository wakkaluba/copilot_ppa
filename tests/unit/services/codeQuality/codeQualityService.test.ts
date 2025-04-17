import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { CodeQualityService } from '../../../../src/services/codeQuality';
import { SecurityScanner } from '../../../../src/services/codeQuality/securityScanner';
import { CodeOptimizer } from '../../../../src/services/codeQuality/codeOptimizer';
import { BestPracticesChecker } from '../../../../src/services/codeQuality/bestPracticesChecker';
import { CodeReviewer } from '../../../../src/services/codeQuality/codeReviewer';
import { DesignImprovementSuggester } from '../../../../src/services/codeQuality/designImprovementSuggester';

suite('CodeQualityService Tests', () => {
    let service: CodeQualityService;
    let sandbox: sinon.SinonSandbox;
    let context: vscode.ExtensionContext;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Create mock extension context
        context = {
            subscriptions: [],
            extensionPath: '/test/path',
            // Add other required context properties as needed
        } as any;

        service = new CodeQualityService(context);
    });

    teardown(() => {
        sandbox.restore();
    });

    test('service should initialize all components', () => {
        assert.ok(service.getSecurityScanner() instanceof SecurityScanner);
        assert.ok(service.getCodeOptimizer() instanceof CodeOptimizer);
        assert.ok(service.getBestPracticesChecker() instanceof BestPracticesChecker);
        assert.ok(service.getCodeReviewer() instanceof CodeReviewer);
        assert.ok(service.getDesignImprovementSuggester() instanceof DesignImprovementSuggester);
    });

    test('code optimizer should analyze runtime complexity', () => {
        const optimizer = service.getCodeOptimizer();
        const document = {
            getText: () => `
                function test() {
                    for (let i = 0; i < n; i++) {
                        for (let j = 0; j < n; j++) {
                            // O(n²) complexity
                        }
                    }
                }
            `,
            fileName: 'test.js',
            uri: { fsPath: 'test.js' }
        } as any;

        const issues = optimizer.analyzeRuntimeComplexity(document);
        
        assert.ok(issues.length > 0);
        assert.ok(issues.some(issue => issue.message.includes('nested loops')));
    });

    test('code optimizer should detect potentially unbounded recursion', () => {
        const optimizer = service.getCodeOptimizer();
        const document = {
            getText: () => `
                function factorial(n) {
                    return n * factorial(n - 1); // Missing base case
                }
            `,
            fileName: 'test.js',
            uri: { fsPath: 'test.js' }
        } as any;

        const issues = optimizer.analyzeRuntimeComplexity(document);
        
        assert.ok(issues.length > 0);
        assert.ok(issues.some(issue => issue.message.includes('recursion')));
    });

    test('best practices checker should detect common issues', () => {
        const checker = service.getBestPracticesChecker();
        const document = {
            getText: () => `
                function test() {
                    var x = 1; // Using var instead of let/const
                    console.log(x); // Using console.log in production
                }
            `,
            fileName: 'test.js',
            uri: { fsPath: 'test.js' }
        } as any;

        const issues = checker.analyzeDocument(document);
        
        assert.ok(issues.length >= 2);
        assert.ok(issues.some(issue => issue.message.includes('var')));
        assert.ok(issues.some(issue => issue.message.includes('console.log')));
    });

    test('design improvement suggester should detect design patterns', () => {
        const suggester = service.getDesignImprovementSuggester();
        const document = {
            getText: () => `
                class UserManager {
                    constructor() {
                        this.users = [];
                    }
                    
                    addUser(user) { this.users.push(user); }
                    removeUser(user) { /* ... */ }
                    getUser(id) { /* ... */ }
                    updateUser(user) { /* ... */ }
                }
            `,
            fileName: 'test.js',
            uri: { fsPath: 'test.js' }
        } as any;

        const suggestions = suggester.analyzeDesign(document);
        
        assert.ok(suggestions.length > 0);
        assert.ok(suggestions.some(s => s.message.includes('Repository pattern')));
    });
});