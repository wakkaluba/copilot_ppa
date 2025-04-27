"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMRequestExecutionService = void 0;
const events_1 = require("events");
const types_1 = require("../types");
/**
 * Service for executing LLM requests with proper queuing and rate limiting
 */
class LLMRequestExecutionService extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.activeRequests = new Map();
        this.requestQueue = [];
        this.maxConcurrentRequests = 3;
        this.requestTimeout = 30000;
        this.processingQueue = false;
    }
    /**
     * Execute an LLM request
     */
    async execute(request, options) {
        const requestInfo = {
            id: crypto.randomUUID(),
            request: {
                content: request,
                options
            },
            startTime: Date.now(),
            status: 'queued'
        };
        // Add to queue and process
        this.requestQueue.push(requestInfo);
        this.emit(types_1.LLMRequestEvent.Queued, {
            requestId: requestInfo.id,
            queuePosition: this.requestQueue.length - 1
        });
        // Start queue processing if not already running
        if (!this.processingQueue) {
            this.processQueue();
        }
        return new Promise((resolve, reject) => {
            const cleanup = () => {
                this.activeRequests.delete(requestInfo.id);
                this.removeListener(types_1.LLMRequestEvent.Success + requestInfo.id, handleSuccess);
                this.removeListener(types_1.LLMRequestEvent.Error + requestInfo.id, handleError);
            };
            const handleSuccess = (response) => {
                cleanup();
                resolve(response);
            };
            const handleError = (error) => {
                cleanup();
                reject(error);
            };
            this.once(types_1.LLMRequestEvent.Success + requestInfo.id, handleSuccess);
            this.once(types_1.LLMRequestEvent.Error + requestInfo.id, handleError);
        });
    }
    /**
     * Process the request queue
     */
    async processQueue() {
        if (this.processingQueue) {
            return;
        }
        this.processingQueue = true;
        while (this.requestQueue.length > 0) {
            // Check if we can process more requests
            if (this.activeRequests.size >= this.maxConcurrentRequests) {
                await new Promise(resolve => setTimeout(resolve, 100));
                continue;
            }
            const request = this.requestQueue.shift();
            if (!request) {
                continue;
            }
            this.processRequest(request).catch(error => {
                this.emit(types_1.LLMRequestEvent.Error + request.id, error);
            });
        }
        this.processingQueue = false;
    }
    /**
     * Process a single request
     */
    async processRequest(requestInfo) {
        try {
            requestInfo.status = 'processing';
            requestInfo.controller = new AbortController();
            this.activeRequests.set(requestInfo.id, requestInfo);
            this.emit(types_1.LLMRequestEvent.Started, {
                requestId: requestInfo.id,
                timestamp: new Date()
            });
            // Set up timeout
            const timeoutId = setTimeout(() => {
                if (requestInfo.controller) {
                    requestInfo.controller.abort();
                }
            }, this.requestTimeout);
            // Execute request
            const response = await this.executeRequest(requestInfo);
            clearTimeout(timeoutId);
            this.emit(types_1.LLMRequestEvent.Success + requestInfo.id, response);
            this.emit(types_1.LLMRequestEvent.Completed, {
                requestId: requestInfo.id,
                duration: Date.now() - requestInfo.startTime
            });
        }
        catch (error) {
            requestInfo.status = 'failed';
            const llmError = this.wrapError(error);
            this.emit(types_1.LLMRequestEvent.Error + requestInfo.id, llmError);
            throw llmError;
        }
    }
    /**
     * Execute the actual LLM request
     */
    async executeRequest(requestInfo) {
        // This would integrate with the active LLM provider
        throw new Error('Not implemented');
    }
    /**
     * Abort a request
     */
    abortRequest(requestId) {
        const request = this.activeRequests.get(requestId);
        if (!request || !request.controller) {
            return false;
        }
        request.controller.abort();
        request.status = 'aborted';
        this.activeRequests.delete(requestId);
        this.emit(types_1.LLMRequestEvent.Aborted, {
            requestId,
            timestamp: new Date()
        });
        return true;
    }
    /**
     * Get request status
     */
    getRequestStatus(requestId) {
        return this.activeRequests.get(requestId)?.status;
    }
    /**
     * Get active request count
     */
    getActiveRequestCount() {
        return this.activeRequests.size;
    }
    /**
     * Get queued request count
     */
    getQueuedRequestCount() {
        return this.requestQueue.length;
    }
    /**
     * Check if the service is connected and ready
     */
    isConnected() {
        return this.provider?.getStatus() === 'active';
    }
    wrapError(error) {
        if (error instanceof Error) {
            return new types_1.LLMRequestError(error.message, error);
        }
        return new types_1.LLMRequestError(String(error));
    }
    dispose() {
        // Abort all active requests
        for (const requestId of this.activeRequests.keys()) {
            this.abortRequest(requestId);
        }
        this.removeAllListeners();
    }
}
exports.LLMRequestExecutionService = LLMRequestExecutionService;
//# sourceMappingURL=LLMRequestExecutionService.js.map