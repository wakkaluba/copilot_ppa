import * as vscode from 'vscode';
import { FileContext } from '../../types/context';
import { WorkspaceStateService } from '../WorkspaceStateService';

describe('WorkspaceStateService', () => {
    let service: WorkspaceStateService;
    let mockContext: vscode.ExtensionContext;
    let mockGlobalState: Map<string, any>;

    beforeEach(() => {
        mockGlobalState = new Map();
        mockContext = {
            globalState: {
                get: jest.fn((key) => mockGlobalState.get(key)),
                update: jest.fn((key, value) => {
                    mockGlobalState.set(key, value);
                    return Promise.resolve();
                })
            }
        } as any;

        service = new WorkspaceStateService(mockContext);
    });

    describe('initialize', () => {
        it('should initialize from empty state', async () => {
            await service.initialize();
            expect(mockContext.globalState.get).toHaveBeenCalledWith('contextManager.workspaces');
        });

        it('should load existing workspaces', async () => {
            const existingData = {
                'workspace1': {
                    id: 'workspace1',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    activeFiles: [],
                    preferences: {}
                }
            };
            mockGlobalState.set('contextManager.workspaces', existingData);

            await service.initialize();

            const context = await service.getWorkspaceContext('workspace1');
            expect(context).toEqual(existingData['workspace1']);
        });
    });

    describe('initializeWorkspace', () => {
        it('should initialize new workspace with default values', async () => {
            const workspaceId = 'test-workspace';
            await service.initializeWorkspace(workspaceId);

            const context = await service.getWorkspaceContext(workspaceId);
            expect(context).toEqual({
                id: workspaceId,
                createdAt: expect.any(Number),
                updatedAt: expect.any(Number),
                activeFiles: [],
                preferences: {}
            });
        });

        it('should not reinitialize existing workspace', async () => {
            const workspaceId = 'test-workspace';
            const initialContext = {
                id: workspaceId,
                createdAt: 123,
                updatedAt: 456,
                activeFiles: [{ path: 'test.ts', lastOpened: 789 }],
                preferences: { theme: 'dark' }
            };

            mockGlobalState.set('contextManager.workspaces', { [workspaceId]: initialContext });
            await service.initialize();
            await service.initializeWorkspace(workspaceId);

            const context = await service.getWorkspaceContext(workspaceId);
            expect(context).toEqual(initialContext);
        });
    });

    describe('updateWorkspaceContext', () => {
        it('should update workspace context', async () => {
            const workspaceId = 'test-workspace';
            await service.initializeWorkspace(workspaceId);

            const update = {
                preferences: { theme: 'dark' }
            };

            await service.updateWorkspaceContext(workspaceId, update);

            const context = await service.getWorkspaceContext(workspaceId);
            expect(context.preferences).toEqual(update.preferences);
            expect(context.updatedAt).toBeGreaterThan(context.createdAt);
        });

        it('should throw error for non-existent workspace', async () => {
            await expect(service.updateWorkspaceContext('non-existent', {}))
                .rejects
                .toThrow('No context found for workspace: non-existent');
        });
    });

    describe('updateActiveFile', () => {
        it('should add new file to active files', async () => {
            const workspaceId = 'test-workspace';
            await service.initializeWorkspace(workspaceId);

            const fileContext: FileContext = {
                path: 'test.ts',
                lastOpened: Date.now()
            };

            await service.updateActiveFile(fileContext);

            const context = await service.getWorkspaceContext(workspaceId);
            expect(context.activeFiles[0]).toEqual(fileContext);
        });

        it('should move existing file to top of active files', async () => {
            const workspaceId = 'test-workspace';
            const oldFile = { path: 'old.ts', lastOpened: 123 };
            const initialContext = {
                id: workspaceId,
                createdAt: 123,
                updatedAt: 456,
                activeFiles: [oldFile],
                preferences: {}
            };

            mockGlobalState.set('contextManager.workspaces', { [workspaceId]: initialContext });
            await service.initialize();

            const newFile = { path: 'test.ts', lastOpened: Date.now() };
            await service.updateActiveFile(newFile);

            const context = await service.getWorkspaceContext(workspaceId);
            expect(context.activeFiles[0]).toEqual(newFile);
            expect(context.activeFiles[1]).toEqual(oldFile);
        });

        it('should limit active files to 10', async () => {
            const workspaceId = 'test-workspace';
            await service.initializeWorkspace(workspaceId);

            // Add 11 files
            for (let i = 0; i < 11; i++) {
                await service.updateActiveFile({
                    path: `file${i}.ts`,
                    lastOpened: Date.now() + i
                });
            }

            const context = await service.getWorkspaceContext(workspaceId);
            expect(context.activeFiles.length).toBe(10);
            expect(context.activeFiles[0].path).toBe('file10.ts');
            expect(context.activeFiles[9].path).toBe('file1.ts');
        });
    });

    describe('clearAllWorkspaces', () => {
        it('should clear all workspace contexts', async () => {
            const workspace1 = 'workspace1';
            const workspace2 = 'workspace2';
            await service.initializeWorkspace(workspace1);
            await service.initializeWorkspace(workspace2);

            await service.clearAllWorkspaces();

            await expect(service.getWorkspaceContext(workspace1))
                .rejects
                .toThrow('No context found for workspace: workspace1');
            await expect(service.getWorkspaceContext(workspace2))
                .rejects
                .toThrow('No context found for workspace: workspace2');
        });
    });

    describe('dispose', () => {
        it('should cleanup resources', () => {
            service.dispose();
            // No explicit assertions needed as dispose is currently a no-op
            // but we want to ensure it exists and can be called
        });
    });
});
