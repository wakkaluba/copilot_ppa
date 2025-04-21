export interface WebpackEntry {
    name: string;
    path: string;
}

export interface WebpackOutput {
    path: string;
    filename: string;
    publicPath?: string | undefined;
}

export interface WebpackLoader {
    name: string;
    test: string;
    options: Record<string, unknown>;
}

export interface WebpackPlugin {
    name: string;
    description: string;
}

export interface WebpackOptimization {
    title: string;
    description: string;
    code: string;
}

export interface WebpackConfigAnalysis {
    entryPoints: WebpackEntry[];
    output: WebpackOutput;
    loaders: WebpackLoader[];
    plugins: WebpackPlugin[];
    content: string;
    optimizationSuggestions: WebpackOptimization[];
}