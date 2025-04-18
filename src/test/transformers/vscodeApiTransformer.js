/**
 * Custom AST transformer for VS Code API mocking in tests
 * This transformer handles automatic mocking of VS Code APIs in test files
 */

// Helper function to detect VS Code API imports
function isVSCodeImport(node) {
  return (
    node.type === 'ImportDeclaration' && 
    node.source && 
    node.source.value === 'vscode'
  );
}

// Helper function to detect VS Code API usage
function isVSCodeApiUsage(node) {
  return (
    node.type === 'MemberExpression' &&
    node.object && 
    node.object.name === 'vscode'
  );
}

// Helper to create mock implementation nodes
function createMockImplementation(j, apiName) {
  return j.callExpression(
    j.memberExpression(
      j.identifier('jest'),
      j.identifier('fn')
    ),
    []
  );
}

// Main transformer function
module.exports = function transformer(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  const mockVSCodeApis = options.mockVSCodeApis || false;

  if (!mockVSCodeApis) {
    return fileInfo.source;
  }

  // Find VS Code imports
  const vscodeImports = root.find(j.ImportDeclaration).filter(isVSCodeImport);

  // If no VS Code imports, return unchanged
  if (vscodeImports.size() === 0) {
    return fileInfo.source;
  }

  // Add Jest mock import if needed
  if (!root.find(j.ImportDeclaration).filter(path => 
      path.node.source.value === 'jest').size()) {
    root.get().node.program.body.unshift(
      j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier('jest'))],
        j.literal('jest')
      )
    );
  }

  // Transform VS Code API usages
  root.find(j.MemberExpression)
    .filter(isVSCodeApiUsage)
    .forEach(path => {
      // Add automatic mocking for functions
      if (path.parent.node.type === 'CallExpression') {
        const apiName = path.node.property.name;
        // Replace with cached mock implementation
        j(path.parent).replaceWith(
          j.callExpression(
            j.memberExpression(
              j.identifier('getCachedMock'),
              j.identifier('call')
            ),
            [
              j.literal(`vscode.${apiName}`),
              j.arrowFunctionExpression(
                [],
                createMockImplementation(j, apiName)
              )
            ]
          )
        );
      }
    });

  return root.toSource();
};