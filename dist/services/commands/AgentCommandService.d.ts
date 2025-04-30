import { ModelService } from '../../llm/modelService';
import { ErrorHandler } from '../error/ErrorHandler';
export declare class AgentCommandService {
    private readonly modelService;
    private readonly errorHandler;
    constructor(modelService: ModelService, errorHandler: ErrorHandler);
    startAgent(): Promise<void>;
    stopAgent(): Promise<void>;
    restartAgent(): Promise<void>;
}
