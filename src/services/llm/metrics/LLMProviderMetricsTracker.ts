import { EventEmitter } from 'events';
import { ProviderMetrics } from '../types';

export class LLMProviderMetricsTracker extends EventEmitter {
    private metrics = new Map<string, ProviderMetrics>();
    private readonly metricsWindow = 1000 * 60 * 60; // 1 hour window
    
    async initializeProvider(providerId: string): Promise<void> {
        this.metrics.set(providerId, {
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            tokenUsage: 0,
            averageResponseTime: 0,
            requestTimes: [],
            lastUpdated: Date.now()
        });
    }
    
    recordSuccess(providerId: string, responseTime: number, tokens: number): void {
        const metrics = this.metrics.get(providerId);
        if (!metrics) {return;}
        
        const now = Date.now();
        
        // Update request times, keeping only those within the window
        metrics.requestTimes = [
            ...metrics.requestTimes.filter(t => now - t.timestamp <= this.metricsWindow),
            { timestamp: now, duration: responseTime }
        ];
        
        // Calculate new average response time
        metrics.averageResponseTime = metrics.requestTimes.reduce(
            (sum, time) => sum + time.duration, 
            0
        ) / metrics.requestTimes.length;
        
        metrics.requestCount++;
        metrics.successCount++;
        metrics.tokenUsage += tokens;
        metrics.lastUpdated = now;
        
        this.emit('metricsUpdated', {
            providerId,
            metrics: { ...metrics }
        });
    }
    
    recordError(providerId: string, error: Error): void {
        const metrics = this.metrics.get(providerId);
        if (!metrics) {return;}
        
        metrics.requestCount++;
        metrics.errorCount++;
        metrics.lastUpdated = Date.now();
        metrics.lastError = error;
        
        this.emit('metricsUpdated', {
            providerId,
            metrics: { ...metrics }
        });
    }
    
    getMetrics(providerId: string): ProviderMetrics | undefined {
        const metrics = this.metrics.get(providerId);
        return metrics ? { ...metrics } : undefined;
    }
    
    resetMetrics(providerId: string): void {
        this.metrics.delete(providerId);
    }
    
    dispose(): void {
        this.metrics.clear();
        this.removeAllListeners();
    }
}