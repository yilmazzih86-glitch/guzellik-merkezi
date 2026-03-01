export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface StaffAvailability {
  [key: string]: string[] | null; 
  // Örn: { "monday": ["09:00", "18:00"], "tuesday": null }
}

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          created_at: string
          customer_id: string
          service_id: string
          staff_id: string | null
          start_at: string
          end_at: string
          status: 'confirmed' | 'cancelled' | 'no_show' | 'completed'
          source: string
          // Yeni eklediğimiz sütun:
          price_at_booking: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          customer_id: string
          service_id: string
          staff_id?: string | null
          start_at: string
          end_at: string
          status?: 'confirmed' | 'cancelled' | 'no_show' | 'completed'
          source?: string
          price_at_booking?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          customer_id?: string
          service_id?: string
          staff_id?: string | null
          start_at?: string
          end_at?: string
          status?: 'confirmed' | 'cancelled' | 'no_show' | 'completed'
          source?: string
          price_at_booking?: number | null
        }
      }
      customers: {
        Row: {
          id: string
          created_at: string
          full_name: string
          phone: string | null
          email: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          full_name: string
          phone?: string | null
          email?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string
          phone?: string | null
          email?: string | null
          notes?: string | null
        }
      }
      services: {
        Row: {
          id: string
          created_at: string
          name: string
          duration_min: number
          price_min: number | null
          price_max: number | null
          active: boolean
          description: string | null
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          duration_min: number
          price_min?: number | null
          price_max?: number | null
          active?: boolean
          description?: string | null
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          duration_min?: number
          price_min?: number | null
          price_max?: number | null
          active?: boolean
          description?: string | null
          image_url?: string | null
        }
      }
      staff: {
        Row: {
          id: string
          created_at: string
          name: string
          title: string | null
          active: boolean
          image_url: string | null
          // Yeni eklediğimiz sütun (JSONB):
          availability: StaffAvailability | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          title?: string | null
          active?: boolean
          image_url?: string | null
          availability?: StaffAvailability | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          title?: string | null
          active?: boolean
          image_url?: string | null
          availability?: StaffAvailability | null
        }
      }
      settings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          business_name: string
          phone: string | null
          address: string | null
          timezone: string
          opening_hours: Json
          booking_rules: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          business_name: string
          phone?: string | null
          address?: string | null
          timezone?: string
          opening_hours: Json
          booking_rules: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          business_name?: string
          phone?: string | null
          address?: string | null
          timezone?: string
          opening_hours?: Json
          booking_rules?: Json
        }
      }
    }
    Functions: {
      book_appointment: {
        Args: {
          p_customer_name: string
          p_customer_phone: string
          p_customer_email: string
          p_service_id: string
          p_staff_id: string
          p_start_at: string
          p_end_at: string
        }
        Returns: Json
      }
      get_dashboard_stats: {
        Args: Record<string, never> // Argüman almaz
        Returns: {
          today_appointments: number
          monthly_revenue: number
          total_customers: number
        }
      }
    }
  }
}