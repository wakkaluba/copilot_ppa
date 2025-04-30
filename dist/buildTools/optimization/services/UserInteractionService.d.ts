import { BuildScriptOptimization } from '../types';
export declare class UserInteractionService {
    selectPackageJson(files: string[]): Promise<string | undefined>;
    selectOptimizations(optimizations: BuildScriptOptimization[]): Promise<BuildScriptOptimization[]>;
    showInfo(message: string): void;
    showError(message: string): void;
    confirmDependencyInstallation(packages: string[]): Promise<boolean>;
}
