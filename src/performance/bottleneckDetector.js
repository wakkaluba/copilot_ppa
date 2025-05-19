// ...restored from orphaned-code backup...
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BottleneckDetector = void 0;
var events_1 = require("events");
var BottleneckDetectionService_1 = require("./services/BottleneckDetectionService");
/**
 * BottleneckDetector analyzes performance data to identify operations
 * that are potentially causing performance issues
 */
var BottleneckDetector = /** @class */ (function (_super) {
    __extends(BottleneckDetector, _super);
    function BottleneckDetector() {
        var _this = _super.call(this) || this;
        _this.service = new BottleneckDetectionService_1.BottleneckDetectionService();
        return _this;
    }
    BottleneckDetector.getInstance = function () {
        if (!BottleneckDetector.instance) {
            BottleneckDetector.instance = new BottleneckDetector();
        }
        return BottleneckDetector.instance;
    };
    /**
     * Enable or disable bottleneck detection
     */
    BottleneckDetector.prototype.setEnabled = function (enabled) {
        this.service.setEnabled(enabled);
    };
    /**
     * Reset all bottleneck statistics
     */
    BottleneckDetector.prototype.resetStats = function () {
        this.service.resetStats();
    };
    /**
     * Analyze performance data
     */
    BottleneckDetector.prototype.analyze = function (data) {
        return this.service.analyze(data);
    };
    return BottleneckDetector;
}(events_1.EventEmitter));
exports.BottleneckDetector = BottleneckDetector;
