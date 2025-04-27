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
exports.TestRunnerService = void 0;
var staticAnalysisService_1 = require("./staticAnalysisService");
var codeCoverageService_1 = require("./codeCoverageService");
var securityTestingService_1 = require("./securityTestingService");
var UnitTestService_1 = require("./services/UnitTestService");
var IntegrationTestService_1 = require("./services/IntegrationTestService");
var E2ETestService_1 = require("./services/E2ETestService");
var PerformanceTestService_1 = require("./services/PerformanceTestService");
/**
 * Service for running various types of tests within the VS Code environment
 */
var TestRunnerService = /** @class */ (function () {
    function TestRunnerService() {
        this.unitService = new UnitTestService_1.UnitTestService();
        this.integrationService = new IntegrationTestService_1.IntegrationTestService();
        this.e2eService = new E2ETestService_1.E2ETestService();
        this.performanceService = new PerformanceTestService_1.PerformanceTestService();
        this.staticService = new staticAnalysisService_1.StaticAnalysisService();
        this.coverageService = new codeCoverageService_1.CodeCoverageService();
        this.securityService = new securityTestingService_1.SecurityTestingService();
    }
    /**
     * Run unit tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    TestRunnerService.prototype.runUnitTests = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.unitService.run(options)];
            });
        });
    };
    /**
     * Run integration tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    TestRunnerService.prototype.runIntegrationTests = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.integrationService.run(options)];
            });
        });
    };
    /**
     * Run end-to-end tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    TestRunnerService.prototype.runE2ETests = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.e2eService.run(options)];
            });
        });
    };
    /**
     * Run performance tests based on specified options
     * @param options The options for the test run
     * @returns A promise resolving to the test result
     */
    TestRunnerService.prototype.runPerformanceTests = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.performanceService.run(options)];
            });
        });
    };
    /**
     * Run static code analysis on the workspace
     */
    TestRunnerService.prototype.runStaticAnalysis = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.staticService.runAnalysis(options)];
            });
        });
    };
    /**
     * Run ESLint analysis
     */
    TestRunnerService.prototype.runESLintAnalysis = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.staticService.runESLint(options)];
            });
        });
    };
    /**
     * Run Prettier analysis
     */
    TestRunnerService.prototype.runPrettierAnalysis = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.staticService.runPrettier(options)];
            });
        });
    };
    /**
     * Run code coverage analysis
     */
    TestRunnerService.prototype.runCodeCoverage = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.coverageService.run(options)];
            });
        });
    };
    /**
     * Run security testing
     */
    TestRunnerService.prototype.runSecurityTest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.securityService.run(options)];
            });
        });
    };
    /**
     * Dispose of resources used by the test runner
     */
    TestRunnerService.prototype.dispose = function () {
        this.unitService.dispose();
        this.integrationService.dispose();
        this.e2eService.dispose();
        this.performanceService.dispose();
        this.staticService.dispose();
        this.coverageService.dispose();
        this.securityService.dispose();
    };
    return TestRunnerService;
}());
exports.TestRunnerService = TestRunnerService;
