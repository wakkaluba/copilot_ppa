/**
 * Tests for hardware specification interface
 */
import { HardwareSpecs } from '../../../../src/llm/types';

describe('HardwareSpecs interface', () => {
  it('should handle minimal hardware specs', () => {
    const specs: HardwareSpecs = {
      cpu: {
        cores: 4,
        model: 'Intel Core i5',
        speed: 3.2
      },
      ram: {
        total: 8192,
        free: 4096
      },
      gpu: {
        name: 'Integrated Graphics',
        memory: 2048,
        available: false
      }
    };
    
    expect(specs.cpu.cores).toBe(4);
    expect(specs.ram.total).toBe(8192);
    expect(specs.gpu!.available).toBe(false);
  });
  
  it('should handle high-end hardware specs', () => {
    const specs: HardwareSpecs = {
      cpu: {
        cores: 12,
        model: 'Intel Core i9',
        speed: 4.5
      },
      ram: {
        total: 32768,
        free: 16384
      },
      gpu: {
        name: 'NVIDIA GeForce RTX 3080',
        memory: 10240,
        available: true,
        vram: 10240,
        cudaSupport: true
      }
    };
    
    expect(specs.cpu.cores).toBe(12);
    expect(specs.ram.total).toBe(32768);
    expect(specs.gpu!.available).toBe(true);
    expect(specs.gpu!.name).toBe('NVIDIA GeForce RTX 3080');
    expect(specs.gpu!.vram).toBe(10240);
    expect(specs.gpu!.cudaSupport).toBe(true);
  });
  
  it('should handle specs with unavailable GPU', () => {
    const specs: HardwareSpecs = {
      cpu: {
        cores: 8,
        model: 'Intel Core i7',
        speed: 3.8
      },
      ram: {
        total: 16384,
        free: 8192
      },
      gpu: {
        name: 'Unknown GPU',
        memory: 0,
        available: false
      }
    };
    
    expect(specs.cpu.cores).toBe(8);
    expect(specs.ram.total).toBe(16384);
    expect(specs.gpu!.available).toBe(false);
  });
  
  it('should handle AMD GPU specs', () => {
    const specs: HardwareSpecs = {
      cpu: {
        cores: 6,
        model: 'AMD Ryzen 5',
        speed: 3.6
      },
      ram: {
        total: 16384,
        free: 8192
      },
      gpu: {
        name: 'AMD Radeon RX 6700 XT',
        memory: 12288,
        available: true,
        vram: 12288,
        cudaSupport: false
      }
    };
    
    expect(specs.cpu.cores).toBe(6);
    expect(specs.ram.total).toBe(16384);
    expect(specs.gpu!.available).toBe(true);
    expect(specs.gpu!.name).toBe('AMD Radeon RX 6700 XT');
    expect(specs.gpu!.vram).toBe(12288);
    expect(specs.gpu!.cudaSupport).toBe(false);
  });
  
  it('should handle complete hardware specs', () => {
    const specs: HardwareSpecs = {
    gpu: {
      name: 'NVIDIA GeForce RTX 4090',
      memory: 24576,
      available: true,
      vram: 24576,
      cudaSupport: true
    },
    ram: {
      total: 65536,
      free: 32768
    },
    cpu: {
      cores: 16,
      model: 'AMD Ryzen 9',
      speed: 5.0
    }
  };
  
    expect(specs.cpu.cores).toBe(16);
    expect(specs.ram.total).toBe(65536);
    expect(specs.gpu!.memory).toBe(24576);
  });
});