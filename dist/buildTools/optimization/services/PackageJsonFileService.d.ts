export declare class PackageJsonFileService {
    findPackageJsonFiles(): Promise<string[]>;
    readPackageJson(filePath: string): Promise<any>;
    writePackageJson(filePath: string, packageJson: any): Promise<void>;
}
