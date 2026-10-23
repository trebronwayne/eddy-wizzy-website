import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The GitHub Actions workflow sets VITE_BASE automatically (for example "/eddy-wizzy-website/"
// on a project site, or "/" on a user site or custom domain). Locally it falls back to "/".
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
});
