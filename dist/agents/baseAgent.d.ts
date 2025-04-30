import { ModelManager } from '../models/modelManager';
export declare abstract class BaseAgent {
    protected modelManager: ModelManager;
    constructor(modelManager: ModelManager);
    abstract processRequest(input: string): Promise<string>;
}
