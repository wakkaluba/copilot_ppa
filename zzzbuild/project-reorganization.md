# Copilot PPA - Project Reorganization Recommendations

## Current Structure Issues
- Test files are scattered across multiple directories
- Source code organization could be improved for better maintainability
- Some directories lack clear purpose or organization

## Proposed New Structure

```
copilot_ppa/
├── src/                  # Main source code
│   ├── agents/           # Agent-related functionality
│   │   └── __tests__/    # Jest tests for agents
│   ├── buildTools/       # Build tooling
│   │   └── __tests__/    # Jest tests for build tools
│   ├── chat/             # Chat functionality
│   │   └── __tests__/    # Jest tests for chat
│   ├── codeEditor/       # Code editor integration
│   │   └── __tests__/    # Jest tests for code editor
│   ├── codeReview/       # Code review functionality
│   │   └── __tests__/    # Jest tests for code review
│   ├── codeTools/        # Code tools
│   │   └── __tests__/    # Jest tests for code tools
│   ├── commands/         # Command implementations
│   │   └── __tests__/    # Jest tests for commands
│   ├── common/           # Shared utilities
│   │   └── __tests__/    # Jest tests for common utilities
│   ├── components/       # UI components
│   │   └── __tests__/    # Jest tests for components
│   ├── copilot/          # Copilot integration
│   │   └── __tests__/    # Jest tests for copilot integration
│   ├── debug/            # Debugging functionality
│   │   └── __tests__/    # Jest tests for debug
│   ├── diagnostics/      # Diagnostic tools
│   │   └── __tests__/    # Jest tests for diagnostics
│   └── __mocks__/        # Jest mocks for the src directory
├── media/                # UI assets and webviews
│   └── __tests__/        # Jest tests for media files
├── locales/              # Localization files
├── .vscode/              # VS Code configuration
├── .github/              # GitHub workflows and templates
├── zzzbuild/             # Original build artifacts (untouched)
├── zzzdocs/              # Original documentation (untouched)
├── zzzrefactoring/       # Original refactoring plans (untouched)
├── zzzscripts/           # Original utility scripts (untouched)
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
└── ...                   # Other configuration files
```

## Reorganization Steps

1. **Organize Test Files using Jest Structure**
   - Implement Jest's standard `__tests__` directory structure within each feature module
   - Place test files adjacent to the code they test, inside `__tests__` folders
   - Create `__mocks__` directories for mock implementations at appropriate levels

2. **Reorganize Source Code**
   - Ensure source code is organized by feature/module in the `src` directory
   - Keep related files together following the Jest pattern of co-location
   - Move test files into corresponding `__tests__` folders

3. **Implement Jest Testing Nomenclature**
   - Rename test files to follow Jest conventions: `[filename].test.js` or `[filename].spec.js`
   - Use Jest snapshots for appropriate UI component testing
   - Organize test fixtures in `__fixtures__` folders when needed

4. **Update Import Paths**
   - Update import paths in source files to reflect the new structure
   - Verify that all imports still work after reorganization
   - Update Jest configuration if needed

5. **Update Build Configuration**
   - Update any build scripts that reference specific file paths
   - Ensure Jest test configuration matches the new directory structure

## Implementation Approach

The reorganization should maintain the following principles:

1. **Preserve existing 'zzz' prefixed directories**
   - All folders beginning with 'zzz' will remain untouched
   - No files will be moved from or to these directories

2. **Follow Jest best practices**
   - Use `__tests__` folders for test files
   - Use `__mocks__` for mock implementations
   - Use `__fixtures__` for test fixtures when needed

3. **Minimize disruption**
   - Make changes incrementally
   - Validate each step with tests before continuing

## Post-Reorganization Tasks

1. **Verify Jest Test Configuration**
   - Ensure Jest configuration in `jest.config.js` is compatible with the new structure
   - Update test patterns and paths if needed
   - Run the test suite to verify all tests still pass

2. **Update Build Process**
   - Verify build process works with the new structure
   - Update TypeScript configurations if necessary

3. **Update Documentation**
   - Revise documentation to reflect the new structure
   - Update contributor guidelines to follow the new patterns

4. **Update VS Code Settings**
   - Update any VS Code specific settings that might reference file paths

## Benefits of New Structure

- **Improved Developer Experience**
  - Tests co-located with source code following Jest patterns
  - Clear distinction between production and test code
  - Easier to find related files

- **Better Testing Practices**
  - Standardized Jest testing structure
  - Easier to maintain test fixtures and mocks
  - Improved test organization

- **Maintainable Architecture**
  - Feature-based organization
  - Better separation of concerns
  - Follows industry standard practices for JavaScript/TypeScript projects

- **Preserved Legacy Systems**
  - Existing 'zzz' prefixed directories remain intact
  - No disruption to established workflows that rely on these directories
  - Gradual migration path to newer structure

## Jest Testing Tips

- Use `.test.js` or `.spec.js` suffix for test files
- Place test files in `__tests__` directories adjacent to the code being tested
- Use Jest's `describe` and `it`/`test` functions to organize tests
- Use snapshots for UI component testing
- Place mocks in `__mocks__` directories
- Use `beforeEach` and `afterEach` for test setup and teardown
- Use `jest.mock()` for mocking modules

## Implementation Example

Example of a module with Jest structure:

```
src/
└── feature/
    ├── feature.ts            # Main feature code
    ├── feature.utils.ts      # Utility functions for the feature
    ├── index.ts              # Entry point for the feature
    ├── __fixtures__/         # Test fixtures for the feature
    │   └── testData.json     # Test data
    ├── __mocks__/            # Mocks for dependencies
    │   └── dependency.ts     # Mocked implementation
    └── __tests__/            # Tests for the feature
        ├── feature.test.ts   # Tests for main feature code
        └── feature.utils.test.ts  # Tests for utilities
```
