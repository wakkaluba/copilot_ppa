# LLM System Performance Monitoring Guide

## Overview

The LLM system includes comprehensive performance monitoring to track resource usage, latency, and system health. This guide explains the monitoring systems and how to use them effectively.

## Metrics Collection

### 1. Connection Metrics
```typescript
interface ConnectionMetrics {
    requestCount: number;
    successCount: number;
    failureCount: number;
    totalLatency: number;
    averageLatency: number;
    lastRequestTime?: Date;
    errorRate: number;
}

class ConnectionMetricsTracker {
    private metrics: ConnectionMetrics = {
        requestCount: 0,
        successCount: 0,
        failureCount: 0,
        totalLatency: 0,
        averageLatency: 0,
        errorRate: 0
    };

    recordRequest(latency: number): void {
        this.metrics.requestCount++;
        this.metrics.totalLatency += latency;
        this.metrics.averageLatency =
            this.metrics.totalLatency / this.metrics.requestCount;
        this.metrics.lastRequestTime = new Date();
    }

    recordSuccess(): void {
        this.metrics.successCount++;
        this.updateErrorRate();
    }

    recordFailure(): void {
        this.metrics.failureCount++;
        this.updateErrorRate();
    }

    private updateErrorRate(): void {
        this.metrics.errorRate =
            this.metrics.failureCount / this.metrics.requestCount;
    }
}
```

### 2. Resource Metrics
```typescript
interface ResourceMetrics {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    modelMemoryUsage: Map<string, number>;
    cacheSize: number;
    processUptime: number;
}

class ResourceMetricsCollector {
    async collectMetrics(): Promise<ResourceMetrics> {
        return {
            memoryUsage: this.getMemoryUsage(),
            cpuUsage: await this.getCPUUsage(),
            diskUsage: await this.getDiskUsage(),
            modelMemoryUsage: await this.getModelMemoryUsage(),
            cacheSize: this.getCacheSize(),
            processUptime: process.uptime()
        };
    }
}
```

### 3. Performance Metrics
```typescript
interface PerformanceMetrics {
    requestLatency: number;
    tokenGenerationRate: number;
    concurrentRequests: number;
    queueLength: number;
    modelLoadTime: number;
}

class PerformanceMonitor {
    private metrics: PerformanceMetrics = {
        requestLatency: 0,
        tokenGenerationRate: 0,
        concurrentRequests: 0,
        queueLength: 0,
        modelLoadTime: 0
    };

    recordRequestMetrics(metrics: Partial<PerformanceMetrics>): void {
        Object.assign(this.metrics, metrics);
        this.emitMetrics();
    }
}
```

## Health Checks

### 1. System Health
```typescript
interface SystemHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Map<string, ComponentHealth>;
    lastCheck: Date;
    details?: Record<string, unknown>;
}

class HealthChecker {
    async checkHealth(): Promise<SystemHealth> {
        const components = new Map<string, ComponentHealth>();

        // Check provider health
        components.set('provider', await this.checkProviderHealth());

        // Check connection health
        components.set('connection', await this.checkConnectionHealth());

        // Check resource health
        components.set('resources', await this.checkResourceHealth());

        return {
            status: this.determineOverallStatus(components),
            components,
            lastCheck: new Date()
        };
    }
}
```

### 2. Provider Health
```typescript
interface ProviderHealth {
    isAvailable: boolean;
    isConnected: boolean;
    responseTime: number;
    errorRate: number;
    modelStatus: Map<string, boolean>;
}

class ProviderHealthMonitor {
    async checkProviderHealth(): Promise<ProviderHealth> {
        const status = await this.provider.getStatus();
        const responseTime = await this.measureResponseTime();
        const modelStatus = await this.checkModelStatus();

        return {
            isAvailable: status.isAvailable,
            isConnected: status.isConnected,
            responseTime,
            errorRate: this.metricsTracker.getErrorRate(),
            modelStatus
        };
    }
}
```

## Performance Optimization

### 1. Request Queue Management
```typescript
class RequestQueue {
    private readonly queue: Array<QueuedRequest> = [];
    private readonly maxConcurrent: number;
    private processing = 0;

    async enqueue<T>(
        operation: () => Promise<T>,
        priority = 0
    ): Promise<T> {
        const request = { operation, priority };

        if (this.canProcess()) {
            return this.process(request);
        }

        return new Promise((resolve, reject) => {
            this.queue.push({
                ...request,
                resolve,
                reject
            });
            this.queue.sort((a, b) => b.priority - a.priority);
        });
    }
}
```

### 2. Resource Management
```typescript
class ResourceManager {
    private readonly maxMemory: number;
    private readonly maxModels: number;
    private loadedModels = new Map<string, ModelInfo>();

    async loadModel(modelId: string): Promise<void> {
        if (this.shouldUnloadModels()) {
            await this.unloadLeastUsedModel();
        }

        await this.provider.loadModel(modelId);
        this.loadedModels.set(modelId, {
            loadTime: Date.now(),
            lastUse: Date.now()
        });
    }
}
```

### 3. Caching Strategy
```typescript
class ResponseCache {
    private cache = new Map<string, CachedResponse>();
    private readonly maxSize: number;
    private readonly ttl: number;

    async get(key: string): Promise<string | null> {
        const cached = this.cache.get(key);
        if (!cached || this.isExpired(cached)) {
            return null;
        }
        return cached.response;
    }

    set(key: string, response: string): void {
        if (this.shouldEvict()) {
            this.evictOldest();
        }
        this.cache.set(key, {
            response,
            timestamp: Date.now()
        });
    }
}
```

## Performance Monitoring UI

### 1. Status Bar Integration
```typescript
class StatusBarMonitor {
    private statusBarItem: vscode.StatusBarItem;

    updateStatus(metrics: PerformanceMetrics): void {
        const status = this.formatStatus(metrics);
        this.statusBarItem.text = status;
        this.statusBarItem.show();
    }
}
```

### 2. Metrics Dashboard
```typescript
class MetricsDashboard {
    private readonly webview: vscode.Webview;

    updateDashboard(metrics: SystemMetrics): void {
        this.webview.postMessage({
            type: 'updateMetrics',
            metrics
        });
    }
}
```

### 3. Lazy Loading Images

To improve performance, enable lazy loading for images and other non-critical resources.
Use the provided utility in `src/webview/lazyLoadImages.ts`:

```typescript
import { enableLazyLoadingForImages } from '@src/webview/lazyLoadImages';

document.addEventListener('DOMContentLoaded', () => {
  enableLazyLoadingForImages();
});
```

In your HTML, use:

```html
<img data-src="image.png" alt="..." />
```

The utility will automatically load images as they enter the viewport.

## Best Practices

1. **Regular Monitoring**
   - Collect metrics periodically
   - Monitor resource usage
   - Track error rates
   - Measure response times

2. **Resource Management**
   - Implement model unloading
   - Use memory efficiently
   - Manage concurrent requests
   - Cache responses appropriately

3. **Performance Optimization**
   - Queue and prioritize requests
   - Implement request batching
   - Use streaming when possible
   - Optimize model loading

4. **Health Monitoring**
   - Regular health checks
   - Component status tracking
   - Automatic recovery
   - Alert on issues

5. **User Experience**
   - Show performance status
   - Provide metrics dashboard
   - Alert on degradation
   - Offer optimization options
