import { BaseAgent } from './baseAgent';
import { ModelManager } from '../models/modelManager';
export interface LanguageAgentConfig {
    language: string;
    fileExtensions: string[];
    promptTemplates: Record<string, string>;
}
export declare class LanguageAgentFactory {
    private static agents;
    static registerAgent(language: string, agentClass: typeof BaseAgent): void;
    static createAgent(language: string, modelManager: ModelManager): BaseAgent;
}
