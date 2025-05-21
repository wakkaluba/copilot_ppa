#!/usr/bin/env bash
# zzzscripts/deploy-docs.sh
# Builds and deploys documentation from zzzdocs/ (and docs/ if present) to GitHub Pages.
# Usage: ./zzzscripts/deploy-docs.sh

set -e

REPO_URL=$(git config --get remote.origin.url)
BRANCH=gh-pages
BUILD_DIR=zzzdocs
EXTRA_DOCS=docs
TMP_DIR=$(mktemp -d)

# Build step (if needed)
# For static markdown, just copy. If you have a docs generator, add build commands here.

# Prepare temp dir
rm -rf "$TMP_DIR"/*
mkdir -p "$TMP_DIR"

# Copy documentation
cp -r "$BUILD_DIR"/* "$TMP_DIR"/
if [ -d "$EXTRA_DOCS" ]; then
  cp -r "$EXTRA_DOCS"/* "$TMP_DIR"/
fi

cd "$TMP_DIR"
git init

git remote add origin "$REPO_URL"
git checkout -b "$BRANCH"
git add .
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git commit -m "Deploy documentation to GitHub Pages [ci skip]"
git push --force origin "$BRANCH"

cd -
rm -rf "$TMP_DIR"
echo "Documentation deployed to $BRANCH branch on GitHub Pages."
