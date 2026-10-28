import crypto from 'node:crypto';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 6.4 calls crypto.getRandomValues on the Node crypto module. Node 20
// exposes this API under crypto.webcrypto, so provide the compatibility alias
// for the Node 20 runtime supported by this project.
if (!crypto.getRandomValues && crypto.webcrypto) {
  crypto.getRandomValues = crypto.webcrypto.getRandomValues.bind(crypto.webcrypto);
}

export default defineConfig({ plugins: [react()] });
