#!/usr/bin/env node
/**
 * Script: optimize-assets.js
 * Optimizes and minifies CSS, JS, and image assets in media/ and resources/.
 * Uses imagemin, clean-css, and terser for optimization.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function optimizeImages() {
  try {
    execSync('npx imagemin media/*.{png,jpg,jpeg,svg} --out-dir=media/', { stdio: 'inherit' });
    execSync('npx imagemin resources/icons/*.{png,jpg,jpeg,svg} --out-dir=resources/icons/', { stdio: 'inherit' });
  } catch (e) {
    console.error('Image optimization failed:', e.message);
  }
}

function minifyCSS() {
  try {
    execSync('npx cleancss -o media/styles.min.css media/*.css', { stdio: 'inherit' });
  } catch (e) {
    console.error('CSS minification failed:', e.message);
  }
}

function minifyJS() {
  try {
    execSync('npx terser media/main.js -o media/main.min.js', { stdio: 'inherit' });
  } catch (e) {
    console.error('JS minification failed:', e.message);
  }
}

function main() {
  optimizeImages();
  minifyCSS();
  minifyJS();
  console.log('Asset optimization complete.');
}

if (require.main === module) {
  main();
}
