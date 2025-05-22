export interface IWebpackEntry {
  name: string;
  path: string;
}

export interface IWebpackOutput {
  path: string;
  filename: string;
  publicPath?: string | undefined;
}

export interface IIWebpackLoader {
  name: string;
  test: string;
  options: Record<string, unknown>;
}

export interface IWebpackPlugin {
  name: string;
  description: string;
}

export interface IIWebpackOptimization {
  title: string;
  description: string;
  code: string;
}

export interface IIWebpackConfigAnalysis {
  entryPoints: IWebpackEntry[];
  output: IWebpackOutput;
  loaders: IIWebpackLoader[];
  plugins: IWebpackPlugin[];
  content: string;
  optimizationSuggestions: IIWebpackOptimization[];
}
