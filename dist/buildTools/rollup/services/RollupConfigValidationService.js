"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollupConfigValidationService = void 0;
const ConfigValidationError_1 = require("../errors/ConfigValidationError");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * Service responsible for validating Rollup configuration files and paths
 */
class RollupConfigValidationService {
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Validates the configuration analysis results
     * @throws {ConfigValidationError} If validation fails
     */
    validateConfig(analysis) {
        if (!analysis.input || analysis.input.length === 0) {
            throw new ConfigValidationError_1.ConfigValidationError('No input files specified in configuration');
        }
        if (!analysis.output || analysis.output.length === 0) {
            throw new ConfigValidationError_1.ConfigValidationError('No output configuration specified');
        }
        // Validate input paths exist
        for (const input of analysis.input) {
            if (!input.path) {
                throw new ConfigValidationError_1.ConfigValidationError(`Invalid input configuration: ${JSON.stringify(input)}`);
            }
            if (!fs.existsSync(input.path)) {
                throw new ConfigValidationError_1.ConfigValidationError(`Input file does not exist: ${input.path}`);
            }
        }
        // Validate output configurations
        for (const output of analysis.output) {
            if (!output.format || !output.file) {
                throw new ConfigValidationError_1.ConfigValidationError(`Invalid output configuration: ${JSON.stringify(output)}`);
            }
            if (!['es', 'cjs', 'umd', 'amd', 'iife', 'system'].includes(output.format)) {
                throw new ConfigValidationError_1.ConfigValidationError(`Invalid output format: ${output.format}`);
            }
        }
        this.logger.debug('Rollup configuration validation successful');
    }
    /**
     * Validates a workspace path
     * @throws {ConfigValidationError} If the path is invalid
     */
    validateWorkspacePath(workspacePath) {
        if (!workspacePath) {
            throw new ConfigValidationError_1.ConfigValidationError('No workspace path provided');
        }
        if (!path.isAbsolute(workspacePath)) {
            throw new ConfigValidationError_1.ConfigValidationError('Workspace path must be absolute');
        }
        if (!fs.existsSync(workspacePath)) {
            throw new ConfigValidationError_1.ConfigValidationError(`Workspace path does not exist: ${workspacePath}`);
        }
        if (!fs.statSync(workspacePath).isDirectory()) {
            throw new ConfigValidationError_1.ConfigValidationError(`Workspace path is not a directory: ${workspacePath}`);
        }
        this.logger.debug(`Workspace path validation successful: ${workspacePath}`);
    }
    /**
     * Validates a config file path
     * @throws {ConfigValidationError} If the path is invalid
     */
    validateConfigPath(configPath) {
        if (!configPath) {
            throw new ConfigValidationError_1.ConfigValidationError('No config path provided');
        }
        if (!path.isAbsolute(configPath)) {
            throw new ConfigValidationError_1.ConfigValidationError('Config path must be absolute');
        }
        if (!fs.existsSync(configPath)) {
            throw new ConfigValidationError_1.ConfigValidationError(`Config file does not exist: ${configPath}`);
        }
        if (!fs.statSync(configPath).isFile()) {
            throw new ConfigValidationError_1.ConfigValidationError(`Config path is not a file: ${configPath}`);
        }
        this.logger.debug(`Config path validation successful: ${configPath}`);
    }
}
exports.RollupConfigValidationService = RollupConfigValidationService;
//# sourceMappingURL=RollupConfigValidationService.js.map