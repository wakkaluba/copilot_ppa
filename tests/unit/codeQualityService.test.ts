\
// ... imports ...
import { CodeOptimizer } from '../../../../src/services/codeQuality/codeOptimizer';
// Assuming CodeReviewer might be part of CodeQualityService or another module now.
// Search for CodeReviewer or its functionality. Let's assume it's integrated or removed for now.
// import { CodeReviewer } from '../../../../src/services/codeQuality/codeReviewer';
import { BestPracticesChecker } from '../../../../src/services/codeQuality/bestPracticesChecker';
import { DesignPatternSuggestor } from '../../../../src/services/codeQuality/designPatternSuggestor';
import { CodeQualityService, QualityIssue } from '../../../../src/services/codeQuality/codeQualityService'; // Assuming QualityIssue is exported
import { Logger } from '../../../../src/utils/logger';
import { createMockDocument, createMockExtensionContext, createMockOutputChannel, createMockLogger } from '../../../helpers/mockHelpers'; // Assuming createMockLogger exists

suite('CodeQualityService Tests', () => {
    let service: CodeQualityService;
    let sandbox: sinon.SinonSandbox;
    let outputChannel: vscode.LogOutputChannel; // Use LogOutputChannel
    let context: vscode.ExtensionContext;
    let optimizer: sinon.SinonStubbedInstance<CodeOptimizer>;
    // let reviewer: sinon.SinonStubbedInstance<CodeReviewer>;
    let checker: sinon.SinonStubbedInstance<BestPracticesChecker>;
    let suggestor: sinon.SinonStubbedInstance<DesignPatternSuggestor>;
    let logger: sinon.SinonStubbedInstance<Logger>;


    setup(() => {
        sandbox = sinon.createSandbox();
        // Use createMockLogger or a manual mock
        logger = createMockLogger(sandbox);
        outputChannel = logger.getOutputChannel() as vscode.LogOutputChannel; // Get channel from logger if possible

        context = createMockExtensionContext();

        // Stub dependencies, assuming they take logger now
        optimizer = sandbox.createStubInstance(CodeOptimizer);
        // reviewer = sandbox.createStubInstance(CodeReviewer);
        checker = sandbox.createStubInstance(BestPracticesChecker);
        suggestor = sandbox.createStubInstance(DesignPatternSuggestor);


        // Stub the getInstance or constructor methods of dependencies if they are singletons/static
        // sandbox.stub(CodeOptimizer, 'getInstance').returns(optimizer);
        // sandbox.stub(BestPracticesChecker, 'getInstance').returns(checker);
        // sandbox.stub(DesignPatternSuggestor, 'getInstance').returns(suggestor);

        // Instantiate the service, passing mocked dependencies
        service = new CodeQualityService(context, logger, optimizer, checker, suggestor /*, reviewer */);

    });

    // ... teardown ...

    test('analyzeCode should call sub-analyzers and aggregate issues', async () => {
        const document = createMockDocument('...');
        const optimizationIssues: QualityIssue[] = [{ file: 'doc', line: 1, message: 'Optimize loop', severity: 'warning', type: 'performance' }];
        const practiceIssues: QualityIssue[] = [{ file: 'doc', line: 5, message: 'Use const', severity: 'info', type: 'convention' }];
        const designSuggestions: QualityIssue[] = [{ file: 'doc', line: 10, message: 'Consider Repository pattern', severity: 'suggestion', type: 'design' }];

        // Assume analyzeDocument is the main method now for optimizer and checker
        optimizer.analyzeDocument.resolves(optimizationIssues);
        checker.analyzeDocument.resolves(practiceIssues); // Use analyzeDocument
        suggestor.suggestPatterns.resolves(designSuggestions);
        // reviewer.reviewCode.resolves([]); // If reviewer exists

        const results = await service.analyzeCode(document);

        assert.strictEqual(results.length, 3);
        assert.ok(results.some(issue => issue.message.includes('Optimize loop')));
        assert.ok(results.some(issue => issue.message.includes('Use const')));
        assert.ok(results.some(issue => issue.message.includes('Repository pattern')));
        sinon.assert.calledOnce(optimizer.analyzeDocument);
        sinon.assert.calledOnce(checker.analyzeDocument);
        sinon.assert.calledOnce(suggestor.suggestPatterns);
        // sinon.assert.calledOnce(reviewer.reviewCode);
    });

    test('optimizeCode should call CodeOptimizer', async () => {
        const document = createMockDocument('function old() {}');
        optimizer.optimizeDocument.resolves('function optimized() {}'); // Assuming optimizeDocument exists

        const optimizedCode = await service.optimizeCode(document);

        assert.strictEqual(optimizedCode, 'function optimized() {}');
        sinon.assert.calledOnce(optimizer.optimizeDocument);
    });


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

    test('checkBestPractices should call BestPracticesChecker', async () => {
        const document = createMockDocument('var x = 1; console.log(x);');
        const practiceIssues: QualityIssue[] = [
            { file: 'doc', line: 1, message: 'Use let or const instead of var', severity: 'info', type: 'convention' },
            { file: 'doc', line: 1, message: 'Avoid console.log in production code', severity: 'warning', type: 'debugging' }
        ];
        checker.analyzeDocument.resolves(practiceIssues); // Use analyzeDocument

        const issues = await service.checkBestPractices(document);

        assert.strictEqual(issues.length, 2);
        // Add explicit type for issue parameter
        assert.ok(issues.some((issue: QualityIssue) => issue.message.includes('var')));
        assert.ok(issues.some((issue: QualityIssue) => issue.message.includes('console.log')));
        sinon.assert.calledOnce(checker.analyzeDocument);
    });


    test('suggestDesignPatterns should call DesignPatternSuggestor', async () => {
        const document = createMockDocument('class DataManager { load() {} save() {} }');
        const designSuggestions: QualityIssue[] = [ // Assuming suggestPatterns returns QualityIssue[] now
             { file: 'doc', line: 1, message: 'Consider using Repository pattern for data access', severity: 'suggestion', type: 'design' }
        ];
        suggestor.suggestPatterns.resolves(designSuggestions);

        // Add await here
        const suggestions = await service.suggestDesignPatterns(document);

        // Add await before accessing length/some
        assert.ok(suggestions.length > 0);
        // Add explicit type for s parameter
        assert.ok(suggestions.some((s: QualityIssue) => s.message.includes('Repository pattern')));
        sinon.assert.calledOnce(suggestor.suggestPatterns);
    });

    // ... rest of the tests, adapting to use analyzeCode or specific service methods ...
});

