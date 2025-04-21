import { PackageJsonFileService } from './services/PackageJsonFileService';
import { BuildScriptAnalyzerService } from './services/BuildScriptAnalyzerService';
import { OptimizationGeneratorService } from './services/OptimizationGeneratorService';
import { UserInteractionService } from './services/UserInteractionService';
import { run_in_terminal } from '../utils/terminalUtils';

export class BuildScriptOptimizer {
    private readonly fileService: PackageJsonFileService;
    private readonly analyzerService: BuildScriptAnalyzerService;
    private readonly optimizationService: OptimizationGeneratorService;
    private readonly uiService: UserInteractionService;

    constructor() {
        this.fileService = new PackageJsonFileService();
        this.analyzerService = new BuildScriptAnalyzerService();
        this.optimizationService = new OptimizationGeneratorService();
        this.uiService = new UserInteractionService();
    }

    public async optimize(): Promise<void> {
        try {
            // Find package.json files
            const packageJsonFiles = await this.fileService.findPackageJsonFiles();
            if (packageJsonFiles.length === 0) {
                this.uiService.showInfo('No package.json files found in the workspace');
                return;
            }

            // Let user select package.json if multiple found
            const selectedFile = await this.uiService.selectPackageJson(packageJsonFiles);
            if (!selectedFile) {
                return;
            }

            // Read and parse package.json
            const packageJson = await this.fileService.readPackageJson(selectedFile);
            if (!packageJson.scripts) {
                this.uiService.showInfo('No scripts found in the selected package.json');
                return;
            }

            // Find build scripts
            const buildScripts = this.analyzerService.findBuildScripts(packageJson.scripts);
            if (buildScripts.length === 0) {
                this.uiService.showInfo('No build scripts found in the selected package.json');
                return;
            }

            // Generate optimizations
            const optimizations = await this.optimizationService.generateOptimizations(buildScripts, packageJson);
            if (optimizations.length === 0) {
                this.uiService.showInfo('No optimizations available for the build scripts');
                return;
            }

            // Let user select optimizations to apply
            const selectedOptimizations = await this.uiService.selectOptimizations(optimizations);
            if (!selectedOptimizations || selectedOptimizations.length === 0) {
                return;
            }

            // Check for required packages
            const requiredPackages = new Set<string>();
            for (const opt of selectedOptimizations) {
                if (opt.requiredPackages) {
                    opt.requiredPackages.forEach((pkg: string) => requiredPackages.add(pkg));
                }
            }

            // Confirm and install required packages if any
            if (requiredPackages.size > 0) {
                const shouldInstall = await this.uiService.confirmDependencyInstallation([...requiredPackages]);
                if (shouldInstall) {
                    await this.installDependencies(requiredPackages);
                }
            }

            // Apply selected optimizations
            const updatedPackageJson = await this.optimizationService.applyOptimizations(
                packageJson,
                selectedOptimizations
            );

            if (updatedPackageJson) {
                await this.fileService.writePackageJson(selectedFile, updatedPackageJson);
                this.uiService.showInfo('Build scripts optimized successfully');
            } else {
                this.uiService.showInfo('No changes were made to build scripts');
            }

        } catch (error) {
            this.uiService.showError(`Error optimizing build scripts: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async installDependencies(packages: Set<string>): Promise<void> {
        try {
            const packagesArray = [...packages];
            await run_in_terminal({
                command: `npm install -D ${packagesArray.join(' ')}`,
                explanation: `Installing required packages: ${packagesArray.join(', ')}`,
                isBackground: false
            });
            this.uiService.showInfo('Required packages installed successfully');
        } catch (error) {
            this.uiService.showError(`Error installing packages: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
}
