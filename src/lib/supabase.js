import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Aktif hanya jika env terisi. Halaman publik aman fallback ke data statis bila null.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const isSupabaseEnabled = Boolean(supabase);
