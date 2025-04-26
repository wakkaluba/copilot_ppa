const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting file casing fix script...');

// Files with casing issues to fix
const filesWithCasingIssues = [
    { 
        from: 'src/utils/Logger.ts',
        to: 'src/utils/logger.ts'
    },
    { 
        from: 'src/services/ConversationManager.ts',
        to: 'src/services/conversationManager.ts'
    }
];

// Fix imports in problematic files
const filesToUpdateImports = [
    'src/services/WorkspaceManager.ts',
    'src/services/CoreAgent.ts'
];

// Process files with casing issues
filesWithCasingIssues.forEach(({ from, to }) => {
    const fromPath = path.resolve(__dirname, '..', from);
    const toPath = path.resolve(__dirname, '..', to);
    
    // Skip if the files are identical except for casing
    if (fromPath.toLowerCase() !== toPath.toLowerCase()) {
        console.log(`Skipping ${from} as it doesn't match ${to} except for casing`);
        return;
    }
    
    // Only proceed if the file exists
    if (fs.existsSync(fromPath)) {
        try {
            console.log(`Fixing casing for ${from} to ${to}`);
            
            // Create a temporary file with a different name
            const tempPath = `${fromPath}_temp`;
            try {
                // Use git to preserve history
                execSync(`git mv "${fromPath}" "${tempPath}"`);
                execSync(`git mv "${tempPath}" "${toPath}"`);
                console.log(`Successfully renamed ${from} to ${to} using git`);
            } catch (gitError) {
                console.error(`Git error: ${gitError.message}`);
                
                // Fallback to regular fs if git fails
                try {
                    fs.renameSync(fromPath, tempPath);
                    fs.renameSync(tempPath, toPath);
                    console.log(`Successfully renamed ${from} to ${to} using fs`);
                } catch (fsError) {
                    console.error(`Filesystem error: ${fsError.message}`);
                }
            }
        } catch (error) {
            console.error(`Failed to fix casing for ${from}: ${error.message}`);
        }
    } else {
        console.log(`File ${from} does not exist, might already be fixed`);
    }
});

// Update imports in files that reference the renamed files
filesToUpdateImports.forEach(filePath => {
    const fullPath = path.resolve(__dirname, '..', filePath);
    
    if (fs.existsSync(fullPath)) {
        try {
            console.log(`Updating imports in ${filePath}`);
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Update imports
            content = content.replace(/from ['"]\.\.\/utils\/Logger['"]/, `from '../utils/logger'`);
            content = content.replace(/from ['"]\.\/ConversationManager['"]/, `from './conversationManager'`);
            
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Successfully updated imports in ${filePath}`);
        } catch (error) {
            console.error(`Failed to update imports in ${filePath}: ${error.message}`);
        }
    }
});

console.log('File casing fix script completed');
