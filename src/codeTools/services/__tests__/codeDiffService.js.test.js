const vscode = require('vscode');
const path = require('path');
const { CodeDiffService } = require('../../services/CodeDiffService');

// Mock VS Code APIs
jest.mock('vscode', () => ({
  Uri: {
    parse: jest.fn().mockImplementation((uriString) => ({
      toString: () => uriString,
      fsPath: `/test/path/${uriString}`,
      path: `/test/path/${uriString}`,
      with: jest.fn().mockImplementation(({ scheme, path }) => ({
        scheme,
        path,
        fsPath: path,
        toString: () => `${scheme}:${path}`
      }))
    }))
  },
  workspace: {
    openTextDocument: jest.fn().mockResolvedValue({
      lineCount: 10
    }),
    applyEdit: jest.fn().mockResolvedValue(true)
  },
  WorkspaceEdit: jest.fn().mockImplementation(() => ({
    replace: jest.fn()
  })),
  Range: jest.fn().mockImplementation((startLine, startChar, endLine, endChar) => ({
    startLine,
    startChar,
    endLine,
    endChar
  })),
  commands: {
    executeCommand: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('CodeDiffService - JavaScript', () => {
  let diffService;
  let mockUri;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create a new instance of the service for each test
    diffService = new CodeDiffService();

    // Create a mock URI
    mockUri = vscode.Uri.parse('file:///test/example.js');
  });

  describe('showDiff', () => {
    it('should create URIs for original and modified content', async () => {
      const originalContent = 'original code';
      const modifiedContent = 'modified code';
      const title = 'Test Diff';

      await diffService.showDiff(mockUri, originalContent, modifiedContent, title);

      // Verify that the URI.with method was called with the correct parameters
      expect(mockUri.with).toHaveBeenCalledWith({
        scheme: 'original',
        path: `${mockUri.path}.original`
      });
      expect(mockUri.with).toHaveBeenCalledWith({
        scheme: 'modified',
        path: `${mockUri.path}.modified`
      });
    });

    it('should open text documents for original and modified content', async () => {
      const originalContent = 'original code';
      const modifiedContent = 'modified code';
      const title = 'Test Diff';

      await diffService.showDiff(mockUri, originalContent, modifiedContent, title);

      // Verify that openTextDocument was called with the correct URIs
      expect(vscode.workspace.openTextDocument).toHaveBeenCalledTimes(2);
    });

    it('should create and apply workspace edits for original and modified content', async () => {
      const originalContent = 'original code';
      const modifiedContent = 'modified code';
      const title = 'Test Diff';

      await diffService.showDiff(mockUri, originalContent, modifiedContent, title);

      // Verify that WorkspaceEdit was created twice
      expect(vscode.WorkspaceEdit).toHaveBeenCalledTimes(2);

      // Verify that applyEdit was called twice
      expect(vscode.workspace.applyEdit).toHaveBeenCalledTimes(2);
    });

    it('should execute the vscode.diff command with correct parameters', async () => {
      const originalContent = 'original code';
      const modifiedContent = 'modified code';
      const title = 'Test Diff';
      const fileName = path.basename(mockUri.fsPath);

      await diffService.showDiff(mockUri, originalContent, modifiedContent, title);

      // Verify that the diff command was executed with the correct parameters
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'vscode.diff',
        expect.anything(), // Original URI
        expect.anything(), // Modified URI
        `${fileName} - ${title}`
      );
    });

    it('should handle empty content gracefully', async () => {
      const originalContent = '';
      const modifiedContent = '';
      const title = 'Empty Diff';

      await diffService.showDiff(mockUri, originalContent, modifiedContent, title);

      // Verify that the function completes without errors
      expect(vscode.workspace.applyEdit).toHaveBeenCalledTimes(2);
      expect(vscode.commands.executeCommand).toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      const originalContent = 'original code';
      const modifiedContent = 'modified code';
      const title = 'Error Test';

      // Simulate an error when applying edits
      vscode.workspace.applyEdit.mockRejectedValueOnce(new Error('Edit error'));

      // Expect the function to propagate the error
      await expect(diffService.showDiff(mockUri, originalContent, modifiedContent, title))
        .rejects.toThrow('Edit error');
    });

    it('should handle long content differences', async () => {
      const originalContent = 'a\nb\nc\nd\ne\nf\ng\nh\ni\nj\nk\nl\nm\nn\no\np\nq\nr\ns\nt';
      const modifiedContent = 'a\nb\nCHANGED\nd\ne\nCHANGED\ng\nh\ni\nj\nk\nl\nm\nn\no\np\nq\nr\ns\nt';
      const title = 'Long Diff';

      await diffService.showDiff(mockUri, originalContent, modifiedContent, title);

      // Verify the function completes successfully with large content
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'vscode.diff',
        expect.anything(),
        expect.anything(),
        expect.stringContaining('Long Diff')
      );
    });
  });
});
