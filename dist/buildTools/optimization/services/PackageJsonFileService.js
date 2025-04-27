"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageJsonFileService = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class PackageJsonFileService {
    async findPackageJsonFiles() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return [];
        }
        const files = [];
        for (const folder of workspaceFolders) {
            const packageJsonPath = path.join(folder.uri.fsPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                files.push(packageJsonPath);
            }
        }
        return files;
    }
    async readPackageJson(filePath) {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            throw new Error(`Failed to read package.json: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async writePackageJson(filePath, packageJson) {
        try {
            await fs.promises.writeFile(filePath, JSON.stringify(packageJson, null, 2), 'utf-8');
        }
        catch (error) {
            throw new Error(`Failed to write package.json: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.PackageJsonFileService = PackageJsonFileService;
//# sourceMappingURL=PackageJsonFileService.js.map