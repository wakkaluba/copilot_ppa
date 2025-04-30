import * as vscode from 'vscode';
import { SecurityRecommendation, RecommendationResult } from '../types';
import { ISecurityAnalysisService } from './SecurityAnalysisService';
import { IDependencyAnalysisService } from './DependencyAnalysisService';
export interface IRecommendationService extends vscode.Disposable {
    generate(): Promise<RecommendationResult>;
    getRecommendationById(id: string): Promise<SecurityRecommendation | undefined>;
    getRecommendationsByCategory(category: string): Promise<SecurityRecommendation[]>;
}
export declare class RecommendationService implements IRecommendationService {
    private readonly analysisSvc;
    private readonly dependencySvc;
    private readonly disposables;
    private recommendationCache;
    constructor(analysisSvc: ISecurityAnalysisService, dependencySvc: IDependencyAnalysisService);
    generate(): Promise<RecommendationResult>;
    getRecommendationById(id: string): Promise<SecurityRecommendation | undefined>;
    getRecommendationsByCategory(category: string): Promise<SecurityRecommendation[]>;
    private generateCodeRecommendations;
    private generateDependencyRecommendations;
    private generateFrameworkRecommendations;
    private generateBestPracticeRecommendations;
    private calculateSeverityCounts;
    private estimateEffort;
    private generateImplementationSteps;
    private generateCodeExample;
    private cacheRecommendations;
    dispose(): void;
}
