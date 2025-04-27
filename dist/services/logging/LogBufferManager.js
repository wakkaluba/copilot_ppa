"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogBufferManager = void 0;
const events_1 = require("events");
/**
 * Manages in-memory log entries and provides efficient storage and retrieval
 */
class LogBufferManager extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.entries = [];
        this.maxEntries = 10000;
    }
    /**
     * Add a log entry to the buffer
     */
    addEntry(entry) {
        this.entries.push(entry);
        // If we've reached capacity, remove oldest entries
        if (this.entries.length > this.maxEntries) {
            this.entries.shift();
            this.emit('overflow');
        }
    }
    /**
     * Get all log entries
     */
    getEntries() {
        return [...this.entries]; // Return a copy to avoid direct modification
    }
    /**
     * Get entries filtered by log level
     */
    getEntriesByLevel(level) {
        return this.entries.filter(entry => entry.level === level);
    }
    /**
     * Get count of entries, optionally filtered by level
     */
    getCount(level) {
        if (level === undefined) {
            return this.entries.length;
        }
        return this.entries.filter(entry => entry.level === level).length;
    }
    /**
     * Clear all entries
     */
    clear() {
        this.entries = [];
    }
    /**
     * Set maximum number of entries to keep in memory
     */
    setMaxEntries(max) {
        if (max <= 0) {
            throw new Error('Max entries must be greater than 0');
        }
        this.maxEntries = max;
        // If current entries exceed new max, trim the buffer
        if (this.entries.length > this.maxEntries) {
            const diff = this.entries.length - this.maxEntries;
            this.entries.splice(0, diff);
            this.emit('overflow');
        }
    }
    /**
     * Get the current max entries setting
     */
    getMaxEntries() {
        return this.maxEntries;
    }
    /**
     * Search entries by text
     */
    search(text) {
        const lowerText = text.toLowerCase();
        return this.entries.filter(entry => entry.message.toLowerCase().includes(lowerText) ||
            (entry.source && entry.source.toLowerCase().includes(lowerText)));
    }
}
exports.LogBufferManager = LogBufferManager;
//# sourceMappingURL=LogBufferManager.js.map