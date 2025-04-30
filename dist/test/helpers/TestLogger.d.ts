export declare class TestLogger {
    errors: string[];
    warnings: string[];
    infos: string[];
    debugs: string[];
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    private format;
    reset(): void;
}
