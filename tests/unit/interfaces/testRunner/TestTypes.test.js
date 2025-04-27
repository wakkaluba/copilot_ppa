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
exports.createMockTestCase = createMockTestCase;
exports.createMockTestSuite = createMockTestSuite;
exports.createMockTestResult = createMockTestResult;
describe('TestCase interface', function () {
    it('should create a valid passed test case with required fields', function () {
        var testCase = {
            id: 'test-1',
            name: 'should do something correctly',
            status: 'passed',
            duration: 42
        };
        expect(testCase).toBeDefined();
        expect(testCase.id).toBe('test-1');
        expect(testCase.name).toBe('should do something correctly');
        expect(testCase.status).toBe('passed');
        expect(testCase.duration).toBe(42);
        expect(testCase.error).toBeUndefined();
        expect(testCase.stackTrace).toBeUndefined();
    });
    it('should create a valid failed test case with optional fields', function () {
        var testCase = {
            id: 'test-2',
            name: 'should handle errors',
            status: 'failed',
            duration: 123,
            error: 'Expected true to be false',
            stackTrace: 'at Object.<anonymous> (/src/test.js:42:3)'
        };
        expect(testCase).toBeDefined();
        expect(testCase.id).toBe('test-2');
        expect(testCase.name).toBe('should handle errors');
        expect(testCase.status).toBe('failed');
        expect(testCase.duration).toBe(123);
        expect(testCase.error).toBe('Expected true to be false');
        expect(testCase.stackTrace).toBe('at Object.<anonymous> (/src/test.js:42:3)');
    });
    it('should create a skipped test case', function () {
        var testCase = {
            id: 'test-3',
            name: 'should be implemented later',
            status: 'skipped',
            duration: 0
        };
        expect(testCase).toBeDefined();
        expect(testCase.id).toBe('test-3');
        expect(testCase.name).toBe('should be implemented later');
        expect(testCase.status).toBe('skipped');
        expect(testCase.duration).toBe(0);
    });
});
describe('TestSuite interface', function () {
    it('should create an empty test suite', function () {
        var suite = {
            id: 'suite-1',
            name: 'Empty Suite',
            tests: [],
            suites: []
        };
        expect(suite).toBeDefined();
        expect(suite.id).toBe('suite-1');
        expect(suite.name).toBe('Empty Suite');
        expect(suite.tests).toHaveLength(0);
        expect(suite.suites).toHaveLength(0);
    });
    it('should create a test suite with tests', function () {
        var tests = [
            {
                id: 'test-1',
                name: 'first test',
                status: 'passed',
                duration: 10
            },
            {
                id: 'test-2',
                name: 'second test',
                status: 'failed',
                duration: 15,
                error: 'Something went wrong'
            }
        ];
        var suite = {
            id: 'suite-2',
            name: 'Suite with Tests',
            tests: tests,
            suites: []
        };
        expect(suite).toBeDefined();
        expect(suite.id).toBe('suite-2');
        expect(suite.name).toBe('Suite with Tests');
        expect(suite.tests).toHaveLength(2);
        expect(suite.tests[0].name).toBe('first test');
        expect(suite.tests[1].name).toBe('second test');
        expect(suite.suites).toHaveLength(0);
    });
    it('should create a nested test suite structure', function () {
        var innerSuite = {
            id: 'inner-suite',
            name: 'Inner Suite',
            tests: [
                {
                    id: 'inner-test',
                    name: 'inner test',
                    status: 'passed',
                    duration: 5
                }
            ],
            suites: []
        };
        var outerSuite = {
            id: 'outer-suite',
            name: 'Outer Suite',
            tests: [
                {
                    id: 'outer-test',
                    name: 'outer test',
                    status: 'passed',
                    duration: 10
                }
            ],
            suites: [innerSuite]
        };
        expect(outerSuite).toBeDefined();
        expect(outerSuite.id).toBe('outer-suite');
        expect(outerSuite.name).toBe('Outer Suite');
        expect(outerSuite.tests).toHaveLength(1);
        expect(outerSuite.tests[0].name).toBe('outer test');
        expect(outerSuite.suites).toHaveLength(1);
        expect(outerSuite.suites[0].id).toBe('inner-suite');
        expect(outerSuite.suites[0].name).toBe('Inner Suite');
        expect(outerSuite.suites[0].tests).toHaveLength(1);
        expect(outerSuite.suites[0].tests[0].name).toBe('inner test');
    });
});
describe('TestResult interface', function () {
    it('should create a valid test result', function () {
        var suite = {
            id: 'suite-1',
            name: 'Test Suite',
            tests: [
                { id: 'test-1', name: 'first test', status: 'passed', duration: 10 },
                { id: 'test-2', name: 'second test', status: 'failed', duration: 20, error: 'Error' },
                { id: 'test-3', name: 'skipped test', status: 'skipped', duration: 0 }
            ],
            suites: []
        };
        var testResult = {
            totalTests: 3,
            passed: 1,
            failed: 1,
            skipped: 1,
            duration: 30,
            suites: [suite],
            timestamp: new Date('2025-04-16T12:00:00.000Z')
        };
        expect(testResult).toBeDefined();
        expect(testResult.totalTests).toBe(3);
        expect(testResult.passed).toBe(1);
        expect(testResult.failed).toBe(1);
        expect(testResult.skipped).toBe(1);
        expect(testResult.duration).toBe(30);
        expect(testResult.suites).toHaveLength(1);
        expect(testResult.suites[0].id).toBe('suite-1');
        expect(testResult.timestamp).toEqual(new Date('2025-04-16T12:00:00.000Z'));
    });
    it('should create a test result with multiple suites', function () {
        var suite1 = {
            id: 'suite-1',
            name: 'Suite 1',
            tests: [
                { id: 'test-1', name: 'test in suite 1', status: 'passed', duration: 10 }
            ],
            suites: []
        };
        var suite2 = {
            id: 'suite-2',
            name: 'Suite 2',
            tests: [
                { id: 'test-2', name: 'test in suite 2', status: 'passed', duration: 15 }
            ],
            suites: []
        };
        var testResult = {
            totalTests: 2,
            passed: 2,
            failed: 0,
            skipped: 0,
            duration: 25,
            suites: [suite1, suite2],
            timestamp: new Date()
        };
        expect(testResult).toBeDefined();
        expect(testResult.totalTests).toBe(2);
        expect(testResult.passed).toBe(2);
        expect(testResult.failed).toBe(0);
        expect(testResult.skipped).toBe(0);
        expect(testResult.suites).toHaveLength(2);
        expect(testResult.suites[0].name).toBe('Suite 1');
        expect(testResult.suites[1].name).toBe('Suite 2');
    });
});
/**
 * Mock factory functions for test runner interfaces
 */
function createMockTestCase(overrides) {
    var defaultTestCase = {
        id: 'mock-test-1',
        name: 'Mock test case',
        status: 'passed',
        duration: 15
    };
    return __assign(__assign({}, defaultTestCase), overrides);
}
function createMockTestSuite(overrides) {
    var defaultSuite = {
        id: 'mock-suite-1',
        name: 'Mock test suite',
        tests: [
            createMockTestCase(),
            createMockTestCase({ id: 'mock-test-2', name: 'Another mock test' })
        ],
        suites: []
    };
    return __assign(__assign({}, defaultSuite), overrides);
}
function createMockTestResult(overrides) {
    var suite = createMockTestSuite();
    var defaultResult = {
        totalTests: 2,
        passed: 2,
        failed: 0,
        skipped: 0,
        duration: 30,
        suites: [suite],
        timestamp: new Date()
    };
    return __assign(__assign({}, defaultResult), overrides);
}
