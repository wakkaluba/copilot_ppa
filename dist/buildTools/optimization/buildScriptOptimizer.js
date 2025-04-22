"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildScriptOptimizer = void 0;
const PackageJsonFileService_1 = require("./services/PackageJsonFileService");
const BuildScriptAnalyzerService_1 = require("./services/BuildScriptAnalyzerService");
const OptimizationGeneratorService_1 = require("./services/OptimizationGeneratorService");
const UserInteractionService_1 = require("./services/UserInteractionService");
const terminalUtils_1 = require("../utils/terminalUtils");
class BuildScriptOptimizer {
    fileService;
    analyzerService;
    optimizationService;
    uiService;
    constructor() {
        this.fileService = new PackageJsonFileService_1.PackageJsonFileService();
        this.analyzerService = new BuildScriptAnalyzerService_1.BuildScriptAnalyzerService();
        this.optimizationService = new OptimizationGeneratorService_1.OptimizationGeneratorService();
        this.uiService = new UserInteractionService_1.UserInteractionService();
    }
    async optimize() {
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
            const requiredPackages = new Set();
            for (const opt of selectedOptimizations) {
                if (opt.requiredPackages) {
                    opt.requiredPackages.forEach((pkg) => requiredPackages.add(pkg));
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
            const updatedPackageJson = await this.optimizationService.applyOptimizations(packageJson, selectedOptimizations);
            if (updatedPackageJson) {
                await this.fileService.writePackageJson(selectedFile, updatedPackageJson);
                this.uiService.showInfo('Build scripts optimized successfully');
            }
            else {
                this.uiService.showInfo('No changes were made to build scripts');
            }
        }
        catch (error) {
            this.uiService.showError(`Error optimizing build scripts: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async installDependencies(packages) {
        try {
            const packagesArray = [...packages];
            await (0, terminalUtils_1.run_in_terminal)({
                command: `npm install -D ${packagesArray.join(' ')}`,
                explanation: `Installing required packages: ${packagesArray.join(', ')}`,
                isBackground: false
            });
            this.uiService.showInfo('Required packages installed successfully');
        }
        catch (error) {
            this.uiService.showError(`Error installing packages: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
}
exports.BuildScriptOptimizer = BuildScriptOptimizer;
//# sourceMappingURL=buildScriptOptimizer.js.map