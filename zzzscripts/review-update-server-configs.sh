#!/usr/bin/env bash
# zzzscripts/review-update-server-configs.sh
# Script to regularly review and update server and application configurations
# Usage: ./zzzscripts/review-update-server-configs.sh

set -e

CONFIG_DIRS=("zzzdocs" "zzzbuild" "src" "zzzrefactoring")
CONFIG_FILES=("*.config.js" "*.config.json" "*.env" "*.yml" "*.yaml" "tsconfig.json" "package.json" "settings.json")

REVIEW_LOG="zzzbuild/config-review-$(date +%Y%m%d).log"

echo "[INFO] Reviewing server and application configuration files..." | tee "$REVIEW_LOG"

for dir in "${CONFIG_DIRS[@]}"; do
  for pattern in "${CONFIG_FILES[@]}"; do
    find "$dir" -type f -name "$pattern" 2>/dev/null | while read -r file; do
      echo "[REVIEW] $file" | tee -a "$REVIEW_LOG"
      head -20 "$file" | tee -a "$REVIEW_LOG"
      echo "---" | tee -a "$REVIEW_LOG"
    done
  done
done

echo "[INFO] Review complete. Please update configs as needed and commit changes."
