import { IDependencyAnalysisService, DependencyScanResult } from '../types';
export declare class DependencyAnalysisService implements IDependencyAnalysisService {
    private readonly disposables;
    scanDependencies(): Promise<DependencyScanResult>;
    private scanNpmDependencies;
    private scanPythonDependencies;
    private scanJavaDependencies;
    private checkNpmVulnerabilities;
    private checkPythonVulnerabilities;
    private checkMavenVulnerabilities;
    private countTotalDependencies;
    dispose(): void;
}
