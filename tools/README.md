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

### After running the script

After running the casing fix tool, you should:

1. Update any direct imports that still reference the incorrect case
2. Rebuild the project with `npm run build`
3. Re-run tests with `npm test`

## Common TypeScript Import Issues

When working in this codebase, follow these conventions:

- Use lowercase for all file names (`logger.ts` not `Logger.ts`)
- Import from the correct case path (`../utils/logger` not `../utils/Logger`)
- Respect the exports as defined in the module (use named exports as they are declared)
