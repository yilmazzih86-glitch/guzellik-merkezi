// src/types/custom.ts

// Mevcut veritabanı tiplerini içe aktarıyoruz (Sakın silmeyin dediğimiz dosya)
import { Database } from './supabase';

// Veritabanındaki ham 'appointments' (Randevu) satırı
type AppointmentRow = Database['public']['Tables']['appointments']['Row'];

// İlişkisel verilerle zenginleştirilmiş Randevu tipi
// (Hem randevu bilgisi hem de Müşteri + Hizmet detayları tek objede)
export interface AppointmentWithDetails extends AppointmentRow {
  customers: {
    full_name: string;
    phone: string | null;
  } | null;
  services: {
    name: string;
    duration_min: number;
  } | null;
}