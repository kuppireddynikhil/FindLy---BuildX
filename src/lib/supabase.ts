import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oodfplfuyntblxnothln.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZGZwbGZ1eW50Ymx4bm90aGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNjA1MTcsImV4cCI6MjA5NjczNjUxN30.A9vKWoJcCWMEtX1jLEe16SFaNcbAeFjilKJs89cklbU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
