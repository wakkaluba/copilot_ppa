export interface HardwareSpecs {
    gpu: {
        available: boolean;
        name: string;
        vram: number;
        cudaSupport: boolean;
    };
    ram: {
        total: number;
        free: number;
    };
    cpu: {
        cores: number;
        model: string;
    };
}
