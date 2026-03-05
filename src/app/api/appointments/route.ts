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
      .select('duration_min, price_min')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Hizmet bulunamadı.' }, { status: 404 });
    }

    // --- SAAT DÜZELTME (TIMEZONE FIX) ---
    // Gelen veri formatı: "2026-03-05T14:00:00" (Frontend saniyeyi zaten ekliyor)
    // Bizim yapmamız gereken sadece +03:00 eklemek.
    
    let isoStringWithOffset;

    if (startAt.includes('Z') || startAt.includes('+')) {
       // Zaten timezone varsa dokunma
       isoStringWithOffset = new Date(startAt).toISOString();
    } else {
       // Sadece timezone ekle (Saniye ekleme!)
       // Örnek: "2026-03-05T14:00:00" + "+03:00"
       isoStringWithOffset = new Date(`${startAt}+03:00`).toISOString();
    }

    const startDate = new Date(isoStringWithOffset);
    const endDate = new Date(startDate.getTime() + service.duration_min * 60000);

    // 3. MÜŞTERİ YÖNETİMİ
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

    // 4. RANDEVUYU KAYDET
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        customer_id: customerId,
        service_id: serviceId,
        staff_id: staffId,
        start_at: isoStringWithOffset, 
        end_at: endDate.toISOString(),
        price_at_booking: service.price_min,
        status: 'confirmed'
      })
      .select()
      .single();

    if (appointmentError) throw new Error(appointmentError.message);

    return NextResponse.json({ success: true, id: appointment.id });

  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}