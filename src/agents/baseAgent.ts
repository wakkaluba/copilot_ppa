import { ModelManager } from '../models/modelManager';

export abstract class BaseAgent {
    protected modelManager: ModelManager;

    constructor(modelManager: ModelManager) {
        this.modelManager = modelManager;
    }

    abstract processRequest(input: string): Promise<string>;
}
