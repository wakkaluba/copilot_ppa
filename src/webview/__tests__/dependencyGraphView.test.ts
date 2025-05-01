import * as vscode from 'vscode';
import { DependencyAnalyzer } from '../../services/dependency/DependencyAnalyzer';
import { DependencyGraphViewProvider } from '../dependencyGraphView';
import { DependencyGraphRenderer } from '../renderers/DependencyGraphRenderer';

jest.mock('vscode');
jest.mock('../renderers/DependencyGraphRenderer');
jest.mock('../../services/dependency/DependencyAnalyzer');

describe('DependencyGraphViewProvider', () => {
    let provider: DependencyGraphViewProvider;
    let mockWebviewPanel: any;
    let mockRenderer: jest.Mocked<DependencyGraphRenderer>;
    let mockAnalyzer: jest.Mocked<DependencyAnalyzer>;

    beforeEach(() => {
        mockWebviewPanel = {
            webview: {
                html: '',
                onDidReceiveMessage: jest.fn(),
                postMessage: jest.fn()
            },
            onDidDispose: jest.fn(),
            reveal: jest.fn(),
            dispose: jest.fn()
        };

        mockRenderer = new DependencyGraphRenderer() as jest.Mocked<DependencyGraphRenderer>;
        mockRenderer.render.mockReturnValue('<mock-graph-html>');

        mockAnalyzer = new DependencyAnalyzer() as jest.Mocked<DependencyAnalyzer>;
        mockAnalyzer.analyzeDependencies.mockResolvedValue({
            nodes: [{ id: 'test', label: 'Test' }],
            edges: []
        });

        (vscode.window.createWebviewPanel as jest.Mock).mockReturnValue(mockWebviewPanel);

        provider = new DependencyGraphViewProvider(mockRenderer, mockAnalyzer);
    });

    describe('panel creation', () => {
        it('should create webview panel with correct options', async () => {
            await provider.show('/test/workspace');

            expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
                'dependencyGraph',
                'Dependency Graph',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );
        });

        it('should analyze dependencies and render graph', async () => {
            await provider.show('/test/workspace');

            expect(mockAnalyzer.analyzeDependencies).toHaveBeenCalledWith('/test/workspace');
            expect(mockRenderer.render).toHaveBeenCalledWith({
                nodes: [{ id: 'test', label: 'Test' }],
                edges: []
            });
            expect(mockWebviewPanel.webview.html).toBe('<mock-graph-html>');
        });

        it('should reuse existing panel if available', async () => {
            await provider.show('/test/workspace');
            await provider.show('/test/workspace');

            expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
            expect(mockWebviewPanel.reveal).toHaveBeenCalled();
        });
    });

    describe('message handling', () => {
        beforeEach(async () => {
            await provider.show('/test/workspace');
        });

        it('should handle node click messages', async () => {
            const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0];

            await messageHandler({
                type: 'nodeClick',
                nodeId: 'test-file.ts'
            });

            expect(vscode.workspace.openTextDocument).toHaveBeenCalled();
            expect(vscode.window.showTextDocument).toHaveBeenCalled();
        });

        it('should handle graph update messages', async () => {
            const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0];

            mockAnalyzer.analyzeDependencies.mockResolvedValueOnce({
                nodes: [{ id: 'updated', label: 'Updated' }],
                edges: []
            });

            await messageHandler({
                type: 'updateGraph'
            });

            expect(mockAnalyzer.analyzeDependencies).toHaveBeenCalled();
            expect(mockRenderer.render).toHaveBeenCalledWith({
                nodes: [{ id: 'updated', label: 'Updated' }],
                edges: []
            });
        });

        it('should handle filter messages', async () => {
            const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0];

            await messageHandler({
                type: 'filter',
                pattern: '*.ts'
            });

            expect(mockAnalyzer.filterDependencies).toHaveBeenCalledWith(
                expect.any(Object),
                '*.ts'
            );
            expect(mockRenderer.render).toHaveBeenCalled();
        });
    });

    describe('panel updates', () => {
        let panel: vscode.WebviewPanel;

        beforeEach(async () => {
            panel = await provider.show('/test/workspace') as vscode.WebviewPanel;
        });

        it('should update panel with new dependencies', async () => {
            const newDependencies = {
                nodes: [{ id: 'new', label: 'New' }],
                edges: []
            };

            mockAnalyzer.analyzeDependencies.mockResolvedValueOnce(newDependencies);
            await provider.update(panel, '/test/workspace');

            expect(mockRenderer.render).toHaveBeenCalledWith(newDependencies);
            expect(mockWebviewPanel.webview.html).toBe('<mock-graph-html>');
        });

        it('should handle update errors gracefully', async () => {
            const error = new Error('Analysis failed');
            mockAnalyzer.analyzeDependencies.mockRejectedValueOnce(error);

            await provider.update(panel, '/test/workspace');

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                'Failed to update dependency graph: Analysis failed'
            );
        });
    });

    describe('cleanup', () => {
        beforeEach(async () => {
            await provider.show('/test/workspace');
        });

        it('should dispose panel on cleanup', () => {
            const disposeHandler = mockWebviewPanel.onDidDispose.mock.calls[0][0];
            disposeHandler();

            // Should clear the panel reference
            expect(provider['currentPanel']).toBeUndefined();
        });

        it('should handle cleanup when updating disposed panel', async () => {
            mockWebviewPanel.dispose();

            await provider.update(mockWebviewPanel, '/test/workspace');
            expect(mockRenderer.render).not.toHaveBeenCalled();
        });
    });
});
