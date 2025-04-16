/**
 * @jest-environment jsdom
 */
import * as vscode from 'vscode';
import { CodeExampleProvider } from '../../src/providers/codeExampleProvider';
import { CodeExample } from '../../src/models/codeExample';

describe('Code Examples', () => {
  let provider: CodeExampleProvider;
  let mockEventEmitter: vscode.EventEmitter<CodeExample[]>;
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    // Set up DOM elements needed for tests
    document.body.innerHTML = `
      <div id="code-examples">
        <div class="example-list"></div>
        <div class="example-detail"></div>
      </div>
    `;

    // Create mock VS Code context
    mockContext = {
      subscriptions: [],
      extensionPath: '/test/path',
      extensionUri: vscode.Uri.file('/test/path'),
      storageUri: vscode.Uri.file('/test/storage'),
      globalStorageUri: vscode.Uri.file('/test/globalStorage'),
      logUri: vscode.Uri.file('/test/log'),
      asAbsolutePath: jest.fn(p => `/test/path/${p}`),
      storagePath: '/test/storage',
      globalStoragePath: '/test/globalStorage',
      logPath: '/test/log',
      extensionMode: vscode.ExtensionMode.Development,
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
        setKeysForSync: jest.fn()
      },
      workspaceState: {
        get: jest.fn(),
        update: jest.fn()
      },
      secrets: {
        get: jest.fn(),
        store: jest.fn(),
        delete: jest.fn()
      },
      environmentVariableCollection: {
        persistent: true,
        replace: jest.fn(),
        append: jest.fn(),
        prepend: jest.fn(),
        get: jest.fn(),
        forEach: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn()
      }
    };

    // Create event emitter for example updates
    mockEventEmitter = new vscode.EventEmitter<CodeExample[]>();

    provider = new CodeExampleProvider(mockContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('Example Management', () => {
    test('adds new code example', async () => {
      const example: CodeExample = {
        id: '1',
        title: 'Test Example',
        description: 'A test example',
        code: 'console.log("test");',
        language: 'typescript',
        tags: ['test']
      };

      await provider.addExample(example);
      const examples = await provider.getExamples();
      
      expect(examples).toContainEqual(example);
    });

    test('updates existing example', async () => {
      const example: CodeExample = {
        id: '1',
        title: 'Original Title',
        description: 'Original description',
        code: 'console.log("original");',
        language: 'typescript',
        tags: ['original']
      };

      await provider.addExample(example);

      const updated: CodeExample = {
        ...example,
        title: 'Updated Title',
        code: 'console.log("updated");'
      };

      await provider.updateExample(updated);
      const examples = await provider.getExamples();
      
      expect(examples).toContainEqual(updated);
      expect(examples).not.toContainEqual(example);
    });

    test('deletes example', async () => {
      const example: CodeExample = {
        id: '1',
        title: 'Test Example',
        description: 'A test example',
        code: 'console.log("test");',
        language: 'typescript',
        tags: ['test']
      };

      await provider.addExample(example);
      await provider.deleteExample(example.id);
      const examples = await provider.getExamples();
      
      expect(examples).not.toContainEqual(example);
    });
  });

  describe('Search and Filter', () => {
    test('searches examples by text', async () => {
      const examples: CodeExample[] = [
        {
          id: '1',
          title: 'Array Map Example',
          description: 'Shows how to use array.map()',
          code: '[1,2,3].map(x => x * 2)',
          language: 'typescript',
          tags: ['array', 'map']
        },
        {
          id: '2',
          title: 'Array Filter Example',
          description: 'Shows how to use array.filter()',
          code: '[1,2,3].filter(x => x > 1)',
          language: 'typescript',
          tags: ['array', 'filter']
        }
      ];

      await Promise.all(examples.map(e => provider.addExample(e)));
      
      const results = await provider.searchExamples('map');
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('Map');
    });

    test('filters examples by tag', async () => {
      const examples: CodeExample[] = [
        {
          id: '1',
          title: 'React Component',
          description: 'A React component example',
          code: 'function App() { return <div>Hello</div>; }',
          language: 'typescript',
          tags: ['react', 'component']
        },
        {
          id: '2',
          title: 'Vue Component',
          description: 'A Vue component example',
          code: 'export default { name: "App" }',
          language: 'typescript',
          tags: ['vue', 'component']
        }
      ];

      await Promise.all(examples.map(e => provider.addExample(e)));
      
      const results = await provider.filterByTags(['react']);
      expect(results).toHaveLength(1);
      expect(results[0].tags).toContain('react');
    });
  });

  describe('Event Handling', () => {
    test('emits event on example added', async () => {
      const handler = jest.fn();
      provider.onDidChangeExamples(handler);

      const example: CodeExample = {
        id: '1',
        title: 'Test Example',
        description: 'A test example',
        code: 'console.log("test");',
        language: 'typescript',
        tags: ['test']
      };

      await provider.addExample(example);
      
      expect(handler).toHaveBeenCalled();
      const examples = handler.mock.calls[0][0];
      expect(examples).toContainEqual(example);
    });

    test('handles example selection', async () => {
      const example: CodeExample = {
        id: '1',
        title: 'Test Example',
        description: 'A test example',
        code: 'console.log("test");',
        language: 'typescript',
        tags: ['test']
      };

      const selectionHandler = jest.fn();
      provider.onDidSelectExample(selectionHandler);

      await provider.addExample(example);
      await provider.selectExample(example.id);
      
      expect(selectionHandler).toHaveBeenCalledWith(example);
    });
  });

  describe('UI Integration', () => {
    test('renders example list', async () => {
      const examples: CodeExample[] = [
        {
          id: '1',
          title: 'Example 1',
          description: 'First example',
          code: 'console.log("first");',
          language: 'typescript',
          tags: ['test']
        },
        {
          id: '2',
          title: 'Example 2',
          description: 'Second example',
          code: 'console.log("second");',
          language: 'typescript',
          tags: ['test']
        }
      ];

      await Promise.all(examples.map(e => provider.addExample(e)));
      await provider.renderExampleList();
      
      const listElement = document.querySelector('.example-list');
      expect(listElement?.children.length).toBe(2);
    });

    test('renders example detail view', async () => {
      const example: CodeExample = {
        id: '1',
        title: 'Test Example',
        description: 'A test example',
        code: 'console.log("test");',
        language: 'typescript',
        tags: ['test']
      };

      await provider.addExample(example);
      await provider.selectExample(example.id);
      
      const detailElement = document.querySelector('.example-detail');
      expect(detailElement?.textContent).toContain('Test Example');
      expect(detailElement?.textContent).toContain('A test example');
    });
  });
});