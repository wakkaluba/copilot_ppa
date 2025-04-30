/**
 * Types and interfaces for the security module
 */
/**
 * Severity levels for security issues
 */
export declare enum SecuritySeverity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
/**
 * Security issue found in code
 */
export interface SecurityIssue {
    /** Unique identifier for this issue type */
    id: string;
    /** Human-readable name of the issue */
    name: string;
    /** Description of the security issue */
    description: string;
    /** Severity level of the issue */
    severity: SecuritySeverity;
    /** File path where the issue was found */
    filePath: string;
    /** Line number where the issue was found */
    line?: number;
    /** Column number where the issue was found */
    column?: number;
    /** Code snippet showing the issue */
    codeSnippet?: string;
    /** CWE (Common Weakness Enumeration) ID if applicable */
    cweId?: string;
    /** Recommendations on how to fix the issue */
    recommendation?: string;
}
/**
 * Result of a code security scan
 */
export interface SecurityScanResult {
    /** Array of security issues found */
    issues: SecurityIssue[];
    /** Number of files that were scanned */
    scannedFiles: number;
    /** Summary counts by severity */
    summary: SecuritySummary;
    /** Timestamp when the scan was completed */
    timestamp: number;
}
/**
 * Vulnerability found in a dependency
 */
export interface DependencyVulnerability {
    /** Name of the vulnerable package */
    name: string;
    /** Version of the package */
    version: string;
    /** Array of vulnerability details */
    vulnerabilityInfo: VulnerabilityInfo[];
}
/**
 * Detailed information about a vulnerability
 */
export interface VulnerabilityInfo {
    /** Vulnerability identifier */
    id: string;
    /** Title of the vulnerability */
    title: string;
    /** Detailed description of the vulnerability */
    description: string;
    /** Severity level */
    severity: SecuritySeverity;
    /** Package versions that are vulnerable */
    vulnerableVersions?: string;
    /** Package versions that fix the vulnerability */
    patchedVersions?: string;
    /** References to CVEs or other resources */
    references?: string[];
    /** Recommendations for fixing */
    recommendation?: string;
    /** Published date of the vulnerability */
    publishedDate?: string;
}
/**
 * Result of dependency vulnerability scan
 */
export interface DependencyScanResult {
    /** List of vulnerable dependencies found */
    vulnerabilities: DependencyVulnerability[];
    /** Total number of dependencies scanned */
    totalDependencies: number;
    /** Whether any vulnerabilities were found */
    hasVulnerabilities: boolean;
    /** Timestamp when the scan was completed */
    timestamp: number;
}
/**
 * Security recommendation for improving code security
 */
export interface SecurityRecommendation {
    /** Unique identifier for this recommendation */
    id: string;
    /** Title of the recommendation */
    title: string;
    /** Detailed description */
    description: string;
    /** Severity level */
    severity: SecuritySeverity;
    /** Category of the recommendation */
    category: 'dependency' | 'code' | 'configuration' | 'authentication' | 'general';
    /** Implementation effort (1-5, 5 being most difficult) */
    effort: number;
    /** Implementation steps */
    implementationSteps?: string[];
    /** Code example if applicable */
    codeExample?: string;
    /** Whether the recommendation has been implemented */
    implemented?: boolean;
}
/**
 * Result of security recommendations analysis
 */
export interface RecommendationsResult {
    /** Array of security recommendations */
    recommendations: SecurityRecommendation[];
    /** Summary of recommendations by severity */
    analysisSummary: SecuritySummary;
    /** Timestamp when the recommendations were generated */
    timestamp: number;
}
/**
 * Summary of security findings by severity
 */
export interface SecuritySummary {
    /** Count of critical severity issues */
    critical: number;
    /** Count of high severity issues */
    high: number;
    /** Count of medium severity issues */
    medium: number;
    /** Count of low severity issues */
    low: number;
}
/**
 * Full security analysis result
 */
export interface SecurityAnalysisResult {
    /** Code security scan result */
    codeResult: SecurityScanResult;
    /** Dependency vulnerability scan result */
    dependencyResult: DependencyScanResult;
    /** Security recommendations result */
    recommendationsResult: RecommendationsResult;
    /** Overall security risk score (0-100) */
    overallRiskScore: number;
    /** Overall risk level */
    overallRiskLevel: 'low' | 'medium' | 'high';
    /** Timestamp when the analysis was completed */
    timestamp: number;
}
