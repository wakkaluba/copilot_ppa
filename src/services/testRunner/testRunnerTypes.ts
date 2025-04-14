/**
 * Types of tests that can be run by the test runner
 */
export type TestType = 'unit' | 'integration' | 'e2e' | 'performance' | 'static' | 'coverage' | 'security';

/**
 * Options for running tests
 */
export interface TestRunnerOptions {
    /** Path to the directory containing the tests */
    path?: string;
    /** Specific test command to run (overrides auto-detection) */
    command?: string;
    /** Test files pattern to include */
    include?: string[];
    /** Test files pattern to exclude */
    exclude?: string[];
    /** Additional environment variables to set */
    env?: Record<string, string>;
    /** Timeout in milliseconds */
    timeout?: number;
    /** Whether to prompt for E2E configuration */
    configureE2E?: boolean;
    /** Browser to use for E2E tests */
    browser?: string;
    /** Whether to run E2E tests in headless mode */
    headless?: boolean;
    /** Whether to ask for a custom command if no command is detected */
    askForCustomCommand?: boolean;
    /** Performance test specific options */
    performance?: {
        /** Number of iterations for the performance test */
        iterations?: number;
        /** Warmup iterations before measuring performance */
        warmup?: number;
        /** Duration of the performance test in seconds */
        duration?: number;
    };
}

/**
 * Result of a test run
 */
export interface TestResult {
    /** Whether the tests passed successfully */
    success: boolean;
    /** A human-readable message about the test result */
    message: string;
    /** Additional details about the test run */
    details?: string;
    /** Exit code from the test process, if applicable */
    exitCode?: number | null;
    /** Standard output from the test process */
    stdout?: string;
    /** Standard error from the test process */
    stderr?: string;
    /** Performance metrics collected during the test */
    performanceMetrics?: Record<string, number>;
    /** Static analysis results */
    staticAnalysis?: {
        /** Raw output from the static analysis tool */
        raw: string;
        /** Number of issues found */
        issueCount?: number;
        /** Detailed list of issues */
        issues?: Array<{
            message: string;
            file?: string;
            line?: number;
            col?: number;
            severity?: string;
        }>;
    };
    /** Code coverage results */
    codeCoverage?: {
        /** Overall coverage percentage */
        overall: number;
        /** Statement coverage percentage */
        statements: number;
        /** Branch coverage percentage */
        branches: number;
        /** Function coverage percentage */
        functions: number;
        /** Line coverage percentage */
        lines: number;
        /** Number of files analyzed */
        totalFiles: number;
        /** Coverage data for individual files */
        files: Array<{
            /** Path to the file */
            path: string;
            /** Percentage of statements covered */
            statements: number;
            /** Percentage of branches covered */
            branches: number;
            /** Percentage of functions covered */
            functions: number;
            /** Percentage of lines covered */
            lines: number;
            /** Overall coverage percentage */
            overall: number;
            /** Line coverage details */
            lineDetails?: {
                /** Lines that are covered */
                covered: number[];
                /** Lines that are not covered */
                uncovered: number[];
                /** Lines that are partially covered */
                partial: number[];
            };
        }>;
    };
    /** Security test results */
    securityTest?: {
        /** Vulnerabilities found during security testing */
        vulnerabilities: Array<{
            /** Title or ID of the vulnerability */
            id: string;
            /** Detailed description */
            description: string;
            /** Severity level */
            severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
            /** Package or component with the vulnerability */
            package?: string;
            /** Version of the package */
            version?: string;
            /** Recommended fix */
            recommendation?: string;
            /** URL with more information */
            url?: string;
            /** CVSS score if available */
            cvssScore?: number;
        }>;
        /** Summary of vulnerabilities by severity */
        summary: {
            info: number;
            low: number;
            medium: number;
            high: number;
            critical: number;
            total: number;
        };
    };
}
