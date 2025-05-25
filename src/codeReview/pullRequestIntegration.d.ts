// Minimal type declaration for JS module to satisfy TypeScript
export class PullRequestIntegration {
  activeProvider: 'github' | 'gitlab' | 'bitbucket' | null;
  gitHubProvider: unknown;
  gitLabProvider: unknown;
  bitbucketProvider: unknown;
  constructor();
  detectProvider(): Promise<boolean>;
  getOpenPullRequests(): Promise<unknown[]>;
  createPullRequest(
    title: string,
    description: string,
    sourceBranch: string,
    targetBranch: string,
  ): Promise<unknown>;
}
