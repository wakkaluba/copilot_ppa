"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMHostManager = exports.HostStatus = void 0;
const events_1 = require("events");
var HostStatus;
(function (HostStatus) {
    HostStatus["Unknown"] = "unknown";
    HostStatus["Available"] = "available";
    HostStatus["Unavailable"] = "unavailable";
    HostStatus["Error"] = "error";
})(HostStatus = exports.HostStatus || (exports.HostStatus = {}));
class LLMHostManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.hosts = new Map();
        this.checkIntervals = new Map();
        this.defaultCheckInterval = 60000; // 1 minute
    }
    /**
     * Add a new LLM host
     * @param id Unique identifier for the host
     * @param name Display name for the host
     * @param url Base URL for the host's API
     * @returns The created host object
     */
    addHost(id, name, url) {
        if (this.hosts.has(id)) {
            throw new Error(`Host with ID ${id} already exists`);
        }
        const host = {
            id,
            name,
            url,
            isAvailable: false,
            lastCheck: 0,
            status: HostStatus.Unknown,
            supportsStreaming: false
        };
        this.hosts.set(id, host);
        this.emit('hostAdded', host);
        return host;
    }
    /**
     * Add a host from provider configuration
     * @param config Provider configuration
     * @returns The created host object
     */
    addHostFromConfig(config) {
        return this.addHost(config.id, config.name, config.apiEndpoint);
    }
    /**
     * Get a host by ID
     * @param id Host ID
     * @returns The host object or undefined if not found
     */
    getHost(id) {
        return this.hosts.get(id);
    }
    /**
     * Get all registered hosts
     * @returns Array of all hosts
     */
    getAllHosts() {
        return Array.from(this.hosts.values());
    }
    /**
     * Remove a host
     * @param id Host ID to remove
     * @returns True if the host was removed
     */
    removeHost(id) {
        if (!this.hosts.has(id)) {
            return false;
        }
        // Stop any active check interval
        this.stopHostCheck(id);
        const host = this.hosts.get(id);
        this.hosts.delete(id);
        this.emit('hostRemoved', host);
        return true;
    }
    /**
     * Check if a host is available
     * @param id Host ID to check
     * @returns Promise resolving to the check result
     */
    async checkHost(id) {
        const host = this.hosts.get(id);
        if (!host) {
            throw new Error(`Host with ID ${id} not found`);
        }
        const startTime = Date.now();
        let result = {
            isAvailable: false
        };
        try {
            // This would typically be an API call to check the host
            // For now, we'll simulate the check
            const isAvailable = await this.simulateHostCheck(host.url);
            const endTime = Date.now();
            result = {
                isAvailable,
                latency: endTime - startTime,
                apiVersion: "1.0",
                supportsStreaming: true // This would be determined from the API response
            };
        }
        catch (error) {
            result.isAvailable = false;
            result.error = error instanceof Error ? error.message : String(error);
        }
        // Update the host status
        this.updateHostStatus(id, result);
        return result;
    }
    /**
     * Start periodic checking of a host
     * @param id Host ID to check
     * @param intervalMs Interval in milliseconds between checks
     */
    startHostCheck(id, intervalMs = this.defaultCheckInterval) {
        if (!this.hosts.has(id)) {
            throw new Error(`Host with ID ${id} not found`);
        }
        // Clear any existing interval
        this.stopHostCheck(id);
        // Set up a new check interval
        const timer = setInterval(() => {
            this.checkHost(id).catch(error => {
                console.error(`Error checking host ${id}:`, error);
            });
        }, intervalMs);
        this.checkIntervals.set(id, timer);
        // Run an immediate check
        this.checkHost(id).catch(error => {
            console.error(`Error checking host ${id}:`, error);
        });
    }
    /**
     * Stop periodic checking of a host
     * @param id Host ID to stop checking
     */
    stopHostCheck(id) {
        const interval = this.checkIntervals.get(id);
        if (interval) {
            clearInterval(interval);
            this.checkIntervals.delete(id);
        }
    }
    /**
     * Update a host's configuration
     * @param id Host ID to update
     * @param updates Partial host updates
     * @returns The updated host
     */
    updateHost(id, updates) {
        const host = this.hosts.get(id);
        if (!host) {
            throw new Error(`Host with ID ${id} not found`);
        }
        // Don't allow changing the ID
        const { id: _, ...validUpdates } = updates;
        const updatedHost = {
            ...host,
            ...validUpdates
        };
        this.hosts.set(id, updatedHost);
        this.emit('hostUpdated', updatedHost);
        return updatedHost;
    }
    /**
     * Get all available hosts
     * @returns Array of available hosts
     */
    getAvailableHosts() {
        return Array.from(this.hosts.values()).filter(host => host.isAvailable);
    }
    /**
     * Set the default check interval for all hosts
     * @param intervalMs Interval in milliseconds
     */
    setDefaultCheckInterval(intervalMs) {
        if (intervalMs < 5000) {
            throw new Error('Check interval must be at least 5000ms (5 seconds)');
        }
        this.defaultCheckInterval = intervalMs;
    }
    /**
     * Start checking all hosts
     */
    startCheckingAllHosts() {
        for (const host of this.hosts.keys()) {
            this.startHostCheck(host);
        }
    }
    /**
     * Stop checking all hosts
     */
    stopCheckingAllHosts() {
        for (const interval of this.checkIntervals.values()) {
            clearInterval(interval);
        }
        this.checkIntervals.clear();
    }
    async simulateHostCheck(url) {
        // In a real implementation, this would make an actual HTTP request to check the host
        // For testing purposes, we'll simulate a success with occasional failures
        return new Promise((resolve) => {
            setTimeout(() => {
                // 90% success rate
                const isAvailable = Math.random() < 0.9;
                resolve(isAvailable);
            }, Math.random() * 100 + 50); // Random delay between 50-150ms
        });
    }
    updateHostStatus(id, result) {
        const host = this.hosts.get(id);
        if (!host) {
            return;
        }
        const previousStatus = host.status;
        const previousAvailability = host.isAvailable;
        // Update the host with check results
        host.isAvailable = result.isAvailable;
        host.lastCheck = Date.now();
        if (result.latency !== undefined) {
            host.latency = result.latency;
        }
        if (result.apiVersion !== undefined) {
            host.apiVersion = result.apiVersion;
        }
        if (result.supportsStreaming !== undefined) {
            host.supportsStreaming = result.supportsStreaming;
        }
        if (result.isAvailable) {
            host.status = HostStatus.Available;
            host.error = undefined;
        }
        else {
            host.status = result.error ? HostStatus.Error : HostStatus.Unavailable;
            host.error = result.error;
        }
        // Emit status change events if needed
        if (previousStatus !== host.status) {
            this.emit('hostStatusChanged', host);
        }
        if (previousAvailability !== host.isAvailable) {
            this.emit(host.isAvailable ? 'hostBecameAvailable' : 'hostBecameUnavailable', host);
        }
    }
    dispose() {
        this.stopCheckingAllHosts();
        this.removeAllListeners();
    }
}
exports.LLMHostManager = LLMHostManager;
//# sourceMappingURL=LLMHostManager.js.map