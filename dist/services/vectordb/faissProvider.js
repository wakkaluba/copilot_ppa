"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaissProvider = void 0;
const FaissProviderService_1 = require("./services/FaissProviderService");
class FaissProvider {
    name = 'FAISS';
    service;
    constructor(context) {
        this.service = new FaissProviderService_1.FaissProviderService(context);
    }
    get isAvailable() {
        return this.service.isAvailable;
    }
    async initialize(options) {
        return this.service.initialize(options);
    }
    async addDocument(document) {
        return this.service.addDocument(document);
    }
    async addDocuments(documents) {
        return this.service.addDocuments(documents);
    }
    async getDocument(id) {
        return this.service.getDocument(id);
    }
    async updateDocument(id, document) {
        return this.service.updateDocument(id, document);
    }
    async deleteDocument(id) {
        return this.service.deleteDocument(id);
    }
    async deleteAll() {
        return this.service.deleteAll();
    }
    async search(query, options) {
        return this.service.search(query, options);
    }
    async getEmbedding(text) {
        return this.service.getEmbedding(text);
    }
    async close() {
        return this.service.close();
    }
}
exports.FaissProvider = FaissProvider;
//# sourceMappingURL=faissProvider.js.map