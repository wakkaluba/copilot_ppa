"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var agent_1 = require("../../agent/agent");
var performanceMonitor_1 = require("./performanceMonitor");
suite('Performance Test Suite', function () {
    var agent;
    var monitor;
    suiteSetup(function () {
        agent = new agent_1.Agent();
        monitor = new performanceMonitor_1.PerformanceMonitor();
    });
    test('LLM Response Time Test', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, monitor.measure(function () {
                            return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, agent.processRequest('Simple test query')];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        })];
                    case 1:
                        metrics = _a.sent();
                        assert.ok(metrics.duration < 2000, 'Response time should be under 2 seconds');
                        return [2 /*return*/];
                }
            });
        });
    });
    test('Memory Usage Test', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, monitor.measureMemory(function () {
                            return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, agent.processRequest('Memory test query')];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        })];
                    case 1:
                        metrics = _a.sent();
                        assert.ok(metrics.heapUsed < 100 * 1024 * 1024, 'Heap usage should be under 100MB');
                        return [2 /*return*/];
                }
            });
        });
    });
    test('Concurrent Requests Test', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var requests, startTime, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requests = Array(5).fill('Test concurrent query');
                        startTime = Date.now();
                        return [4 /*yield*/, Promise.all(requests.map(function (r) { return agent.processRequest(r); }))];
                    case 1:
                        _a.sent();
                        duration = Date.now() - startTime;
                        assert.ok(duration < 10000, 'Concurrent requests should complete under 10 seconds');
                        return [2 /*return*/];
                }
            });
        });
    });
    test('Large File Processing Test', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var largeCode, metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        largeCode = 'x'.repeat(100000);
                        return [4 /*yield*/, monitor.measure(function () {
                                return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, agent.processCode(largeCode)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            })];
                    case 1:
                        metrics = _a.sent();
                        assert.ok(metrics.duration < 5000, 'Large file processing should be under 5 seconds');
                        return [2 /*return*/];
                }
            });
        });
    });
    test('Cache Performance Test', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var query, metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = 'Cache test query';
                        return [4 /*yield*/, agent.processRequest(query)];
                    case 1:
                        _a.sent(); // Warm up cache
                        return [4 /*yield*/, monitor.measure(function () {
                                return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, agent.processRequest(query)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            })];
                    case 2:
                        metrics = _a.sent();
                        assert.ok(metrics.duration < 500, 'Cached response should be under 500ms');
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=performance.test.js.map