import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { WorkspaceStateService } from '../../../src/services/workspace/WorkspaceStateService';
import { FileContext, WorkspaceContext } from '../../../src/types/context';

suite('WorkspaceStateService Tests', () => {
    let service: WorkspaceStateService;
    let mockContext: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;
    let mockGlobalState: { [key: string]: any };

    setup(() => {
        sandbox = sinon.createSandbox();
        mockGlobalState = {};

        // Create mock vscode.ExtensionContext
        mockContext = {
            globalState: {
                get: (key: string) => mockGlobalState[key],
                update: async (key: string, value: any) => {
                    mockGlobalState[key] = value;
                    return Promise.resolve();
                }
            }
        } as any;

        service = new WorkspaceStateService(mockContext);
    });

    teardown(() => {
        sandbox.restore();
    });

    test('initialize should load workspace contexts from global state', async () => {
        const storedContexts = {
            'workspace1': {
                id: 'workspace1',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                activeFiles: [],
                preferences: {}
            }
        };
        mockGlobalState['contextManager.workspaces'] = storedContexts;

        await service.initialize();

        // Verify context was loaded
        const context = await service.getWorkspaceContext('workspace1');
        assert.strictEqual(context.id, 'workspace1');
    });

    test('initializeWorkspace should create new workspace context if not exists', async () => {
        const workspaceId = 'test-workspace';
        await service.initializeWorkspace(workspaceId);

        const context = await service.getWorkspaceContext(workspaceId);
        assert.strictEqual(context.id, workspaceId);
        assert.ok(context.createdAt);
        assert.ok(context.updatedAt);
        assert.deepStrictEqual(context.activeFiles, []);
        assert.deepStrictEqual(context.preferences, {});
    });

    test('initializeWorkspace should not overwrite existing workspace context', async () => {
        const workspaceId = 'test-workspace';
        const initialContext: WorkspaceContext = {
            id: workspaceId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            activeFiles: [{ path: 'test.ts', language: 'typescript' }],
            preferences: { theme: 'dark' }
        };

        mockGlobalState['contextManager.workspaces'] = {
            [workspaceId]: initialContext
        };

        await service.initialize();
        await service.initializeWorkspace(workspaceId);

        const context = await service.getWorkspaceContext(workspaceId);
        assert.deepStrictEqual(context, initialContext);
    });

    test('updateWorkspaceContext should update existing context', async () => {
        const workspaceId = 'test-workspace';
        await service.initializeWorkspace(workspaceId);

        const update = {
            preferences: { theme: 'light' }
        };

        await service.updateWorkspaceContext(workspaceId, update);

        const context = await service.getWorkspaceContext(workspaceId);
        assert.deepStrictEqual(context.preferences, update.preferences);
        assert.ok(context.updatedAt > context.createdAt);
    });

    test('updateActiveFile should manage active files list correctly', async () => {
        const workspaceId = 'test-workspace';
        await service.initializeWorkspace(workspaceId);

        const file1: FileContext = { path: 'test1.ts', language: 'typescript' };
        const file2: FileContext = { path: 'test2.ts', language: 'typescript' };

        await service.updateActiveFile(file1);
        await service.updateActiveFile(file2);

        const context = await service.getWorkspaceContext(workspaceId);
        assert.strictEqual(context.activeFiles[0].path, file2.path);
        assert.strictEqual(context.activeFiles[1].path, file1.path);
    });

    test('updateActiveFile should limit active files list size', async () => {
        const workspaceId = 'test-workspace';
        await service.initializeWorkspace(workspaceId);

        // Add more than 10 files
        for (let i = 0; i < 12; i++) {
            await service.updateActiveFile({
                path: `test${i}.ts`,
                language: 'typescript'
            });
        }

        const context = await service.getWorkspaceContext(workspaceId);
        assert.strictEqual(context.activeFiles.length, 10);
        assert.strictEqual(context.activeFiles[0].path, 'test11.ts');
    });

    test('clearAllWorkspaces should remove all workspace contexts', async () => {
        await service.initializeWorkspace('workspace1');
        await service.initializeWorkspace('workspace2');

        await service.clearAllWorkspaces();

        await assert.rejects(
            () => service.getWorkspaceContext('workspace1'),
            /No context found for workspace/
        );
        await assert.rejects(
            () => service.getWorkspaceContext('workspace2'),
            /No context found for workspace/
        );
    });

    test('getWorkspaceContext should throw for non-existent workspace', async () => {
        await assert.rejects(
            () => service.getWorkspaceContext('non-existent'),
            /No context found for workspace/
        );
    });

    test('dispose should not throw', () => {
        assert.doesNotThrow(() => service.dispose());
    });
});
