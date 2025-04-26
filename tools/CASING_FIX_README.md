# File Casing Issues Fix Guide

This guide addresses file casing issues in the project that cause TypeScript errors, particularly on case-sensitive systems or when working across different operating systems.

## Issues Identified

The main issues identified in the project are:

1. **Inconsistent file casing in imports**:
   - `logger.ts` vs `Logger.ts`
   - `conversationManager.ts` vs `ConversationManager.ts`
   - `coreAgent.ts` vs `CoreAgent.ts`

2. **TypeScript type errors**:
   - Timestamp property in LogEntry interface is supposed to be a Date but sometimes used as a number
   - Missing context property in LogEntry interface
   - Other type compatibility issues across various files

## How to Fix

Run the following command to fix all issues:

```bash
npm run fix-all
```

This will run the following scripts:

1. `fix-casing.js` - Fixes file casing issues by renaming files to their lowercase versions
2. `fix-imports.js` - Fixes import statements throughout the codebase
3. `fix-type-errors.js` - Fixes specific type errors in the codebase

## Manual Steps That Might Be Required

After running the automated fixes:

1. Restart VS Code to ensure the casing changes are recognized
2. Run `tsc --noEmit` to identify any remaining type errors
3. Fix any remaining issues manually

## Prevention

The updated `tsconfig.json` includes `"forceConsistentCasingInFileNames": true` which will help catch these issues during compilation.

Always use consistent casing in your imports and file names to avoid these issues in the future.
