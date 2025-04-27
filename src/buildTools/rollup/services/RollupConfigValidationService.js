"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollupConfigValidationService = void 0;
var ConfigValidationError_1 = require("../errors/ConfigValidationError");
var path = require("path");
var fs = require("fs");
/**
 * Service responsible for validating Rollup configuration files and paths
 */
var RollupConfigValidationService = /** @class */ (function () {
    function RollupConfigValidationService(logger) {
        this.logger = logger;
    }
    /**
     * Validates the configuration analysis results
     * @throws {ConfigValidationError} If validation fails
     */
    RollupConfigValidationService.prototype.validateConfig = function (analysis) {
        if (!analysis.input || analysis.input.length === 0) {
            throw new ConfigValidationError_1.ConfigValidationError('No input files specified in configuration');
        }
        if (!analysis.output || analysis.output.length === 0) {
            throw new ConfigValidationError_1.ConfigValidationError('No output configuration specified');
        }
        // Validate input paths exist
        for (var _i = 0, _a = analysis.input; _i < _a.length; _i++) {
            var input = _a[_i];
            if (!input.path) {
                throw new ConfigValidationError_1.ConfigValidationError("Invalid input configuration: ".concat(JSON.stringify(input)));
            }
            if (!fs.existsSync(input.path)) {
                throw new ConfigValidationError_1.ConfigValidationError("Input file does not exist: ".concat(input.path));
            }
        }
        // Validate output configurations
        for (var _b = 0, _c = analysis.output; _b < _c.length; _b++) {
            var output = _c[_b];
            if (!output.format || !output.file) {
                throw new ConfigValidationError_1.ConfigValidationError("Invalid output configuration: ".concat(JSON.stringify(output)));
            }
            if (!['es', 'cjs', 'umd', 'amd', 'iife', 'system'].includes(output.format)) {
                throw new ConfigValidationError_1.ConfigValidationError("Invalid output format: ".concat(output.format));
            }
        }
        this.logger.debug('Rollup configuration validation successful');
    };
    /**
     * Validates a workspace path
     * @throws {ConfigValidationError} If the path is invalid
     */
    RollupConfigValidationService.prototype.validateWorkspacePath = function (workspacePath) {
        if (!workspacePath) {
            throw new ConfigValidationError_1.ConfigValidationError('No workspace path provided');
        }
        if (!path.isAbsolute(workspacePath)) {
            throw new ConfigValidationError_1.ConfigValidationError('Workspace path must be absolute');
        }
        if (!fs.existsSync(workspacePath)) {
            throw new ConfigValidationError_1.ConfigValidationError("Workspace path does not exist: ".concat(workspacePath));
        }
        if (!fs.statSync(workspacePath).isDirectory()) {
            throw new ConfigValidationError_1.ConfigValidationError("Workspace path is not a directory: ".concat(workspacePath));
        }
        this.logger.debug("Workspace path validation successful: ".concat(workspacePath));
    };
    /**
     * Validates a config file path
     * @throws {ConfigValidationError} If the path is invalid
     */
    RollupConfigValidationService.prototype.validateConfigPath = function (configPath) {
        if (!configPath) {
            throw new ConfigValidationError_1.ConfigValidationError('No config path provided');
        }
        if (!path.isAbsolute(configPath)) {
            throw new ConfigValidationError_1.ConfigValidationError('Config path must be absolute');
        }
        if (!fs.existsSync(configPath)) {
            throw new ConfigValidationError_1.ConfigValidationError("Config file does not exist: ".concat(configPath));
        }
        if (!fs.statSync(configPath).isFile()) {
            throw new ConfigValidationError_1.ConfigValidationError("Config path is not a file: ".concat(configPath));
        }
        this.logger.debug("Config path validation successful: ".concat(configPath));
    };
    return RollupConfigValidationService;
}());
exports.RollupConfigValidationService = RollupConfigValidationService;
