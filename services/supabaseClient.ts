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

// Direct access is more reliable for Vite's static replacement
const rawUrl = process.env.SUPABASE_URL || 'https://apnwdwafkdhqtubgwrik.supabase.co';
const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbndkd2Fma2RocXR1Ymd3cmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzI1MzMsImV4cCI6MjA4MTY0ODUzM30.u5WwXMTmJk0_ms12kA5PJ55TFDnkZobCvK36cDspdlQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
