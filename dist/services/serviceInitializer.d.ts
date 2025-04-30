import { IService } from './interfaces';
export interface ServiceInitializationResult {
    success: boolean;
    error?: Error;
    serviceId: string;
}
export declare class ServiceInitializer {
    static initializeService(service: IService, serviceId: string, dependencies?: {
        [key: string]: any;
    }): Promise<ServiceInitializationResult>;
    static initializeServices(services: Array<{
        service: IService;
        id: string;
        dependencies?: {
            [key: string]: any;
        };
    }>): Promise<ServiceInitializationResult[]>;
}
