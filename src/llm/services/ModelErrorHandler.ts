import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ILLMRequest } from '../types';

export interface IErrorContext {
    requestId: string;
    modelId: string;
    error: Error;
    timestamp: number;
    context: {
        requestState: string;
        retryCount: number;
        resourceUsage?: Record<string, number>;
    };
}

export interface IRecoveryStrategy {
    type: 'retry' | 'fallback' | 'circuit_break' | 'throttle';
    priority: number;
    maxAttempts: number;
    backoffMs: number;
    timeout: number;
}

export interface ICircuitBreakerConfig {
    failureThreshold: number;
    resetTimeoutMs: number;
    halfOpenMaxRequests: number;
}

export interface IThrottleConfig {
    maxRequestsPerMinute: number;
    maxBurstSize: number;
    cooldownPeriodMs: number;
}

@injectable()
export class ModelErrorHandler extends EventEmitter {
    private readonly errorLog = new Map<string, IErrorContext[]>();
    private readonly circuitStates = new Map<string, 'closed' | 'open' | 'half-open'>();
    private readonly throttleCounters = new Map<string, number[]>();

    private readonly defaultStrategy: IRecoveryStrategy = {
        type: 'retry',
        priority: 1,
        maxAttempts: 3,
        backoffMs: 1000,
        timeout: 30000
    };

    private readonly circuitConfig: ICircuitBreakerConfig = {
        failureThreshold: 5,
        resetTimeoutMs: 60000,
        halfOpenMaxRequests: 3
    };

