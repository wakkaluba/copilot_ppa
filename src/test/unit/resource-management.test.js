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
var sinon = require("sinon");
var mockHelpers_1 = require("../helpers/mockHelpers");
var resourceManager_1 = require("../../services/resourceManager");
describe('Resource Management', function () {
    var resourceManager;
    var historyMock;
    var mockContext;
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
        mockContext = (0, mockHelpers_1.createMockExtensionContext)();
        historyMock = (0, mockHelpers_1.createMockConversationHistory)();
        // Create a fresh instance for each test
        resourceManager = new resourceManager_1.ResourceManager(mockContext, historyMock);
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should track memory usage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var initialMemory;
        return __generator(this, function (_a) {
            initialMemory = resourceManager.getCurrentMemoryUsage();
            assert.ok(initialMemory.total > 0);
            assert.ok(initialMemory.used > 0);
            assert.ok(initialMemory.free > 0);
            assert.ok(initialMemory.percentUsed > 0);
            return [2 /*return*/];
        });
    }); });
    it('should track CPU usage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var initialCpu;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resourceManager.getCurrentCpuUsage()];
                case 1:
                    initialCpu = _a.sent();
                    assert.ok(initialCpu.systemPercent >= 0);
                    assert.ok(initialCpu.processPercent >= 0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should identify high memory usage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var memoryStatus;
        return __generator(this, function (_a) {
            // Mock a high memory usage scenario
            sandbox.stub(resourceManager, 'getCurrentMemoryUsage').returns({
                total: 8000, // 8GB
                used: 7200, // 7.2GB (90%)
                free: 800, // 0.8GB
                percentUsed: 90
            });
            memoryStatus = resourceManager.checkMemoryStatus();
            assert.strictEqual(memoryStatus.status, 'warning');
            assert.ok(memoryStatus.message.includes('high'));
            return [2 /*return*/];
        });
    }); });
    it('should identify critical CPU usage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var cpuStatus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock a high CPU usage scenario
                    sandbox.stub(resourceManager, 'getCurrentCpuUsage').resolves({
                        systemPercent: 85,
                        processPercent: 75
                    });
                    return [4 /*yield*/, resourceManager.checkCpuStatus()];
                case 1:
                    cpuStatus = _a.sent();
                    assert.strictEqual(cpuStatus.status, 'critical');
                    assert.ok(cpuStatus.message.includes('critical'));
                    return [2 /*return*/];
            }
        });
    }); });
    it('should optimize memory usage when needed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var i, optimizationResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 10)) return [3 /*break*/, 4];
                    return [4 /*yield*/, historyMock.createConversation("Conversation ".concat(i))];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    // Mock memory pressure
                    sandbox.stub(resourceManager, 'isUnderMemoryPressure').returns(true);
                    return [4 /*yield*/, resourceManager.optimizeMemoryUsage()];
                case 5:
                    optimizationResult = _a.sent();
                    assert.strictEqual(optimizationResult.optimized, true);
                    assert.ok(optimizationResult.freedMemory > 0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should schedule resource checks', function () { return __awaiter(void 0, void 0, void 0, function () {
        var checkSpy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    checkSpy = sandbox.spy(resourceManager, 'checkResourceStatus');
                    // Start resource monitoring
                    resourceManager.startMonitoring(1000); // Check every second
                    // Wait for at least one check
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1200); })];
                case 1:
                    // Wait for at least one check
                    _a.sent();
                    // Stop monitoring
                    resourceManager.stopMonitoring();
                    assert.ok(checkSpy.called, 'checkResourceStatus should be called at least once');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle resource allocation for large operations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var allocationResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resourceManager.allocateResourcesForOperation({
                        estimatedMemory: 500, // 500MB
                        estimatedCpuLoad: 50, // 50%
                        priority: 'high'
                    })];
                case 1:
                    allocationResult = _a.sent();
                    assert.strictEqual(allocationResult.allocated, true);
                    assert.ok(allocationResult.availableMemory > 0);
                    assert.ok(allocationResult.availableCpu > 0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should deny resource allocation when system is under pressure', function () { return __awaiter(void 0, void 0, void 0, function () {
        var allocationResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock system under pressure
                    sandbox.stub(resourceManager, 'isUnderMemoryPressure').returns(true);
                    sandbox.stub(resourceManager, 'isUnderCpuPressure').resolves(true);
                    return [4 /*yield*/, resourceManager.allocateResourcesForOperation({
                            estimatedMemory: 1000, // 1GB
                            estimatedCpuLoad: 70, // 70%
                            priority: 'normal'
                        })];
                case 1:
                    allocationResult = _a.sent();
                    assert.strictEqual(allocationResult.allocated, false);
                    assert.ok(allocationResult.reason.includes('pressure'));
                    return [2 /*return*/];
            }
        });
    }); });
});
