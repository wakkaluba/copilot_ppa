/**
 * Supported performance testing frameworks/tools
 */
export type PerformanceFramework = 'lighthouse' | 'k6' | 'autocannon' | 'benchmark.js' | 'jmeter' | 'custom';
/**
 * Configuration for performance tests
 */
export interface PerformanceTestConfig {
    /** Framework used for performance testing */
    framework: PerformanceFramework;
    /** Command to execute the performance tests */
    command: string;
    /** Number of iterations to run */
    iterations?: number;
    /** Duration of the test in seconds */
    duration?: number;
    /** Target URL for web performance tests */
    targetUrl?: string;
    /** Custom metrics to collect */
    customMetrics?: string[];
}
/**
 * Service for configuring performance tests
 */
export declare class PerformanceTestConfigService {
    /**
     * Create a performance test configuration using a wizard
     */
    configurePerformanceTest(workspacePath: string): Promise<PerformanceTestConfig | undefined>;
    /**
     * Detect the performance testing tools available in the workspace
     */
    detectPerformanceTools(workspacePath: string): Promise<PerformanceFramework[]>;
    private hasNodeModule;
}
