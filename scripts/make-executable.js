#!/usr/bin/env node

// This script ensures the binary is executable across platforms
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const binaryPath = path.join(rootDir, 'dist', 'index.js');

// Log the action
console.log(`Setting executable permissions for: ${binaryPath}`);

try {
  // Check if file exists
  if (fs.existsSync(binaryPath)) {
    // Get current permissions
    const stats = fs.statSync(binaryPath);
    // Add executable permissions (unix-based systems)
    // On Windows this effectively does nothing but doesn't cause errors
    const newMode = stats.mode | 0o111; // add executable permissions
    fs.chmodSync(binaryPath, newMode);
    
    console.log('Successfully set executable permissions');
  } else {
    console.error('Binary file not found at:', binaryPath);
    process.exit(1);
  }
} catch (error) {
  console.error('Error setting permissions:', error.message);
  process.exit(1);
}