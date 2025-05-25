// Minimal stub for Bitbucket provider
class BitbucketProvider {
  constructor() {}
  async isConnected() {
    return false;
  }
  async getOpenPullRequests() {
    return [];
  }
  async createPullRequest(title, description, sourceBranch, targetBranch) {
    return { title, description, sourceBranch, targetBranch };
  }
}
module.exports = { BitbucketProvider };
