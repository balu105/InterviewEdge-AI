
import { createClient } from '@supabase/supabase-js';

// Project ID: apnwdwafkdhqtubgwrik
const supabaseUrl = process.env.SUPABASE_URL || 'https://apnwdwafkdhqtubgwrik.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbndkd2Fma2RocXR1Ymd3cmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzI1MzMsImV4cCI6MjA4MTY0ODUzM30.u5WwXMTmJk0_ms12kA5PJ55TFDnkZobCvK36cDspdlQ';

if (!supabaseUrl || supabaseUrl === '') {
  console.warn("CRITICAL: Supabase URL is missing.");
}

if (!supabaseAnonKey || supabaseAnonKey === '') {
  console.warn("CRITICAL: Supabase Anon Key is missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
