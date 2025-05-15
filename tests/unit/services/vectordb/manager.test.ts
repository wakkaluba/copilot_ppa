<<<<<<< HEAD
import * as vscode from 'vscode';
import { VectorDatabaseManager } from '../../../../src/services/vectordb/manager';
import { SearchOptions, VectorDatabaseOptions, VectorDocument } from '../../../../src/services/vectordb/models';
import { VectorDatabaseProvider } from '../../../../src/services/vectordb/provider';

jest.mock('vscode');

describe('VectorDatabaseManager', () => {
    let manager: VectorDatabaseManager;
    let mockContext: vscode.ExtensionContext;
    let mockProvider1: jest.Mocked<VectorDatabaseProvider>;
    let mockProvider2: jest.Mocked<VectorDatabaseProvider>;

    beforeEach(() => {
        // Setup mock context
        mockContext = {
            subscriptions: []
        } as unknown as vscode.ExtensionContext;

        // Setup mock providers
        mockProvider1 = {
            name: 'provider1',
            initialize: jest.fn().mockResolvedValue(undefined),
            close: jest.fn().mockResolvedValue(undefined),
            addDocument: jest.fn().mockResolvedValue('doc1'),
            addDocuments: jest.fn().mockResolvedValue(['doc1', 'doc2']),
            search: jest.fn().mockResolvedValue([
                { document: { id: 'doc1', content: 'test1' }, score: 0.9 }
            ]),
            getEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3])
        } as jest.Mocked<VectorDatabaseProvider>;

        mockProvider2 = {
            name: 'provider2',
            initialize: jest.fn().mockResolvedValue(undefined),
            close: jest.fn().mockResolvedValue(undefined),
            addDocument: jest.fn().mockResolvedValue('doc2'),
            addDocuments: jest.fn().mockResolvedValue(['doc3', 'doc4']),
            search: jest.fn().mockResolvedValue([
                { document: { id: 'doc2', content: 'test2' }, score: 0.8 }
            ]),
            getEmbedding: jest.fn().mockResolvedValue([0.4, 0.5, 0.6])
        } as jest.Mocked<VectorDatabaseProvider>;

        // Create manager instance
        manager = new VectorDatabaseManager(mockContext);
    });

    describe('Provider Management', () => {
        test('should register providers', () => {
            manager.registerProvider(mockProvider1);
            manager.registerProvider(mockProvider2);

            const providers = manager.getProviders();
            expect(providers).toHaveLength(2);
            expect(providers).toContain(mockProvider1);
            expect(providers).toContain(mockProvider2);
        });

        test('should get provider by name', () => {
            manager.registerProvider(mockProvider1);
            manager.registerProvider(mockProvider2);

            const provider1 = manager.getProvider('provider1');
            const provider2 = manager.getProvider('provider2');
            const nonexistent = manager.getProvider('nonexistent');

            expect(provider1).toBe(mockProvider1);
            expect(provider2).toBe(mockProvider2);
            expect(nonexistent).toBeUndefined();
        });

        test('should set active provider', async () => {
            manager.registerProvider(mockProvider1);
            manager.registerProvider(mockProvider2);

            const options: VectorDatabaseOptions = {
                dimensions: 768,
                metric: 'cosine'
            };

            const success = await manager.setActiveProvider('provider1', options);
            expect(success).toBe(true);
            expect(mockProvider1.initialize).toHaveBeenCalledWith(options);
            expect(manager.getActiveProvider()).toBe(mockProvider1);
        });

        test('should handle provider initialization failure', async () => {
            manager.registerProvider(mockProvider1);
            mockProvider1.initialize.mockRejectedValue(new Error('Init failed'));

            const success = await manager.setActiveProvider('provider1');
            expect(success).toBe(false);
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Failed to initialize provider1')
            );
        });
    });

    describe('Document Management', () => {
        beforeEach(() => {
            manager.registerProvider(mockProvider1);
            manager.setEnabled(true);
            manager.setActiveProvider('provider1');
        });

        test('should add single document', async () => {
            const doc: VectorDocument = {
                id: 'doc1',
                content: 'test content',
                metadata: { type: 'test' }
            };

            const id = await manager.addDocument(doc);
            expect(id).toBe('doc1');
            expect(mockProvider1.addDocument).toHaveBeenCalledWith(doc);
        });

        test('should add multiple documents', async () => {
            const docs: VectorDocument[] = [
                { id: 'doc1', content: 'test1' },
                { id: 'doc2', content: 'test2' }
            ];

            const ids = await manager.addDocuments(docs);
            expect(ids).toEqual(['doc1', 'doc2']);
            expect(mockProvider1.addDocuments).toHaveBeenCalledWith(docs);
        });

        test('should handle document addition errors', async () => {
            mockProvider1.addDocument.mockRejectedValue(new Error('Add failed'));

            const id = await manager.addDocument({ id: 'doc1', content: 'test' });
            expect(id).toBeNull();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Failed to add document')
            );
        });
    });

    describe('Search Functionality', () => {
        beforeEach(() => {
            manager.registerProvider(mockProvider1);
            manager.setEnabled(true);
            manager.setActiveProvider('provider1');
        });

        test('should search with text query', async () => {
            const query = 'test query';
            const options: SearchOptions = {
                limit: 10,
                minScore: 0.5
            };

            const results = await manager.search(query, options);
            expect(results).toHaveLength(1);
            expect(mockProvider1.search).toHaveBeenCalledWith(query, options);
        });

        test('should search with vector query', async () => {
            const query = [0.1, 0.2, 0.3];
            const results = await manager.search(query);
            expect(results).toHaveLength(1);
            expect(mockProvider1.search).toHaveBeenCalledWith(query, undefined);
        });

        test('should handle search errors', async () => {
            mockProvider1.search.mockRejectedValue(new Error('Search failed'));

            const results = await manager.search('test');
            expect(results).toEqual([]);
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Search failed')
            );
        });
    });

    describe('Embedding Generation', () => {
        beforeEach(() => {
            manager.registerProvider(mockProvider1);
            manager.setEnabled(true);
            manager.setActiveProvider('provider1');
        });

        test('should generate embeddings', async () => {
            const text = 'test text';
            const embedding = await manager.getEmbedding(text);
            expect(embedding).toEqual([0.1, 0.2, 0.3]);
            expect(mockProvider1.getEmbedding).toHaveBeenCalledWith(text);
        });

        test('should handle embedding errors', async () => {
            mockProvider1.getEmbedding.mockRejectedValue(new Error('Embedding failed'));

            const embedding = await manager.getEmbedding('test');
            expect(embedding).toBeNull();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Failed to generate embedding')
            );
        });
    });

    describe('Enable/Disable Functionality', () => {
        beforeEach(() => {
            manager.registerProvider(mockProvider1);
        });

        test('should handle disabled state', async () => {
            manager.setEnabled(false);
            await manager.setActiveProvider('provider1');

            const searchResults = await manager.search('test');
            const embedding = await manager.getEmbedding('test');
            const docId = await manager.addDocument({ id: 'doc1', content: 'test' });

            expect(searchResults).toEqual([]);
            expect(embedding).toBeNull();
            expect(docId).toBeNull();
        });

        test('should enable/disable functionality', () => {
            manager.setEnabled(true);
            expect(manager.isVectorDatabaseEnabled()).toBe(true);
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
                'setContext',
                'copilotPPA.vectorDatabaseEnabled',
                true
            );

            manager.setEnabled(false);
            expect(manager.isVectorDatabaseEnabled()).toBe(false);
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
                'setContext',
                'copilotPPA.vectorDatabaseEnabled',
                false
            );
        });
    });

    describe('Cleanup', () => {
        test('should close active provider', async () => {
            manager.registerProvider(mockProvider1);
            await manager.setActiveProvider('provider1');

            await manager.close();
            expect(mockProvider1.close).toHaveBeenCalled();
            expect(manager.getActiveProvider()).toBeNull();
        });
    });
=======
// Test scaffold for src/services/vectordb/manager.ts
import { Manager } from '../../../../src/services/vectordb/manager';

describe('VectorDB Manager', () => {
  it('should instantiate without error', () => {
    expect(() => new Manager()).not.toThrow();
  });
  // TODO: Add integration tests for different vector database providers
>>>>>>> cef1c76635fc36a1404b37471794ec45f6e9c2e4
});
