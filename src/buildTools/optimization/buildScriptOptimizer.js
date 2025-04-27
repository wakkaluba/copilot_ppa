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
exports.BuildScriptOptimizer = void 0;
var logger_1 = require("../../utils/logger");
var OptimizationGeneratorService_1 = require("./services/OptimizationGeneratorService");
var BuildScriptAnalyzerService_1 = require("./services/BuildScriptAnalyzerService");
var UserInteractionService_1 = require("./services/UserInteractionService");
var BuildScriptOptimizer = /** @class */ (function () {
    function BuildScriptOptimizer(buildTools, loggerFactory) {
        var _a;
        this.logger = (_a = loggerFactory === null || loggerFactory === void 0 ? void 0 : loggerFactory('BuildScriptOptimizer')) !== null && _a !== void 0 ? _a : new logger_1.Logger('BuildScriptOptimizer');
        this.generator = new OptimizationGeneratorService_1.OptimizationGeneratorService();
        this.analyzer = new BuildScriptAnalyzerService_1.BuildScriptAnalyzerService();
        this.ui = new UserInteractionService_1.UserInteractionService();
    }
    BuildScriptOptimizer.prototype.optimizeScript = function (scriptName, scriptCommand) {
        return __awaiter(this, void 0, void 0, function () {
            var buildScripts, analysis, context_1, optimizations, selectedOptimizations, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        this.logger.info("Analyzing build script: ".concat(scriptName));
                        buildScripts = this.analyzer.findBuildScripts((_a = {},
                            _a[scriptName] = scriptCommand,
                            _a));
                        if (!buildScripts.length) {
                            this.logger.warn('No build scripts found to optimize');
                            return [2 /*return*/, []];
                        }
                        analysis = this.analyzer.analyzeBuildCommand(scriptCommand);
                        context_1 = {
                            scriptInfo: buildScripts[0],
                            packageJson: {},
                            analysis: analysis
                        };
                        return [4 /*yield*/, this.generator.generateOptimizations([buildScripts[0]], {})];
                    case 1:
                        optimizations = _b.sent();
                        this.logger.info("Generated ".concat(optimizations.length, " optimization suggestions"));
                        return [4 /*yield*/, this.ui.selectOptimizations(optimizations)];
                    case 2:
                        selectedOptimizations = _b.sent();
                        if (selectedOptimizations.length > 0) {
                            this.ui.showInfo("Selected ".concat(selectedOptimizations.length, " optimizations to apply"));
                        }
                        return [2 /*return*/, selectedOptimizations];
                    case 3:
                        error_1 = _b.sent();
                        this.logger.error('Error optimizing build script:', error_1);
                        throw this.wrapError(error_1);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BuildScriptOptimizer.prototype.wrapError = function (error) {
        if (error instanceof Error) {
            return error;
        }
        return new Error("Build script optimization failed: ".concat(String(error)));
    };
    return BuildScriptOptimizer;
}());
exports.BuildScriptOptimizer = BuildScriptOptimizer;
