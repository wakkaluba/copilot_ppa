import { TestResult } from './testRunnerTypes';
/**
 * Supported security testing tools
 */
export type SecurityTool = 'snyk' | 'npm-audit' | 'owasp-dependency-check' | 'sonarqube' | 'trivy' | 'custom';
/**
 * Options for security testing
 */
export interface SecurityTestOptions {
    /** Path to analyze */
    path?: string;
    /** Specific tool to use */
    tool?: SecurityTool;
    /** Custom command to run */
    command?: string;
    /** Only report vulnerabilities with severity >= this level */
    severityThreshold?: 'info' | 'low' | 'medium' | 'high' | 'critical';
    /** Whether to fail test on vulnerabilities */
    failOnVulnerabilities?: boolean;
    /** Maximum number of vulnerabilities to allow */
    threshold?: number;
}
/**
 * Vulnerability found during security testing
 */
export interface SecurityVulnerability {
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
}
/**
 * Service for performing security testing
 */
export declare class SecurityTestingService {
    private toolService;
    private executor;
    private parser;
    private filter;
    private summary;
    private outputChannel;
    constructor();
    /**
     * Run security testing
     */
    runSecurityTest(options: SecurityTestOptions): Promise<TestResult>;
    /**
     * Clean up resources
     */
    dispose(): void;
}
