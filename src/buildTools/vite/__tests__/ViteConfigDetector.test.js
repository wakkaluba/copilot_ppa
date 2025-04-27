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
var ViteConfigDetector_1 = require("../services/ViteConfigDetector");
var jest_mock_extended_1 = require("jest-mock-extended");
describe('ViteConfigDetector', function () {
    var detector;
    var mockLogger;
    var mockFs;
    beforeEach(function () {
        mockLogger = (0, jest_mock_extended_1.mock)();
        mockFs = (0, jest_mock_extended_1.mock)();
        detector = new ViteConfigDetector_1.ViteConfigDetector(mockLogger, mockFs);
    });
    describe('detectConfig', function () {
        it('should detect TypeScript config file', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFs.exists.mockResolvedValueOnce(true);
                        mockFs.readFile.mockResolvedValueOnce("\n                import { defineConfig } from 'vite'\n                export default defineConfig({})\n            ");
                        return [4 /*yield*/, detector.detectConfig('/project/vite.config.ts')];
                    case 1:
                        result = _a.sent();
                        expect(result.configType).toBe('typescript');
                        expect(result.path).toBe('/project/vite.config.ts');
                        expect(result.isValid).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should detect JavaScript config file', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFs.exists.mockResolvedValueOnce(true);
                        mockFs.readFile.mockResolvedValueOnce("\n                export default {\n                    plugins: []\n                }\n            ");
                        return [4 /*yield*/, detector.detectConfig('/project/vite.config.js')];
                    case 1:
                        result = _a.sent();
                        expect(result.configType).toBe('javascript');
                        expect(result.path).toBe('/project/vite.config.js');
                        expect(result.isValid).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should detect ESM config file', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFs.exists.mockResolvedValueOnce(true);
                        mockFs.readFile.mockResolvedValueOnce("\n                import { defineConfig } from 'vite'\n                export default defineConfig({})\n            ");
                        return [4 /*yield*/, detector.detectConfig('/project/vite.config.mjs')];
                    case 1:
                        result = _a.sent();
                        expect(result.configType).toBe('esm');
                        expect(result.path).toBe('/project/vite.config.mjs');
                        expect(result.isValid).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle missing config file', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFs.exists.mockResolvedValueOnce(false);
                        return [4 /*yield*/, detector.detectConfig('/project/vite.config.ts')];
                    case 1:
                        result = _a.sent();
                        expect(result.isValid).toBe(false);
                        expect(result.error).toBeDefined();
                        expect(mockLogger.warn).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should validate dependencies in package.json', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFs.exists.mockResolvedValueOnce(true);
                        mockFs.readFile.mockResolvedValueOnce("\n                import vue from '@vitejs/plugin-vue'\n                export default {\n                    plugins: [vue()]\n                }\n            ");
                        mockFs.readFile.mockResolvedValueOnce("{\n                \"dependencies\": {\n                    \"@vitejs/plugin-vue\": \"^2.0.0\"\n                }\n            }");
                        return [4 /*yield*/, detector.detectConfig('/project/vite.config.ts')];
                    case 1:
                        result = _a.sent();
                        expect(result.isValid).toBe(true);
                        expect(result.dependencies).toContainEqual({
                            name: '@vitejs/plugin-vue',
                            version: '^2.0.0'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should detect missing required dependencies', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFs.exists.mockResolvedValueOnce(true);
                        mockFs.readFile.mockResolvedValueOnce("\n                import vue from '@vitejs/plugin-vue'\n                export default {\n                    plugins: [vue()]\n                }\n            ");
                        mockFs.readFile.mockResolvedValueOnce("{\n                \"dependencies\": {}\n            }");
                        return [4 /*yield*/, detector.detectConfig('/project/vite.config.ts')];
                    case 1:
                        result = _a.sent();
                        expect(result.isValid).toBe(false);
                        expect(result.missingDependencies).toContain('@vitejs/plugin-vue');
                        expect(mockLogger.error).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle invalid config syntax', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mockFs.exists.mockResolvedValueOnce(true);
                        mockFs.readFile.mockResolvedValueOnce('invalid { config');
                        return [4 /*yield*/, detector.detectConfig('/project/vite.config.ts')];
                    case 1:
                        result = _b.sent();
                        expect(result.isValid).toBe(false);
                        expect(result.error).toBeDefined();
                        expect((_a = result.error) === null || _a === void 0 ? void 0 : _a.message).toContain('syntax');
                        expect(mockLogger.error).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
