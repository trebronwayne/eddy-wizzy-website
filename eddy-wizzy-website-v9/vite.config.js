import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The GitHub Actions workflow sets VITE_BASE automatically (for example "/eddy-wizzy-website/"
// on a project site, or "/" on a user site or custom domain). Locally it falls back to "/".
// It also sets SITE_URL so link previews (WhatsApp, Facebook, X) get a full https address.
const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');

function siteMeta() {
  return {
    name: 'site-meta',
    transformIndexHtml(html) {
      if (siteUrl) return html.replaceAll('__SITE_URL__', siteUrl);
      // No known address (local development): leave the share-preview tags out.
      return html.replace(/<!--share-start-->[\s\S]*?<!--share-end-->/, '');
    },
  };
}

export default defineConfig({
  plugins: [react(), siteMeta()],
  base: process.env.VITE_BASE || '/',
});
