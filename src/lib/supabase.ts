import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pzffbbgezpkiludxjjoz.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZmZiYmdlenBraWx1ZHhqam96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1ODExNjEsImV4cCI6MjA3MDE1NzE2MX0.E61EseqpLUuXoqakSxidQmnDxuYdDsW3aSC2oyzu3Fk';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);