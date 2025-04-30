import { SecurityScanner, SecurityIssue } from './securityScanner';
import { CodeOptimizer, OptimizationIssue } from './codeOptimizer';
import { BestPracticesChecker, BestPracticeIssue } from './bestPracticesChecker';
import { CodeReviewer, CodeReviewComment, CodeReviewReport } from './codeReviewer';
import { DesignImprovementSuggester, DesignIssue } from './designImprovementSuggester';
export { SecurityScanner, SecurityIssue, CodeOptimizer, OptimizationIssue, BestPracticesChecker, BestPracticeIssue, CodeReviewer, CodeReviewComment, CodeReviewReport, DesignImprovementSuggester, DesignIssue };
export declare class CodeQualityService {
    private _securityScanner;
    private _codeOptimizer;
    private _bestPracticesChecker;
    private _codeReviewer;
    private _designImprovementSuggester;
    constructor(context: import('vscode').ExtensionContext);
    getSecurityScanner(): SecurityScanner;
    getCodeOptimizer(): CodeOptimizer;
    getBestPracticesChecker(): BestPracticesChecker;
    getCodeReviewer(): CodeReviewer;
    getDesignImprovementSuggester(): DesignImprovementSuggester;
}
