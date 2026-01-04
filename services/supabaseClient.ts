
import { createClient } from '@supabase/supabase-js';

/**
 * Sanitizes the Supabase URL. 
 * If a user accidentally pastes the dashboard URL, this converts it to the correct API format.
 */
const sanitizeSupabaseUrl = (url: string) => {
  if (!url) return '';
  let cleaned = url.trim().replace(/\/$/, '');
  
  // Convert dashboard URL to API URL:
  // https://supabase.com/dashboard/project/apnwdwafkdhqtubgwrik -> https://apnwdwafkdhqtubgwrik.supabase.co
  if (cleaned.includes('supabase.com/dashboard/project/')) {
    const parts = cleaned.split('/');
    const projectRef = parts[parts.length - 1];
    return `https://${projectRef}.supabase.co`;
  }
  
  return cleaned;
};

const getEnv = (key: string, fallback: string) => {
  // In a Vite environment, we use process.env which is shimmed in vite.config.ts
  const val = process.env && (process.env[key] || (process.env as any)[`VITE_${key}`]);
  if (val && val.trim() !== '') return val.trim();
  
  // Fallback to hardcoded defaults for local development if env is missing
  return fallback;
};

const rawUrl = getEnv('SUPABASE_URL', 'https://apnwdwafkdhqtubgwrik.supabase.co');
const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbndkd2Fma2RocXR1Ymd3cmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzI1MzMsImV4cCI6MjA4MTY0ODUzM30.u5WwXMTmJk0_ms12kA5PJ55TFDnkZobCvK36cDspdlQ');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
