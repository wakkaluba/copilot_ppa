import { expect } from 'chai';
import * as modelIndex from '../../src/models/index';

describe('Models index tests', () => {
    it('should export interfaces from various modules', () => {
        // The index module is just re-exporting from other locations
        // We can test that the exports exist and are of the right type

        // Check that the module exports something
        expect(modelIndex).to.be.an('object').that.is.not.empty;

        // We can check for specific interface types that should be re-exported
        // This is a structural test - we're checking that the shape of the
        // exports matches what we expect

        // Since interfaces don't exist at runtime, we can verify exports
        // exist by checking if their names are in the keys of the module
        const exportedNames = Object.keys(modelIndex);

        // Check for interfaces from './interfaces'
        expect(exportedNames).to.include.members([
            'IChatMessage',
            'IChatSession',
            'IChatErrorEvent',
            'IConnectionStatus'
        ]);

        // The module should also export interfaces from other locations
        // Let's check that the export structure works as expected
        expect(exportedNames.length).to.be.at.least(4,
            'Should export at least the interfaces from interfaces.ts');
    });
});
