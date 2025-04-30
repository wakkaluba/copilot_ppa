"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMStreamProvider = void 0;
const events_1 = require("events");
const LLMConnectionManager_1 = require("./LLMConnectionManager");
const llm_1 = require("../../types/llm");
const LLMStreamProcessor_1 = require("./services/LLMStreamProcessor");
const LLMChunkExtractor_1 = require("./services/LLMChunkExtractor");
const LLMStreamManager_1 = require("./services/LLMStreamManager");
const LLMStreamError_1 = require("./errors/LLMStreamError");
/**
 * Provider for handling streaming LLM responses
 */
class LLMStreamProvider extends events_1.EventEmitter {
    streamProcessor;
    chunkExtractor;
    streamManager;
    connectionManager;
    /**
     * Creates a new LLM stream provider
     * @param streamEndpoint URL endpoint for streaming
     */
    constructor(streamEndpoint = 'http://localhost:11434/api/chat') {
        super();
        this.connectionManager = LLMConnectionManager_1.LLMConnectionManager.getInstance();
        this.streamProcessor = new LLMStreamProcessor_1.LLMStreamProcessor();
        this.chunkExtractor = new LLMChunkExtractor_1.LLMChunkExtractor();
        this.streamManager = new LLMStreamManager_1.LLMStreamManager(streamEndpoint);
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.streamProcessor.on('data', chunk => this.emit('data', chunk));
        this.streamProcessor.on('error', error => this.handleError(error));
        this.streamProcessor.on('end', text => this.emit('end', text));
    }
    /**
     * Streams a message request to the LLM
     *
     * @param payload The message payload
     * @param config Optional session configuration
     * @returns Promise that resolves when streaming ends
     */
    async streamMessage(payload, config) {
        try {
            await this.ensureConnection();
            this.streamManager.resetState();
            const response = await this.streamManager.startStream(payload, config);
            await this.streamProcessor.processStream(response);
        }
        catch (error) {
            this.handleError(error instanceof Error ? error : new LLMStreamError_1.LLMStreamError(String(error)));
            throw error;
        }
    }
    async ensureConnection() {
        if (this.connectionManager.connectionState !== llm_1.ConnectionState.CONNECTED) {
            const connected = await this.connectionManager.connectToLLM();
            if (!connected) {
                throw new LLMStreamError_1.LLMStreamError('Failed to connect to LLM service');
            }
        }
    }
    handleError(error) {
        console.error('LLM stream error:', error);
        this.emit('error', error);
        this.streamManager.cleanup();
    }
    /**
     * Aborts the current stream if active
     */
    abort() {
        this.streamManager.abort();
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
}
exports.LLMStreamProvider = LLMStreamProvider;
//# sourceMappingURL=LLMStreamProvider.js.map