import { ModelService } from '../../llm/modelService';
import { ConfigManager } from '../../config';
import { ErrorHandler } from '../error/ErrorHandler';
export declare class ConfigurationCommandService {
    private readonly modelService;
    private readonly configManager;
    private readonly errorHandler;
    constructor(modelService: ModelService, configManager: ConfigManager, errorHandler: ErrorHandler);
    configureModel(): Promise<void>;
    clearConversation(): Promise<void>;
    private validateEndpointUrl;
}
