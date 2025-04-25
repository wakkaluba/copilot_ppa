import * as vscode from 'vscode';
import * as os from 'os';
import { ConversationHistory } from './ConversationHistory';

export interface MemoryUsage {
    total: number;    // Total memory in MB
    used: number;     // Used memory in MB
    free: number;     // Free memory in MB
    percentUsed: number; // Percentage of memory used
}

export interface CpuUsage {
    systemPercent: number; // System-wide CPU usage
    processPercent: number; // Process CPU usage
}

export interface ResourceStatus {
    status: 'normal' | 'warning' | 'critical';
    message: string;
}

export interface ResourceOperationRequest {
    estimatedMemory: number; // Estimated memory need in MB
    estimatedCpuLoad: number; // Estimated CPU load in percentage
    priority: 'low' | 'normal' | 'high'; // Operation priority
}

export interface ResourceAllocationResult {
    allocated: boolean;
    reason?: string;
    availableMemory?: number;
    availableCpu?: number;
}

/**
 * Manages system resource usage and provides methods to optimize resource utilization
 * for LLM operations.
 */
export class ResourceManager {
    private monitoringInterval: NodeJS.Timeout | null = null;
    private memoryWarningThreshold = 80; // 80% memory usage warning threshold
    private memoryCriticalThreshold = 90; // 90% memory usage critical threshold
    private cpuWarningThreshold = 70; // 70% CPU usage warning threshold
    private cpuCriticalThreshold = 85; // 85% CPU usage critical threshold
    
    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly conversationHistory: ConversationHistory
    ) {}

    /**
     * Gets the current memory usage of the system
     */
    getCurrentMemoryUsage(): MemoryUsage {
        const totalMemory = os.totalmem() / (1024 * 1024); // Convert to MB
        const freeMemory = os.freemem() / (1024 * 1024); // Convert to MB
        const usedMemory = totalMemory - freeMemory;
        const percentUsed = (usedMemory / totalMemory) * 100;
        
        return {
            total: Math.round(totalMemory),
            used: Math.round(usedMemory),
            free: Math.round(freeMemory),
            percentUsed: Math.round(percentUsed)
        };
    }

    /**
     * Gets the current CPU usage of the system and process
     */
    async getCurrentCpuUsage(): Promise<CpuUsage> {
        // This is a simple approximation - in a real implementation,
        // we would measure CPU usage more accurately over time
        const cpus = os.cpus();
        const totalCpuTime = cpus.reduce((acc, cpu) => {
            return acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
        }, 0);
        
        const totalIdleTime = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
        const systemPercent = 100 - (totalIdleTime / totalCpuTime * 100);
        
        // Estimate process CPU usage - in a real implementation this would be more accurate
        const processPercent = systemPercent * 0.6; // Simple approximation
        
        return {
            systemPercent: Math.round(systemPercent),
            processPercent: Math.round(processPercent)
        };
    }

    /**
     * Checks if the system is under memory pressure
     */
    isUnderMemoryPressure(): boolean {
        const memoryUsage = this.getCurrentMemoryUsage();
        return memoryUsage.percentUsed > this.memoryCriticalThreshold;
    }

    /**
     * Checks if the system is under CPU pressure
     */
    async isUnderCpuPressure(): Promise<boolean> {
        const cpuUsage = await this.getCurrentCpuUsage();
        return cpuUsage.systemPercent > this.cpuCriticalThreshold;
    }

    /**
     * Checks the status of memory resources
     */
    checkMemoryStatus(): ResourceStatus {
        const memoryUsage = this.getCurrentMemoryUsage();
        
        if (memoryUsage.percentUsed > this.memoryCriticalThreshold) {
            return {
                status: 'critical',
                message: `Critical memory usage: ${memoryUsage.percentUsed.toFixed(1)}% used, ${memoryUsage.free.toFixed(0)} MB free`
            };
        } else if (memoryUsage.percentUsed > this.memoryWarningThreshold) {
            return {
                status: 'warning',
                message: `High memory usage: ${memoryUsage.percentUsed.toFixed(1)}% used, ${memoryUsage.free.toFixed(0)} MB free`
            };
        }
        
        return {
            status: 'normal',
            message: `Normal memory usage: ${memoryUsage.percentUsed.toFixed(1)}% used, ${memoryUsage.free.toFixed(0)} MB free`
        };
    }

    /**
     * Checks the status of CPU resources
     */
    async checkCpuStatus(): Promise<ResourceStatus> {
        const cpuUsage = await this.getCurrentCpuUsage();
        
        if (cpuUsage.systemPercent > this.cpuCriticalThreshold) {
            return {
                status: 'critical',
                message: `Critical CPU usage: ${cpuUsage.systemPercent.toFixed(1)}% system, ${cpuUsage.processPercent.toFixed(1)}% process`
            };
        } else if (cpuUsage.systemPercent > this.cpuWarningThreshold) {
            return {
                status: 'warning',
                message: `High CPU usage: ${cpuUsage.systemPercent.toFixed(1)}% system, ${cpuUsage.processPercent.toFixed(1)}% process`
            };
        }
        
        return {
            status: 'normal',
            message: `Normal CPU usage: ${cpuUsage.systemPercent.toFixed(1)}% system, ${cpuUsage.processPercent.toFixed(1)}% process`
        };
    }

    /**
     * Checks overall resource status
     */
    async checkResourceStatus(): Promise<ResourceStatus> {
        const memoryStatus = this.checkMemoryStatus();
        const cpuStatus = await this.checkCpuStatus();
        
        // Return the most severe status
        if (memoryStatus.status === 'critical' || cpuStatus.status === 'critical') {
            return {
                status: 'critical',
                message: `Critical resource usage - ${memoryStatus.message}; ${cpuStatus.message}`
            };
        } else if (memoryStatus.status === 'warning' || cpuStatus.status === 'warning') {
            return {
                status: 'warning',
                message: `Warning: resource pressure detected - ${memoryStatus.message}; ${cpuStatus.message}`
            };
        }
        
        return {
            status: 'normal',
            message: 'Normal resource usage'
        };
    }

    /**
     * Starts periodic monitoring of system resources
     */
    startMonitoring(intervalMs: number = 5000): void {
        // Clear any existing interval
        this.stopMonitoring();
        
        this.monitoringInterval = setInterval(async () => {
            await this.checkResourceStatus();
        }, intervalMs);
    }

    /**
     * Stops the resource monitoring
     */
    stopMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    /**
     * Optimizes memory usage by cleaning up resources
     */
    async optimizeMemoryUsage(): Promise<{ optimized: boolean; freedMemory: number }> {
        const beforeMemory = this.getCurrentMemoryUsage();
        
        // Perform optimization actions
        await this.cleanupConversationCache();
        global.gc?.(); // Request garbage collection if available
        
        const afterMemory = this.getCurrentMemoryUsage();
        const freedMemory = beforeMemory.used - afterMemory.used;
        
        return {
            optimized: freedMemory > 0,
            freedMemory: Math.max(0, freedMemory)
        };
    }

    /**
     * Cleans up conversation cache to free memory
     */
    private async cleanupConversationCache(): Promise<void> {
        // Get all conversations
        const conversations = this.conversationHistory.getAllConversations();
        
        if (conversations.length > 10) {
            // Keep the 10 most recent conversations and clean up the rest
            const sortedConversations = conversations.sort((a, b) => {
                const aLastUpdated = a.messages.length ? 
                    a.messages[a.messages.length - 1].timestamp : 0;
                const bLastUpdated = b.messages.length ? 
                    b.messages[b.messages.length - 1].timestamp : 0;
                return bLastUpdated - aLastUpdated;
            });
            
            // Delete older conversations
            for (let i = 10; i < sortedConversations.length; i++) {
                await this.conversationHistory.deleteConversation(sortedConversations[i].id);
            }
        }
    }

    /**
     * Allocates resources for an operation
     */
    async allocateResourcesForOperation(request: ResourceOperationRequest): Promise<ResourceAllocationResult> {
        // Check current resource status
        const memoryUnderPressure = this.isUnderMemoryPressure();
        const cpuUnderPressure = await this.isUnderCpuPressure();
        
        const memoryUsage = this.getCurrentMemoryUsage();
        const cpuUsage = await this.getCurrentCpuUsage();
        
        // If system is under pressure and request is not high priority, deny it
        if ((memoryUnderPressure || cpuUnderPressure) && request.priority !== 'high') {
            return {
                allocated: false,
                reason: `System under resource pressure: memory=${memoryUsage.percentUsed.toFixed(1)}%, CPU=${cpuUsage.systemPercent.toFixed(1)}%`,
                availableMemory: memoryUsage.free,
                availableCpu: 100 - cpuUsage.systemPercent
            };
        }
        
        // If estimated resource needs exceed available resources, deny
        if (request.estimatedMemory > memoryUsage.free) {
            return {
                allocated: false,
                reason: `Insufficient memory: requested ${request.estimatedMemory}MB but only ${memoryUsage.free.toFixed(0)}MB available`,
                availableMemory: memoryUsage.free,
                availableCpu: 100 - cpuUsage.systemPercent
            };
        }
        
        if (request.estimatedCpuLoad + cpuUsage.systemPercent > 100) {
            return {
                allocated: false,
                reason: `Insufficient CPU: requested ${request.estimatedCpuLoad}% but only ${(100 - cpuUsage.systemPercent).toFixed(0)}% available`,
                availableMemory: memoryUsage.free,
                availableCpu: 100 - cpuUsage.systemPercent
            };
        }
        
        // Resources are available, approve allocation
        return {
            allocated: true,
            availableMemory: memoryUsage.free,
            availableCpu: 100 - cpuUsage.systemPercent
        };
    }
}