import { ITestCase, ITestResult, ITestSuite } from '../../../../src/types';

describe('TestTypes', () => {
    test('should create empty test suite', () => {
        const suite: ITestSuite = {
            id: 'suite-1',
            name: 'EmptySuite',
            tests: [],
            suites: []
        };

        expect(suite).toBeDefined();
        expect(suite.id).toBe('suite-1');
        expect(suite.name).toBe('EmptySuite');
        expect(suite.tests).toHaveLength(0);
        expect(suite.suites).toHaveLength(0);
    });

    test('should create test suite with tests', () => {
        const tests: ITestCase[] = [
            {
                id: 'test-1',
                name: 'firstTest',
                status: 'passed',
                duration: 10
            },
            {
                id: 'test-2',
                name: 'secondTest',
                status: 'failed',
                duration: 15,
                error: 'Something went wrong'
            }
        ];

        const suite: ITestSuite = {
            id: 'suite-2',
            name: 'SuiteWithTests',
            tests,
            suites: []
        };

        expect(suite).toBeDefined();
        expect(suite.id).toBe('suite-2');
        expect(suite.name).toBe('SuiteWithTests');
        expect(suite.tests).toHaveLength(2);
        expect(suite.tests[0].name).toBe('firstTest');
        expect(suite.tests[1].name).toBe('secondTest');
    });

    test('should create nested test suite structure', () => {
        const innerSuite: ITestSuite = {
            id: 'inner-suite',
            name: 'InnerSuite',
            tests: [
                {
                    id: 'inner-test',
                    name: 'innerTest',
                    status: 'passed',
                    duration: 5
                }
            ],
            suites: []
        };

        const outerSuite: ITestSuite = {
            id: 'outer-suite',
            name: 'OuterSuite',
            tests: [
                {
                    id: 'outer-test',
                    name: 'outerTest',
                    status: 'passed',
                    duration: 10
                }
            ],
            suites: [innerSuite]
        };

        expect(outerSuite).toBeDefined();
        expect(outerSuite.tests).toHaveLength(1);
        expect(outerSuite.suites).toHaveLength(1);
        expect(outerSuite.suites[0].tests).toHaveLength(1);
    });

    test('should create complete test result', () => {
        const suite: ITestSuite = {
            id: 'suite-1',
            name: 'TestSuite',
            tests: [
                { id: 'test-1', name: 'firstTest', status: 'passed', duration: 10 },
                { id: 'test-2', name: 'secondTest', status: 'failed', duration: 20, error: 'Error' },
                { id: 'test-3', name: 'skippedTest', status: 'skipped', duration: 0 }
            ],
            suites: []
        };

        const testResult: ITestResult = {
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
    });
});

/**
 * Mock factory functions for test runner interfaces
 */
export function createMockTestCase(overrides?: Partial<ITestCase>): ITestCase {
    const defaultTestCase: ITestCase = {
        id: 'mock-test-1',
        name: 'mockTestCase',
        status: 'passed',
        duration: 15
    };
    return { ...defaultTestCase, ...overrides };
}

export function createMockTestSuite(overrides?: Partial<ITestSuite>): ITestSuite {
    const defaultSuite: ITestSuite = {
        id: 'mock-suite-1',
        name: 'MockTestSuite',
        tests: [
            createMockTestCase(),
            createMockTestCase({ id: 'mock-test-2', name: 'anotherMockTest' })
        ],
        suites: []
    };
    return { ...defaultSuite, ...overrides };
}

export function createMockTestResult(overrides?: Partial<ITestResult>): ITestResult {
    const suite = createMockTestSuite();
    const defaultResult: ITestResult = {
        totalTests: 2,
        passed: 2,
        failed: 0,
        skipped: 0,
        duration: 30,
        suites: [suite],
        timestamp: new Date()
    };
    return { ...defaultResult, ...overrides };
}
