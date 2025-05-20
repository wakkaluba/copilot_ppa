# SonarQube Setup Guide

This document describes how to integrate SonarQube analysis into the CI pipeline for this project.

## Prerequisites
- A running SonarQube server (cloud or self-hosted)
- SonarQube project key and authentication token
- Node.js and npm installed

## CI Integration Steps
1. **Install SonarQube Scanner:**
   - Add `sonarqube-scanner` as a dev dependency:
     ```sh
     npm install --save-dev sonarqube-scanner
     ```
2. **Configure SonarQube Properties:**
   - Create a `sonar-project.properties` file in the project root:
     ```
     sonar.projectKey=your_project_key
     sonar.organization=your_org (if using SonarCloud)
     sonar.host.url=https://your-sonarqube-server
     sonar.login=your_token
     sonar.sources=src
     sonar.tests=test
     sonar.javascript.lcov.reportPaths=coverage/lcov.info
     ```
3. **Add SonarQube Step to CI:**
   - In your CI config (e.g., GitHub Actions, Azure Pipelines), add a step to run the scanner:
     ```sh
     npx sonarqube-scanner
     ```
4. **Verify Analysis:**
   - Ensure the analysis runs on each push/PR and results are visible in SonarQube dashboard.

## Badge Integration
- After the first successful analysis, get the badge markdown from your SonarQube project and add it to the top of your `README.md`.

## Troubleshooting
- Ensure the token has correct permissions.
- Check that coverage and source paths match your project structure.
- Review SonarQube logs in CI for errors.

---
_Last updated: 2025-05-20_
