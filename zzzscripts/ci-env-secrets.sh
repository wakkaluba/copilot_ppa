#!/usr/bin/env bash
# zzzscripts/ci-env-secrets.sh
# Script to set up environment-specific configuration and secrets for CI/CD
# Usage: source this script in your CI pipeline or call directly

set -e

# Example: Load secrets from environment variables or a secure store
# (Replace with your actual secrets management solution)

if [ -f ".env.ci" ]; then
  echo "Loading CI environment variables from .env.ci..."
  set -o allexport
  source .env.ci
  set +o allexport
else
  echo "No .env.ci file found. Using existing environment variables."
fi

# Example: Export secrets for use in CI jobs
export LLM_API_KEY=${LLM_API_KEY:-"dummy-key"}
export DB_CONNECTION_STRING=${DB_CONNECTION_STRING:-"dummy-conn"}

# Add more secrets/config as needed

echo "CI environment and secrets loaded."
