"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorDatabaseManager = void 0;
exports.initializeVectorDatabaseManager = initializeVectorDatabaseManager;
exports.getVectorDatabaseManager = getVectorDatabaseManager;
const vscode = __importStar(require("vscode"));
const chromaProvider_1 = require("./chromaProvider");
const faissProvider_1 = require("./faissProvider");
/**
 * Manager for vector database providers
 */
class VectorDatabaseManager {
    constructor(context) {
        this.context = context;
        this.providers = new Map();
        this.activeProvider = null;
        this.isEnabled = false;
        // Register providers
        this.registerProvider(new chromaProvider_1.ChromaProvider(context));
        this.registerProvider(new faissProvider_1.FaissProvider(context));
    }
    /**
     * Register a provider
     */
    registerProvider(provider) {
        this.providers.set(provider.name.toLowerCase(), provider);
    }
    /**
     * Get a list of available providers
     */
    getProviders() {
        return Array.from(this.providers.values());
    }
    /**
     * Get a provider by name
     */
    getProvider(name) {
        return this.providers.get(name.toLowerCase());
    }
    /**
     * Get the active provider
     */
    getActiveProvider() {
        return this.activeProvider;
    }
    /**
     * Set the active provider
     */
    async setActiveProvider(name, options) {
        // Close existing provider if one is active
        if (this.activeProvider) {
            await this.activeProvider.close();
            this.activeProvider = null;
        }
        const provider = this.getProvider(name);
        if (!provider) {
            return false;
        }
        try {
            // Initialize the provider
            await provider.initialize(options);
            this.activeProvider = provider;
            return true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize ${name} provider: ${error.message}`);
            return false;
        }
    }
    /**
     * Enable/disable vector database functionality
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        vscode.commands.executeCommand('setContext', 'copilotPPA.vectorDatabaseEnabled', enabled);
    }
    /**
     * Check if vector database functionality is enabled
     */
    isVectorDatabaseEnabled() {
        return this.isEnabled;
    }
    /**
     * Add a document to the database
     */
    async addDocument(document) {
        if (!this.isEnabled || !this.activeProvider) {
            return null;
        }
        try {
            return await this.activeProvider.addDocument(document);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to add document: ${error.message}`);
            return null;
        }
    }
    /**
     * Add multiple documents to the database
     */
    async addDocuments(documents) {
        if (!this.isEnabled || !this.activeProvider) {
            return null;
        }
        try {
            return await this.activeProvider.addDocuments(documents);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to add documents: ${error.message}`);
            return null;
        }
    }
    /**
     * Search for similar documents
     */
    async search(query, options) {
        if (!this.isEnabled || !this.activeProvider) {
            return [];
        }
        try {
            return await this.activeProvider.search(query, options);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Search failed: ${error.message}`);
            return [];
        }
    }
    /**
     * Get embedding for text
     */
    async getEmbedding(text) {
        if (!this.isEnabled || !this.activeProvider) {
            return null;
        }
        try {
            return await this.activeProvider.getEmbedding(text);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to generate embedding: ${error.message}`);
            return null;
        }
    }
    /**
     * Close all providers
     */
    async close() {
        if (this.activeProvider) {
            await this.activeProvider.close();
            this.activeProvider = null;
        }
    }
}
exports.VectorDatabaseManager = VectorDatabaseManager;
// Singleton instance
let vectorDatabaseManager = null;
/**
 * Initialize the vector database manager
 */
function initializeVectorDatabaseManager(context) {
    if (!vectorDatabaseManager) {
        vectorDatabaseManager = new VectorDatabaseManager(context);
    }
    return vectorDatabaseManager;
}
/**
 * Get the vector database manager instance
 */
function getVectorDatabaseManager() {
    if (!vectorDatabaseManager) {
        throw new Error('Vector Database Manager not initialized');
    }
    return vectorDatabaseManager;
}
//# sourceMappingURL=manager.js.map