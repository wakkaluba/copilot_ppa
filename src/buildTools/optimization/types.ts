export interface IBuildScriptInfo {
  name: string;
  command: string;
}

export interface IBuildScriptOptimization {
  title: string;
  description: string;
  benefit: string;
  before: string;
  after: string;
  complexity: 'low' | 'medium' | 'high';
  requiredPackages?: string[];
}

export interface IOptimizationContext {
  scriptInfo: IBuildScriptInfo;
  packageJson: any;
  analysis: {
    hasTypeScript: boolean;
    hasWebpack: boolean;
    hasRollup: boolean;
    hasVite: boolean;
    isParallel: boolean;
    hasEnvironmentVars: boolean;
    hasCleaning: boolean;
    hasCache: boolean;
  };
}
