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
var BuildScriptOptimizer = /** @class */ (function () {
    function BuildScriptOptimizer() {
    }
    /**
     * Analyzes and optimizes a build script from package.json
     */
    BuildScriptOptimizer.prototype.optimizeScript = function (scriptName, scriptCommand) {
        return __awaiter(this, void 0, void 0, function () {
            var optimizations;
            return __generator(this, function (_a) {
                optimizations = [];
                // Check for cross-env usage
                if (scriptCommand.includes('NODE_ENV=production') || scriptCommand.includes('NODE_ENV=development')) {
                    if (!scriptCommand.includes('cross-env')) {
                        optimizations.push({
                            title: 'Use cross-env for Cross-Platform Environment Variables',
                            description: 'Add cross-env to ensure environment variables work across different platforms',
                            benefit: 'Ensures your build scripts work on Windows, macOS, and Linux without platform-specific issues',
                            before: scriptCommand,
                            after: scriptCommand.replace(/(NODE_ENV=[a-zA-Z]+)/, 'cross-env $1')
                        });
                    }
                }
                // Check for parallel builds
                if (scriptCommand.includes('&&') && !scriptCommand.includes('concurrently') && !scriptCommand.includes('npm-run-all')) {
                    optimizations.push({
                        title: 'Use concurrently for Parallel Task Execution',
                        description: 'Replace sequential task execution (&&) with concurrent execution for faster builds',
                        benefit: 'Can significantly reduce build time when tasks can run in parallel',
                        before: scriptCommand,
                        after: "concurrently \"".concat(scriptCommand.split('&&').map(function (cmd) { return cmd.trim(); }).join('" "'), "\"")
                    });
                }
                // Check for webpack build optimization
                if (scriptCommand.includes('webpack')) {
                    if (!scriptCommand.includes('--profile') && !scriptCommand.includes('--json')) {
                        optimizations.push({
                            title: 'Add Build Profiling',
                            description: 'Add --profile flag to analyze webpack build performance',
                            benefit: 'Helps identify bottlenecks in your build process',
                            before: scriptCommand,
                            after: "".concat(scriptCommand, " --profile")
                        });
                    }
                    if (!scriptCommand.includes('cache') && !scriptCommand.includes('--cache')) {
                        optimizations.push({
                            title: 'Enable Webpack Caching',
                            description: 'Add caching to webpack builds for faster rebuilds',
                            benefit: 'Significantly speeds up incremental builds during development',
                            before: scriptCommand,
                            after: "".concat(scriptCommand, " --cache")
                        });
                    }
                }
                // Check for TypeScript build optimization
                if (scriptCommand.includes('tsc')) {
                    if (!scriptCommand.includes('--incremental')) {
                        optimizations.push({
                            title: 'Enable Incremental TypeScript Compilation',
                            description: 'Add --incremental flag to TypeScript compilation',
                            benefit: 'Reduces compilation time by reusing information from previous compilations',
                            before: scriptCommand,
                            after: "".concat(scriptCommand, " --incremental")
                        });
                    }
                    if (!scriptCommand.includes('--noEmit') && scriptCommand.includes('--project') && scriptCommand.includes('lint')) {
                        optimizations.push({
                            title: 'Use --noEmit for Type Checking Only',
                            description: 'Add --noEmit when running TypeScript for linting/checking only',
                            benefit: 'Speeds up type checking by skipping file generation',
                            before: scriptCommand,
                            after: "".concat(scriptCommand, " --noEmit")
                        });
                    }
                }
                // Check for build output cleanup
                if (scriptName === 'build' && !scriptCommand.includes('rimraf') && !scriptCommand.includes('del') && !scriptCommand.includes('rm -rf')) {
                    optimizations.push({
                        title: 'Add Clean Step Before Build',
                        description: 'Clean output directory before building to prevent stale files',
                        benefit: 'Prevents issues with outdated files persisting in your build directory',
                        before: scriptCommand,
                        after: "rimraf dist && ".concat(scriptCommand)
                    });
                }
                // Check for environment-specific builds
                if (scriptName === 'build' && !scriptCommand.includes('NODE_ENV=production')) {
                    optimizations.push({
                        title: 'Add Production Environment Flag',
                        description: 'Specify NODE_ENV=production for production builds',
                        benefit: 'Ensures bundlers and tools apply production optimizations',
                        before: scriptCommand,
                        after: "cross-env NODE_ENV=production ".concat(scriptCommand)
                    });
                }
                return [2 /*return*/, optimizations];
            });
        });
    };
    return BuildScriptOptimizer;
}());
exports.BuildScriptOptimizer = BuildScriptOptimizer;
