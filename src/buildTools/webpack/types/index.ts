export interface WebpackConfigAnalysis {
    entryPoints: any[];
    output: any;
    loaders: any[];
    plugins: any[];
    optimizationSuggestions: any[];
}

export interface WebpackPlugin {
    name: string;
    description: string;
}

export interface WebpackConfigContent {
    content: string;
    entryPoints: any[];
    output: any;
    loaders: any[];
    plugins: any[];
}