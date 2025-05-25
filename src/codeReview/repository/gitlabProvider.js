// Minimal stub for GitLab provider
class GitLabProvider {
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
module.exports = { GitLabProvider };
