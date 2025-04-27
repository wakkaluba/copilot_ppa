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
exports.WebpackConfigDetector = void 0;
var glob = require("glob");
var path = require("path");
/**
 * Default logger implementation that does nothing
 */
var NoOpLogger = /** @class */ (function () {
    function NoOpLogger() {
    }
    NoOpLogger.prototype.debug = function () { };
    NoOpLogger.prototype.info = function () { };
    NoOpLogger.prototype.warn = function () { };
    NoOpLogger.prototype.error = function () { };
    return NoOpLogger;
}());
var WebpackConfigDetector = /** @class */ (function () {
    function WebpackConfigDetector(logger) {
        this.configPatterns = [
            'webpack.config.js',
            'webpack.*.config.js',
            '*webpack.config.js',
            '*webpack*.js',
            'webpack.config.ts',
            'webpack.*.config.ts',
            '*webpack.config.ts',
            '*webpack*.ts'
        ];
        this.logger = logger || new NoOpLogger();
    }
    /**
     * Detects webpack configuration files in the given directory
     * @param workspacePath Directory to search for webpack configs
     * @returns Array of absolute paths to webpack config files
     */
    WebpackConfigDetector.prototype.detectConfigs = function (workspacePath) {
        return __awaiter(this, void 0, void 0, function () {
            var configs_1, _i, _a, pattern, matches, configArray, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.debug("Searching for webpack configs in ".concat(workspacePath));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        configs_1 = new Set();
                        _i = 0, _a = this.configPatterns;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        pattern = _a[_i];
                        return [4 /*yield*/, this.findFiles(pattern, workspacePath)];
                    case 3:
                        matches = _b.sent();
                        matches.forEach(function (match) { return configs_1.add(path.resolve(workspacePath, match)); });
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        configArray = Array.from(configs_1);
                        this.logger.debug("Found ".concat(configArray.length, " webpack config files"));
                        return [2 /*return*/, configArray];
                    case 6:
                        error_1 = _b.sent();
                        this.logger.error('Error detecting webpack configs:', error_1);
                        throw new Error("Failed to detect webpack configurations: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Finds files matching the given pattern in the workspace
     * @param pattern Glob pattern to match
     * @param cwd Directory to search in
     */
    WebpackConfigDetector.prototype.findFiles = function (pattern, cwd) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            glob(pattern, { cwd: cwd }, function (err, matches) {
                if (err) {
                    _this.logger.error("Error searching for pattern ".concat(pattern, ":"), err);
                    reject(err);
                }
                else {
                    resolve(matches);
                }
            });
        });
    };
    /**
     * Validates if a file is a webpack config
     * @param filePath Path to the file to validate
     * @returns true if the file appears to be a webpack config
     */
    WebpackConfigDetector.prototype.validateConfigFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fileName_1, isMatch;
            return __generator(this, function (_a) {
                this.logger.debug("Validating webpack config file: ".concat(filePath));
                try {
                    fileName_1 = path.basename(filePath);
                    isMatch = this.configPatterns.some(function (pattern) {
                        return new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$').test(fileName_1);
                    });
                    if (!isMatch) {
                        this.logger.debug("File ".concat(fileName_1, " does not match webpack config patterns"));
                        return [2 /*return*/, false];
                    }
                    // Additional validation could be added here, like checking file contents
                    // for webpack-specific keywords or importing the config to validate it
                    return [2 /*return*/, true];
                }
                catch (error) {
                    this.logger.error('Error validating webpack config file:', error);
                    throw new Error("Failed to validate webpack configuration file: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    };
    return WebpackConfigDetector;
}());
exports.WebpackConfigDetector = WebpackConfigDetector;
