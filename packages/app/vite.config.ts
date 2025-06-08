/// <reference types="vite/client" />
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { copyFileSync, existsSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import packageJson from './package.json' with { type: 'json' };

if (!existsSync(path.join(__dirname, '.env'))) {
  copyFileSync(path.join(__dirname, '.env.defaults'), path.join(__dirname, '.env'));
}

let gitHash;
try {
  gitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (_err) {
  gitHash = 'unknown'; // Default value when not in a git repository
}

process.env.MEDPLUM_VERSION = packageJson.version + '-' + gitHash;

// Check if we're in a Docker environment or if the monorepo structure exists
const isMonorepo = existsSync(path.resolve(__dirname, '../core/src'));

export default defineConfig({
  envPrefix: ['MEDPLUM_', 'GOOGLE_', 'RECAPTCHA_'],
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3010,
    allowedHosts: ['localhost', '127.0.0.1', 'emr-dev.cms.afyahewani.io'],
  },
  preview: {
    host: '0.0.0.0',
    port: 3010,
  },
  publicDir: 'static',
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: isMonorepo
      ? {
          '@medplum/core': path.resolve(__dirname, '../core/src'),
          '@medplum/react': path.resolve(__dirname, '../react/src'),
          '@medplum/react-hooks': path.resolve(__dirname, '../react-hooks/src'),
        }
      : {},
  },
});
