// TypeScript declaration for BitbucketProvider
export class BitbucketProvider {
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
