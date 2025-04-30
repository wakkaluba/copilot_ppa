/**
 * Provides integration with Pull Request systems from various Git providers
 */
export declare class PullRequestIntegration {
    private gitHubProvider;
    private gitLabProvider;
    private bitbucketProvider;
    private activeProvider;
    constructor();
    /**
     * Detects the Git provider being used in the current workspace
     */
    detectProvider(): Promise<boolean>;
    /**
     * Gets the list of open pull requests for the current repository
     */
    getOpenPullRequests(): Promise<any[]>;
    /**
     * Creates a new pull request with the specified details
     */
    createPullRequest(title: string, description: string, sourceBranch: string, targetBranch: string): Promise<any>;
    /**
     * Adds a code review comment to a specific pull request
     */
    addReviewComment(pullRequestId: string, filePath: string, lineNumber: number, comment: string): Promise<void>;
    /**
     * Submits a complete review for a pull request
     */
    submitReview(pullRequestId: string, reviewState: 'approve' | 'request_changes' | 'comment', summary: string): Promise<void>;
    /**
     * Checks if a pull request meets the specified quality criteria
     */
    checkPullRequestQuality(pullRequestId: string): Promise<{
        passed: boolean;
        issues: string[];
    }>;
    private getChangedFiles;
    private checkFileQuality;
}
