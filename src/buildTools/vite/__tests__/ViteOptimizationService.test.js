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
var ViteOptimizationService_1 = require("../services/ViteOptimizationService");
var jest_mock_extended_1 = require("jest-mock-extended");
describe('ViteOptimizationService', function () {
    var optimizer;
    var mockLogger;
    beforeEach(function () {
        mockLogger = (0, jest_mock_extended_1.mock)();
        optimizer = new ViteOptimizationService_1.ViteOptimizationService(mockLogger);
    });
    describe('analyzeOptimizations', function () {
        it('should detect suboptimal build settings', function () { return __awaiter(void 0, void 0, void 0, function () {
            var config, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            build: {
                                minify: false,
                                target: 'es2015'
                            }
                        };
                        return [4 /*yield*/, optimizer.analyzeOptimizations(config)];
                    case 1:
                        result = _a.sent();
                        expect(result.suggestions).toContainEqual(expect.objectContaining({
                            type: 'build',
                            description: expect.stringContaining('minification'),
                            impact: 'high'
                        }));
                        expect(result.suggestions).toContainEqual(expect.objectContaining({
                            type: 'build',
                            description: expect.stringContaining('target'),
                            impact: 'medium'
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should suggest dependency optimizations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var config, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            optimizeDeps: {
                                entries: [],
                                include: []
                            }
                        };
                        return [4 /*yield*/, optimizer.analyzeOptimizations(config)];
                    case 1:
                        result = _a.sent();
                        expect(result.suggestions).toContainEqual(expect.objectContaining({
                            type: 'dependencies',
                            description: expect.stringContaining('pre-bundling'),
                            impact: 'high'
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should suggest asset optimizations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var config, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            build: {
                                assetsInlineLimit: 10000000
                            }
                        };
                        return [4 /*yield*/, optimizer.analyzeOptimizations(config)];
                    case 1:
                        result = _a.sent();
                        expect(result.suggestions).toContainEqual(expect.objectContaining({
                            type: 'assets',
                            description: expect.stringContaining('inline limit'),
                            impact: 'medium'
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should detect missing production optimizations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var config, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            build: {
                                sourcemap: true,
                                minify: true
                            }
                        };
                        return [4 /*yield*/, optimizer.analyzeOptimizations(config, 'production')];
                    case 1:
                        result = _a.sent();
                        expect(result.suggestions).toContainEqual(expect.objectContaining({
                            type: 'production',
                            description: expect.stringContaining('sourcemap'),
                            impact: 'medium'
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should provide code samples for suggestions', function () { return __awaiter(void 0, void 0, void 0, function () {
            var config, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            build: {
                                minify: false
                            }
                        };
                        return [4 /*yield*/, optimizer.analyzeOptimizations(config)];
                    case 1:
                        result = _a.sent();
                        expect(result.suggestions[0].sampleCode).toBeDefined();
                        expect(result.suggestions[0].sampleCode).toContain('minify: "esbuild"');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should detect missing CSS optimizations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var config, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            css: {
                                postcss: false
                            }
                        };
                        return [4 /*yield*/, optimizer.analyzeOptimizations(config)];
                    case 1:
                        result = _a.sent();
                        expect(result.suggestions).toContainEqual(expect.objectContaining({
                            type: 'css',
                            description: expect.stringContaining('PostCSS'),
                            impact: 'medium'
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle invalid configurations gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = null;
                        return [4 /*yield*/, expect(optimizer.analyzeOptimizations(config)).rejects.toThrow()];
                    case 1:
                        _a.sent();
                        expect(mockLogger.error).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
