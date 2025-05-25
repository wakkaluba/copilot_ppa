// TypeScript declaration for GitHubProvider
export class GitHubProvider {
  constructor();
  isConnected(): Promise<boolean>;
  getOpenPullRequests(): Promise<unknown[]>;
  createPullRequest(
    title: string,
    description: string,
    sourceBranch: string,
    targetBranch: string,
  ): Promise<unknown>;
}
