// src/app/api/appointments/route.ts

// ✅ DOĞRU IMPORT (Server Side)
import { createClient } from '@/server/db/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Sunucu taraflı client oluşturuluyor
  const supabase = await createClient();
  
  try {
    const body = await request.json();
    const { serviceId, staffId, startAt, customer } = body;

    // 1. Validasyon
    if (!serviceId || !staffId || !startAt || !customer?.phone) {
      return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
    }

    // 2. Hizmet Detaylarını Çek
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration_min, price_min')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Hizmet bulunamadı.' }, { status: 400 });
    }

    // Bitiş saatini hesapla
    const startDate = new Date(startAt);
    const endDate = new Date(startDate.getTime() + service.duration_min * 60000); // dk -> ms

    // 3. MÜŞTERİ YÖNETİMİ
    let customerId;
    
    // Telefon ile müşteri ara
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', customer.phone)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // Yoksa oluştur
      const { data: newCustomer, error: createCustomerError } = await supabase
        .from('customers')
        .insert({
          full_name: customer.fullName,
          phone: customer.phone,
          email: customer.email
        })
        .select()
        .single();

      if (createCustomerError) {
        return NextResponse.json({ error: 'Müşteri kaydı başarısız: ' + createCustomerError.message }, { status: 500 });
      }
      customerId = newCustomer.id;
    }

    // 4. RANDEVU KAYDI (Direct Insert)
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        customer_id: customerId,
        service_id: serviceId,
        staff_id: staffId,
        start_at: startAt,
        end_at: endDate.toISOString(),
        price_at_booking: service.price_min,
        status: 'confirmed'
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('Randevu Hatası:', appointmentError);
      return NextResponse.json({ error: 'Randevu kaydedilemedi: ' + appointmentError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: appointment.id });

  } catch (err: any) {
    console.error('Sunucu Hatası:', err);
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}