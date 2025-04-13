import * as assert from 'assert';
import * as vscode from 'vscode';
import { WorkspaceAccessManager } from '../../commands/workspaceAccess';

suite('WorkspaceAccess Test Suite', () => {
    let workspaceAccess: WorkspaceAccessManager;

    setup(() => {
        workspaceAccess = WorkspaceAccessManager.getInstance();
    });

    test('Should initialize with correct default state', () => {
        assert.strictEqual(workspaceAccess.isEnabled(), false);
    });

    test('Should toggle workspace access', async () => {
        const initialState = workspaceAccess.isEnabled();
        await workspaceAccess.toggleAccess();
        assert.strictEqual(workspaceAccess.isEnabled(), !initialState);
    });

    test('Should emit change event when toggling', async () => {
        let eventFired = false;
        const disposable = workspaceAccess.onDidChangeAccess(() => {
            eventFired = true;
        });

        await workspaceAccess.toggleAccess();
        assert.strictEqual(eventFired, true);
        disposable.dispose();
    });
});
