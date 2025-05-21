#!/usr/bin/env bash
# zzzscripts/deploy-staging.sh
# Deploys the current build to the staging environment.
# Usage: ./zzzscripts/deploy-staging.sh

set -e

echo "[deploy-staging] Building project for staging..."
npm run build

echo "[deploy-staging] Running database migrations (if any)..."
# Uncomment and customize if you have migrations
# npm run migrate:staging

echo "[deploy-staging] Syncing build artifacts to staging server..."
# Replace with your actual staging server details
STAGING_USER=${STAGING_USER:-user}
STAGING_HOST=${STAGING_HOST:-staging.example.com}
STAGING_PATH=${STAGING_PATH:-/var/www/staging}

rsync -avz --delete dist/ "$STAGING_USER@$STAGING_HOST:$STAGING_PATH/"

echo "[deploy-staging] Deployment to staging complete."
