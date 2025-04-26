import { EventEmitter } from 'events';
import { 
    LLMRequest, 
    LLMResponse, 
    LLMRequestOptions, 
    LLMRequestEvent,
    LLMRequestStatus,
    LLMRequestError
} from '../types';

interface RequestInfo {
    id: string;
    request: LLMRequest;
    startTime: number;
    status: LLMRequestStatus;
    controller?: AbortController;
}

/**
 * Service for executing LLM requests with proper queuing and rate limiting
 */
export class LLMRequestExecutionService extends EventEmitter {
    private readonly activeRequests = new Map<string, RequestInfo>();
    private readonly requestQueue: RequestInfo[] = [];
    private readonly maxConcurrentRequests = 3;
    private readonly requestTimeout = 30000;
    private processingQueue = false;

    /**
     * Execute an LLM request
     */
    public async execute(
        request: string,
        options: LLMRequestOptions
    ): Promise<LLMResponse> {
        const requestInfo: RequestInfo = {
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
        this.emit(LLMRequestEvent.Queued, {
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
                this.removeListener(LLMRequestEvent.Success + requestInfo.id, handleSuccess);
                this.removeListener(LLMRequestEvent.Error + requestInfo.id, handleError);
            };

            const handleSuccess = (response: LLMResponse) => {
                cleanup();
                resolve(response);
            };

            const handleError = (error: Error) => {
                cleanup();
                reject(error);
            };

            this.once(LLMRequestEvent.Success + requestInfo.id, handleSuccess);
            this.once(LLMRequestEvent.Error + requestInfo.id, handleError);
        });
    }

    /**
     * Process the request queue
     */
    private async processQueue(): Promise<void> {
        if (this.processingQueue) {return;}
        this.processingQueue = true;

        while (this.requestQueue.length > 0) {
            // Check if we can process more requests
            if (this.activeRequests.size >= this.maxConcurrentRequests) {
                await new Promise(resolve => setTimeout(resolve, 100));
                continue;
            }

            const request = this.requestQueue.shift();
            if (!request) {continue;}

            this.processRequest(request).catch(error => {
                this.emit(LLMRequestEvent.Error + request.id, error);
            });
        }

        this.processingQueue = false;
    }

    /**
     * Process a single request
     */
    private async processRequest(requestInfo: RequestInfo): Promise<void> {
        try {
            requestInfo.status = 'processing';
            requestInfo.controller = new AbortController();
            this.activeRequests.set(requestInfo.id, requestInfo);

            this.emit(LLMRequestEvent.Started, {
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
            this.emit(LLMRequestEvent.Success + requestInfo.id, response);
            this.emit(LLMRequestEvent.Completed, {
                requestId: requestInfo.id,
                duration: Date.now() - requestInfo.startTime
            });

        } catch (error) {
            requestInfo.status = 'failed';
            const llmError = this.wrapError(error);
            this.emit(LLMRequestEvent.Error + requestInfo.id, llmError);
            throw llmError;
        }
    }

    /**
     * Execute the actual LLM request
     */
    private async executeRequest(requestInfo: RequestInfo): Promise<LLMResponse> {
        // This would integrate with the active LLM provider
        throw new Error('Not implemented');
    }

    /**
     * Abort a request
     */
    public abortRequest(requestId: string): boolean {
        const request = this.activeRequests.get(requestId);
        if (!request || !request.controller) {
            return false;
        }

        request.controller.abort();
        request.status = 'aborted';
        this.activeRequests.delete(requestId);
        
        this.emit(LLMRequestEvent.Aborted, {
            requestId,
            timestamp: new Date()
        });
        
        return true;
    }

    /**
     * Get request status
     */
    public getRequestStatus(requestId: string): LLMRequestStatus | undefined {
        return this.activeRequests.get(requestId)?.status;
    }

    /**
     * Get active request count
     */
    public getActiveRequestCount(): number {
        return this.activeRequests.size;
    }

    /**
     * Get queued request count
     */
    public getQueuedRequestCount(): number {
        return this.requestQueue.length;
    }

    /**
     * Check if the service is connected and ready
     */
    public isConnected(): boolean {
        return this.provider?.getStatus() === 'active';
    }

    private wrapError(error: unknown): LLMRequestError {
        if (error instanceof Error) {
            return new LLMRequestError(error.message, error);
        }
        return new LLMRequestError(String(error));
    }

    public dispose(): void {
        // Abort all active requests
        for (const requestId of this.activeRequests.keys()) {
            this.abortRequest(requestId);
        }
        this.removeAllListeners();
    }
}