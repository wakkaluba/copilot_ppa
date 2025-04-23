import * as vscode from 'vscode';
import { SecuritySeverity } from '../types/security';

export interface SecurityAnalysisResult {
    codeResult: SecurityScanResult;
    dependencyResult: DependencyScanResult;
    recommendationsResult: RecommendationResult;
    overallRiskScore: number;
    riskLevel: RiskLevel;
    timestamp: number;
}

export interface SecurityScanResult {
    issues: SecurityIssue[];
    scannedFiles: number;
    timestamp: number;
}

export interface DependencyScanResult {
    vulnerabilities: DependencyVulnerability[];
    totalDependencies: number;
    hasVulnerabilities: boolean;
    timestamp: number;
}

export interface RecommendationResult {
    recommendations: SecurityRecommendation[];
    analysisSummary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}

export interface SecuritySummary {
    critical: number;
    high: number;
    medium: number;
    low: number;
}

export interface SecurityRecommendation {
    id: string;
    title: string;
    description: string;
    severity: SecuritySeverity;
    type: 'code' | 'dependency' | 'configuration';
    implementation?: string;
    packageSuggestion?: {
        name: string;
        flags?: string;
    };
}

export interface SecurityIssue {
    id: string;
    name: string;
    description: string;
    severity: SecuritySeverity;
    location: {
        file: string;
        line: number;
        column: number;
    };
    code?: string;
    recommendation?: string;
    ruleId?: string;
    documentation?: string;
}

export interface SecurityAction {
    type: 'fix' | 'install' | 'update' | 'remove';
    description: string;
    data: any;
}

export interface DependencyVulnerability {
    name: string;
    version: string;
    vulnerabilityInfo: {
        id: string;
        title: string;
        description: string;
        severity: SecuritySeverity;
        cvss?: number;
        fixedIn?: string;
    }[];
}

export interface VulnerabilityInfo {
    id: string;
    title: string;
    description: string;
    severity: SecuritySeverity;
    recommendation?: string;
}

/**
 * Security severity levels
 */
export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Overall risk levels
 */
export type RiskLevel = 'high' | 'medium' | 'low';

/**
 * Progress reporter function type
 */
export type ProgressReporter = (message: string) => void;

export interface ISecurityAnalysisService extends vscode.Disposable {
    scanWorkspace(): Promise<SecurityScanResult>;
    scanFile(document: vscode.TextDocument): Promise<SecurityIssue[]>;
}

export interface IDependencyAnalysisService extends vscode.Disposable {
    scanDependencies(): Promise<DependencyScanResult>;
}

export interface IRecommendationService extends vscode.Disposable {
    generate(): Promise<RecommendationResult>;
}