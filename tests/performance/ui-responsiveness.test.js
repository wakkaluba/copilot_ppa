"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var vscode = require("vscode");
var webviewPanel_1 = require("../../src/webview/webviewPanel");
var uiManager_1 = require("../../src/ui/uiManager");
var performanceManager_1 = require("../../src/performance/performanceManager");
describe('UI Responsiveness Tests', function () {
    var uiManager;
    var performanceManager;
    var webviewPanel;
    var messageQueue = [];
    // Mock WebView implementation for testing
    var MockWebview = /** @class */ (function () {
        function MockWebview() {
            this.html = '';
            this.options = {};
            this.cspSource = '';
            this.messageEmitter = new vscode.EventEmitter();
            this.onDidReceiveMessage = this.messageEmitter.event;
        }
        MockWebview.prototype.postMessage = function (message) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    messageQueue.push(message);
                    return [2 /*return*/, true];
                });
            });
        };
        MockWebview.prototype.asWebviewUri = function (resource) {
            return resource;
        };
        return MockWebview;
    }());
    beforeEach(function () {
        // Create mock extension context
        var context = {
            subscriptions: [],
            workspaceState: new MockMemento(),
            globalState: new MockMemento(),
            extensionPath: '/test/path',
            storagePath: '/test/storage'
        };
        // Initialize components
        performanceManager = performanceManager_1.PerformanceManager.getInstance();
        performanceManager.setEnabled(true);
        var mockWebview = new MockWebview();
        webviewPanel = new webviewPanel_1.WebviewPanel(mockWebview);
        uiManager = new uiManager_1.UIManager(context, webviewPanel);
        // Clear message queue
        messageQueue = [];
    });
    test('handles rapid UI updates efficiently', function () { return __awaiter(void 0, void 0, void 0, function () {
        var updateCount, measurePoints, i, startTime, avgUpdateTime, maxUpdateTime, p95UpdateTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    updateCount = 100;
                    measurePoints = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < updateCount)) return [3 /*break*/, 5];
                    startTime = performance.now();
                    return [4 /*yield*/, webviewPanel.postMessage({
                            type: 'update',
                            data: {
                                id: "item-".concat(i),
                                content: "Test content ".concat(i),
                                timestamp: new Date()
                            }
                        })];
                case 2:
                    _a.sent();
                    measurePoints.push(performance.now() - startTime);
                    // Add minimal delay to simulate real-world conditions
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5); })];
                case 3:
                    // Add minimal delay to simulate real-world conditions
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5:
                    avgUpdateTime = measurePoints.reduce(function (a, b) { return a + b; }, 0) / measurePoints.length;
                    maxUpdateTime = Math.max.apply(Math, measurePoints);
                    p95UpdateTime = measurePoints.sort(function (a, b) { return a - b; })[Math.floor(measurePoints.length * 0.95)];
                    // Verify performance thresholds
                    assert.ok(avgUpdateTime < 16, "Average update time ".concat(avgUpdateTime, "ms exceeds 16ms frame budget"));
                    assert.ok(maxUpdateTime < 100, "Max update time ".concat(maxUpdateTime, "ms exceeds threshold"));
                    assert.ok(p95UpdateTime < 50, "95th percentile update time ".concat(p95UpdateTime, "ms exceeds threshold"));
                    return [2 /*return*/];
            }
        });
    }); });
    test('maintains responsiveness with large datasets', function () { return __awaiter(void 0, void 0, void 0, function () {
        var largeDataset, batchSizes, renderTimes, _i, batchSizes_1, batchSize, startTime, i, batch, timings, i, _a, prevBatch, prevTime, _b, currBatch, currTime, prevTimePerItem, currTimePerItem;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    largeDataset = Array(1000).fill(null).map(function (_, i) { return ({
                        id: "item-".concat(i),
                        title: "Test Item ".concat(i),
                        description: 'A'.repeat(1000), // 1KB of text per item
                        metadata: {
                            timestamp: new Date(),
                            category: i % 5,
                            tags: Array(10).fill(null).map(function (_, j) { return "tag-".concat(j); })
                        }
                    }); });
                    batchSizes = [10, 50, 100, 500, 1000];
                    renderTimes = new Map();
                    _i = 0, batchSizes_1 = batchSizes;
                    _c.label = 1;
                case 1:
                    if (!(_i < batchSizes_1.length)) return [3 /*break*/, 7];
                    batchSize = batchSizes_1[_i];
                    startTime = performance.now();
                    i = 0;
                    _c.label = 2;
                case 2:
                    if (!(i < largeDataset.length)) return [3 /*break*/, 5];
                    batch = largeDataset.slice(i, i + batchSize);
                    return [4 /*yield*/, webviewPanel.postMessage({
                            type: 'updateDataset',
                            data: { items: batch }
                        })];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    i += batchSize;
                    return [3 /*break*/, 2];
                case 5:
                    renderTimes.set(batchSize, performance.now() - startTime);
                    _c.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    timings = Array.from(renderTimes.entries());
                    // Verify batch processing efficiency
                    for (i = 1; i < timings.length; i++) {
                        _a = timings[i - 1], prevBatch = _a[0], prevTime = _a[1];
                        _b = timings[i], currBatch = _b[0], currTime = _b[1];
                        prevTimePerItem = prevTime / prevBatch;
                        currTimePerItem = currTime / currBatch;
                        assert.ok(currTimePerItem <= prevTimePerItem * 1.5, "Processing efficiency decreased significantly for batch size ".concat(currBatch));
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    test('handles concurrent UI operations without blocking', function () { return __awaiter(void 0, void 0, void 0, function () {
        var operations, operationTypes, completionTimes, operationPromises, _i, _a, _b, type, timings, avgTime, maxTime;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    operations = 20;
                    operationTypes = ['update', 'scroll', 'filter', 'search'];
                    completionTimes = new Map();
                    // Initialize timing arrays
                    operationTypes.forEach(function (type) { return completionTimes.set(type, []); });
                    operationPromises = Array(operations).fill(null).map(function (_, i) { return __awaiter(void 0, void 0, void 0, function () {
                        var _i, operationTypes_1, type, startTime;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _i = 0, operationTypes_1 = operationTypes;
                                    _b.label = 1;
                                case 1:
                                    if (!(_i < operationTypes_1.length)) return [3 /*break*/, 4];
                                    type = operationTypes_1[_i];
                                    startTime = performance.now();
                                    return [4 /*yield*/, webviewPanel.postMessage({
                                            type: type,
                                            data: {
                                                id: "op-".concat(i),
                                                operationType: type,
                                                timestamp: new Date()
                                            }
                                        })];
                                case 2:
                                    _b.sent();
                                    (_a = completionTimes.get(type)) === null || _a === void 0 ? void 0 : _a.push(performance.now() - startTime);
                                    _b.label = 3;
                                case 3:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(operationPromises)];
                case 1:
                    _c.sent();
                    // Calculate statistics for each operation type
                    for (_i = 0, _a = completionTimes.entries(); _i < _a.length; _i++) {
                        _b = _a[_i], type = _b[0], timings = _b[1];
                        avgTime = timings.reduce(function (a, b) { return a + b; }, 0) / timings.length;
                        maxTime = Math.max.apply(Math, timings);
                        // Verify responsiveness thresholds
                        assert.ok(avgTime < 50, "Average time for ".concat(type, " (").concat(avgTime, "ms) exceeds threshold"));
                        assert.ok(maxTime < 200, "Maximum time for ".concat(type, " (").concat(maxTime, "ms) exceeds threshold"));
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    test('manages memory usage during intensive UI updates', function () { return __awaiter(void 0, void 0, void 0, function () {
        var iterations, componentsPerIteration, heapMeasurements, _loop_1, i, memoryGrowth, avgGrowthPerIteration;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    iterations = 50;
                    componentsPerIteration = 20;
                    heapMeasurements = [];
                    // Record initial heap usage
                    heapMeasurements.push(process.memoryUsage().heapUsed);
                    _loop_1 = function (i) {
                        var components;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    components = Array(componentsPerIteration).fill(null).map(function (_, j) { return ({
                                        id: "component-".concat(i, "-").concat(j),
                                        type: j % 4 === 0 ? 'list' : j % 4 === 1 ? 'tree' : j % 4 === 2 ? 'grid' : 'chart',
                                        data: Array(50).fill(null).map(function (_, k) { return ({
                                            id: "item-".concat(k),
                                            value: Math.random() * 1000,
                                            metadata: {
                                                timestamp: new Date(),
                                                category: k % 5,
                                                tags: Array(5).fill(null).map(function (_, l) { return "tag-".concat(l); })
                                            }
                                        }); })
                                    }); });
                                    // Update UI with new components
                                    return [4 /*yield*/, webviewPanel.postMessage({
                                            type: 'updateComponents',
                                            data: { components: components }
                                        })];
                                case 1:
                                    // Update UI with new components
                                    _b.sent();
                                    // Measure heap usage
                                    heapMeasurements.push(process.memoryUsage().heapUsed);
                                    // Allow time for GC if needed
                                    if (i % 10 === 0 && global.gc) {
                                        global.gc();
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < iterations)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    memoryGrowth = heapMeasurements[heapMeasurements.length - 1] - heapMeasurements[0];
                    avgGrowthPerIteration = memoryGrowth / iterations;
                    // Verify memory management
                    assert.ok(memoryGrowth < 50 * 1024 * 1024, "Total memory growth ".concat(memoryGrowth, " bytes exceeds threshold"));
                    assert.ok(avgGrowthPerIteration < 1024 * 1024, "Average memory growth per iteration ".concat(avgGrowthPerIteration, " bytes exceeds threshold"));
                    // Verify message processing remained efficient
                    assert.ok(messageQueue.length === iterations, "Message queue length ".concat(messageQueue.length, " doesn't match iterations ").concat(iterations));
                    return [2 /*return*/];
            }
        });
    }); });
});
// Mock implementation of vscode.Memento for testing
var MockMemento = /** @class */ (function () {
    function MockMemento() {
        this.storage = new Map();
    }
    MockMemento.prototype.get = function (key, defaultValue) {
        return this.storage.has(key) ? this.storage.get(key) : defaultValue;
    };
    MockMemento.prototype.update = function (key, value) {
        this.storage.set(key, value);
        return Promise.resolve();
    };
    return MockMemento;
}());
