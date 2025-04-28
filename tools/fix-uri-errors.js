const fs = require('fs');
const path = require('path');

console.log('Starting URI type error fix script...');

// Files with URI type errors to fix
const filesToFix = [
  {
    path: 'src/services/WorkspaceManager.ts',
    replacements: [
      {
        // Fix readFile method to accept string or Uri
        pattern: /public async readFile\(uri: vscode\.Uri\): Promise<string>/g,
        replacement: 'public async readFile(uri: vscode.Uri | string): Promise<string>'
      },
      {
        // Add Uri conversion in readFile implementation
        pattern: /const data = await this\.fs\.readFile\(uri\);/g,
        replacement: 'const uriObj = typeof uri === "string" ? vscode.Uri.file(uri) : uri;\n        const data = await this.fs.readFile(uriObj);'
      },
      {
        // Fix writeFile method to accept string or Uri
        pattern: /public async writeFile\(uri: vscode\.Uri, content: string\): Promise<void>/g,
        replacement: 'public async writeFile(uri: vscode.Uri | string, content: string): Promise<void>'
      },
      {
        // Add Uri conversion in writeFile implementation
        pattern: /await this\.fs\.writeFile\(uri,/g,
        replacement: 'const uriObj = typeof uri === "string" ? vscode.Uri.file(uri) : uri;\n        await this.fs.writeFile(uriObj,'
      },
      {
        // Fix deleteFile method to accept string or Uri
        pattern: /public async deleteFile\(uri: vscode\.Uri\): Promise<void>/g,
        replacement: 'public async deleteFile(uri: vscode.Uri | string): Promise<void>'
      },
      {
        // Add Uri conversion in deleteFile implementation
        pattern: /await this\.fs\.delete\(uri,/g,
        replacement: 'const uriObj = typeof uri === "string" ? vscode.Uri.file(uri) : uri;\n        await this.fs.delete(uriObj,'
      },
      {
        // Fix createDirectory method to accept string or Uri
        pattern: /public async createDirectory\(uri: vscode\.Uri\): Promise<void>/g,
        replacement: 'public async createDirectory(uri: vscode.Uri | string): Promise<void>'
      },
      {
        // Add Uri conversion in createDirectory implementation
        pattern: /await this\.fs\.createDirectory\(uri\);/g,
        replacement: 'const uriObj = typeof uri === "string" ? vscode.Uri.file(uri) : uri;\n        await this.fs.createDirectory(uriObj);'
      }
    ]
  },
  {
    path: 'src/services/conversationManager.ts',
    replacements: [
      {
        // Fix URI string issues
        pattern: /await this\.workspaceManager\.readFile\(filePath\);/g,
        replacement: 'await this.workspaceManager.readFile(filePath);'
      },
      {
        // Fix Uri conversion for file operations
        pattern: /await this\.workspaceManager\.createDirectory\(this\.historyPath\);/g,
        replacement: 'await this.workspaceManager.createDirectory(this.historyPath);'
      },
      {
        // Fix missing Uri conversion
        pattern: /filePath,\n/g,
        replacement: 'filePath,\n'
      }
    ]
  }
];

// Process files with URI errors
filesToFix.forEach(({ path: filePath, replacements }) => {
  const fullPath = path.resolve(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      console.log(`Fixing URI errors in ${filePath}`);
      let content = fs.readFileSync(fullPath, 'utf8');
      let hasChanges = false;
      
      replacements.forEach(({ pattern, replacement }) => {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        fs.writeFileSync(fullPath, content);
        console.log(`Successfully updated ${filePath}`);
      } else {
        console.log(`No changes needed for ${filePath}`);
      }
    } catch (error) {
      console.error(`Failed to fix URI errors in ${filePath}: ${error.message}`);
    }
  } else {
    console.log(`File ${filePath} does not exist`);
  }
});

console.log('URI error fix script completed');
