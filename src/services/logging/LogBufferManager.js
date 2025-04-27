"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogBufferManager = void 0;
var events_1 = require("events");
/**
 * Manages in-memory log entries and provides efficient storage and retrieval
 */
var LogBufferManager = /** @class */ (function (_super) {
    __extends(LogBufferManager, _super);
    function LogBufferManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.entries = [];
        _this.maxEntries = 10000;
        return _this;
    }
    /**
     * Add a log entry to the buffer
     */
    LogBufferManager.prototype.addEntry = function (entry) {
        this.entries.push(entry);
        // If we've reached capacity, remove oldest entries
        if (this.entries.length > this.maxEntries) {
            this.entries.shift();
            this.emit('overflow');
        }
    };
    /**
     * Get all log entries
     */
    LogBufferManager.prototype.getEntries = function () {
        return __spreadArray([], this.entries, true); // Return a copy to avoid direct modification
    };
    /**
     * Get entries filtered by log level
     */
    LogBufferManager.prototype.getEntriesByLevel = function (level) {
        return this.entries.filter(function (entry) { return entry.level === level; });
    };
    /**
     * Get count of entries, optionally filtered by level
     */
    LogBufferManager.prototype.getCount = function (level) {
        if (level === undefined) {
            return this.entries.length;
        }
        return this.entries.filter(function (entry) { return entry.level === level; }).length;
    };
    /**
     * Clear all entries
     */
    LogBufferManager.prototype.clear = function () {
        this.entries = [];
    };
    /**
     * Set maximum number of entries to keep in memory
     */
    LogBufferManager.prototype.setMaxEntries = function (max) {
        if (max <= 0) {
            throw new Error('Max entries must be greater than 0');
        }
        this.maxEntries = max;
        // If current entries exceed new max, trim the buffer
        if (this.entries.length > this.maxEntries) {
            var diff = this.entries.length - this.maxEntries;
            this.entries.splice(0, diff);
            this.emit('overflow');
        }
    };
    /**
     * Get the current max entries setting
     */
    LogBufferManager.prototype.getMaxEntries = function () {
        return this.maxEntries;
    };
    /**
     * Search entries by text
     */
    LogBufferManager.prototype.search = function (text) {
        var lowerText = text.toLowerCase();
        return this.entries.filter(function (entry) {
            return entry.message.toLowerCase().includes(lowerText) ||
                (entry.source && entry.source.toLowerCase().includes(lowerText));
        });
    };
    return LogBufferManager;
}(events_1.EventEmitter));
exports.LogBufferManager = LogBufferManager;
