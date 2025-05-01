import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ILLMRequest, ILLMResponse } from '../types';

export interface IRequestOptions {
    timeout?: number;
    retryAttempts?: number;
    retryDelayMs?: number;
    abortSignal?: AbortSignal;
}

export interface IRequestMetrics {
    startTime: number;
    endTime?: number;
    retryCount: number;
    streamingEnabled: boolean;
    tokenCount?: number;
}

export interface IRequestState {
    request: ILLMRequest;
    metrics: IRequestMetrics;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: Error;
    response?: ILLMResponse;
}

@injectable()
export class LLMRequestManager extends EventEmitter {
    private readonly requests = new Map<string, IRequestState>();
    private readonly defaultOptions: IRequestOptions = {
        timeout: 30000,
        retryAttempts: 3,
        retryDelayMs: 1000
    };

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
    }

    public async submitRequest(
        request: ILLMRequest,
        options: IRequestOptions = {}
    ): Promise<ILLMResponse> {
        try {
            const state: IRequestState = {
                request,
                metrics: {
                    startTime: Date.now(),
                    retryCount: 0,
                    streamingEnabled: !!request.options?.stream
                },
                status: 'pending'
            };

            this.requests.set(request.id, state);
            this.emit('requestSubmitted', { requestId: request.id });

            const mergedOptions = { ...this.defaultOptions, ...options };
            return await this.processRequest(request.id, mergedOptions);
        } catch (error) {
            this.handleError(`Failed to submit request ${request.id}`, error as Error);
            throw error;
        }
    }

    private async processRequest(
        requestId: string,
        options: IRequestOptions
    ): Promise<ILLMResponse> {
        const state = this.getRequestState(requestId);
        state.status = 'processing';

        try {
            // This would integrate with actual request processing logic
            throw new Error('Method not implemented');
        } catch (error) {
            if (state.metrics.retryCount < options.retryAttempts!) {
                state.metrics.retryCount++;
                this.emit('requestRetrying', {
                    requestId,
                    attempt: state.metrics.retryCount
                });

                await new Promise(resolve => setTimeout(resolve, options.retryDelayMs));
                return this.processRequest(requestId, options);
            }

            state.status = 'failed';
            state.error = error as Error;
            throw error;
        }
    }

    public async cancelRequest(requestId: string): Promise<void> {
        const state = this.getRequestState(requestId);
        state.status = 'failed';
        state.error = new Error('Request cancelled');
        this.emit('requestCancelled', { requestId });
    }

    public getRequestState(requestId: string): IRequestState {
        const state = this.requests.get(requestId);
        if (!state) {
            throw new Error(`Request ${requestId} not found`);
        }
        return state;
    }

    public listActiveRequests(): IRequestState[] {
        return Array.from(this.requests.values())
            .filter(state => state.status === 'pending' || state.status === 'processing');
    }

    private updateRequestMetrics(requestId: string, response: ILLMResponse): void {
        const state = this.getRequestState(requestId);
        state.metrics.endTime = Date.now();
        state.metrics.tokenCount = response.tokenUsage?.totalTokens;
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[LLMRequestManager]', message, error);
        this.emit('error', error);
    }

    public dispose(): void {
        this.requests.clear();
        this.removeAllListeners();
    }
}
