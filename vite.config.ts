import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Inject the process.env.API_KEY from the build environment (Netlify) into the client code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Safe polyfill for process.env to prevent "process is not defined" crashes in browser
    'process.env': {} 
  }
});