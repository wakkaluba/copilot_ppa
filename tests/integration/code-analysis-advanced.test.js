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
var codeAnalyzer_1 = require("../../src/services/codeQuality/codeAnalyzer");
var metricsCollector_1 = require("../../src/services/codeQuality/metricsCollector");
var complexityAnalyzer_1 = require("../../src/services/codeQuality/complexityAnalyzer");
var WorkspaceManager_1 = require("../../src/services/WorkspaceManager");
describe('Advanced Code Analysis', function () {
    var codeAnalyzer;
    var dependencyGraph;
    var metricsCollector;
    var complexityAnalyzer;
    var workspaceManager;
    var testWorkspace;
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var context;
        return __generator(this, function (_a) {
            context = {
                subscriptions: [],
                workspaceState: new MockMemento(),
                globalState: new MockMemento(),
                extensionPath: '/test/path',
                storagePath: '/test/storage'
            };
            workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
            codeAnalyzer = new codeAnalyzer_1.CodeAnalyzer(workspaceManager);
            dependencyGraph = new dependencyAnalyzer_1.DependencyGraph();
            metricsCollector = new metricsCollector_1.MetricsCollector();
            complexityAnalyzer = new complexityAnalyzer_1.ComplexityAnalyzer();
            return [2 /*return*/];
        });
    }); });
    test('analyzes complex circular dependencies', function () { return __awaiter(void 0, void 0, void 0, function () {
        var files, graph, cycles;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    files = [
                        {
                            path: '/src/moduleA.ts',
                            content: "\n                    import { funcB } from './moduleB';\n                    import { funcC } from './moduleC';\n                    export function funcA() {\n                        return funcB() + funcC();\n                    }\n                "
                        },
                        {
                            path: '/src/moduleB.ts',
                            content: "\n                    import { funcC } from './moduleC';\n                    import { funcA } from './moduleA';\n                    export function funcB() {\n                        return funcC() + funcA();\n                    }\n                "
                        },
                        {
                            path: '/src/moduleC.ts',
                            content: "\n                    import { funcA } from './moduleA';\n                    import { funcB } from './moduleB';\n                    export function funcC() {\n                        return funcA() + funcB();\n                    }\n                "
                        }
                    ];
                    return [4 /*yield*/, dependencyGraph.buildFromFiles(files)];
                case 1:
                    graph = _a.sent();
                    return [4 /*yield*/, dependencyGraph.findCycles(graph)];
                case 2:
                    cycles = _a.sent();
                    // Verify cycle detection
                    assert.ok(cycles.length > 0, 'Should detect circular dependencies');
                    assert.ok(cycles.some(function (cycle) {
                        return cycle.includes('moduleA') &&
                            cycle.includes('moduleB') &&
                            cycle.includes('moduleC');
                    }), 'Should identify the specific circular dependency chain');
                    return [2 /*return*/];
            }
        });
    }); });
    test('handles large-scale dependency analysis', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fileCount, files, startTime, graph, _a, seconds, nanoseconds, analysisTime;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fileCount = 1000;
                    files = Array(fileCount).fill(null).map(function (_, i) {
                        var dependencies = Array(5).fill(null).map(function () {
                            return Math.floor(Math.random() * fileCount);
                        }).filter(function (dep) { return dep !== i; });
                        return {
                            path: "/src/module".concat(i, ".ts"),
                            content: "\n                    ".concat(dependencies.map(function (dep) {
                                return "import { func".concat(dep, " } from './module").concat(dep, "';");
                            }).join('\n'), "\n                    export function func").concat(i, "() {\n                        return ").concat(dependencies.map(function (dep) {
                                return "func".concat(dep, "()");
                            }).join(' + '), ";\n                    }\n                ")
                        };
                    });
                    startTime = process.hrtime();
                    return [4 /*yield*/, dependencyGraph.buildFromFiles(files)];
                case 1:
                    graph = _b.sent();
                    _a = process.hrtime(startTime), seconds = _a[0], nanoseconds = _a[1];
                    analysisTime = seconds * 1000 + nanoseconds / 1000000;
                    // Verify performance characteristics
                    assert.ok(analysisTime < 10000, "Analysis time ".concat(analysisTime, "ms exceeded threshold"));
                    assert.ok(Object.keys(graph.nodes).length === fileCount, 'Should process all files');
                    return [2 /*return*/];
            }
        });
    }); });
    test('calculates accurate complexity metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
        var complexCode, metrics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    complexCode = "\n            function processData(data: any[]): any {\n                let result = [];\n                for (let i = 0; i < data.length; i++) {\n                    if (data[i].type === 'A') {\n                        for (let j = 0; j < data[i].items.length; j++) {\n                            if (data[i].items[j].status === 'active') {\n                                switch (data[i].items[j].category) {\n                                    case 'high':\n                                        result.push(processHighPriority(data[i].items[j]));\n                                        break;\n                                    case 'medium':\n                                        if (checkCondition(data[i].items[j])) {\n                                            result.push(processMediumPriority(data[i].items[j]));\n                                        }\n                                        break;\n                                    default:\n                                        result.push(processLowPriority(data[i].items[j]));\n                                }\n                            }\n                        }\n                    }\n                }\n                return result;\n            }\n        ";
                    return [4 /*yield*/, complexityAnalyzer.analyze(complexCode)];
                case 1:
                    metrics = _a.sent();
                    // Verify complexity metrics
                    assert.ok(metrics.cyclomaticComplexity > 10, 'Should identify high cyclomatic complexity');
                    assert.ok(metrics.nestingDepth > 4, 'Should identify deep nesting');
                    assert.ok(metrics.cognitiveComplexity > 15, 'Should identify high cognitive complexity');
                    return [2 /*return*/];
            }
        });
    }); });
    test('identifies code duplication patterns', function () { return __awaiter(void 0, void 0, void 0, function () {
        var files, duplicates;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    files = [
                        {
                            path: '/src/handler1.ts',
                            content: "\n                    export function handleRequest1(req: any) {\n                        const data = validateInput(req);\n                        if (!data) return { error: 'Invalid input' };\n                        const result = processData(data);\n                        if (!result) return { error: 'Processing failed' };\n                        return { success: true, data: result };\n                    }\n                "
                        },
                        {
                            path: '/src/handler2.ts',
                            content: "\n                    export function handleRequest2(req: any) {\n                        const data = validateInput(req);\n                        if (!data) return { error: 'Invalid input' };\n                        const result = processData(data);\n                        if (!result) return { error: 'Processing failed' };\n                        return { success: true, data: result };\n                    }\n                "
                        },
                        {
                            path: '/src/handler3.ts',
                            content: "\n                    export function handleRequest3(req: any) {\n                        const data = validateInput(req);\n                        if (!data) return { error: 'Invalid input' };\n                        const result = processData(data);\n                        if (!result) return { error: 'Processing failed' };\n                        return { success: true, data: result };\n                    }\n                "
                        }
                    ];
                    return [4 /*yield*/, codeAnalyzer.findDuplication(files)];
                case 1:
                    duplicates = _a.sent();
                    // Verify duplication detection
                    assert.ok(duplicates.length > 0, 'Should detect code duplication');
                    assert.ok(duplicates.some(function (d) { return d.similarity > 0.9; }), 'Should identify high similarity');
                    assert.ok(duplicates.some(function (d) {
                        return d.locations.length === 3 &&
                            d.locations.every(function (l) { return l.path.includes('handler'); });
                    }), 'Should identify all instances of duplication');
                    return [2 /*return*/];
            }
        });
    }); });
    test('analyzes code quality trends over time', function () { return __awaiter(void 0, void 0, void 0, function () {
        var codeVersions, trends, complexityTrend;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    codeVersions = Array(10).fill(null).map(function (_, version) { return ({
                        timestamp: new Date() - version * 86400000, // Daily intervals
                        files: [
                            {
                                path: '/src/main.ts',
                                content: "\n                        function processData".concat(version, "(data: any) {\n                            ").concat(Array(version + 1).fill(null).map(function () {
                                    return 'if (condition) { doSomething(); }';
                                }).join('\n'), "\n                            return result;\n                        }\n                    ")
                            }
                        ]
                    }); });
                    return [4 /*yield*/, Promise.all(codeVersions.map(function (version) { return __awaiter(void 0, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = {
                                            timestamp: version.timestamp
                                        };
                                        return [4 /*yield*/, Promise.all(version.files.map(function (file) {
                                                return metricsCollector.collectMetrics(file.content);
                                            }))];
                                    case 1: return [2 /*return*/, (_a.metrics = _b.sent(),
                                            _a)];
                                }
                            });
                        }); }))];
                case 1:
                    trends = _a.sent();
                    complexityTrend = trends.map(function (t) { return ({
                        timestamp: t.timestamp,
                        avgComplexity: t.metrics.reduce(function (sum, m) { return sum + m.complexity; }, 0) / t.metrics.length
                    }); });
                    // Verify trend analysis
                    assert.ok(complexityTrend[0].avgComplexity > complexityTrend[complexityTrend.length - 1].avgComplexity, 'Should detect increasing complexity trend');
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
