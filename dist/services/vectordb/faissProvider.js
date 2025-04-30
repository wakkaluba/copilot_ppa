"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaissProvider = void 0;
const LoggerService_1 = require("../LoggerService");
const FaissProviderService_1 = require("./services/FaissProviderService");
/**
 * Provides FAISS vector database functionality with comprehensive error handling
 */
class FaissProvider {
    name = 'FAISS';
    service;
    logger;
    disposed = false;
    constructor(context) {
        this.service = new FaissProviderService_1.FaissProviderService(context);
        this.logger = LoggerService_1.LoggerService.getInstance();
    }
    get isAvailable() {
        try {
            return this.service.isAvailable;
        }
        catch (error) {
            this.handleError('Failed to check availability', error);
            return false;
        }
    }
    async initialize(options) {
        try {
            this.validateInitialization();
            await this.service.initialize(options);
        }
        catch (error) {
            this.handleError('Failed to initialize FAISS provider', error);
            throw error;
        }
    }
    async addDocument(document) {
        try {
            this.validateDocument(document);
            return await this.service.addDocument(document);
        }
        catch (error) {
            this.handleError('Failed to add document', error);
            throw error;
        }
    }
    async addDocuments(documents) {
        try {
            documents.forEach(this.validateDocument.bind(this));
            return await this.service.addDocuments(documents);
        }
        catch (error) {
            this.handleError('Failed to add multiple documents', error);
            throw error;
        }
    }
    async getDocument(id) {
        try {
            this.validateId(id);
            return await this.service.getDocument(id);
        }
        catch (error) {
            this.handleError(`Failed to get document: ${id}`, error);
            return null;
        }
    }
    async updateDocument(id, document) {
        try {
            this.validateId(id);
            this.validatePartialDocument(document);
            return await this.service.updateDocument(id, document);
        }
        catch (error) {
            this.handleError(`Failed to update document: ${id}`, error);
            return false;
        }
    }
    async deleteDocument(id) {
        try {
            this.validateId(id);
            return await this.service.deleteDocument(id);
        }
        catch (error) {
            this.handleError(`Failed to delete document: ${id}`, error);
            return false;
        }
    }
    async deleteAll() {
        try {
            await this.service.deleteAll();
        }
        catch (error) {
            this.handleError('Failed to delete all documents', error);
            throw error;
        }
    }
    async search(query, options) {
        try {
            this.validateQuery(query);
            return await this.service.search(query, options);
        }
        catch (error) {
            this.handleError('Failed to execute search', error);
            return [];
        }
    }
    async getEmbedding(text) {
        try {
            this.validateText(text);
            return await this.service.getEmbedding(text);
        }
        catch (error) {
            this.handleError('Failed to get embedding', error);
            return [];
        }
    }
    async close() {
        try {
            await this.service.close();
            this.disposed = true;
        }
        catch (error) {
            this.handleError('Failed to close FAISS provider', error);
            throw error;
        }
    }
    validateInitialization() {
        if (this.disposed) {
            throw new Error('FAISS provider has been disposed');
        }
    }
    validateDocument(document) {
        if (!document || typeof document !== 'object') {
            throw new Error('Invalid document format');
        }
    }
    validatePartialDocument(document) {
        if (!document || typeof document !== 'object') {
            throw new Error('Invalid partial document format');
        }
    }
    validateId(id) {
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid document ID');
        }
    }
    validateQuery(query) {
        if (typeof query !== 'string' && !Array.isArray(query)) {
            throw new Error('Invalid query format');
        }
        if (Array.isArray(query) && !query.every(n => typeof n === 'number')) {
            throw new Error('Query vector must contain only numbers');
        }
    }
    validateText(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid text input');
        }
    }
    handleError(message, error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`FaissProvider: ${message}`, errorMessage);
        // Don't throw here - let the calling method decide how to handle the error
    }
}
exports.FaissProvider = FaissProvider;
//# sourceMappingURL=faissProvider.js.map