import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bcfgryrpahbjxhnduane.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ob_ExR5R8kxQEUTFgBah6Q_amiQm0HF';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

