import { EventEmitter } from 'events';
import { LLMResponse, LLMRequestOptions, LLMRequestStatus } from '../types';
/**
 * Service for executing LLM requests with proper queuing and rate limiting
 */
export declare class LLMRequestExecutionService extends EventEmitter {
    private readonly activeRequests;
    private readonly requestQueue;
    private readonly maxConcurrentRequests;
    private readonly requestTimeout;
    private processingQueue;
    /**
     * Execute an LLM request
     */
    execute(request: string, options: LLMRequestOptions): Promise<LLMResponse>;
    /**
     * Process the request queue
     */
    private processQueue;
    /**
     * Process a single request
     */
    private processRequest;
    /**
     * Execute the actual LLM request
     */
    private executeRequest;
    /**
     * Abort a request
     */
    abortRequest(requestId: string): boolean;
    /**
     * Get request status
     */
    getRequestStatus(requestId: string): LLMRequestStatus | undefined;
    /**
     * Get active request count
     */
    getActiveRequestCount(): number;
    /**
     * Get queued request count
     */
    getQueuedRequestCount(): number;
    /**
     * Check if the service is connected and ready
     */
    isConnected(): boolean;
    private wrapError;
    dispose(): void;
}
