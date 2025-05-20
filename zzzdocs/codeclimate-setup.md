# CodeClimate Setup Guide

This document describes how to integrate CodeClimate analysis into the CI pipeline for this project.

## Prerequisites
- A CodeClimate account and repository setup (https://codeclimate.com/)
- CodeClimate CLI installed locally or in CI

## Setup Steps
1. Add a `.codeclimate.yml` configuration file to the project root (already present).
2. In your CI pipeline, add a step to run CodeClimate analysis:
   - Example (GitHub Actions):
     ```yaml
     - name: Run CodeClimate analysis
       run: |
         docker pull codeclimate/codeclimate
         docker run --env CODECLIMATE_CODE="${{ github.workspace }}" codeclimate/codeclimate analyze
     ```
3. Set up the CodeClimate badge in your README (see top of README for placeholder).
4. Configure quality gate thresholds in CodeClimate dashboard (coverage, duplication, complexity).
5. Set CI to fail if quality gates are not met (see your CI provider's documentation for conditional steps).

## Quality Gate Thresholds
- **Coverage**: 80% minimum
- **Duplication**: < 5%
- **Complexity**: No methods > 15 cyclomatic complexity

## Documentation
- Update this file and the README with any changes to the CodeClimate setup or thresholds.
- For more details, see https://docs.codeclimate.com/docs
