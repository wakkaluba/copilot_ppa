export interface IWebpackEntry {
  name: string;
  path: string;
}

export interface IWebpackOutput {
  path: string;
  filename: string;
  publicPath?: string | undefined;
}

export interface IWebpackLoader {
  name: string;
  test: string;
  options: Record<string, unknown>;
}

export interface IWebpackPlugin {
  name: string;
  description: string;
}

export interface IWebpackOptimization {
  title: string;
  description: string;
  code: string;
}

export interface IWebpackConfigAnalysis {
  entryPoints: IWebpackEntry[];
  output: IWebpackOutput;
  loaders: IWebpackLoader[];
  plugins: IWebpackPlugin[];
  content: string;
  optimizationSuggestions: IWebpackOptimization[];
}
