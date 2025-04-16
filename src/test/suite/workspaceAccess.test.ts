import * as vscode from 'vscode';
import { WorkspaceAccessManager } from '../../commands/workspaceAccess';

describe('WorkspaceAccess Tests', () => {
  let workspaceAccess: WorkspaceAccessManager;
  let mockEventEmitter: vscode.EventEmitter<boolean>;

  beforeEach(() => {
    // Create a new event emitter for each test
    mockEventEmitter = new vscode.EventEmitter<boolean>();
    jest.spyOn(WorkspaceAccessManager as any, 'onDidChangeAccessEmitter', 'get')
      .mockReturnValue(mockEventEmitter);

    workspaceAccess = WorkspaceAccessManager.getInstance();
  });

  afterEach(() => {
    // Reset the singleton instance
    (WorkspaceAccessManager as any).instance = undefined;
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('initializes with correct default state', () => {
      expect(workspaceAccess.isEnabled()).toBe(false);
    });

    test('maintains singleton instance', () => {
      const instance1 = WorkspaceAccessManager.getInstance();
      const instance2 = WorkspaceAccessManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Access Control', () => {
    test('toggles workspace access', async () => {
      const initialState = workspaceAccess.isEnabled();
      await workspaceAccess.toggleAccess();
      expect(workspaceAccess.isEnabled()).toBe(!initialState);
    });

    test('emits change event when toggling', async () => {
      const changeHandler = jest.fn();
      workspaceAccess.onDidChangeAccess(changeHandler);

      await workspaceAccess.toggleAccess();
      
      expect(changeHandler).toHaveBeenCalledWith(true);
    });

    test('handles multiple event listeners', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      workspaceAccess.onDidChangeAccess(handler1);
      workspaceAccess.onDidChangeAccess(handler2);

      await workspaceAccess.toggleAccess();

      expect(handler1).toHaveBeenCalledWith(true);
      expect(handler2).toHaveBeenCalledWith(true);
    });
  });

  describe('Event Handling', () => {
    test('properly disposes event listeners', () => {
      const handler = jest.fn();
      const disposable = workspaceAccess.onDidChangeAccess(handler);

      disposable.dispose();

      // Trigger a change
      mockEventEmitter.fire(true);

      expect(handler).not.toHaveBeenCalled();
    });

    test('handles event subscription after initialization', async () => {
      const handler = jest.fn();
      
      // Toggle access before subscribing
      await workspaceAccess.toggleAccess();
      
      // Subscribe to events
      workspaceAccess.onDidChangeAccess(handler);
      
      // Toggle again
      await workspaceAccess.toggleAccess();
      
      expect(handler).toHaveBeenCalledWith(false);
    });
  });

  describe('Error Handling', () => {
    test('handles toggle failure gracefully', async () => {
      // Mock a failure in the toggle operation
      jest.spyOn(workspaceAccess as any, 'updateState')
        .mockRejectedValueOnce(new Error('Toggle failed'));

      await expect(workspaceAccess.toggleAccess())
        .rejects.toThrow('Toggle failed');

      // State should remain unchanged
      expect(workspaceAccess.isEnabled()).toBe(false);
    });
  });
});
