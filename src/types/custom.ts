import { Database } from './supabase';

// 1. Temel Satır Tipleri
type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type CustomerRow = Database['public']['Tables']['customers']['Row'];

// 2. Müşteri Tipi
export interface Customer extends CustomerRow {
  total_spend: number | null;
  visit_count: number | null;
  last_visit_at: string | null;
}

// 3. İlişkisel Verilerle Zenginleştirilmiş Randevu Tipi (DÜZELTİLDİ)
// 'Omit' kullanarak orijinal 'status' alanını siliyoruz ve yenisini ekliyoruz.
export interface AppointmentWithDetails extends Omit<AppointmentRow, 'status'> {
  // Statü alanını genişletiyoruz:
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

  // İlişkili tablolar
  customers: {
    full_name: string | null; // null ihtimalini de ekledik (garanti olsun)
    phone: string | null;
    visit_count?: number | null; 
    total_spend?: number | null;
  } | null;
  services: {
    name: string;
    duration_min: number;
  } | null;
  staff: {
    name: string | null;
  } | null;
}