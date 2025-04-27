"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockDesignIssue = createMockDesignIssue;
describe('DesignIssue interface', function () {
    it('should create a valid design issue object', function () {
        var issue = {
            file: '/path/to/file.ts',
            line: 42,
            column: 5,
            severity: 'recommendation',
            description: 'This class has too many methods',
            improvement: 'Consider breaking it into smaller classes',
            category: 'patterns'
        };
        expect(issue).toBeDefined();
        expect(issue.file).toBe('/path/to/file.ts');
        expect(issue.line).toBe(42);
        expect(issue.column).toBe(5);
        expect(issue.severity).toBe('recommendation');
        expect(issue.description).toBe('This class has too many methods');
        expect(issue.improvement).toBe('Consider breaking it into smaller classes');
        expect(issue.category).toBe('patterns');
    });
    it('should allow different severity levels', function () {
        var criticalIssue = createMockDesignIssue({
            severity: 'critical'
        });
        var recommendationIssue = createMockDesignIssue({
            severity: 'recommendation'
        });
        var suggestionIssue = createMockDesignIssue({
            severity: 'suggestion'
        });
        expect(criticalIssue.severity).toBe('critical');
        expect(recommendationIssue.severity).toBe('recommendation');
        expect(suggestionIssue.severity).toBe('suggestion');
    });
    it('should allow different issue categories', function () {
        var architectureIssue = createMockDesignIssue({
            category: 'architecture'
        });
        var patternsIssue = createMockDesignIssue({
            category: 'patterns'
        });
        var structureIssue = createMockDesignIssue({
            category: 'structure'
        });
        var modularizationIssue = createMockDesignIssue({
            category: 'modularization'
        });
        var couplingIssue = createMockDesignIssue({
            category: 'coupling'
        });
        expect(architectureIssue.category).toBe('architecture');
        expect(patternsIssue.category).toBe('patterns');
        expect(structureIssue.category).toBe('structure');
        expect(modularizationIssue.category).toBe('modularization');
        expect(couplingIssue.category).toBe('coupling');
    });
    it('should work with React component issues', function () {
        var issue = {
            file: '/src/components/ComplexComponent.tsx',
            line: 10,
            column: 1,
            severity: 'critical',
            description: 'React component is too large (350 lines)',
            improvement: 'Break this component into smaller, more focused components',
            category: 'structure'
        };
        expect(issue).toBeDefined();
        expect(issue.file).toContain('Component');
        expect(issue.severity).toBe('critical');
        expect(issue.description).toContain('React component');
        expect(issue.category).toBe('structure');
    });
    it('should work with dependency issues', function () {
        var issue = {
            file: '/package.json',
            line: 1,
            column: 1,
            severity: 'recommendation',
            description: 'Multiple related dependencies for lodash',
            improvement: 'Consider consolidating related dependencies to reduce complexity',
            category: 'coupling'
        };
        expect(issue).toBeDefined();
        expect(issue.file).toBe('/package.json');
        expect(issue.description).toContain('dependencies');
        expect(issue.category).toBe('coupling');
    });
});
/**
 * Helper function to create mock design issues
 */
function createMockDesignIssue(overrides) {
    var defaultIssue = {
        file: '/path/to/file.ts',
        line: 42,
        column: 5,
        severity: 'recommendation',
        description: 'This class has too many methods',
        improvement: 'Consider breaking it into smaller classes',
        category: 'patterns'
    };
    return __assign(__assign({}, defaultIssue), overrides);
}
