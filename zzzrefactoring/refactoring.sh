#!/bin/bash

# Refactoring script for Copilot PPA project
echo "Starting refactoring process..."

# Check for code style issues
echo "Checking code style..."
npm run lint

# Run tests to ensure everything works before refactoring
echo "Running tests..."
npm test

# Update refactoring status
echo "Updating refactoring status..."
node ./zzzscripts/update-refactoring-status.js

echo "Refactoring process completed."