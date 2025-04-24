"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMHostHealthMonitor = void 0;
const events_1 = require("events");
class LLMHostHealthMonitor extends events_1.EventEmitter {
    outputChannel;
    monitoredProcesses = new Map();
    healthChecks = new Map();
    checkInterval = 5000; // 5 seconds
    constructor(outputChannel) {
        super();
        this.outputChannel = outputChannel;
    }
    startMonitoring(processInfo) {
        const { pid } = processInfo;
        if (this.monitoredProcesses.has(pid)) {
            return;
        }
        this.healthChecks.set(pid, {
            lastCheck: Date.now(),
            checkCount: 0,
            warningCount: 0,
            status: 'healthy'
        });
        const intervalId = setInterval(() => this.checkHealth(pid), this.checkInterval);
        this.monitoredProcesses.set(pid, intervalId);
    }
    stopMonitoring(pid) {
        const intervalId = this.monitoredProcesses.get(pid);
        if (intervalId) {
            clearInterval(intervalId);
            this.monitoredProcesses.delete(pid);
            this.healthChecks.delete(pid);
        }
    }
    async checkHealth(pid) {
        try {
            const metrics = await this.collectMetrics(pid);
            const healthCheck = this.healthChecks.get(pid);
            if (!healthCheck) {
                return;
            }
            healthCheck.lastCheck = Date.now();
            healthCheck.checkCount++;
            if (metrics.cpuUsage > 90 || metrics.memoryUsage > 90) {
                healthCheck.warningCount++;
                healthCheck.status = 'warning';
                this.emit('health:warning', `High resource usage detected (CPU: ${metrics.cpuUsage}%, Memory: ${metrics.memoryUsage}%)`, metrics);
            }
            else {
                healthCheck.status = 'healthy';
            }
            if (healthCheck.warningCount >= 3) {
                healthCheck.status = 'critical';
                this.emit('health:critical', new Error(`Process ${pid} has shown high resource usage for an extended period`), metrics);
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`[ERROR] Health check failed for process ${pid}: ${error}`);
        }
    }
    async collectMetrics(pid) {
        // This would integrate with node's process module or OS-specific tools
        return {
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 100,
            timestamp: Date.now()
        };
    }
    dispose() {
        for (const [pid] of this.monitoredProcesses) {
            this.stopMonitoring(pid);
        }
        this.removeAllListeners();
    }
}
exports.LLMHostHealthMonitor = LLMHostHealthMonitor;
//# sourceMappingURL=LLMHostHealthMonitor.js.map