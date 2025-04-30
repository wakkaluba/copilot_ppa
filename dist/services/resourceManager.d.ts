import * as vscode from 'vscode';
import { ConversationHistory } from './ConversationHistory';
export interface MemoryUsage {
    total: number;
    used: number;
    free: number;
    percentUsed: number;
}
export interface CpuUsage {
    systemPercent: number;
    processPercent: number;
}
export interface ResourceStatus {
    status: 'normal' | 'warning' | 'critical';
    message: string;
}
export interface ResourceOperationRequest {
    estimatedMemory: number;
    estimatedCpuLoad: number;
    priority: 'low' | 'normal' | 'high';
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
export declare class ResourceManager {
    private readonly context;
    private readonly conversationHistory;
    private monitoringInterval;
    private memoryWarningThreshold;
    private memoryCriticalThreshold;
    private cpuWarningThreshold;
    private cpuCriticalThreshold;
    constructor(context: vscode.ExtensionContext, conversationHistory: ConversationHistory);
    /**
     * Gets the current memory usage of the system
     */
    getCurrentMemoryUsage(): MemoryUsage;
    /**
     * Gets the current CPU usage of the system and process
     */
    getCurrentCpuUsage(): Promise<CpuUsage>;
    /**
     * Checks if the system is under memory pressure
     */
    isUnderMemoryPressure(): boolean;
    /**
     * Checks if the system is under CPU pressure
     */
    isUnderCpuPressure(): Promise<boolean>;
    /**
     * Checks the status of memory resources
     */
    checkMemoryStatus(): ResourceStatus;
    /**
     * Checks the status of CPU resources
     */
    checkCpuStatus(): Promise<ResourceStatus>;
    /**
     * Checks overall resource status
     */
    checkResourceStatus(): Promise<ResourceStatus>;
    /**
     * Starts periodic monitoring of system resources
     */
    startMonitoring(intervalMs?: number): void;
    /**
     * Stops the resource monitoring
     */
    stopMonitoring(): void;
    /**
     * Optimizes memory usage by cleaning up resources
     */
    optimizeMemoryUsage(): Promise<{
        optimized: boolean;
        freedMemory: number;
    }>;
    /**
     * Cleans up conversation cache to free memory
     */
    private cleanupConversationCache;
    /**
     * Allocates resources for an operation
     */
    allocateResourcesForOperation(request: ResourceOperationRequest): Promise<ResourceAllocationResult>;
}
