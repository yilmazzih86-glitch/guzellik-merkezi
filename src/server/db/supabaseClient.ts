import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Tarayıcıda (Client-side) kullanılacak standart istemci
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);