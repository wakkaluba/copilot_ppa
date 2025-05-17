/**
 * Tests for index
 * Source: src\services\codeQuality\index.js
 */
const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const {
    CodeQualityService,
    SecurityScanner,
    CodeOptimizer,
    BestPracticesChecker,
    CodeReviewer,
    DesignImprovementSuggester
} = require('../../../src/services/codeQuality/index.js');

describe('CodeQualityService', () => {
    let context;
    beforeEach(() => {
        context = {};
    });

    it('should instantiate all sub-services', () => {
        const service = new CodeQualityService(context);
        assert(service.getSecurityScanner() instanceof SecurityScanner);
        assert(service.getCodeOptimizer() instanceof CodeOptimizer);
        assert(service.getBestPracticesChecker() instanceof BestPracticesChecker);
        assert(service.getCodeReviewer() instanceof CodeReviewer);
        assert(service.getDesignImprovementSuggester() instanceof DesignImprovementSuggester);
    });

    it('should return the same sub-service instances', () => {
        const service = new CodeQualityService(context);
        assert.strictEqual(service.getSecurityScanner(), service.getSecurityScanner());
        assert.strictEqual(service.getCodeOptimizer(), service.getCodeOptimizer());
        assert.strictEqual(service.getBestPracticesChecker(), service.getBestPracticesChecker());
        assert.strictEqual(service.getCodeReviewer(), service.getCodeReviewer());
        assert.strictEqual(service.getDesignImprovementSuggester(), service.getDesignImprovementSuggester());
    });
});

describe('Exports', () => {
    it('should export all main classes', () => {
        assert(SecurityScanner);
        assert(CodeOptimizer);
        assert(BestPracticesChecker);
        assert(CodeReviewer);
        assert(DesignImprovementSuggester);
    });
});
