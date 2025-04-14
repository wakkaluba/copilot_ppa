import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

export interface RollupConfigAnalysis {
    inputFiles: string[];
    outputFormats: string[];
    plugins: string[];
    externals: string[];
    optimizationSuggestions: any[];
}

export class RollupConfigManager {
    /**
     * Detects Rollup configuration files in the given directory
     */
    public async detectConfigs(workspacePath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const patterns = [
                'rollup.config.js',
                'rollup.config.mjs',
                'rollup.*.js',
                'rollup.*.mjs',
                'rollup.config.ts',
                'rollup.*.ts'
            ];
            
            const configs: string[] = [];
            
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
    public async analyzeConfig(configPath: string): Promise<RollupConfigAnalysis> {
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
            const optimizationSuggestions = this.generateOptimizationSuggestions(
                content, inputFiles, outputFormats, plugins, externals
            );
            
            return {
                inputFiles,
                outputFormats,
                plugins,
                externals,
                optimizationSuggestions
            };
        } catch (error) {
            console.error('Error analyzing Rollup config:', error);
            throw error;
        }
    }
    
    /**
     * Generates optimization suggestions for a Rollup configuration
     */
    public async generateOptimizations(configPath: string): Promise<any[]> {
        const analysis = await this.analyzeConfig(configPath);
        return analysis.optimizationSuggestions;
    }
    
    private extractInputFiles(inputStr: string): string[] {
        const inputFiles: string[] = [];
        
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
    
    private extractOutputFormats(outputStr: string): string[] {
        const formats: string[] = [];
        
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
    
    private extractPlugins(pluginMatches: RegExpMatchArray[]): string[] {
        const plugins: string[] = [];
        
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
    
    private extractExternals(externalMatches: RegExpMatchArray[]): string[] {
        const externals: string[] = [];
        
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
    
    private generateOptimizationSuggestions(
        content: string,
        inputFiles: string[],
        outputFormats: string[],
        plugins: string[],
        externals: string[]
    ): any[] {
        const suggestions: any[] = [];
        
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
