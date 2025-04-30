import { BaseAgent } from '../baseAgent';
export declare class TypeScriptAgent extends BaseAgent {
    private config;
    reviewCode(code: string): Promise<string>;
    suggestRefactoring(code: string): Promise<string>;
    generateDocumentation(code: string): Promise<string>;
    private processWithTemplate;
}
