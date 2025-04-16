/**
 * Tests for TestRunner interface types
 */
import { TestCase, TestSuite, TestResult } from '../../../../src/testRunner/testTypes';

describe('TestCase interface', () => {
  it('should create a valid passed test case with required fields', () => {
    const testCase: TestCase = {
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

  it('should create a valid failed test case with optional fields', () => {
    const testCase: TestCase = {
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

  it('should create a skipped test case', () => {
    const testCase: TestCase = {
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

describe('TestSuite interface', () => {
  it('should create an empty test suite', () => {
    const suite: TestSuite = {
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

  it('should create a test suite with tests', () => {
    const tests: TestCase[] = [
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

    const suite: TestSuite = {
      id: 'suite-2',
      name: 'Suite with Tests',
      tests,
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

  it('should create a nested test suite structure', () => {
    const innerSuite: TestSuite = {
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

    const outerSuite: TestSuite = {
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

describe('TestResult interface', () => {
  it('should create a valid test result', () => {
    const suite: TestSuite = {
      id: 'suite-1',
      name: 'Test Suite',
      tests: [
        { id: 'test-1', name: 'first test', status: 'passed', duration: 10 },
        { id: 'test-2', name: 'second test', status: 'failed', duration: 20, error: 'Error' },
        { id: 'test-3', name: 'skipped test', status: 'skipped', duration: 0 }
      ],
      suites: []
    };

    const testResult: TestResult = {
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

  it('should create a test result with multiple suites', () => {
    const suite1: TestSuite = {
      id: 'suite-1',
      name: 'Suite 1',
      tests: [
        { id: 'test-1', name: 'test in suite 1', status: 'passed', duration: 10 }
      ],
      suites: []
    };

    const suite2: TestSuite = {
      id: 'suite-2',
      name: 'Suite 2',
      tests: [
        { id: 'test-2', name: 'test in suite 2', status: 'passed', duration: 15 }
      ],
      suites: []
    };

    const testResult: TestResult = {
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

export function createMockTestCase(overrides?: Partial<TestCase>): TestCase {
  const defaultTestCase: TestCase = {
    id: 'mock-test-1',
    name: 'Mock test case',
    status: 'passed',
    duration: 15
  };

  return { ...defaultTestCase, ...overrides };
}

export function createMockTestSuite(overrides?: Partial<TestSuite>): TestSuite {
  const defaultSuite: TestSuite = {
    id: 'mock-suite-1',
    name: 'Mock test suite',
    tests: [
      createMockTestCase(),
      createMockTestCase({ id: 'mock-test-2', name: 'Another mock test' })
    ],
    suites: []
  };

  return { ...defaultSuite, ...overrides };
}

export function createMockTestResult(overrides?: Partial<TestResult>): TestResult {
  const suite = createMockTestSuite();
  
  const defaultResult: TestResult = {
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