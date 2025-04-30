import { VulnerabilityService } from './VulnerabilityService';
import { DependencyScanResult } from '../types';
export declare class DependencyScanService {
    private readonly vulnerabilityService;
    private readonly logger;
    constructor(vulnerabilityService: VulnerabilityService);
    scanWorkspace(): Promise<DependencyScanResult>;
    private scanNpmDependencies;
    private scanPythonDependencies;
}
