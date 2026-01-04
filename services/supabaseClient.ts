
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, fallback: string) => {
  const val = process.env[key];
  if (!val || val.trim() === '') return fallback;
  return val.trim();
};

const supabaseUrl = getEnv('SUPABASE_URL', 'https://apnwdwafkdhqtubgwrik.supabase.co');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbndkd2Fma2RocXR1Ymd3cmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzI1MzMsImV4cCI6MjA4MTY0ODUzM30.u5WwXMTmJk0_ms12kA5PJ55TFDnkZobCvK36cDspdlQ');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
