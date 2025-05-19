/**
 * Tests for index
 * Source: src\refactoring\index.ts
 */
import * as assert from 'assert';
import { RefactoringTools } from '../../src/codeTools/refactoringTools';

describe('RefactoringTools', () => {
  let refactoringTools: RefactoringTools;

  beforeEach(() => {
    refactoringTools = new RefactoringTools();
  });

  afterEach(() => {
    // Clean up if needed
    if (refactoringTools && typeof refactoringTools.dispose === 'function') {
      refactoringTools.dispose();
    }
  });

  it('should instantiate and initialize', async () => {
    assert.ok(refactoringTools);
    await assert.doesNotReject(() => refactoringTools.initialize());
  });

  it('should handle simplifyCode with no active editor', async () => {
    // Simulate no active editor
    const orig = (global as any).vscode?.window?.activeTextEditor;
    (global as any).vscode = { window: { activeTextEditor: undefined, showWarningMessage: () => {} } };
    await assert.doesNotReject(() => refactoringTools.simplifyCode());
    // Restore
    if (orig !== undefined) (global as any).vscode.window.activeTextEditor = orig;
  });

  it('should handle removeUnusedCode with no active editor', async () => {
    const orig = (global as any).vscode?.window?.activeTextEditor;
    (global as any).vscode = { window: { activeTextEditor: undefined, showWarningMessage: () => {} } };
    await assert.doesNotReject(() => refactoringTools.removeUnusedCode());
    if (orig !== undefined) (global as any).vscode.window.activeTextEditor = orig;
  });

  it('should handle refactorWithLLM with no active editor', async () => {
    const orig = (global as any).vscode?.window?.activeTextEditor;
    (global as any).vscode = { window: { activeTextEditor: undefined, showWarningMessage: () => {} } };
    await assert.doesNotReject(() => refactoringTools.refactorWithLLM('Refactor this code'));
    if (orig !== undefined) (global as any).vscode.window.activeTextEditor = orig;
  });
});