    private readonly throttleConfig: IThrottleConfig = {
        maxRequestsPerMinute: 100,
        maxBurstSize: 10,
        cooldownPeriodMs: 60000
    };

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
        this.initializeErrorHandling();
    }

    private initializeErrorHandling(): void {
        process.on('unhandledRejection', (reason, promise) => {
            this.handleUnhandledRejection(reason as Error, promise);
        });

        process.on('uncaughtException', (error) => {
            this.handleUncaughtException(error);
        });
    }

    public async handleRequestError(
        request: ILLMRequest,
        error: Error
    ): Promise<IRecoveryStrategy> {
        try {
            const context: IErrorContext = {
                requestId: request.id,
                modelId: request.model,
                error,
                timestamp: Date.now(),
                context: {
                    requestState: 'failed',
                    retryCount: 0
                }
            };

            this.logError(context);

            if (this.isCircuitBreakerOpen(request.model)) {
                return this.handleCircuitBreakerOpen(request);
            }

            if (this.isThrottled(request.model)) {
                return this.handleThrottled(request);
            }

            const strategy = this.determineRecoveryStrategy(context);
            await this.executeRecoveryStrategy(strategy, context);

            return strategy;
        } catch (handlingError) {
            this.handleError('Failed to handle request error', handlingError as Error);
            throw handlingError;
        }
    }

    private logError(context: IErrorContext): void {
        let modelErrors = this.errorLog.get(context.modelId);
        if (!modelErrors) {
            modelErrors = [];
            this.errorLog.set(context.modelId, modelErrors);
        }

        modelErrors.push(context);
        this.emit('errorLogged', context);

        // Prune old errors
        const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
        modelErrors = modelErrors.filter(e => e.timestamp >= cutoff);
        this.errorLog.set(context.modelId, modelErrors);
    }

    private isCircuitBreakerOpen(modelId: string): boolean {
        return this.circuitStates.get(modelId) === 'open';
    }

    private isThrottled(modelId: string): boolean {
        const timestamps = this.throttleCounters.get(modelId) || [];
        const cutoff = Date.now() - 60000; // Last minute
        const recentRequests = timestamps.filter(t => t >= cutoff);

        return recentRequests.length >= this.throttleConfig.maxRequestsPerMinute;
    }

    private async handleCircuitBreakerOpen(request: ILLMRequest): Promise<IRecoveryStrategy> {
        return {
            type: 'circuit_break',
            priority: 3,
            maxAttempts: 0,
            backoffMs: this.circuitConfig.resetTimeoutMs,
            timeout: this.circuitConfig.resetTimeoutMs
        };
    }

    private async handleThrottled(request: ILLMRequest): Promise<IRecoveryStrategy> {
        return {
            type: 'throttle',
            priority: 2,
            maxAttempts: 1,
            backoffMs: this.calculateBackoff(request.model),
            timeout: this.throttleConfig.cooldownPeriodMs
        };
    }

    private determineRecoveryStrategy(context: IErrorContext): IRecoveryStrategy {
        if (this.isTransientError(context.error)) {
            return {
                ...this.defaultStrategy,
                type: 'retry',
                backoffMs: this.calculateBackoff(context.modelId)
            };
        }

        if (this.isFallbackEligible(context)) {
            return {
                ...this.defaultStrategy,
                type: 'fallback',
                priority: 2
            };
        }

        return { ...this.defaultStrategy };
    }

    private async executeRecoveryStrategy(
        strategy: IRecoveryStrategy,
        context: IErrorContext
    ): Promise<void> {
        switch (strategy.type) {
            case 'retry':
                await this.executeRetryStrategy(strategy, context);
                break;
            case 'fallback':
                await this.executeFallbackStrategy(strategy, context);
                break;
            case 'circuit_break':
                await this.executeCircuitBreakStrategy(strategy, context);
                break;
            case 'throttle':
                await this.executeThrottleStrategy(strategy, context);
                break;
        }
    }

    private async executeRetryStrategy(
        strategy: IRecoveryStrategy,
        context: IErrorContext
    ): Promise<void> {
        // This would implement actual retry logic
        this.emit('retryStarted', { context, strategy });
    }

    private async executeFallbackStrategy(
        strategy: IRecoveryStrategy,
        context: IErrorContext
    ): Promise<void> {
        // This would implement actual fallback logic
        this.emit('fallbackStarted', { context, strategy });
    }

    private async executeCircuitBreakStrategy(
        strategy: IRecoveryStrategy,
        context: IErrorContext
    ): Promise<void> {
        this.circuitStates.set(context.modelId, 'open');
        setTimeout(() => {
            this.circuitStates.set(context.modelId, 'half-open');
        }, this.circuitConfig.resetTimeoutMs);

        this.emit('circuitBreakerOpened', { modelId: context.modelId });
    }

    private async executeThrottleStrategy(
        strategy: IRecoveryStrategy,
        context: IErrorContext
    ): Promise<void> {
        let timestamps = this.throttleCounters.get(context.modelId) || [];
        timestamps.push(Date.now());

        // Keep only last minute's worth of timestamps
        const cutoff = Date.now() - 60000;
        timestamps = timestamps.filter(t => t >= cutoff);

        this.throttleCounters.set(context.modelId, timestamps);
        this.emit('requestThrottled', { modelId: context.modelId });
    }

    private isTransientError(error: Error): boolean {
        // This would implement actual transient error detection
        return error.message.includes('timeout') ||
               error.message.includes('network') ||
               error.message.includes('rate limit');
    }

    private isFallbackEligible(context: IErrorContext): boolean {
        // This would implement actual fallback eligibility logic
        return context.context.retryCount >= this.defaultStrategy.maxAttempts;
    }

    private calculateBackoff(modelId: string): number {
        const errors = this.errorLog.get(modelId) || [];
        const multiplier = Math.min(errors.length, 5);
        return this.defaultStrategy.backoffMs * multiplier;
    }

    private handleUnhandledRejection(error: Error, promise: Promise<unknown>): void {
        this.logger.error('[ModelErrorHandler] Unhandled rejection', error);
        this.emit('unhandledRejection', { error, promise });
    }

    private handleUncaughtException(error: Error): void {
        this.logger.error('[ModelErrorHandler] Uncaught exception', error);
        this.emit('uncaughtException', { error });
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelErrorHandler]', message, error);
        this.emit('error', error);
    }

    public getErrorHistory(modelId: string): IErrorContext[] {
        return this.errorLog.get(modelId) || [];
    }

    public getCircuitBreakerState(modelId: string): 'closed' | 'open' | 'half-open' {
        return this.circuitStates.get(modelId) || 'closed';
    }

    public getThrottleState(modelId: string): number {
        const timestamps = this.throttleCounters.get(modelId) || [];
        const cutoff = Date.now() - 60000;
        return timestamps.filter(t => t >= cutoff).length;
    }

    public dispose(): void {
        this.errorLog.clear();
        this.circuitStates.clear();
        this.throttleCounters.clear();
        this.removeAllListeners();
    }
}
