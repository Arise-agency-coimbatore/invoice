import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://svegxorneqqgszdwogfu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2ZWd4b3JuZXFxZ3N6ZHdvZ2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTUwODUsImV4cCI6MjA5MzM3MTA4NX0.BkzMjDWC_tblkWL1sVHMLzt_d0b3hEXE9SPf25-0HHE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
