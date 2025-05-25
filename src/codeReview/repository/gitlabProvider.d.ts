// TypeScript declaration for GitLabProvider
export class GitLabProvider {
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
