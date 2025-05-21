#!/bin/bash

# Deployment script for Copilot PPA extension
# Usage: ./deploy.sh [version] [environment]
# Example: ./deploy.sh 1.0.0 production

# Set default values
VERSION=${1:-"patch"}
ENVIRONMENT=${2:-"development"}
DATE=$(date +"%Y-%m-%d")
ARTIFACTS_DIR="./artifacts"

# Display banner
echo "======================================================"
echo "  Copilot PPA Extension Deployment"
echo "  Version: $VERSION"
echo "  Environment: $ENVIRONMENT"
echo "  Date: $DATE"
echo "======================================================"

# Check prerequisites
echo "Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting."; exit 1; }
command -v vsce >/dev/null 2>&1 || { echo "vsce is not installed. Installing..."; npm install -g @vscode/vsce; }

# Ensure artifacts directory exists
mkdir -p "$ARTIFACTS_DIR"

# Run tests
echo "Running tests..."
npm test

# Check test results
if [ $? -ne 0 ]; then
    echo "Tests failed! Aborting deployment."
    exit 1
fi

# Update version in package.json (patch, minor, or major)
echo "Updating version ($VERSION)..."
npm version $VERSION

# Get the new version number
NEW_VERSION=$(node -p "require('./package.json').version")
echo "New version: $NEW_VERSION"

# Build extension
echo "Building extension..."
npm run compile

# Package extension
echo "Packaging extension..."
vsce package -o "$ARTIFACTS_DIR/copilot-ppa-$NEW_VERSION.vsix"

# Deploy based on environment
if [ "$ENVIRONMENT" == "production" ]; then
    echo "Publishing to VS Code Marketplace..."
    vsce publish

    # Create git tag for the release
    echo "Creating git tag for version $NEW_VERSION..."
    git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"
    git push origin "v$NEW_VERSION"

    echo "Creating GitHub release..."
    # This would use the GitHub CLI or API to create a release
    # gh release create "v$NEW_VERSION" "$ARTIFACTS_DIR/copilot-ppa-$NEW_VERSION.vsix" --title "Release $NEW_VERSION" --notes "Release notes for version $NEW_VERSION"
else
    echo "Skipping marketplace publishing (development environment)."
fi

# Deploy documentation to GitHub Pages
if [ -f "./zzzscripts/deploy-docs.sh" ]; then
  echo "Deploying documentation to GitHub Pages..."
  bash ./zzzscripts/deploy-docs.sh
else
  echo "Documentation deploy script not found. Skipping docs deployment."
fi

# Update changelog
echo "Updating changelog..."
CHANGELOG_FILE="./CHANGELOG.md"
TEMP_FILE=$(mktemp)

echo "## $NEW_VERSION - $DATE" > $TEMP_FILE
echo "" >> $TEMP_FILE
echo "### Added" >> $TEMP_FILE
echo "- New features in this release" >> $TEMP_FILE
echo "" >> $TEMP_FILE
echo "### Changed" >> $TEMP_FILE
echo "- Changes in this release" >> $TEMP_FILE
echo "" >> $TEMP_FILE
echo "### Fixed" >> $TEMP_FILE
echo "- Bug fixes in this release" >> $TEMP_FILE
echo "" >> $TEMP_FILE

# Prepend the new version information to the changelog
cat $CHANGELOG_FILE >> $TEMP_FILE
mv $TEMP_FILE $CHANGELOG_FILE

echo "======================================================"
echo "  Deployment completed successfully!"
echo "  Version $NEW_VERSION is now ready."
echo "======================================================"
