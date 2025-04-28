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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollupConfigDetector = void 0;
const glob = __importStar(require("glob"));
const path = __importStar(require("path"));
/**
 * Default logger implementation that does nothing
 */
class NoOpLogger {
    debug() { }
    info() { }
    warn() { }
    error() { }
}
class RollupConfigDetector {
    constructor(logger) {
        this.configPatterns = [
            'rollup.config.js',
            'rollup.*.config.js',
            '*rollup.config.js',
            '*rollup*.js',
            'rollup.config.ts',
            'rollup.*.config.ts',
            '*rollup.config.ts',
            '*rollup*.ts',
            'rollup.config.mjs',
            'rollup.*.config.mjs'
        ];
        this.logger = logger || new NoOpLogger();
    }
    /**
     * Detects rollup configuration files in the given directory
     * @param workspacePath Directory to search for rollup configs
     * @returns Array of absolute paths to rollup config files
     */
    async detectConfigs(workspacePath) {
        this.logger.debug(`Searching for rollup configs in ${workspacePath}`);
        try {
            const configs = new Set();
            for (const pattern of this.configPatterns) {
                const matches = await this.findFiles(pattern, workspacePath);
                matches.forEach(match => configs.add(path.resolve(workspacePath, match)));
            }
            const configArray = Array.from(configs);
            this.logger.debug(`Found ${configArray.length} rollup config files`);
            return configArray;
        }
        catch (error) {
            this.logger.error('Error detecting rollup configs:', error);
            throw new Error(`Failed to detect rollup configurations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Finds files matching the given pattern in the workspace
     * @param pattern Glob pattern to match
     * @param cwd Directory to search in
     */
    findFiles(pattern, cwd) {
        return new Promise((resolve, reject) => {
            glob(pattern, { cwd }, (err, matches) => {
                if (err) {
                    this.logger.error(`Error searching for pattern ${pattern}:`, err);
                    reject(err);
                }
                else {
                    resolve(matches);
                }
            });
        });
    }
    /**
     * Validates if a file is a rollup config
     * @param filePath Path to the file to validate
     * @returns true if the file appears to be a rollup config
     */
    async validateConfigFile(filePath) {
        this.logger.debug(`Validating rollup config file: ${filePath}`);
        try {
            // Check if the file matches any of our patterns
            const fileName = path.basename(filePath);
            const isMatch = this.configPatterns.some(pattern => new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$').test(fileName));
            if (!isMatch) {
                this.logger.debug(`File ${fileName} does not match rollup config patterns`);
                return false;
            }
            // Additional validation could be added here, like checking file contents
            // for rollup-specific keywords or importing the config to validate it
            return true;
        }
        catch (error) {
            this.logger.error('Error validating rollup config file:', error);
            throw new Error(`Failed to validate rollup configuration file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Gets the default config pattern for a given language
     * @param language The programming language (js, ts, etc.)
     * @returns The default config pattern for that language
     */
    getDefaultConfigPattern(language) {
        const patterns = {
            'js': 'rollup.config.js',
            'ts': 'rollup.config.ts',
            'mjs': 'rollup.config.mjs'
        };
        return patterns[language] || patterns['js'];
    }
}
exports.RollupConfigDetector = RollupConfigDetector;
//# sourceMappingURL=RollupConfigDetector.js.map