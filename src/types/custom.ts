// src/types/custom.ts

import { Database } from './supabase';

// 1. Temel Satır Tipleri
type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type CustomerRow = Database['public']['Tables']['customers']['Row'];

// 2. Müşteri Tipi (GÜNCELLENDİ)
// CustomerRow'u genişletiyoruz ve eksik alanları manuel ekliyoruz.
export interface Customer extends CustomerRow {
  total_spend: number | null;
  visit_count: number | null;
  last_visit_at: string | null;
}

// 3. İlişkisel Verilerle Zenginleştirilmiş Randevu Tipi
export interface AppointmentWithDetails extends AppointmentRow {
  customers: {
    full_name: string;
    phone: string | null;
    visit_count?: number | null; 
    total_spend?: number | null;
  } | null;
  services: {
    name: string;
    duration_min: number;
  } | null;
  staff: {
    name: string;
  } | null;
}