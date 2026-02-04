
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Use '.' instead of process.cwd() to avoid type error and use current directory
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // Expose the loaded environment variables to the browser via process.env
      // Note: API_KEY is expected to be injected automatically into process.env.API_KEY
      'process.env': JSON.stringify({
        ...env,
        // Removed manual API_KEY mapping to comply with @google/genai guidelines
        SUPABASE_URL: env.SUPABASE_URL || env.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY,
      })
    },
    server: {
      port: 3000
    }
  };
});
