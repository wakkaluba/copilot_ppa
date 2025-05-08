const vscode = require('vscode');
const { VectorDatabaseProvider } = require('../provider');

// Create a mock implementation of VectorDatabaseProvider for testing
class MockVectorDatabaseProvider {
    constructor() {
        this.name = 'Mock Provider';
        this._isAvailable = false;
        this.documents = new Map();
        this.initialized = false;
        this.mockEmbedding = Array(128).fill(0).map((_, i) => i / 128); // Generate simple embedding
    }

    get isAvailable() {
        return this._isAvailable;
    }

    async initialize(options) {
        this._isAvailable = true;
        this.initialized = true;
    }

    async addDocument(document) {
        if (!this.initialized) {
            throw new Error('Provider not initialized');
        }

        const id = document.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const docWithId = {
            ...document,
            id,
            embedding: document.embedding || await this.getEmbedding(document.content)
        };

        this.documents.set(id, docWithId);
        return id;
    }

    async addDocuments(documents) {
        if (!this.initialized) {
            throw new Error('Provider not initialized');
        }

        const results = await Promise.all(documents.map(doc => this.addDocument(doc)));
        return results;
    }

    async getDocument(id) {
        if (!this.initialized) {
            throw new Error('Provider not initialized');
        }

        return this.documents.get(id) || null;
    }

    async updateDocument(id, document) {
        if (!this.initialized) {
            throw new Error('Provider not initialized');
        }

        const existingDoc = this.documents.get(id);
        if (!existingDoc) {
            return false;
        }

        const updatedDoc = {
            ...existingDoc,
            ...document,
            id // Ensure ID doesn't change
        };

        if (document.content && !document.embedding) {
            updatedDoc.embedding = await this.getEmbedding(document.content);
        }

        this.documents.set(id, updatedDoc);
        return true;
    }

    async deleteDocument(id) {
        if (!this.initialized) {
            throw new Error('Provider not initialized');
        }

        if (!this.documents.has(id)) {
            return false;
        }

        this.documents.delete(id);
        return true;
    }

    async deleteAll() {
        if (!this.initialized) {
            throw new Error('Provider not initialized');
        }

        this.documents.clear();
    }

