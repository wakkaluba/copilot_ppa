#!/bin/bash

# Build script for Copilot PPA Extension
# This script prepares everything and compiles the VSIX package for local testing

set -e # Exit on error

# Display script banner
echo "====================================================="
echo "   Copilot PPA Extension Build Script"
echo "====================================================="

# Function to display colored output
function log() {
    local color=$1
    local message=$2
    case $color in
        "green") echo -e "\033[0;32m$message\033[0m" ;;
        "yellow") echo -e "\033[0;33m$message\033[0m" ;;
        "red") echo -e "\033[0;31m$message\033[0m" ;;
        *) echo "$message" ;;
    esac
}

# Check for required tools
log "yellow" "Checking required tools..."
if ! command -v npm &> /dev/null; then
    log "red" "Error: npm is not installed. Please install Node.js and npm."
    exit 1
fi

if ! command -v node &> /dev/null; then
    log "red" "Error: node is not installed. Please install Node.js."
    exit 1
fi

if ! command -v npx &> /dev/null; then
    log "red" "Error: npx is not installed. Please install with 'npm install -g npx'."
    exit 1
fi

# Get the current directory (extension root)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"
log "green" "Building from directory: $PROJECT_DIR"

# Clean up any previous builds
log "yellow" "Cleaning up previous builds..."
rm -rf ./out ./dist ./.vscode-test *.vsix

# Install dependencies
log "yellow" "Installing dependencies..."
npm install

# Run linter
log "yellow" "Running linter..."
if ! npm run lint; then
    log "red" "Linting failed. Please fix the issues and try again."
    exit 1
fi

# Run tests
log "yellow" "Running tests..."
if ! npm test; then
    log "yellow" "Some tests failed. Building anyway, but please review test failures."
fi

# Compile TypeScript
log "yellow" "Compiling TypeScript..."
npm run compile

# Package the extension
log "yellow" "Packaging the extension..."
npx vsce package

# Check if the packaging was successful
if [ $? -eq 0 ]; then
    # Find the generated VSIX file
    VSIX_FILE=$(find . -maxdepth 1 -name "*.vsix" | sort -V | tail -n 1)
    
    if [ -n "$VSIX_FILE" ]; then
        log "green" "✅ Build successful! VSIX package created: $VSIX_FILE"
        
        # Installation instructions
        echo ""
        log "yellow" "To install the extension locally, run:"
        echo "code --install-extension $VSIX_FILE"
        echo ""
    else
        log "red" "Failed to find generated VSIX file."
        exit 1
    fi
else
    log "red" "Failed to package the extension."
    exit 1
fi

exit 0