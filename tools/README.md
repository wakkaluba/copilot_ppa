# Codebase Fix Tools

This directory contains utility scripts for fixing common issues in the codebase.

## Fix Casing

The `fix-casing.js` script resolves file path casing issues that can cause TypeScript compilation problems, especially on case-sensitive systems or when working across different operating systems.

### Usage

```bash
node tools/fix-casing.js
```

### What it does

- Renames files to match the expected casing used in imports
- Uses git commands to preserve file history
- Falls back to regular filesystem operations if git fails
- Currently fixes:
  - `src/utils/Logger.ts` → `src/utils/logger.ts`
  - `src/services/ConversationManager.ts` → `src/services/conversationManager.ts`
  - `src/services/CoreAgent.ts` → `src/services/coreAgent.ts`

### After running the script

After running the casing fix tool, you should:

1. Update any direct imports that still reference the incorrect case
2. Rebuild the project with `npm run build`
3. Re-run tests with `npm test`

## Fix Type Errors

The `fix-type-errors.js` script addresses common type errors in the TypeScript code.

### Usage

```bash
node tools/fix-type-errors.js
```

## Fix Timestamp Errors

The `fix-timestamp-errors.js` script specifically fixes timestamp-related type errors, converting `new Date()` to `Date.now()` where number types are required.

### Usage

```bash
node tools/fix-timestamp-errors.js
```

## Fix URI Errors

The `fix-uri-errors.js` script addresses URI-related type errors by modifying methods to accept both string and URI parameters.

### Usage

```bash
node tools/fix-uri-errors.js
```

## Comprehensive Fix

The `fix-all.js` script runs all the fix scripts in the proper sequence.

### Usage

```bash
node tools/fix-all.js
```

## Common TypeScript Import Issues

If you're experiencing issues with TypeScript imports, consider:

1. Ensure you're using consistent casing in import statements
2. Check that the exported name matches exactly what you're importing
3. Verify the relative path is correct

## After Running Fixes

1. Restart VS Code to ensure all changes are recognized
2. Run `npm run compile` to check for remaining type errors
3. Address any remaining issues manually