    async search(query, options = {}) {
        if (!this.initialized) {
            throw new Error('Provider not initialized');
        }

        const queryEmbedding = Array.isArray(query) ? query : await this.getEmbedding(query);
        const limit = options.limit || 10;
        const minScore = options.minScore || 0;

        // Calculate dot product similarity between query and documents
        const results = [];

        for (const doc of this.documents.values()) {
            if (!doc.embedding) {
                continue;
            }

            // Very basic similarity calculation - for testing only
            const score = this.calculateSimilarity(queryEmbedding, doc.embedding);

            if (score >= minScore) {
                results.push({ document: doc, score });
            }
        }

        // Sort by score (descending) and limit
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    async getEmbedding(text) {
        // For testing purposes, just create a simple embedding from the text length
        // In a real implementation, this would call an embedding model
        return [...this.mockEmbedding].map(val => val * text.length % 1);
    }

    async close() {
        this._isAvailable = false;
        this.initialized = false;
    }

    calculateSimilarity(embedding1, embedding2) {
        // Simple dot product for test purposes
        let dotProduct = 0;
        const minLength = Math.min(embedding1.length, embedding2.length);

        for (let i = 0; i < minLength; i++) {
            dotProduct += embedding1[i] * embedding2[i];
        }

        return dotProduct;
    }
}

describe('VectorDatabaseProvider interface (JavaScript)', () => {
    let provider;

    beforeEach(() => {
        provider = new MockVectorDatabaseProvider();
    });

    describe('initialization', () => {
        test('should initialize the provider', async () => {
            expect(provider.isAvailable).toBe(false);
            await provider.initialize();
            expect(provider.isAvailable).toBe(true);
        });

        test('should initialize with custom options', async () => {
            const options = {
                dimensions: 128,
                metric: 'cosine'
            };

            await provider.initialize(options);
            expect(provider.isAvailable).toBe(true);
        });
    });

    describe('document operations', () => {
        beforeEach(async () => {
            await provider.initialize();
        });

        test('should add a document and return an ID', async () => {
            const document = {
                id: 'test-doc-1',
                content: 'This is a test document'
            };

            const id = await provider.addDocument(document);
            expect(id).toBe('test-doc-1');

            const retrievedDoc = await provider.getDocument(id);
            expect(retrievedDoc).not.toBeNull();
            expect(retrievedDoc.content).toBe('This is a test document');
        });

        test('should add multiple documents', async () => {
            const documents = [
                { id: 'test-doc-2', content: 'Document 2' },
                { id: 'test-doc-3', content: 'Document 3' }
            ];

            const ids = await provider.addDocuments(documents);
            expect(ids.length).toBe(2);
            expect(ids).toContain('test-doc-2');
            expect(ids).toContain('test-doc-3');
        });

        test('should update a document', async () => {
            const document = {
                id: 'test-doc-4',
                content: 'Original content'
            };

            await provider.addDocument(document);

            const updateSuccess = await provider.updateDocument('test-doc-4', {
                content: 'Updated content'
            });

            expect(updateSuccess).toBe(true);

            const retrievedDoc = await provider.getDocument('test-doc-4');
            expect(retrievedDoc.content).toBe('Updated content');
        });

        test('should return false when updating non-existent document', async () => {
            const updateSuccess = await provider.updateDocument('non-existent-id', {
                content: 'Updated content'
            });

            expect(updateSuccess).toBe(false);
        });

        test('should delete a document', async () => {
            const document = {
                id: 'test-doc-5',
                content: 'Document to delete'
            };

            await provider.addDocument(document);

            const deleteSuccess = await provider.deleteDocument('test-doc-5');
            expect(deleteSuccess).toBe(true);

            const retrievedDoc = await provider.getDocument('test-doc-5');
            expect(retrievedDoc).toBeNull();
        });

        test('should return false when deleting non-existent document', async () => {
            const deleteSuccess = await provider.deleteDocument('non-existent-id');
            expect(deleteSuccess).toBe(false);
        });

        test('should delete all documents', async () => {
            const documents = [
                { id: 'test-doc-6', content: 'Document 6' },
                { id: 'test-doc-7', content: 'Document 7' }
            ];

            await provider.addDocuments(documents);
            await provider.deleteAll();

            const doc6 = await provider.getDocument('test-doc-6');
            const doc7 = await provider.getDocument('test-doc-7');

            expect(doc6).toBeNull();
            expect(doc7).toBeNull();
        });
    });

    describe('search operations', () => {
        beforeEach(async () => {
            await provider.initialize();

            const documents = [
                { id: 'doc1', content: 'TypeScript is a programming language' },
                { id: 'doc2', content: 'JavaScript is a dynamic language' },
                { id: 'doc3', content: 'Python is easy to learn' },
                { id: 'doc4', content: 'Java is widely used in enterprise' },
                { id: 'doc5', content: 'C++ provides low-level memory management' }
            ];

            await provider.addDocuments(documents);
        });

        test('should search documents by text query', async () => {
            const results = await provider.search('TypeScript programming');

            expect(results.length).toBeGreaterThan(0);
            // The first result should be the most relevant
            expect(results[0].document.id).toBe('doc1');
        });

        test('should search with embedding vector query', async () => {
            // First get an embedding
            const embedding = await provider.getEmbedding('programming language');

            // Then search with it
            const results = await provider.search(embedding);

            expect(results.length).toBeGreaterThan(0);
            // Results should have scores
            expect(results[0].score).toBeGreaterThan(0);
        });

        test('should handle search options', async () => {
            const options = {
                limit: 2,
                minScore: 0.1
            };

            const results = await provider.search('programming', options);

            expect(results.length).toBeLessThanOrEqual(2);
            expect(results[0].score).toBeGreaterThanOrEqual(options.minScore);
        });
    });

    describe('embeddings', () => {
        beforeEach(async () => {
            await provider.initialize();
        });

        test('should generate embeddings for text', async () => {
            const embedding = await provider.getEmbedding('This is a test');

            expect(Array.isArray(embedding)).toBe(true);
            expect(embedding.length).toBeGreaterThan(0);
            // Should contain floating point numbers
            embedding.forEach(value => {
                expect(typeof value).toBe('number');
            });
        });

        test('different texts should have different embeddings', async () => {
            const embedding1 = await provider.getEmbedding('Text one');
            const embedding2 = await provider.getEmbedding('Different text');

            // Some values should differ
            let isDifferent = false;
            for (let i = 0; i < Math.min(embedding1.length, embedding2.length); i++) {
                if (embedding1[i] !== embedding2[i]) {
                    isDifferent = true;
                    break;
                }
            }

            expect(isDifferent).toBe(true);
        });
    });

    describe('error handling', () => {
        test('should throw error when using provider before initialization', async () => {
            // Don't initialize the provider

            await expect(provider.addDocument({
                id: 'test-doc',
                content: 'Test content'
            })).rejects.toThrow('Provider not initialized');

            await expect(provider.search('query')).rejects.toThrow('Provider not initialized');
        });

        test('should handle closing correctly', async () => {
            await provider.initialize();
            expect(provider.isAvailable).toBe(true);

            await provider.close();
            expect(provider.isAvailable).toBe(false);

            // Should throw after closing
            await expect(provider.addDocument({
                id: 'test-doc',
                content: 'Test content'
            })).rejects.toThrow('Provider not initialized');
        });
    });
});
