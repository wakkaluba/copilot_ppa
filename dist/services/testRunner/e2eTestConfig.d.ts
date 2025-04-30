/**
 * Supported E2E testing frameworks
 */
export type E2EFramework = 'cypress' | 'playwright' | 'puppeteer' | 'selenium' | 'testcafe' | 'other';
/**
 * Configuration for E2E tests
 */
export interface E2ETestConfig {
    framework: E2EFramework;
    command: string;
    configPath?: string;
    browser?: string;
    headless?: boolean;
}
/**
 * Service for detecting and configuring E2E test frameworks
 */
export declare class E2ETestConfigService {
    private static instance;
    /**
     * Get singleton instance of the service
     */
    static getInstance(): E2ETestConfigService;
    /**
     * Private constructor to enforce singleton
     */
    private constructor();
    /**
     * Detect the E2E framework in use in the given workspace
     */
    detectFramework(workspacePath: string): Promise<E2ETestConfig | undefined>;
    /**
     * Configure the E2E tests with user input
     */
    configureE2E(workspacePath: string): Promise<E2ETestConfig | undefined>;
    private fileExists;
    private folderContains;
    private findConfigPath;
}
