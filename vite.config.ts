
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Expose the loaded environment variables to the browser via process.env
      'process.env': JSON.stringify({
        ...env,
        // Ensure standard keys are mapped even if they use the VITE_ prefix in Vercel
        API_KEY: env.API_KEY || env.VITE_API_KEY,
        SUPABASE_URL: env.SUPABASE_URL || env.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY,
      })
    },
    server: {
      port: 3000
    }
  };
});
