// src/server/db/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Mevcut kullanım bozulmasın diye (Geriye dönük uyumluluk için)
export const supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

// HATA ÇÖZÜMÜ: İstemci bileşenlerinde (use client) çerezleri (cookie) 
// okuyabilmesi ve oturum bilgilerini gönderebilmesi için createBrowserClient kullanıyoruz.
export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};