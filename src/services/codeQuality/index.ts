import { SecurityScanner, SecurityIssue } from './securityScanner';
import { CodeOptimizer, OptimizationIssue } from './codeOptimizer';
import { BestPracticesChecker, BestPracticeIssue } from './bestPracticesChecker';
import { CodeReviewer, CodeReviewComment, CodeReviewReport } from './codeReviewer';
import { DesignImprovementSuggester, DesignIssue } from './designImprovementSuggester';

export {
    SecurityScanner,
    SecurityIssue,
    CodeOptimizer,
    OptimizationIssue,
    BestPracticesChecker,
    BestPracticeIssue,
    CodeReviewer,
    CodeReviewComment,
    CodeReviewReport,
    DesignImprovementSuggester,
    DesignIssue
};

export class CodeQualityService {
    private _securityScanner: SecurityScanner;
    private _codeOptimizer: CodeOptimizer;
    private _bestPracticesChecker: BestPracticesChecker;
    private _codeReviewer: CodeReviewer;
    private _designImprovementSuggester: DesignImprovementSuggester;
    
    constructor(context: import('vscode').ExtensionContext) {
        this._securityScanner = new SecurityScanner(context);
        this._codeOptimizer = new CodeOptimizer(context);
        this._bestPracticesChecker = new BestPracticesChecker(context);
        this._codeReviewer = new CodeReviewer(context);
        this._designImprovementSuggester = new DesignImprovementSuggester(context);
    }
    
    public getSecurityScanner(): SecurityScanner {
        return this._securityScanner;
    }
    
    public getCodeOptimizer(): CodeOptimizer {
        return this._codeOptimizer;
    }
    
    public getBestPracticesChecker(): BestPracticesChecker {
        return this._bestPracticesChecker;
    }
    
    public getCodeReviewer(): CodeReviewer {
        return this._codeReviewer;
    }
    
    public getDesignImprovementSuggester(): DesignImprovementSuggester {
        return this._designImprovementSuggester;
    }
}
