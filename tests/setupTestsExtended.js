"use strict";
/**
 * Extended setup for more complex testing scenarios.
 * This file is not automatically loaded by Jest, but can be imported when needed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEventEmitter = exports.setupExtendedMocks = exports.createMockEventEmitter = void 0;
// Mock VS Code's Event and EventEmitter
var MockEventEmitter = /** @class */ (function () {
    function MockEventEmitter() {
        var _this = this;
        this.listeners = new Set();
        this.event = function (listener) {
            _this.listeners.add(listener);
            return {
                dispose: function () {
                    _this.listeners.delete(listener);
                }
            };
        };
    }
    MockEventEmitter.prototype.fire = function (data) {
        this.listeners.forEach(function (listener) { return listener(data); });
    };
    MockEventEmitter.prototype.dispose = function () {
        this.listeners.clear();
    };
    return MockEventEmitter;
}());
exports.MockEventEmitter = MockEventEmitter;
// Create helper for EventEmitter creation
var createMockEventEmitter = function () { return new MockEventEmitter(); };
exports.createMockEventEmitter = createMockEventEmitter;
// Advanced mocks and helpers for complex test scenarios
var setupExtendedMocks = function () {
    // Anything that needs to be set up for extended testing scenarios
    // can be added here
};
exports.setupExtendedMocks = setupExtendedMocks;
// Setup environment variables needed for tests
process.env.NODE_ENV = 'test';
// Mock global.performance if needed
if (typeof global.performance === 'undefined') {
    global.performance = {
        now: function () { return Date.now(); }
    };
}
