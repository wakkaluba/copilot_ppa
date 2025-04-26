import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ContextManager } from '../../src/services/ContextManager';
import { ConversationManager } from '../../src/services/conversationManager';
import { WorkspaceManager } from '../../src/services/WorkspaceManager';
import { FileSystemService } from '../../src/services/FileSystemService';

describe('Cross-Platform Filesystem Interactions', () => {
    let contextManager: ContextManager;
    let conversationManager: ConversationManager;
    let workspaceManager: WorkspaceManager;
    let fileSystemService: FileSystemService;
    let testWorkspace: string;

    beforeEach(async () => {
        // Create test workspace directory with mixed path separators
        testWorkspace = path.join(__dirname, '.test-workspace');
        if (!fs.existsSync(testWorkspace)) {
            fs.mkdirSync(testWorkspace, { recursive: true });
        }

        // Create mock extension context
        const context = {
            subscriptions: [],
            workspaceState: new MockMemento(),
            globalState: new MockMemento(),
            extensionPath: testWorkspace,
            storagePath: path.join(testWorkspace, 'storage')
        } as any as vscode.ExtensionContext;

        // Initialize components
        workspaceManager = WorkspaceManager.getInstance();
        fileSystemService = new FileSystemService(workspaceManager);
        contextManager = ContextManager.getInstance();
        conversationManager = ConversationManager.getInstance();

        // Set up test workspace structure
        await setupTestWorkspace();
    });

    afterEach(() => {
        if (fs.existsSync(testWorkspace)) {
            fs.rmSync(testWorkspace, { recursive: true, force: true });
        }
    });

    async function setupTestWorkspace() {
        // Create directories with mixed separators
        const dirs = [
            'src/components',
            'src\\utils',
            'test/unit',
            'test\\integration'
        ];

        for (const dir of dirs) {
            const fullPath = path.join(testWorkspace, dir.replace(/[\\/]/g, path.sep));
            fs.mkdirSync(fullPath, { recursive: true });
        }

        // Create test files with different line endings
        const files = {
            'src/components/test.tsx': 'export const Test = () => {\n  return <div>Test</div>;\n}',
            'src\\utils\\helper.ts': 'export function helper() {\r\n  return true;\r\n}',
            'test/unit/test.spec.ts': 'describe("test", () => {\n  it("works", () => {});\n});',
            'test\\integration\\test.spec.ts': 'test("integration", async () => {\r\n});'
        };

        for (const [filePath, content] of Object.entries(files)) {
            const fullPath = path.join(testWorkspace, filePath.replace(/[\\/]/g, path.sep));
            fs.writeFileSync(fullPath, content);
        }
    }

    test('handles mixed path separators correctly', async () => {
        const paths = [
            'src/components/test.tsx',
            'src\\utils\\helper.ts',
            path.join('src', 'components', 'test.tsx'),
            path.join('src', 'utils', 'helper.ts')
        ];

        for (const testPath of paths) {
            const normalizedPath = path.join(testWorkspace, testPath.replace(/[\\/]/g, path.sep));
            const exists = await fileSystemService.fileExists(normalizedPath);
            assert.ok(exists, `File ${testPath} should exist`);

            const content = await fileSystemService.readFile(normalizedPath);
            assert.ok(content.length > 0, `File ${testPath} should have content`);
        }
    });

    test('preserves line endings when reading and writing files', async () => {
        const files = {
            lf: path.join(testWorkspace, 'src', 'components', 'test.tsx'),
            crlf: path.join(testWorkspace, 'src', 'utils', 'helper.ts')
        };

        // Read original content and line endings
        const originals = {
            lf: await fileSystemService.readFile(files.lf),
            crlf: await fileSystemService.readFile(files.crlf)
        };

        // Write content back
        await fileSystemService.writeFile(files.lf, originals.lf);
        await fileSystemService.writeFile(files.crlf, originals.crlf);

        // Read again and verify line endings are preserved
        const lfContent = await fileSystemService.readFile(files.lf);
        const crlfContent = await fileSystemService.readFile(files.crlf);

        assert.strictEqual(lfContent.match(/\n/g)?.length, originals.lf.match(/\n/g)?.length);
        assert.strictEqual(crlfContent.match(/\r\n/g)?.length, originals.crlf.match(/\r\n/g)?.length);
    });

    test('handles concurrent file operations safely', async () => {
        const testFile = path.join(testWorkspace, 'concurrent-test.txt');
        const operations = 50;
        const concurrentWrites = Array(operations).fill(null).map(async (_, i) => {
            await fileSystemService.writeFile(testFile, `Line ${i}\n`, { flag: 'a' });
        });

        // Perform concurrent writes
        await Promise.all(concurrentWrites);

        // Verify file integrity
        const content = await fileSystemService.readFile(testFile);
        const lines = content.split('\n').filter(line => line.trim());
        assert.strictEqual(lines.length, operations);

        // Check all lines are present
        const numbers = new Set(lines.map(line => parseInt(line.split(' ')[1])));
        assert.strictEqual(numbers.size, operations);
    });

    test('handles special characters in paths and filenames', async () => {
        const specialPaths = [
            path.join(testWorkspace, 'test with spaces.ts'),
            path.join(testWorkspace, 'test-with-дashes.ts'),
            path.join(testWorkspace, '테스트.ts'),
            path.join(testWorkspace, 'test_with_∆_symbols.ts')
        ];

        // Create files with special characters
        for (const filePath of specialPaths) {
            await fileSystemService.writeFile(filePath, 'test content');
            const exists = await fileSystemService.fileExists(filePath);
            assert.ok(exists, `File ${filePath} should exist`);
        }

        // Try to read files
        for (const filePath of specialPaths) {
            const content = await fileSystemService.readFile(filePath);
            assert.strictEqual(content, 'test content');
        }
    });

    test('recovers from partial writes and locks', async () => {
        const testFile = path.join(testWorkspace, 'locked-file.txt');
        const content = 'Test content\n'.repeat(1000); // Create somewhat large content
        
        // Simulate file lock
        const tempHandle = await fs.promises.open(testFile, 'w');
        
        try {
            // Attempt to write while file is locked
            const writePromise = fileSystemService.writeFile(testFile, content);
            
            // Release lock after a delay
            setTimeout(async () => {
                await tempHandle.close();
            }, 100);

            // Wait for write to complete
            await writePromise;

            // Verify content was written correctly
            const writtenContent = await fileSystemService.readFile(testFile);
            assert.strictEqual(writtenContent, content);
        } finally {
            // Ensure handle is closed
            try {
                await tempHandle.close();
            } catch (e) {
                // Handle may already be closed
            }
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