import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import { TestResult } from './testRunnerTypes';
import { SecurityToolService } from './services/SecurityToolService';
import { CommandExecutorService } from './services/CommandExecutorService';
import { SecurityResultParserService } from './services/SecurityResultParserService';
import { SecurityFilterService } from './services/SecurityFilterService';
import { SecuritySummaryService } from './services/SecuritySummaryService';

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
export class SecurityTestingService {
    private toolService: SecurityToolService;
    private executor: CommandExecutorService;
    private parser: SecurityResultParserService;
    private filter: SecurityFilterService;
    private summary: SecuritySummaryService;
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.toolService = new SecurityToolService();
        this.executor = new CommandExecutorService();
        this.parser = new SecurityResultParserService();
        this.filter = new SecurityFilterService();
        this.summary = new SecuritySummaryService();
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Security Testing');
    }

    /**
     * Run security testing
     */
    public async runSecurityTest(options: SecurityTestOptions): Promise<TestResult> {
        const workspace = options.path || vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspace) return { success: false, message: 'No workspace folder found' };

        this.outputChannel.appendLine(`Running security test on ${workspace}`);
        this.outputChannel.show();

        const tool = await this.toolService.detectTool(options, workspace);
        if (!tool) return { success: false, message: 'No security testing tool detected' };

        const cmd = options.command || this.toolService.buildCommand(tool, options);
        this.outputChannel.appendLine(`Running command: ${cmd}`);

        const result = await this.executor.execute(cmd, workspace, this.outputChannel);
        const vulnerabilities = await this.parser.parseResults(result, tool);
        const filtered = this.filter.apply(vulnerabilities, options);

        result.securityTest = {
            vulnerabilities: filtered,
            summary: this.summary.generate(filtered)
        };

        const passes = options.threshold === undefined || filtered.length <= options.threshold;
        result.success = !options.failOnVulnerabilities || filtered.length === 0 || passes;
        result.message = this.summary.createMessage(filtered, options, passes);

        return result;
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        this.outputChannel.dispose();
    }
}
