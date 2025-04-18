import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LocalizationManager } from '../../src/i18n/localizationManager';
import { LanguageService } from '../../src/services/languageService';
import { LocaleLoader } from '../../src/i18n/localeLoader';

describe('Internationalization Support', () => {
    let localizationManager: LocalizationManager;
    let languageService: LanguageService;
    let localeLoader: LocaleLoader;
    let testLocalesDir: string;

    beforeEach(async () => {
        // Create test locales directory
        testLocalesDir = path.join(__dirname, '.test-locales');
        if (!fs.existsSync(testLocalesDir)) {
            fs.mkdirSync(testLocalesDir, { recursive: true });
        }

        // Create mock extension context
        const context = {
            subscriptions: [],
            workspaceState: new MockMemento(),
            globalState: new MockMemento(),
            extensionPath: testLocalesDir,
            storagePath: path.join(testLocalesDir, 'storage')
        } as any as vscode.ExtensionContext;

        // Set up test locale files
        await setupTestLocales();

        localizationManager = new LocalizationManager(context);
        languageService = new LanguageService();
        localeLoader = new LocaleLoader(context);
    });

    afterEach(() => {
        if (fs.existsSync(testLocalesDir)) {
            fs.rmSync(testLocalesDir, { recursive: true, force: true });
        }
    });

    async function setupTestLocales() {
        const locales = {
            'en.json': {
                "welcome": "Welcome",
                "error.notFound": "Not found",
                "dialog.confirm": "Are you sure?",
                "complex.path.nested.key": "Nested English value",
                "interpolation": "Hello, {name}!",
                "plural": {
                    "one": "{count} item",
                    "other": "{count} items"
                }
            },
            'ja.json': {
                "welcome": "ようこそ",
                "error.notFound": "見つかりません",
                "dialog.confirm": "よろしいですか？",
                "complex.path.nested.key": "ネストされた日本語の値",
                "interpolation": "こんにちは、{name}さん！",
                "plural": {
                    "other": "{count}個のアイテム"
                }
            },
            'ar.json': {
                "welcome": "مرحباً",
                "error.notFound": "غير موجود",
                "dialog.confirm": "هل أنت متأكد؟",
                "complex.path.nested.key": "قيمة متداخلة باللغة العربية",
                "interpolation": "مرحباً، {name}!",
                "plural": {
                    "zero": "لا يوجد عناصر",
                    "one": "عنصر واحد",
                    "two": "عنصران",
                    "few": "{count} عناصر",
                    "many": "{count} عنصراً",
                    "other": "{count} عنصر"
                }
            },
            'zh.json': {
                "welcome": "欢迎",
                "error.notFound": "未找到",
                "dialog.confirm": "确定吗？",
                "complex.path.nested.key": "嵌套的中文值",
                "interpolation": "你好，{name}！",
                "plural": {
                    "other": "{count}个项目"
                }
            }
        };

        // Write locale files
        for (const [locale, content] of Object.entries(locales)) {
            fs.writeFileSync(
                path.join(testLocalesDir, locale),
                JSON.stringify(content, null, 2),
                'utf8'
            );
        }
    }

    test('handles complex character sets correctly', async () => {
        await localizationManager.initialize();
        
        const testCases = [
            { locale: 'ja', key: 'welcome', expected: 'ようこそ' },
            { locale: 'ar', key: 'welcome', expected: 'مرحباً' },
            { locale: 'zh', key: 'welcome', expected: '欢迎' }
        ];

        for (const { locale, key, expected } of testCases) {
            await localizationManager.setLocale(locale);
            const result = localizationManager.translate(key);
            assert.strictEqual(result, expected);
        }
    });

    test('supports nested translation keys', async () => {
        await localizationManager.initialize();
        await localizationManager.setLocale('en');

        const result = localizationManager.translate('complex.path.nested.key');
        assert.strictEqual(result, 'Nested English value');

        // Test fallback behavior
        await localizationManager.setLocale('fr'); // Non-existent locale
        const fallback = localizationManager.translate('complex.path.nested.key');
        assert.strictEqual(fallback, 'Nested English value'); // Should fall back to English
    });

    test('handles interpolation with different writing systems', async () => {
        await localizationManager.initialize();
        
        const testCases = [
            { 
                locale: 'en',
                key: 'interpolation',
                vars: { name: 'John' },
                expected: 'Hello, John!'
            },
            { 
                locale: 'ja',
                key: 'interpolation',
                vars: { name: '田中' },
                expected: 'こんにちは、田中さん！'
            },
            { 
                locale: 'ar',
                key: 'interpolation',
                vars: { name: 'أحمد' },
                expected: 'مرحباً، أحمد!'
            }
        ];

        for (const { locale, key, vars, expected } of testCases) {
            await localizationManager.setLocale(locale);
            const result = localizationManager.translate(key, vars);
            assert.strictEqual(result, expected);
        }
    });

    test('supports complex plural rules', async () => {
        await localizationManager.initialize();
        
        const testCases = [
            // English
            { locale: 'en', count: 1, expected: '1 item' },
            { locale: 'en', count: 2, expected: '2 items' },
            
            // Arabic (complex plural rules)
            { locale: 'ar', count: 0, expected: 'لا يوجد عناصر' },
            { locale: 'ar', count: 1, expected: 'عنصر واحد' },
            { locale: 'ar', count: 2, expected: 'عنصران' },
            { locale: 'ar', count: 3, expected: '3 عناصر' },
            { locale: 'ar', count: 11, expected: '11 عنصراً' },
            
            // Japanese (no plural forms)
            { locale: 'ja', count: 1, expected: '1個のアイテム' },
            { locale: 'ja', count: 2, expected: '2個のアイテム' }
        ];

        for (const { locale, count, expected } of testCases) {
            await localizationManager.setLocale(locale);
            const result = localizationManager.translate('plural', { count });
            assert.strictEqual(result, expected);
        }
    });

    test('handles concurrent locale switches', async () => {
        await localizationManager.initialize();
        
        const operations = 50;
        const locales = ['en', 'ja', 'ar', 'zh'];
        const results = new Map<string, string>();

        // Perform rapid locale switches
        const switches = Array(operations).fill(null).map(async (_, i) => {
            const locale = locales[i % locales.length];
            await localizationManager.setLocale(locale);
            const result = localizationManager.translate('welcome');
            results.set(locale, result);
        });

        await Promise.all(switches);

        // Verify results for each locale
        assert.strictEqual(results.get('en'), 'Welcome');
        assert.strictEqual(results.get('ja'), 'ようこそ');
        assert.strictEqual(results.get('ar'), 'مرحباً');
        assert.strictEqual(results.get('zh'), '欢迎');
    });

    test('maintains locale-specific number formatting', async () => {
        await localizationManager.initialize();
        
        const number = 1234567.89;
        const testCases = [
            { locale: 'en', expected: '1,234,567.89' },
            { locale: 'de', expected: '1.234.567,89' },
            { locale: 'ar', expected: '١٬٢٣٤٬٥٦٧٫٨٩' }
        ];

        for (const { locale, expected } of testCases) {
            await localizationManager.setLocale(locale);
            const formatted = languageService.formatNumber(number);
            assert.strictEqual(formatted, expected);
        }
    });
});

// Mock implementation of vscode.Memento for testing
class MockMemento implements vscode.Memento {
    private storage = new Map<string, any>();

    get<T>(key: string): T | undefined;
    get<T>(key: string, defaultValue: T): T;
    get(key: string, defaultValue?: any) {
        return this.storage.has(key) ? this.storage.get(key) : defaultValue;
    }

    update(key: string, value: any): Thenable<void> {
        this.storage.set(key, value);
        return Promise.resolve();
    }
}