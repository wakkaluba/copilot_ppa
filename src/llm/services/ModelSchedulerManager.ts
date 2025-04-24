import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { LLMModelInfo, SchedulerConfig, ModelRequest, RequestPriority } from '../types';
import { ModelMetricsManager } from './ModelMetricsManager';

@injectable()
export class ModelSchedulerManager extends EventEmitter implements vscode.Disposable {
    private readonly outputChannel: vscode.OutputChannel;
    private readonly requestQueues = new Map<RequestPriority, ModelRequest[]>();
    private readonly activeRequests = new Set<string>();
    private readonly maxConcurrentRequests = 3;
    private isProcessing = false;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelMetricsManager) private readonly metricsManager: ModelMetricsManager
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Scheduler');
        this.initializeQueues();
    }

    public async scheduleRequest(
        request: ModelRequest,
        priority: RequestPriority = 'normal'
    ): Promise<string> {
        const requestId = request.id || crypto.randomUUID();

        try {
            const queue = this.requestQueues.get(priority);
            if (!queue) {
                throw new Error(`Invalid priority level: ${priority}`);
            }

            // Add request to appropriate queue
            queue.push({ ...request, id: requestId });
            this.emit('requestQueued', { requestId, priority });
            this.logRequestQueued(requestId, priority);

            // Start processing if not already running
            if (!this.isProcessing) {
                this.processQueues();
            }

            return requestId;
        } catch (error) {
            this.handleError('Failed to schedule request', error as Error);
            throw error;
        }
    }

    public cancelRequest(requestId: string): boolean {
        // Check active requests first
        if (this.activeRequests.has(requestId)) {
            this.activeRequests.delete(requestId);
            this.emit('requestCancelled', { requestId });
            return true;
        }

        // Check queues
        for (const [priority, queue] of this.requestQueues.entries()) {
            const index = queue.findIndex(req => req.id === requestId);
            if (index !== -1) {
                queue.splice(index, 1);
                this.emit('requestCancelled', { requestId, priority });
                return true;
            }
        }

        return false;
    }

    private async processQueues(): Promise<void> {
        if (this.isProcessing) {return;}
        this.isProcessing = true;

        try {
            while (this.hasQueuedRequests()) {
                if (this.activeRequests.size >= this.maxConcurrentRequests) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    continue;
                }

                const request = this.getNextRequest();
                if (!request) {continue;}

                this.activeRequests.add(request.id);
                this.emit('requestStarted', { requestId: request.id });

                this.processRequest(request).catch(error => {
                    this.handleError(`Failed to process request ${request.id}`, error as Error);
                });
            }
        } catch (error) {
            this.handleError('Queue processing error', error as Error);
        } finally {
            this.isProcessing = false;
        }
    }

    private async processRequest(request: ModelRequest): Promise<void> {
        const startTime = Date.now();

        try {
            await request.execute();
            
            const duration = Date.now() - startTime;
            this.metricsManager.recordRequestMetrics(request.modelId, {
                duration,
                success: true
            });

            this.emit('requestCompleted', {
                requestId: request.id,
                duration
            });
        } catch (error) {
            this.metricsManager.recordRequestMetrics(request.modelId, {
                duration: Date.now() - startTime,
                success: false
            });
            throw error;
        } finally {
            this.activeRequests.delete(request.id);
        }
    }

    private getNextRequest(): ModelRequest | undefined {
        const priorities: RequestPriority[] = ['high', 'normal', 'low'];
        
        for (const priority of priorities) {
            const queue = this.requestQueues.get(priority);
            if (queue?.length) {
                return queue.shift();
            }
        }
        return undefined;
    }

    private hasQueuedRequests(): boolean {
        return Array.from(this.requestQueues.values()).some(queue => queue.length > 0);
    }

    private initializeQueues(): void {
        this.requestQueues.set('high', []);
        this.requestQueues.set('normal', []);
        this.requestQueues.set('low', []);
    }

    public getQueueStatus(): Record<RequestPriority, number> {
        const status: Record<RequestPriority, number> = {
            high: 0,
            normal: 0,
            low: 0
        };

        for (const [priority, queue] of this.requestQueues.entries()) {
            status[priority] = queue.length;
        }

        return status;
    }

    public getActiveRequestCount(): number {
        return this.activeRequests.size;
    }

    private logRequestQueued(requestId: string, priority: RequestPriority): void {
        this.outputChannel.appendLine(`Request ${requestId} queued with priority ${priority}`);
        this.outputChannel.appendLine('Queue Status:');
        const status = this.getQueueStatus();
        Object.entries(status).forEach(([priority, count]) => {
            this.outputChannel.appendLine(`  ${priority}: ${count} requests`);
        });
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelSchedulerManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.removeAllListeners();
        
        // Cancel all active and queued requests
        this.activeRequests.clear();
        this.requestQueues.forEach(queue => queue.length = 0);
    }
}
