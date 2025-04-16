/**
 * Tests for the HardwareSpecs interface
 */
import { HardwareSpecs } from '../../../../src/llm/modelService';

describe('HardwareSpecs interface', () => {
  it('should create a valid basic hardware specs object', () => {
    const specs: HardwareSpecs = {
      gpu: {
        available: false
      },
      ram: {
        total: 8192, // 8GB
        free: 4096 // 4GB
      },
      cpu: {
        cores: 4
      }
    };

    expect(specs).toBeDefined();
    expect(specs.gpu.available).toBe(false);
    expect(specs.ram.total).toBe(8192);
    expect(specs.ram.free).toBe(4096);
    expect(specs.cpu.cores).toBe(4);
  });

  it('should create a valid hardware specs object with GPU', () => {
    const specs: HardwareSpecs = {
      gpu: {
        available: true,
        name: 'NVIDIA GeForce RTX 3080',
        vram: 10240, // 10GB
        cudaSupport: true
      },
      ram: {
        total: 32768, // 32GB
        free: 16384 // 16GB
      },
      cpu: {
        cores: 8,
        model: 'AMD Ryzen 7 5800X'
      }
    };

    expect(specs).toBeDefined();
    expect(specs.gpu.available).toBe(true);
    expect(specs.gpu.name).toBe('NVIDIA GeForce RTX 3080');
    expect(specs.gpu.vram).toBe(10240);
    expect(specs.gpu.cudaSupport).toBe(true);
    expect(specs.ram.total).toBe(32768);
    expect(specs.ram.free).toBe(16384);
    expect(specs.cpu.cores).toBe(8);
    expect(specs.cpu.model).toBe('AMD Ryzen 7 5800X');
  });

  it('should create a valid hardware specs object with limited RAM', () => {
    const specs: HardwareSpecs = {
      gpu: {
        available: false
      },
      ram: {
        total: 4096, // 4GB
        free: 1024 // 1GB
      },
      cpu: {
        cores: 2,
        model: 'Intel Core i3'
      }
    };

    expect(specs).toBeDefined();
    expect(specs.gpu.available).toBe(false);
    expect(specs.ram.total).toBe(4096);
    expect(specs.ram.free).toBe(1024);
    expect(specs.cpu.cores).toBe(2);
    expect(specs.cpu.model).toBe('Intel Core i3');
  });

  it('should create a valid hardware specs object with non-CUDA GPU', () => {
    const specs: HardwareSpecs = {
      gpu: {
        available: true,
        name: 'AMD Radeon RX 6700 XT',
        vram: 12288, // 12GB
        cudaSupport: false
      },
      ram: {
        total: 16384, // 16GB
        free: 8192 // 8GB
      },
      cpu: {
        cores: 6
      }
    };

    expect(specs).toBeDefined();
    expect(specs.gpu.available).toBe(true);
    expect(specs.gpu.name).toBe('AMD Radeon RX 6700 XT');
    expect(specs.gpu.vram).toBe(12288);
    expect(specs.gpu.cudaSupport).toBe(false);
    expect(specs.ram.total).toBe(16384);
    expect(specs.ram.free).toBe(8192);
  });
});

// Helper function to create hardware specs objects for testing
export function createTestHardwareSpecs(overrides?: Partial<HardwareSpecs>): HardwareSpecs {
  const defaultSpecs: HardwareSpecs = {
    gpu: {
      available: true,
      name: 'NVIDIA GeForce RTX 3070',
      vram: 8192, // 8GB
      cudaSupport: true
    },
    ram: {
      total: 16384, // 16GB
      free: 8192 // 8GB
    },
    cpu: {
      cores: 8,
      model: 'Intel Core i7-12700K'
    }
  };

  if (overrides?.gpu) {
    return {
      ...defaultSpecs,
      ...overrides,
      gpu: {
        ...defaultSpecs.gpu,
        ...overrides.gpu
      },
      ram: {
        ...defaultSpecs.ram,
        ...overrides?.ram
      },
      cpu: {
        ...defaultSpecs.cpu,
        ...overrides?.cpu
      }
    };
  }

  return { ...defaultSpecs, ...overrides };
}