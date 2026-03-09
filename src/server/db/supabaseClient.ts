// src/server/db/supabaseClient.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Mevcut kullanım bozulmasın diye (Singleton instance)
export const supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// HATA ÇÖZÜMÜ: Bileşenlerin beklediği fonksiyonu export ediyoruz
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};