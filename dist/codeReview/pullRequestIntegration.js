"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestIntegration = void 0;
const githubProvider_1 = require("../repository/githubProvider");
const gitlabProvider_1 = require("../repository/gitlabProvider");
const bitbucketProvider_1 = require("../repository/bitbucketProvider");
/**
 * Provides integration with Pull Request systems from various Git providers
 */
class PullRequestIntegration {
    gitHubProvider;
    gitLabProvider;
    bitbucketProvider;
    activeProvider = null;
    constructor() {
        this.gitHubProvider = new githubProvider_1.GitHubProvider();
        this.gitLabProvider = new gitlabProvider_1.GitLabProvider();
        this.bitbucketProvider = new bitbucketProvider_1.BitbucketProvider();
    }
    /**
     * Detects the Git provider being used in the current workspace
     */
    async detectProvider() {
        // Check for GitHub first
        if (await this.gitHubProvider.isConnected()) {
            this.activeProvider = 'github';
            return true;
        }
        // Check for GitLab next
        if (await this.gitLabProvider.isConnected()) {
            this.activeProvider = 'gitlab';
            return true;
        }
        // Check for Bitbucket last
        if (await this.bitbucketProvider.isConnected()) {
            this.activeProvider = 'bitbucket';
            return true;
        }
        this.activeProvider = null;
        return false;
    }
    /**
     * Gets the list of open pull requests for the current repository
     */
    async getOpenPullRequests() {
        if (!this.activeProvider) {
            await this.detectProvider();
        }
        switch (this.activeProvider) {
            case 'github':
                return await this.gitHubProvider.getOpenPullRequests();
            case 'gitlab':
                return await this.gitLabProvider.getOpenPullRequests();
            case 'bitbucket':
                return await this.bitbucketProvider.getOpenPullRequests();
            default:
                throw new Error('No active Git provider detected');
        }
    }
    /**
     * Creates a new pull request with the specified details
     */
    async createPullRequest(title, description, sourceBranch, targetBranch) {
        if (!this.activeProvider) {
            await this.detectProvider();
        }
        switch (this.activeProvider) {
            case 'github':
                return await this.gitHubProvider.createPullRequest(title, description, sourceBranch, targetBranch);
            case 'gitlab':
                return await this.gitLabProvider.createPullRequest(title, description, sourceBranch, targetBranch);
            case 'bitbucket':
                return await this.bitbucketProvider.createPullRequest(title, description, sourceBranch, targetBranch);
            default:
                throw new Error('No active Git provider detected');
        }
    }
    /**
     * Adds a code review comment to a specific pull request
     */
    async addReviewComment(pullRequestId, filePath, lineNumber, comment) {
        if (!this.activeProvider) {
            await this.detectProvider();
        }
        switch (this.activeProvider) {
            case 'github':
                await this.gitHubProvider.addReviewComment(pullRequestId, filePath, lineNumber, comment);
                break;
            case 'gitlab':
                await this.gitLabProvider.addReviewComment(pullRequestId, filePath, lineNumber, comment);
                break;
            case 'bitbucket':
                await this.bitbucketProvider.addReviewComment(pullRequestId, filePath, lineNumber, comment);
                break;
            default:
                throw new Error('No active Git provider detected');
        }
    }
    /**
     * Submits a complete review for a pull request
     */
    async submitReview(pullRequestId, reviewState, summary) {
        if (!this.activeProvider) {
            await this.detectProvider();
        }
        switch (this.activeProvider) {
            case 'github':
                await this.gitHubProvider.submitReview(pullRequestId, reviewState, summary);
                break;
            case 'gitlab':
                await this.gitLabProvider.submitReview(pullRequestId, reviewState, summary);
                break;
            case 'bitbucket':
                await this.bitbucketProvider.submitReview(pullRequestId, reviewState, summary);
                break;
            default:
                throw new Error('No active Git provider detected');
        }
    }
    /**
     * Checks if a pull request meets the specified quality criteria
     */
    async checkPullRequestQuality(pullRequestId) {
        // Get the files changed in the PR
        const changedFiles = await this.getChangedFiles(pullRequestId);
        const issues = [];
        // Check each file for quality issues
        for (const file of changedFiles) {
            // Perform code quality checks on the file
            const fileIssues = await this.checkFileQuality(file);
            issues.push(...fileIssues);
        }
        // Determine if the PR passes quality checks
        const passed = issues.length === 0;
        return { passed, issues };
    }
    async getChangedFiles(pullRequestId) {
        if (!this.activeProvider) {
            await this.detectProvider();
        }
        switch (this.activeProvider) {
            case 'github':
                return await this.gitHubProvider.getChangedFiles(pullRequestId);
            case 'gitlab':
                return await this.gitLabProvider.getChangedFiles(pullRequestId);
            case 'bitbucket':
                return await this.bitbucketProvider.getChangedFiles(pullRequestId);
            default:
                throw new Error('No active Git provider detected');
        }
    }
    async checkFileQuality(filePath) {
        // Implement file quality checks
        // This would integrate with the code quality tools
        return [];
    }
}
exports.PullRequestIntegration = PullRequestIntegration;
//# sourceMappingURL=pullRequestIntegration.js.map