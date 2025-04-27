"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.OptimizationGeneratorService = void 0;
var BuildScriptAnalyzerService_1 = require("./BuildScriptAnalyzerService");
var OptimizationGeneratorService = /** @class */ (function () {
    function OptimizationGeneratorService() {
        this.analyzer = new BuildScriptAnalyzerService_1.BuildScriptAnalyzerService();
    }
    OptimizationGeneratorService.prototype.generateOptimizations = function (buildScripts, packageJson) {
        return __awaiter(this, void 0, void 0, function () {
            var optimizations, _i, buildScripts_1, script, analysis, context_1;
            return __generator(this, function (_a) {
                optimizations = [];
                for (_i = 0, buildScripts_1 = buildScripts; _i < buildScripts_1.length; _i++) {
                    script = buildScripts_1[_i];
                    analysis = this.analyzer.analyzeBuildCommand(script.command);
                    context_1 = {
                        scriptInfo: script,
                        packageJson: packageJson,
                        analysis: analysis
                    };
                    optimizations.push.apply(optimizations, this.generateCrossEnvOptimizations(context_1));
                    optimizations.push.apply(optimizations, this.generateParallelizationOptimizations(context_1));
                    optimizations.push.apply(optimizations, this.generateWebpackOptimizations(context_1));
                    optimizations.push.apply(optimizations, this.generateTypeScriptOptimizations(context_1));
                    optimizations.push.apply(optimizations, this.generateCleanupOptimizations(context_1));
                    optimizations.push.apply(optimizations, this.generateCacheOptimizations(context_1));
                    optimizations.push.apply(optimizations, this.generateEnvironmentOptimizations(context_1));
                }
                return [2 /*return*/, optimizations];
            });
        });
    };
    OptimizationGeneratorService.prototype.applyOptimizations = function (packageJson, optimizations) {
        return __awaiter(this, void 0, void 0, function () {
            var modified, updatedPackageJson, _i, optimizations_1, optimization, _a, _b, _c, name_1, command, _d, _e, pkg;
            return __generator(this, function (_f) {
                modified = false;
                updatedPackageJson = __assign({}, packageJson);
                for (_i = 0, optimizations_1 = optimizations; _i < optimizations_1.length; _i++) {
                    optimization = optimizations_1[_i];
                    if (!updatedPackageJson.scripts) {
                        updatedPackageJson.scripts = {};
                    }
                    // Find the script that matches the 'before' state
                    for (_a = 0, _b = Object.entries(updatedPackageJson.scripts); _a < _b.length; _a++) {
                        _c = _b[_a], name_1 = _c[0], command = _c[1];
                        if (command === optimization.before) {
                            updatedPackageJson.scripts[name_1] = optimization.after;
                            modified = true;
                            break;
                        }
                    }
                    // Add any required packages
                    if (optimization.requiredPackages && optimization.requiredPackages.length > 0) {
                        if (!updatedPackageJson.devDependencies) {
                            updatedPackageJson.devDependencies = {};
                        }
                        for (_d = 0, _e = optimization.requiredPackages; _d < _e.length; _d++) {
                            pkg = _e[_d];
                            if (!updatedPackageJson.devDependencies[pkg]) {
                                updatedPackageJson.devDependencies[pkg] = "^1.0.0"; // Default to latest major version
                                modified = true;
                            }
                        }
                    }
                }
                return [2 /*return*/, modified ? updatedPackageJson : null];
            });
        });
    };
    OptimizationGeneratorService.prototype.generateCrossEnvOptimizations = function (context) {
        var scriptInfo = context.scriptInfo, analysis = context.analysis;
        var optimizations = [];
        if (analysis.hasEnvironmentVars && !scriptInfo.command.includes('cross-env')) {
            optimizations.push({
                title: 'Use cross-env for Cross-Platform Environment Variables',
                description: 'Add cross-env to ensure environment variables work across different platforms',
                benefit: 'Ensures your build scripts work on Windows, macOS, and Linux without platform-specific issues',
                complexity: 'low',
                before: scriptInfo.command,
                after: scriptInfo.command.replace(/(NODE_ENV=[a-zA-Z]+)/, 'cross-env $1'),
                requiredPackages: ['cross-env']
            });
        }
        return optimizations;
    };
    OptimizationGeneratorService.prototype.generateParallelizationOptimizations = function (context) {
        var scriptInfo = context.scriptInfo, analysis = context.analysis;
        var optimizations = [];
        if (scriptInfo.command.includes('&&') && !analysis.isParallel) {
            optimizations.push({
                title: 'Use concurrently for Parallel Task Execution',
                description: 'Replace sequential task execution (&&) with concurrent execution for faster builds',
                benefit: 'Can significantly reduce build time when tasks can run in parallel',
                complexity: 'medium',
                before: scriptInfo.command,
                after: "concurrently \"".concat(scriptInfo.command.split('&&').map(function (cmd) { return cmd.trim(); }).join('" "'), "\""),
                requiredPackages: ['concurrently']
            });
        }
        return optimizations;
    };
    OptimizationGeneratorService.prototype.generateWebpackOptimizations = function (context) {
        var scriptInfo = context.scriptInfo, analysis = context.analysis;
        var optimizations = [];
        if (analysis.hasWebpack) {
            if (!scriptInfo.command.includes('--profile') && !scriptInfo.command.includes('--json')) {
                optimizations.push({
                    title: 'Add Build Profiling',
                    description: 'Add --profile flag to analyze webpack build performance',
                    benefit: 'Helps identify bottlenecks in your build process',
                    complexity: 'low',
                    before: scriptInfo.command,
                    after: "".concat(scriptInfo.command, " --profile")
                });
            }
            if (!analysis.hasCache) {
                optimizations.push({
                    title: 'Enable Webpack Caching',
                    description: 'Add caching to webpack builds for faster rebuilds',
                    benefit: 'Significantly speeds up incremental builds during development',
                    complexity: 'low',
                    before: scriptInfo.command,
                    after: "".concat(scriptInfo.command, " --cache")
                });
            }
        }
        return optimizations;
    };
    OptimizationGeneratorService.prototype.generateTypeScriptOptimizations = function (context) {
        var scriptInfo = context.scriptInfo, analysis = context.analysis;
        var optimizations = [];
        if (analysis.hasTypeScript) {
            if (!scriptInfo.command.includes('--incremental')) {
                optimizations.push({
                    title: 'Enable Incremental TypeScript Compilation',
                    description: 'Add --incremental flag to TypeScript compilation',
                    benefit: 'Reduces compilation time by reusing information from previous compilations',
                    complexity: 'low',
                    before: scriptInfo.command,
                    after: "".concat(scriptInfo.command, " --incremental")
                });
            }
            if (!scriptInfo.command.includes('--noEmit') && scriptInfo.command.includes('--project') && scriptInfo.command.includes('lint')) {
                optimizations.push({
                    title: 'Use --noEmit for Type Checking Only',
                    description: 'Add --noEmit when running TypeScript for linting/checking only',
                    benefit: 'Speeds up type checking by skipping file generation',
                    complexity: 'low',
                    before: scriptInfo.command,
                    after: "".concat(scriptInfo.command, " --noEmit")
                });
            }
        }
        return optimizations;
    };
    OptimizationGeneratorService.prototype.generateCleanupOptimizations = function (context) {
        var scriptInfo = context.scriptInfo, analysis = context.analysis;
        var optimizations = [];
        if (scriptInfo.name === 'build' && !analysis.hasCleaning) {
            optimizations.push({
                title: 'Add Clean Step Before Build',
                description: 'Clean output directory before building to prevent stale files',
                benefit: 'Prevents issues with outdated files persisting in your build directory',
                complexity: 'low',
                before: scriptInfo.command,
                after: "rimraf dist && ".concat(scriptInfo.command),
                requiredPackages: ['rimraf']
            });
        }
        return optimizations;
    };
    OptimizationGeneratorService.prototype.generateCacheOptimizations = function (context) {
        var scriptInfo = context.scriptInfo, analysis = context.analysis;
        var optimizations = [];
        if ((analysis.hasWebpack || analysis.hasRollup || analysis.hasVite) && !analysis.hasCache) {
            var tool = analysis.hasWebpack ? 'webpack' : analysis.hasRollup ? 'rollup' : 'vite';
            optimizations.push({
                title: "Enable ".concat(tool, " Build Caching"),
                description: "Add cache configuration for ".concat(tool),
                benefit: 'Speeds up subsequent builds by caching build artifacts',
                complexity: 'medium',
                before: scriptInfo.command,
                after: "".concat(scriptInfo.command, " --cache")
            });
        }
        return optimizations;
    };
    OptimizationGeneratorService.prototype.generateEnvironmentOptimizations = function (context) {
        var scriptInfo = context.scriptInfo;
        var optimizations = [];
        if (scriptInfo.name === 'build' && !scriptInfo.command.includes('NODE_ENV=production')) {
            optimizations.push({
                title: 'Add Production Environment Flag',
                description: 'Specify NODE_ENV=production for production builds',
                benefit: 'Ensures bundlers and tools apply production optimizations',
                complexity: 'low',
                before: scriptInfo.command,
                after: "cross-env NODE_ENV=production ".concat(scriptInfo.command),
                requiredPackages: ['cross-env']
            });
        }
        return optimizations;
    };
    return OptimizationGeneratorService;
}());
exports.OptimizationGeneratorService = OptimizationGeneratorService;
