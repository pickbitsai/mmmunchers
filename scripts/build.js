#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('Starting optimized build process...');

try {
  // Set build environment
  process.env.NODE_ENV = 'production';
  process.env.CI = 'true';

  // Clean previous builds
  console.log('Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Build client with optimized settings
  console.log('Building React client...');
  execSync('npx vite build --mode production', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=2048'
    }
  });

  console.log('Build completed successfully!');
  console.log('Build output available in dist/public');

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
