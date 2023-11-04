import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(() => {
  return {
    base: '',
    build: {
      outDir: 'build',
    },
    plugins: [react(), viteTsconfigPaths()],
    server: {
      open: true, // Automatically open browser
      port: 3000,
    }
  };
})