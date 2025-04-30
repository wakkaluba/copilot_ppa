import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../../common/logging';
interface RateLimitConfig {
    requestsPerSecond: number;
    burstLimit: number;
    maxQueueSize: number;
    quotaLimit?: number;
    timeWindowMs?: number;
}
export declare class ModelRateLimiter extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly buckets;
    private readonly queues;
    private readonly configs;
    private readonly outputChannel;
    private readonly cleanupInterval;
    constructor(logger: ILogger);
    configureModel(modelId: string, config: Partial<RateLimitConfig>): Promise<void>;
    acquireToken(modelId: string, timeout?: number): Promise<void>;
    private getOrCreateBucket;
    private tryAcquireToken;
    private checkAndUpdateQuota;
    private enqueueRequest;
    private removeRequest;
    private processQueue;
    private cleanupStaleRequests;
    getRateLimitStatus(modelId: string): {
        tokens: number;
        queueLength: number;
        quotaRemaining?: number;
        quotaResetTime?: number;
    };
    private logConfigUpdate;
    private logQueueUpdate;
    private handleError;
    dispose(): void;
}
export {};
