import { AgentCommandService } from './AgentCommandService';
import { ConfigurationCommandService } from './ConfigurationCommandService';
import { VisualizationCommandService } from './VisualizationCommandService';
import { ErrorHandler } from '../error/ErrorHandler';
export declare class MenuCommandService {
    private readonly agentService;
    private readonly configService;
    private readonly visualizationService;
    private readonly errorHandler;
    constructor(agentService: AgentCommandService, configService: ConfigurationCommandService, visualizationService: VisualizationCommandService, errorHandler: ErrorHandler);
    openMenu(): Promise<void>;
}
