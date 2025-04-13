import { BaseAgent } from './baseAgent';
import { ModelManager } from '../models/modelManager';

export interface LanguageAgentConfig {
    language: string;
    fileExtensions: string[];
    promptTemplates: Record<string, string>;
}

export class LanguageAgentFactory {
    private static agents: Map<string, typeof BaseAgent> = new Map();

    static registerAgent(language: string, agentClass: typeof BaseAgent) {
        this.agents.set(language.toLowerCase(), agentClass);
    }

    static createAgent(language: string, modelManager: ModelManager): BaseAgent {
        const agentClass = this.agents.get(language.toLowerCase());
        if (!agentClass) {
            throw new Error(`No agent available for language: ${language}`);
        }
        return new agentClass(modelManager);
    }
}
