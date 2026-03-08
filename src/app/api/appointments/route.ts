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
      .select('name, duration_min, price_min')
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

    // 5. RANDEVUYU KAYDET
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

    // --- YENİ EKLENEN KISIM: HATIRLATICI PLANLAMA ---
    // Randevu saatinden 24 saat önce ve 2 saat önce için reminder ekle
    const remindersToInsert = [];
    const now = new Date();

    // 1. Hatırlatma: 24 Saat Önce
    const time24hBefore = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    if (time24hBefore > now) {
      remindersToInsert.push({
        appointment_id: appointment.id,
        type: 'email_24h', // Tip ayrımı yaptık
        scheduled_for: time24hBefore.toISOString()
      });
    }

    // 2. Hatırlatma: 2 Saat Önce
    const time2hBefore = new Date(startDate.getTime() - 2 * 60 * 60 * 1000);
    if (time2hBefore > now) {
      remindersToInsert.push({
        appointment_id: appointment.id,
        type: 'email_2h', // Tip ayrımı yaptık
        scheduled_for: time2hBefore.toISOString()
      });
    }

    if (remindersToInsert.length > 0) {
      await supabase.from('reminders').insert(remindersToInsert);
    }
    // -----------------------------------------------------

    // 6. n8n WEBHOOK TETİKLEME (YENİ RANDEVU BİLDİRİMİ)
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (webhookUrl) {
      const trDate = startDate.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'long', year: 'numeric' });
      const trTime = startDate.toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' });

      // Fire-and-forget
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NEW_APPOINTMENT',
          appointmentId: appointment.id,
          customer: { name: customer.fullName, email: customer.email, phone: customer.phone },
          service: service.name,
          date: trDate,
          time: trTime
        })
      }).catch(err => console.error('Webhook Error:', err));
    }

    return NextResponse.json({ success: true, id: appointment.id });

  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}