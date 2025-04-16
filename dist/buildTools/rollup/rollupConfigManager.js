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
exports.RollupConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob = __importStar(require("glob"));
class RollupConfigManager {
    /**
     * Detects Rollup configuration files in the given directory
     */
    async detectConfigs(workspacePath) {
        return new Promise((resolve, reject) => {
            const patterns = [
                'rollup.config.js',
                'rollup.config.mjs',
                'rollup.*.js',
                'rollup.*.mjs',
                'rollup.config.ts',
                'rollup.*.ts'
            ];
            const configs = [];
            for (const pattern of patterns) {
                const matches = glob.sync(pattern, { cwd: workspacePath });
                for (const match of matches) {
                    configs.push(path.join(workspacePath, match));
                }
            }
            // Remove duplicates
            resolve([...new Set(configs)]);
        });
    }
    /**
     * Analyzes a Rollup configuration file
     */
    async analyzeConfig(configPath) {
        try {
            const content = fs.readFileSync(configPath, 'utf-8');
            // Simple regex-based analysis for demonstration purposes
            const inputMatch = content.match(/input\s*:\s*['"]([^'"]*)['"]/s) ||
                content.match(/input\s*:\s*{([^}]*)}/s) ||
                content.match(/input\s*:\s*\[([^\]]*)\]/s);
            const outputMatch = content.match(/output\s*:\s*{([^}]*)}/s) ||
                content.match(/output\s*:\s*\[([^\]]*)\]/s);
            const pluginMatches = Array.from(content.matchAll(/plugins\s*:\s*\[([^\]]*)\]/gs) || []);
            const externalMatches = Array.from(content.matchAll(/external\s*:\s*\[([^\]]*)\]/gs) || []) ||
                Array.from(content.matchAll(/external\s*:\s*\(([^)]*)\)/gs) || []);
            // Extract input files
            const inputFiles = this.extractInputFiles(inputMatch ? inputMatch[1] : '');
            // Extract output formats
            const outputFormats = this.extractOutputFormats(outputMatch ? outputMatch[1] : '');
            // Extract plugins
            const plugins = this.extractPlugins(pluginMatches);
            // Extract externals
            const externals = this.extractExternals(externalMatches);
            // Generate optimization suggestions
            const optimizationSuggestions = this.generateOptimizationSuggestions(content, inputFiles, outputFormats, plugins, externals);
            return {
                inputFiles,
                outputFormats,
                plugins,
                externals,
                optimizationSuggestions
            };
        }
        catch (error) {
            console.error('Error analyzing Rollup config:', error);
            throw error;
        }
    }
    /**
     * Generates optimization suggestions for a Rollup configuration
     */
    async generateOptimizations(configPath) {
        const analysis = await this.analyzeConfig(configPath);
        return analysis.optimizationSuggestions;
    }
    extractInputFiles(inputStr) {
        const inputFiles = [];
        // Extract from simple string input
        const simpleMatch = inputStr.match(/['"]([^'"]*)['"]/);
        if (simpleMatch) {
            inputFiles.push(simpleMatch[1]);
            return inputFiles;
        }
        // Extract from object input
        const objectMatches = Array.from(inputStr.matchAll(/['"]([^'"]*)['"]\s*:\s*['"]([^'"]*)['"]/g));
        for (const match of objectMatches) {
            inputFiles.push(match[2]);
        }
        // Extract from array input
        const arrayMatches = Array.from(inputStr.matchAll(/['"]([^'"]*)['"]/g));
        for (const match of arrayMatches) {
            inputFiles.push(match[1]);
        }
        return inputFiles;
    }
    extractOutputFormats(outputStr) {
        const formats = [];
        // Extract format from output object
        const formatMatch = outputStr.match(/format\s*:\s*['"]([^'"]*)['"]/);
        if (formatMatch) {
            formats.push(formatMatch[1]);
        }
        // Extract formats from output array
        const formatMatches = Array.from(outputStr.matchAll(/format\s*:\s*['"]([^'"]*)['"]/g));
        for (const match of formatMatches) {
            if (!formats.includes(match[1])) {
                formats.push(match[1]);
            }
        }
        return formats;
    }
    extractPlugins(pluginMatches) {
        const plugins = [];
        for (const match of pluginMatches) {
            const pluginContent = match[1];
            // Extract plugin names
            const pluginNameMatches = Array.from(pluginContent.matchAll(/(\w+)\(/g));
            for (const pluginMatch of pluginNameMatches) {
                const pluginName = pluginMatch[1];
                if (!plugins.includes(pluginName)) {
                    plugins.push(pluginName);
                }
            }
        }
        return plugins;
    }
    extractExternals(externalMatches) {
        const externals = [];
        for (const match of externalMatches) {
            const externalContent = match[1];
            // Extract external module names
            const externalNameMatches = Array.from(externalContent.matchAll(/['"]([^'"]*)['"]/g));
            for (const externalMatch of externalNameMatches) {
                const externalName = externalMatch[1];
                if (!externals.includes(externalName)) {
                    externals.push(externalName);
                }
            }
        }
        return externals;
    }
    generateOptimizationSuggestions(content, inputFiles, outputFormats, plugins, externals) {
        const suggestions = [];
        // Check for terser plugin
        if (!plugins.includes('terser') && !content.includes('terser')) {
            suggestions.push({
                title: 'Add Terser Plugin for Minification',
                description: 'Use Rollup terser plugin to minify your JavaScript output',
                code: `
import { terser } from 'rollup-plugin-terser';

export default {
  // ...
  plugins: [
    // ...existing plugins
    terser()
  ]
};`
            });
        }
        // Check for multiple output formats
        if (outputFormats.length <= 1) {
            suggestions.push({
                title: 'Generate Multiple Module Formats',
                description: 'Consider outputting multiple formats (ESM, CJS, UMD) for better compatibility',
                code: `
export default {
  // ...
  output: [
    {
      file: 'dist/bundle.esm.js',
      format: 'esm'
    },
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'myLibrary'
    }
  ]
};`
            });
        }
        // Check for nodeResolve plugin
        if (!plugins.includes('nodeResolve') && !content.includes('node-resolve')) {
            suggestions.push({
                title: 'Add Node Resolve Plugin',
                description: 'Use @rollup/plugin-node-resolve to resolve node_modules dependencies',
                code: `
import resolve from '@rollup/plugin-node-resolve';

export default {
  // ...
  plugins: [
    // ...existing plugins
    resolve()
  ]
};`
            });
        }
        // Check for commonjs plugin
        if (!plugins.includes('commonjs') && !content.includes('commonjs')) {
            suggestions.push({
                title: 'Add CommonJS Plugin',
                description: 'Use @rollup/plugin-commonjs to convert CommonJS modules to ES modules',
                code: `
import commonjs from '@rollup/plugin-commonjs';

export default {
  // ...
  plugins: [
    // ...existing plugins
    commonjs()
  ]
};`
            });
        }
        // Check for treeshaking
        if (!content.includes('treeshake') || content.includes('treeshake: false')) {
            suggestions.push({
                title: 'Enable Tree Shaking',
                description: 'Ensure tree shaking is enabled to eliminate dead code',
                code: `
export default {
  // ...
  treeshake: {
    moduleSideEffects: false
  }
};`
            });
        }
        // Check for source maps
        if (!content.includes('sourcemap')) {
            suggestions.push({
                title: 'Add Source Maps for Development',
                description: 'Consider adding source maps for easier debugging in development',
                code: `
export default {
  // ...
  output: {
    // ...other output options
    sourcemap: process.env.NODE_ENV !== 'production'
  }
};`
            });
        }
        return suggestions;
    }
}
exports.RollupConfigManager = RollupConfigManager;
//# sourceMappingURL=rollupConfigManager.js.map