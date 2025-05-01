import { FilePreferences } from '../../../../src/services/conversation/FilePreferences';

describe('FilePreferences', () => {
    let preferences: FilePreferences;

    beforeEach(() => {
        preferences = new FilePreferences();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should track file extensions correctly', async () => {
        await preferences.trackFileExtension('.ts');
        const extensions = preferences.getRecentExtensions();

        expect(extensions).toHaveLength(1);
        expect(extensions[0]?.extension).toBe('.ts');
        expect(extensions[0]?.count).toBe(1);
    });

    test('should increment extension count on multiple tracking', async () => {
        await preferences.trackFileExtension('.ts');
        await preferences.trackFileExtension('.ts');
        const extensions = preferences.getRecentExtensions();

        expect(extensions).toHaveLength(1);
        expect(extensions[0]?.count).toBe(2);
    });

    test('should track multiple extensions', async () => {
        await preferences.trackFileExtension('.ts');
        await preferences.trackFileExtension('.js');
        const extensions = preferences.getRecentExtensions();

        expect(extensions).toHaveLength(2);
        expect(extensions.map(e => e.extension)).toContain('.ts');
        expect(extensions.map(e => e.extension)).toContain('.js');
    });

    test('should sort extensions by frequency', async () => {
        await preferences.trackFileExtension('.ts');
        await preferences.trackFileExtension('.ts');
        await preferences.trackFileExtension('.js');
        const extensions = preferences.getRecentExtensions();

        expect(extensions[0]?.extension).toBe('.ts');
        expect(extensions[0]?.count).toBe(2);
        expect(extensions[1]?.extension).toBe('.js');
        expect(extensions[1]?.count).toBe(1);
    });
});
