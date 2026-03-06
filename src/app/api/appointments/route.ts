// src/app/api/appointments/route.ts

import { createClient } from '@/server/db/supabase'; 
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { serviceId, staffId, startAt, customer } = body;

    // 1. Validasyon
    if (!serviceId || !staffId || !startAt || !customer?.phone) {
      return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
    }

    // 2. Hizmet Bilgisini Çek
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('name, duration_min, price_min') // name eklendi (Mailde kullanmak için)
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Hizmet bulunamadı.' }, { status: 404 });
    }

    // Timezone Ayarı
    let isoStringWithOffset;
    if (startAt.includes('Z') || startAt.includes('+')) {
       isoStringWithOffset = new Date(startAt).toISOString();
    } else {
       isoStringWithOffset = new Date(`${startAt}+03:00`).toISOString();
    }

    const startDate = new Date(isoStringWithOffset);
    const endDate = new Date(startDate.getTime() + service.duration_min * 60000);

    // 3. ÇAKIŞMA KONTROLÜ
    const { data: conflict } = await supabase
        .from('appointments')
        .select('id')
        .eq('staff_id', staffId)
        .in('status', ['confirmed', 'pending'])
        .lt('start_at', endDate.toISOString())
        .gt('end_at', isoStringWithOffset)
        .maybeSingle();

    if (conflict) {
        return NextResponse.json({ error: 'Seçilen saat az önce doldu, lütfen başka bir saat seçin.' }, { status: 409 });
    }

    // 4. MÜŞTERİ YÖNETİMİ
    let customerId;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', customer.phone)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          full_name: customer.fullName,
          phone: customer.phone,
          email: customer.email
        })
        .select()
        .single();

      if (createError) throw new Error(createError.message);
      customerId = newCustomer.id;
    }

    // 5. RANDEVUYU KAYDET (PENDING)
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        customer_id: customerId,
        service_id: serviceId,
        staff_id: staffId,
        start_at: isoStringWithOffset, 
        end_at: endDate.toISOString(),
        price_at_booking: service.price_min,
        status: 'pending'
      })
      .select()
      .single();

    if (appointmentError) throw new Error(appointmentError.message);

    // 6. n8n WEBHOOK TETİKLEME (YENİ EKLENEN KISIM) 🚀
    // İşlem başarılı, arka planda n8n'e haber verelim (Await etmiyoruz, kullanıcıyı bekletmeyelim)
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (webhookUrl) {
      // İstanbul Saatini Hesapla
      const trDate = startDate.toLocaleDateString('tr-TR', { 
        timeZone: 'Europe/Istanbul', // 👈 KRİTİK NOKTA
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });

      const trTime = startDate.toLocaleTimeString('tr-TR', { 
        timeZone: 'Europe/Istanbul', // 👈 KRİTİK NOKTA
        hour: '2-digit', 
        minute: '2-digit' 
      });

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NEW_APPOINTMENT',
          appointmentId: appointment.id,
          customer: {
            name: customer.fullName,
            email: customer.email,
            phone: customer.phone
          },
          service: service.name,
          date: trDate, // Örn: 6 Mart 2026
          time: trTime  // Örn: 14:30 (İstanbul saatiyle)
        })
      }).catch(err => console.error('n8n Webhook Error:', err));
    }

    return NextResponse.json({ success: true, id: appointment.id });

  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}