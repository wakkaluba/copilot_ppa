import { StructureReorganizer } from '../../../src/services/refactoring/structureReorganizer';

describe('StructureReorganizer', () => {
  let reorganizer: StructureReorganizer;

  beforeEach(() => {
    reorganizer = new StructureReorganizer();
  });

  it('should instantiate without errors', () => {
    expect(reorganizer).toBeInstanceOf(StructureReorganizer);
  });

  it('should have an analyzeFileStructure method', () => {
    expect(typeof reorganizer.analyzeFileStructure).toBe('function');
  });

  it('should have a proposeReorganization method', () => {
    expect(typeof reorganizer.proposeReorganization).toBe('function');
  });
});
