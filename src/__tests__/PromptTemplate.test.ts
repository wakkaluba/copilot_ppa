import { PromptTemplate, NewPromptTemplate } from '../services/promptTemplates/model';

describe('PromptTemplate Interface', () => {
  // Test for required properties
  describe('Required Properties', () => {
    it('should create a valid prompt template with all required properties', () => {
      const now = Date.now();
      const template: PromptTemplate = {
        id: 'test-id-123',
        name: 'Test Template',
        content: 'This is a {{test}} template with {{variables}}',
        category: 'testing',
        tags: ['test', 'unit-test'],
        createdAt: now,
        modifiedAt: now
      };

      expect(template.id).toBe('test-id-123');
      expect(template.name).toBe('Test Template');
      expect(template.content).toBe('This is a {{test}} template with {{variables}}');
      expect(template.category).toBe('testing');
      expect(template.tags).toEqual(['test', 'unit-test']);
      expect(template.createdAt).toBe(now);
      expect(template.modifiedAt).toBe(now);
    });

    it('should error when missing required properties', () => {
      const now = Date.now();

      // @ts-expect-error - id is required
      const missingId: PromptTemplate = {
        name: 'Missing ID',
        content: 'Content here',
        category: 'testing',
        tags: ['test'],
        createdAt: now,
        modifiedAt: now
      };

      // @ts-expect-error - name is required
      const missingName: PromptTemplate = {
        id: 'missing-name',
        content: 'Content here',
        category: 'testing',
        tags: ['test'],
        createdAt: now,
        modifiedAt: now
      };

      // @ts-expect-error - content is required
      const missingContent: PromptTemplate = {
        id: 'missing-content',
        name: 'Missing Content',
        category: 'testing',
        tags: ['test'],
        createdAt: now,
        modifiedAt: now
      };

      // @ts-expect-error - category is required
      const missingCategory: PromptTemplate = {
        id: 'missing-category',
        name: 'Missing Category',
        content: 'Content here',
        tags: ['test'],
        createdAt: now,
        modifiedAt: now
      };

      // @ts-expect-error - tags is required
      const missingTags: PromptTemplate = {
        id: 'missing-tags',
        name: 'Missing Tags',
        content: 'Content here',
        category: 'testing',
        createdAt: now,
        modifiedAt: now
      };

      // @ts-expect-error - createdAt is required
      const missingCreatedAt: PromptTemplate = {
        id: 'missing-created-at',
        name: 'Missing Created At',
        content: 'Content here',
        category: 'testing',
        tags: ['test'],
        modifiedAt: now
      };

      // @ts-expect-error - modifiedAt is required
      const missingModifiedAt: PromptTemplate = {
        id: 'missing-modified-at',
        name: 'Missing Modified At',
        content: 'Content here',
        category: 'testing',
        tags: ['test'],
        createdAt: now
      };
    });
  });

  // Test for optional properties
  describe('Optional Properties', () => {
    it('should handle optional properties correctly', () => {
      const now = Date.now();
      const template: PromptTemplate = {
        id: 'test-id-123',
        name: 'Test Template',
        content: 'This is a {{test}} template with {{variables}}',
        description: 'This is a description of the template',
        category: 'testing',
        tags: ['test', 'unit-test'],
        createdAt: now,
        modifiedAt: now,
        isSystem: true
      };

      expect(template.description).toBe('This is a description of the template');
      expect(template.isSystem).toBe(true);
    });

    it('should allow optional properties to be undefined', () => {
      const now = Date.now();
      const template: PromptTemplate = {
        id: 'test-id-123',
        name: 'Test Template',
        content: 'This is a {{test}} template with {{variables}}',
        category: 'testing',
        tags: ['test', 'unit-test'],
        createdAt: now,
        modifiedAt: now
      };

      expect(template.description).toBeUndefined();
      expect(template.isSystem).toBeUndefined();
    });
  });

  // Test NewPromptTemplate type
  describe('NewPromptTemplate Type', () => {
    it('should create a valid NewPromptTemplate without id/timestamps', () => {
      const newTemplate: NewPromptTemplate = {
        name: 'New Template',
        content: 'This is a new {{test}} template',
        category: 'testing',
        tags: ['test', 'new']
      };

      expect(newTemplate.name).toBe('New Template');
      expect(newTemplate.content).toBe('This is a new {{test}} template');
      expect(newTemplate.category).toBe('testing');
      expect(newTemplate.tags).toEqual(['test', 'new']);

      // Optional properties
      newTemplate.description = 'A description';
      expect(newTemplate.description).toBe('A description');
    });

    it('should not allow id, createdAt or modifiedAt in NewPromptTemplate', () => {
      const validNewTemplate: NewPromptTemplate = {
        name: 'New Template',
        content: 'This is a new template',
        category: 'testing',
        tags: ['test']
      };

      // @ts-expect-error - id should not be in NewPromptTemplate
      validNewTemplate.id = 'some-id';

      // @ts-expect-error - createdAt should not be in NewPromptTemplate
      validNewTemplate.createdAt = Date.now();

      // @ts-expect-error - modifiedAt should not be in NewPromptTemplate
      validNewTemplate.modifiedAt = Date.now();
    });
  });

  // Test for special use cases
  describe('Special Use Cases', () => {
    it('should handle templates with variables in content', () => {
      const now = Date.now();
      const template: PromptTemplate = {
        id: 'code-explainer',
        name: 'Code Explainer',
        content: 'Please explain this code:\n\n```{{language}}\n{{selection}}\n```',
        description: 'Template for explaining code',
        category: 'code-analysis',
        tags: ['explanation', 'code'],
        createdAt: now,
        modifiedAt: now
      };

      expect(template.content).toContain('{{language}}');
      expect(template.content).toContain('{{selection}}');
    });

    it('should handle system template flag', () => {
      const now = Date.now();
      const systemTemplate: PromptTemplate = {
        id: 'system-template',
        name: 'System Template',
        content: 'System template content',
        category: 'system',
        tags: ['system'],
        createdAt: now,
        modifiedAt: now,
        isSystem: true
      };

      const userTemplate: PromptTemplate = {
        id: 'user-template',
        name: 'User Template',
        content: 'User template content',
        category: 'user',
        tags: ['user'],
        createdAt: now,
        modifiedAt: now,
        isSystem: false
      };

      expect(systemTemplate.isSystem).toBe(true);
      expect(userTemplate.isSystem).toBe(false);
    });
  });

  // Test for common template categories and tags
  describe('Common Template Categories and Tags', () => {
    it('should support various template categories', () => {
      const now = Date.now();
      
      const codeAnalysisTemplate: PromptTemplate = {
        id: 'code-analysis',
        name: 'Code Analysis',
        content: 'Analyze this code: {{code}}',
        category: 'code-analysis',
        tags: ['analysis'],
        createdAt: now,
        modifiedAt: now
      };
      
      const refactoringTemplate: PromptTemplate = {
        id: 'refactoring',
        name: 'Code Refactoring',
        content: 'Refactor this code: {{code}}',
        category: 'code-improvement',
        tags: ['refactoring'],
        createdAt: now,
        modifiedAt: now
      };
      
      const testingTemplate: PromptTemplate = {
        id: 'testing',
        name: 'Generate Tests',
        content: 'Generate tests for: {{code}}',
        category: 'testing',
        tags: ['unit-test'],
        createdAt: now,
        modifiedAt: now
      };

      expect(codeAnalysisTemplate.category).toBe('code-analysis');
      expect(refactoringTemplate.category).toBe('code-improvement');
      expect(testingTemplate.category).toBe('testing');
    });

    it('should allow multiple tags for filtering', () => {
      const now = Date.now();
      const template: PromptTemplate = {
        id: 'multi-tag',
        name: 'Multi-tag Template',
        content: 'Content with multiple tags',
        category: 'general',
        tags: ['javascript', 'react', 'performance', 'optimization'],
        createdAt: now,
        modifiedAt: now
      };

      expect(template.tags).toHaveLength(4);
      expect(template.tags).toContain('javascript');
      expect(template.tags).toContain('react');
      expect(template.tags).toContain('performance');
      expect(template.tags).toContain('optimization');
    });
  });
});