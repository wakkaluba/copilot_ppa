/**
 * Severity levels for security issues
 */
export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Base security issue information
 */
export interface SecurityIssue {
  id: string;
  name: string;
  description: string;
  severity: SecuritySeverity;
  file: string;
  line: number;
  column: number;
  codeSnippet: string;
  recommendation?: string;
  hasFix?: boolean;
}

/**
 * Pattern for identifying security issues in code
 */
export interface SecurityPattern {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  severity: SecuritySeverity;
  languages: string[];
  fix?: string;
}

/**
 * Result of a code security scan
 */
export interface SecurityScanResult {
  issues: SecurityIssue[];
  scannedFiles: number;
  timestamp: number;
}

/**
 * Information about a security vulnerability
 */
export interface VulnerabilityInfo {
  id: string;
  title: string;
  description: string;
  severity: SecuritySeverity;
  vulnerableVersions?: string;
  patchedVersions?: string[];
  packageName?: string;
  version?: string;
  references?: string[];
  recommendation?: string;
  publishedDate?: string;
  cwe?: string[];
  cvss?: {
    score: number;
    vector: string;
  };
}

/**
 * Dependency vulnerability information
 */
export interface DependencyVulnerability {
  name: string;
  version: string;
  vulnerabilityInfo: VulnerabilityInfo[];
  fixAvailable: boolean;
  fixedVersion?: string;
  timestamp: number;
}

/**
 * Result of a dependency scan
 */
export interface DependencyScanResult {
  vulnerabilities: DependencyVulnerability[];
  totalDependencies: number;
  hasVulnerabilities: boolean;
  timestamp: number;
  packageJsonPath?: string;
  packageName?: string;
  packageVersion?: string;
  nodeModulesSize?: number;
  nodeModulesLastUpdated?: number;
}

/**
 * Security summary counts by severity
 */
export interface SecuritySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

/**
 * Security recommendation
 */
export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  severity: SecuritySeverity;
  category: 'code' | 'dependencies' | 'general';
  impact: string;
  effort: 'low' | 'medium' | 'high';
  relatedIssues?: any[];
  recommendation: string;
  additionalInfo?: any;
}

/**
 * Result of recommendation generation
 */
export interface RecommendationResult {
  recommendations: SecurityRecommendation[];
  analysisSummary: SecuritySummary;
  timestamp: number;
}

/**
 * Complete security analysis result
 */
export interface SecurityAnalysisResult {
  codeResult: SecurityScanResult;
  dependencyResult: DependencyScanResult;
  recommendationsResult: RecommendationResult;
  overallRiskScore: number;
  timestamp: number;
}
