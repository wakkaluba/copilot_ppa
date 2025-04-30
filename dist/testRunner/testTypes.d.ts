/**
 * Represents a test case with its execution result
 */
export interface TestCase {
    id: string;
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
    stackTrace?: string;
}
/**
 * Represents a test suite containing tests and other suites
 */
export interface TestSuite {
    id: string;
    name: string;
    tests: TestCase[];
    suites: TestSuite[];
}
/**
 * Represents the overall test execution results
 */
export interface TestResult {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    suites: TestSuite[];
    timestamp: Date;
    success: boolean;
    message?: string;
    details?: string;
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    performanceMetrics?: Record<string, number>;
}
