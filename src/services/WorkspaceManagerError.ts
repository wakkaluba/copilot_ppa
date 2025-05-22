// Custom error for WorkspaceManager
export class WorkspaceManagerError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'WorkspaceManagerError';
  }
}
